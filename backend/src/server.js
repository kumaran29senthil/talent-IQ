import express from "express";
import { ENV } from "./lib/env.js";
import path from "path";

const app = express();

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

app.listen(ENV.PORT, () => {
    console.log("Server is running on port " + ENV.PORT);
});
