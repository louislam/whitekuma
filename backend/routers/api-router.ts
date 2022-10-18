import express from "express";
import SseStream from "ssestream";
import { WhiteKumaServer } from "../whitekuma-server";
import { passwordStrength } from "check-password-strength";
import cors from "cors";

const server = WhiteKumaServer.getInstance();

export let apiRouter = express.Router();
apiRouter.use(express.json());

if (process.env.NODE_ENV === "development") {
    apiRouter.use(cors());
}

apiRouter.get("/", (request, response) => {
    let result = {
        "version": ""
    };
    response.json(result);
});

// Need Setup
apiRouter.get("/need-setup", (request, response) => {
    response.json(server.needSetup);
});

apiRouter.post("/setup", async (request, response) => {
    console.log("Setup");
    try {
        const username = request.body.username;
        const password = request.body.password;

        if (!username || typeof username !== "string" || username.trim().length <= 0) {
            throw new Error("Invalid Username");
        }

        if (!password || typeof password !== "string") {
            throw new Error("Invalid Password");
        }

        if (passwordStrength(password).value === "Too weak") {
            throw new Error("Password is too weak. It should contain alphabetic and numeric characters. It must be at least 6 characters in length.");
        }

        if (!server.needSetup) {
            throw new Error("Uptime Kuma has been initialized. If you want to run setup again, please delete the database.");
        }

        server.db.data.users.push({
            username,
            password: server.cryptr.encrypt(password),
        });

        await server.db.write();

        response.json({
            ok: true,
        });

    } catch (e) {
        console.error(e);
        if (e instanceof Error) {
            response.status(400);
            response.json({
                ok: false,
                msg: e.message,
            });
        }
    }
});

// Job List
apiRouter.get("/jobs", (request, response) => {

});

// Get a Job
apiRouter.get("/job/:id", (request, response) => {

});

// Pause a Job
apiRouter.get("/job/:id/pause", (request, response) => {

});

// Resume a Job
apiRouter.get("/job/:id/resume", (request, response) => {

});

// Trigger Backup now
apiRouter.get("/job/:id/backup-now", (request, response) => {

});

// Create or Update a Job
apiRouter.post("/job", (request, response) => {

});

// Delete a Job
apiRouter.delete("/job/:id", (request, response) => {

});

// sse
apiRouter.get("/sse", (req, res) => {
    console.log("new connection");

    const sseStream = new SseStream(req);
    sseStream.pipe(res);
    const pusher = setInterval(() => {
        sseStream.write({
            event: "server-time",
            data: new Date().toTimeString()
        });
    }, 1000);

    res.on("close", () => {
        console.log("lost connection");
        clearInterval(pusher);
        sseStream.unpipe(res);
    });
});
