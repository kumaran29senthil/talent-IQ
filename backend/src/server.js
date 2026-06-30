import express from "express";
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import path from "path";
import cors from "cors";
import {serve} from "inngest/express";
import {inngest, functions} from "./lib/inngest.js"

const app = express();

//use middleware
app.use(express.json());
// credentails:true means server allows a browser to include cookies on request 
app.use(cors({origin: ENV.CLIENT_URL, credentials:true}));

app.use("/api/inngest", serve({client: inngest,functions,signingKey: ENV.INNGEST_SIGNING_KEY}))

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "Hi Appian" });
});

app.get("/books", (req, res) => {
  res.status(200).json({ msg: "Hi Kumaran" });
});

if (ENV.NODE_ENV === "production") {
  // This points directly to backend/src. We step up twice to hit the frontend folder cleanly.
  const frontendDist = path.resolve(import.meta.dirname, "../../frontend/dist");

  // Serve the static build folder
  app.use(express.static(frontendDist));

  // Handle the Express v5 Catch-All
  app.get("/*splat", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}


const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(ENV.PORT, () => {
      console.log("Server is running on port " + ENV.PORT);
    });
    server.once("error", (error) => {
      console.error("Error starting server:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
