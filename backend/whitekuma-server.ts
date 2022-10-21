import express, { Express } from "express";
import { Database } from "./database";
import Cryptr from "cryptr";
import { Job } from "./job";
import consoleStamp from "console-stamp";
import expressStaticGzip from "express-static-gzip";

export class WhiteKumaServer {
    public version : string = "unknown";
    private static instance : WhiteKumaServer;
    private app : Express = express();

    private port : number = 3011;
    private dataDir : string = "./data";
    private _db! : Database;
    private _cryptr! : Cryptr;
    private jobList : Job[] = [];

    private indexHTML : string = "";

    private _secret! : string;

    static getInstance() : WhiteKumaServer {
        if (!this.instance) {
            this.instance = new WhiteKumaServer();
        }
        return this.instance;
    }

    private constructor() {

    }

    async init() : Promise<void> {
        let includeLog = [ "log", "info", "warn", "error" ];

        if ((process.env.NODE_ENV === "development")) {
            includeLog.push("debug");
        }

        consoleStamp(console, {
            format: ":date().blue :label(7).green",
            include: includeLog,
        });

        console.log("Welcome to WhiteKuma");

        if (process.env.npm_package_version) {
            this.version = process.env.npm_package_version;
        }

        try {
            this.indexHTML = fs.readFileSync("./dist/index.html").toString();
        } catch (e) {
            // "dist/index.html" is not necessary for development
            if (process.env.NODE_ENV !== "development") {
                console.error("Error: Cannot find 'dist/index.html', did you install correctly?");
                process.exit(1);
            }
        }

        console.debug("Adding API Router");

        this.app.use("/", expressStaticGzip("dist", {
            enableBrotli: true,
        }));

        this.app.use("/api", apiRouter);

        // Universal Route Handler, must be at the end of all express routes.
        this.app.get("*", async (req, res) => {
            if (req.originalUrl.startsWith("/upload/")) {
                res.status(404).send("File not found.");
            } else {
                res.send(this.indexHTML);
            }
        });

        this._db = await Database.createDB(this.dataDir);

        this._secret = process.env.WK_SECRET || this._db.data.secret;
        this._cryptr = new Cryptr(this._secret);

        this.app.listen(this.port, () => {
            console.log(`⚡️Server is running at http://localhost:${this.port}`);
        });

        this.startJobs();
    }

    startJobs() {
        console.log("Prepare to Start All Jobs");

        if (this._db.data.jobs.length === 0) {
            console.log("No Jobs");
            return;
        }

        let jobDataList = this._db.data.jobs;

        for (let jobData of jobDataList) {
            let job = new Job(jobData, this.dataDir);
            this.jobList.push(job);

            if (jobData.active) {
                job.start();
            }
        }
    }

    close() {
    }

    get cryptr(): Cryptr {
        return this._cryptr;
    }

    get needSetup(): boolean {
        return this._db.data.users.length <= 0;
    }

    get db(): Database {
        return this._db;
    }

    getJob(id : number) : Job {
        let job = this.jobList.find((job) => {
            return job.jobData.id === id;
        });
        if (!job) {
            throw new Error("Job not found");
        }
        return job;
    }

    get secret() {
        return this._secret;
    }
}

import { apiRouter } from "./routers/api-router";
import fs from "fs";

