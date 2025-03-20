import { Configuration } from 'electron-builder';

const config: Configuration = {
  appId: "com.yourcompany.deployment-app",
  productName: "Deployment App",
  directories: {
    output: "dist"
  },
  files: [
    "dist/**/*",
    "public/**/*",
    "assets/**/*",
    "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
    "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
    "!**/node_modules/*.d.ts",
    "!**/node_modules/.bin",
    "!{.eslintrc.json,.eslintrc.js}"
  ],
  mac: {
    category: "public.app-category.developer-tools",
    target: ["dmg", "zip"]
  },
  win: {
    target: ["nsis", "portable"]
  },
  linux: {
    target: ["AppImage", "deb", "rpm"],
    category: "Development"
  }
};

export default config;