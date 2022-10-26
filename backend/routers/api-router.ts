import express, { Response } from "express";
import SseStream from "ssestream";
import { WhiteKumaServer } from "../whitekuma-server";
import { passwordStrength } from "check-password-strength";
import cors from "cors";
import { verify, hash } from "../password-hash";
import jwt from "jsonwebtoken";
import { JobSimple } from "../database";
import { SseManager } from "../sse-manager";

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
            password: hash(password),
        });

        await server.db.write();

        response.json({ });

    } catch (e) {
        responseError(response, e);
    }
});

// Login
apiRouter.post("/login", (req, res) => {
    let errorMsg = "Invalid Username or Password";

    try {
        const username = req.body.username;
        const password = req.body.password;

        if (typeof username !== "string" || typeof password !== "string") {
            throw new Error(errorMsg);
        }

        let user = server.db.data.users.find((user) => {
            return user.username === username;
        });

        if (user && verify(password, user.password)) {
            res.json({
                username,
                token: jwt.sign({
                    username: username,
                }, server.secret),
            });
        } else {
            throw new Error(errorMsg);
        }

    } catch (e) {
        responseError(res, e);
    }

    return null;
});

// Job List
apiRouter.get("/job-list", (req, res) => {
    try {
        server.checkLogin(req);

        let list : Record<string, JobSimple> = {};

        for (let job of server.db.data.jobs) {
            list[job.id] = {
                id: job.id,
                name: job.name,
                active: job.active,
                loaded: false,
            };
        }

        res.json({
            jobList: list,
        });
    } catch (e) {
        responseError(res, e);
    }
    server.checkLogin(req);
});

// Get a Job
apiRouter.get("/job/:id", (req, res) => {
    try {
        const job = server.getJob(parseInt(req.params.id));

        res.json({
            job: job.toPublicJSON(),
        });
    } catch (e) {
        responseError(res, e);
    }
});

// Pause a Job
apiRouter.get("/job/:id/pause", (req, res) => {
    try {
        const job = server.getJob(parseInt(req.params.id));
        job.stop();
        res.json({ });
    } catch (e) {
        responseError(res, e);
    }
});

// Resume a Job
apiRouter.get("/job/:id/resume", (req, res) => {
    try {
        const job = server.getJob(parseInt(req.params.id));
        job.start();
        res.json({ });
    } catch (e) {
        responseError(res, e);
    }
});

// Trigger Backup now
apiRouter.get("/job/:id/backup-now", async (req, res) => {
    try {
        const job = server.getJob(parseInt(req.params.id));

        if (!job) {
            throw new Error("Job not found");
        }
        console.log("Manual Backup");
        await job.backupNow(true);
        res.json({

        });
    } catch (e) {
        responseError(res, e);
    }
});

// Download Backup
apiRouter.get("/job/:id/download/:backupName", (req, res) => {
    try {
        const job = server.getJob(parseInt(req.params.id));

    } catch (e) {
        responseError(res, e);
    }
});

// Restore Backup
apiRouter.get("/job/:id/restore/:backupName", async (req, res) => {
    try {
        const job = server.getJob(parseInt(req.params.id));
        const dir = await job.restore(req.params.backupName);
        res.json({
            outputDir: dir,
        });
    } catch (e) {
        responseError(res, e);
    }
});

// Create or Update a Job
apiRouter.post("/job/:id", (req, res) => {

});

// Delete a Job
apiRouter.delete("/job/:id", async (req, res) => {
    try {
        const job = server.getJob(parseInt(req.params.id));
        await job.delete();
        res.json({ });
    } catch (e) {
        responseError(res, e);
    }
});

// TODO: sse
apiRouter.get("/sse", (req, res) => {
    console.log("[sse] new connection");
    let sseStream = SseManager.getInstance().subscribe(req, res);
    sseStream.write({
        data: "Welcome",
    });
});

function responseError(response : Response, e : unknown) {
    if (e instanceof Error) {
        response.status(400);
        response.json({
            msg: e.message,
        });
    }
}
