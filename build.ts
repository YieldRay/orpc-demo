import { build, type Plugin } from "esbuild";
import { readFileSync } from "node:fs";
import { builtinModules } from "node:module";

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

const pkg: PackageJson = JSON.parse(readFileSync("./package.json", "utf-8"));

const deps = Object.keys({
  ...pkg.dependencies,
  ...pkg.devDependencies,
  ...pkg.peerDependencies,
});

// Rewrites bare npm specifiers to npm: URLs for Deno/edge runtimes.
// Node built-ins are allowed only with the node: prefix.
const npmSpecifierPlugin: Plugin = {
  name: "npm-specifier",
  setup(build) {
    // Allow node: built-ins as external
    build.onResolve({ filter: /^node:/ }, () => ({ external: true }));

    // Rewrite bare Node built-ins to use node: prefix
    const builtinFilter = new RegExp(`^(${builtinModules.join("|")})(\/|$)`);
    build.onResolve({ filter: builtinFilter }, (args) => ({
      path: "node:" + args.path,
      external: true,
    }));

    // Rewrite npm package specifiers to npm: URLs
    build.onResolve({ filter: /^[^./]/ }, (args) => {
      const isDep = deps.some((d) => args.path === d || args.path.startsWith(d + "/"));
      if (isDep) {
        return { path: "npm:" + args.path, external: true };
      }
    });
  },
};

await build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  outfile: "dist/main.js",
  format: "esm",
  target: "esnext",
  platform: "browser",
  plugins: [npmSpecifierPlugin],
});

console.log("Build complete → dist/main.js");
