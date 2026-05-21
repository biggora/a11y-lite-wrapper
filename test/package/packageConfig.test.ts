import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  packageManager?: string;
  publishConfig?: {
    access?: string;
  };
  engines?: {
    node?: string;
  };
  keywords?: string[];
  author?: string;
  license?: string;
  repository?: {
    type?: string;
    url?: string;
  };
  bugs?: {
    url?: string;
  };
  homepage?: string;
  sideEffects?: boolean;
  exports?: Record<
    string,
    {
      types?: {
        import?: string;
        require?: string;
      };
      import?: string;
      require?: string;
      default?: string;
    }
  >;
}

const packageJson = JSON.parse(
  readFileSync(resolve(process.cwd(), "package.json"), "utf8")
) as PackageJson;

describe("package configuration", () => {
  const expectedExports = {
    ".": "./dist/index",
    "./combobox": "./dist/combobox/index",
    "./listbox": "./dist/listbox/index",
    "./keyboard": "./dist/keyboard/index",
    "./react": "./dist/react/index"
  } as const;

  it("keeps runtime dependencies empty and marks React as an optional peer", () => {
    expect(packageJson.dependencies).toEqual({});
    expect(packageJson.peerDependencies).toHaveProperty("react");
    expect(packageJson.peerDependenciesMeta?.react?.optional).toBe(true);
    expect(packageJson.devDependencies).toMatchObject({
      react: expect.any(String),
      "react-dom": expect.any(String),
      typescript: expect.any(String),
      tsup: expect.any(String),
      vitest: expect.any(String),
      "@testing-library/react": expect.any(String),
      publint: expect.any(String),
      vite: expect.any(String),
      "@arethetypeswrong/cli": expect.any(String)
    });
  });

  it("declares the package as side-effect free", () => {
    expect(packageJson.sideEffects).toBe(false);
  });

  it("declares npm metadata for discovery and repository links", () => {
    expect(packageJson.packageManager).toBe("pnpm@10.33.4");
    expect(packageJson.publishConfig).toEqual({
      access: "public"
    });
    expect(packageJson.engines).toEqual({
      node: ">=18"
    });
    expect(packageJson.keywords).toEqual([
      "accessibility",
      "a11y",
      "aria",
      "wai-aria",
      "headless",
      "combobox",
      "listbox",
      "keyboard-navigation",
      "react"
    ]);
    expect(packageJson.author).toBe("biggora");
    expect(packageJson.license).toBe("MIT");
    expect(packageJson.repository).toEqual({
      type: "git",
      url: "git+https://github.com/biggora/a11y-lite-wrapper.git"
    });
    expect(packageJson.bugs).toEqual({
      url: "https://github.com/biggora/a11y-lite-wrapper/issues"
    });
    expect(packageJson.homepage).toBe("https://biggora.github.io/a11y-lite-wrapper/");
  });

  it("exports the required subpaths with the required condition order", () => {
    expect(Object.keys(packageJson.exports ?? {})).toEqual([
      ".",
      "./combobox",
      "./listbox",
      "./keyboard",
      "./react"
    ]);

    for (const exportPath of Object.keys(expectedExports)) {
      expect(Object.keys(packageJson.exports?.[exportPath] ?? {})).toEqual([
        "types",
        "import",
        "require",
        "default"
      ]);
    }
  });

  it("maps ESM and CJS declarations for every exported subpath", () => {
    for (const [exportPath, distPath] of Object.entries(expectedExports)) {
      expect(packageJson.exports?.[exportPath]).toEqual({
        types: {
          import: `${distPath}.d.ts`,
          require: `${distPath}.d.cts`
        },
        import: `${distPath}.mjs`,
        require: `${distPath}.cjs`,
        default: `${distPath}.mjs`
      });
    }
  });
});
