import { COPYRIGHT, DESCRIPTION, LICENSE_NAME, REPO, VERSION } from "/_/constants/mod.ts";
import * as fs from "std/fs/mod.ts";
import * as path from "std/path/mod.ts";
import { build } from "x/dnt/mod.ts";

const outDir = path.join("target", "npm");

await fs.emptyDir(outDir);

await Promise.all([
  build({
    importMap: "import_map.json",
    entryPoints: [
      "_/constants/mod.ts",
      "_/util/mod.ts",
      "system/mod.ts",
      "frame/mod.ts",
      "frame_metadata/mod.ts",
      "target/wasm/crypto/mod.js", // remove top-level await & ensure dts files referenced
      "rpc/mod.ts",
      "config/mod.ts",
      "codegen/mod.ts",
    ],
    outDir,
    package: {
      name: "capi-beta",
      version: VERSION,
      description: DESCRIPTION,
      license: LICENSE_NAME,
      repository: REPO,
    },
    compilerOptions: {
      importHelpers: true,
      sourceMap: true,
      target: "ES2021",
    },
    scriptModule: false, // re-enable once top-level await removed from wasm bindings
    shims: {
      deno: true,
    },
    test: false,
    typeCheck: false,
  }),

  (async (): Promise<void> => {
    const [leading, trailing] = new TextDecoder().decode(await Deno.readFile(path.join("_", "assets", "LICENSE")))
      .split("[yyyy] [name of copyright owner]") as [string, string];
    const licenseTxt = `${leading}${new Date().getFullYear()} ${COPYRIGHT}${trailing}`;
    await Deno.writeFile(path.join(outDir, "LICENSE"), new TextEncoder().encode(licenseTxt));
  })(),
]);
