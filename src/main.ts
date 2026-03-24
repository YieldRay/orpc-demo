import { RPCHandler } from "@orpc/server/fetch";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { CORSPlugin } from "@orpc/server/plugins";
import { onError } from "@orpc/server";
import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { router } from "./router.ts";
import { createWebServer } from "./helper.ts";

const rpcHandler = new RPCHandler(router, {
  plugins: [new CORSPlugin()],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

const openAPIHandler = new OpenAPIHandler(router, {
  plugins: [new CORSPlugin()],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

const spec = await generator.generate(router, {
  info: {
    title: "Planet API",
    version: "1.0.0",
  },
});

export default createWebServer(async (request: Request) => {
  const url = new URL(request.url);
  if (url.pathname === "/") {
    url.pathname = "/openapi/";
    return Response.redirect(url, 302);
  }
  if (url.pathname === "/openapi.json") {
    return new Response(JSON.stringify(spec), {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
  if (url.pathname === "/openapi") {
    url.pathname = "/openapi/";
    return Response.redirect(url, 302);
  }
  if (url.pathname === "/openapi/") {
    const js = "https://cdn.jsdelivr.net/npm/@scalar/api-reference";
    /** @see https://github.com/scalar/scalar/blob/main/documentation/configuration.md */
    const configuration = {
      favicon: "./favicon.ico",
      theme: url.searchParams.get("theme") || "light",
      url: "/openapi.json",
      isEditable: false,
      agent: {
        disabled: true,
      },
      mcp: {
        disabled: true,
      },
      proxyUrl: url.searchParams.has("proxy") ? url.searchParams.get("proxy") || "https://proxy.scalar.com" : undefined,
      showSidebar: url.searchParams.has("showSidebar") && url.searchParams.get("showSidebar") !== "false",
    };
    const toDatasetConfig = (input: unknown) => JSON.stringify(JSON.stringify(input));

    return new Response(
      /*html*/ `<!DOCTYPE html>
<html>
    <head>
        <title>OpenAI API Reference</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="none" />
        <link rel="preload" href="${js}" as="script" />
        <link rel="preload" href="${configuration.url}" as="fetch" crossorigin />
    </head>
    <body>
        <script id="api-reference"></script>
        <script>
            document.getElementById("api-reference").dataset.configuration = ${toDatasetConfig(configuration)};
        </script>
        <script src="${js}"></script>
    </body>
</html>`,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  }

  const context = { headers: request.headers };

  // Try RPC handler first
  const rpc = await rpcHandler.handle(request, { prefix: "/rpc", context });
  if (rpc.matched) return rpc.response;

  // Then try OpenAPI handler
  const rest = await openAPIHandler.handle(request, { prefix: "/", context });
  if (rest.matched) return rest.response;

  return new Response("Not found", { status: 404 });
});
