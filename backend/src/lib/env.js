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
    NODE_ENV: process.env.NODE_ENV,
    CLIENT_URL: process.env.CLIENT_URL,
    INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
    INNGEST_SIGNING_KEY : process.env.INNGEST_SIGNING_KEY,
    STREAM_API_KEY: process.env.STREAM_API_KEY,
    STREAM_API_SECRET: process.env.STREAM_API_SECRET
};