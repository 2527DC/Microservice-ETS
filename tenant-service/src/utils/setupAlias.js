// setupAlias.js
import { fileURLToPath } from "url";
import path from "path";
import moduleAlias from "module-alias";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up: /service-user/src/utils → /service-user/src → /service-user → /packages → /Microservice_architecture
const rootPath = path.resolve(__dirname, "../../../../");

// Register aliases
moduleAlias.addAliases({
  "@shared": path.join(rootPath, "shared"),
  "@db": path.join(rootPath, "shared", "db"),
});

console.log("✅ Module aliases registered:");
console.log(" - @shared →", path.join(rootPath, "shared"));
console.log(" - @db →", path.join(rootPath, "shared", "db"));
