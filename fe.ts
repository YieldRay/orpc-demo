const { Scalar } = window as any;
import server, { openapi } from "./src/main.ts";

const HEADER = "X-Is-OpenAPI";
const HEADER_VALUE = "true";
const originalFetch = window.fetch.bind(window);

// @ts-ignore
window.fetch = async (input, init) => {
  const request = new Request(input, init);
  // Only intercept requests from the API reference page, which are marked with a special header.
  if (request.headers.get(HEADER) === HEADER_VALUE) {
    request.headers.delete(HEADER);
    const response = await server.fetch(request);
    Object.defineProperty(response, "url", { value: request.url });
    console.log("[DEBUG] Intercepted request", request, response);
    return response;
  }
  return originalFetch(input, init);
};

Scalar.createApiReference("#app", {
  favicon: "./favicon.ico",
  theme: "light",
  content: JSON.stringify(openapi),
  isEditable: false,
  agent: { disabled: true },
  mcp: { disabled: true },
  onBeforeRequest({ request }: { request: Request }) {
    request.headers.set(HEADER, HEADER_VALUE);
  },
});
