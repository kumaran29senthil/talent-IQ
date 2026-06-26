import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the actual directory path of this specific file (env.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Point cleanly back into backend/.env relative to this file
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

export const ENV = {
    PORT: process.env.PORT,
    DB_URL: process.env.DB_URL,
    NODE_ENV: process.env.NODE_ENV
};