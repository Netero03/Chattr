import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PROJECT_ROOT = path.join(__dirname, "../../..");

export const FRONTEND_DIST_PATH = path.join(
  PROJECT_ROOT,
  "frontend",
  "dist"
);
