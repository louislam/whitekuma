import express, { Express, Request } from "express";
import { Database, JobData } from "./database";
import Cryptr from "cryptr";
import fs from "fs";
import consoleStamp from "console-stamp";
import expressStaticGzip from "express-static-gzip";
import jwt from "jsonwebtoken";

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
        console.log("Environment: " + process.env.NODE_ENV);

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

        this.app.listen(this.port, async () => {
            console.log(`⚡️Server is running at http://localhost:${this.port}`);
            await this.startJobs();
        });

    }

    async startJobs() {
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
                await job.start();
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

    checkLogin(req : Request) {
        const auth = req.headers.authorization;

        if (!auth) {
            throw new Error("Not Logged In");
        }

        let split = auth.split(" ");

        if (split.length <= 1) {
            throw new Error("Not Logged In");
        }

        let token = split[1];

        let decoded = jwt.verify(token, this.secret) as {
            username: string;
        };

        console.debug("Username from JWT: " + decoded.username);

        let user = this._db.data.users.find((user) => {
            return user.username === decoded.username;
        });

        if (!user) {
            throw new Error("Not Logged In");
        }
    }

    async checkAndProcessJobData(jobData: JobData) {
        if (typeof jobData.cron !== "string") {
            throw new Error("Invalid Cron");
        }

        jobData.cron = jobData.cron.trim();
        jobData.password = this.cryptr.encrypt(jobData.password);

        return jobData;
    }

    async createJob(jobData: JobData) {
        jobData = await this.checkAndProcessJobData(jobData);
        jobData.id = this.generateJobID();
        jobData.type = "mariabackup";
        jobData.active = true;
        jobData.storage = "local";
        jobData.storagePath = "";

        const job = new Job(jobData, this.dataDir);

        console.debug("Job Created: " + jobData.id);

        // Try to start the job.
        await job.start();

        console.debug("Job Started: " + jobData.id);

        // Add to DB
        this._db.data.jobs.push(jobData);
        await this._db.write();

        // Add to Job List
        this.jobList.push(job);

        SseManager.getInstance().sendJob(job);

        return job;
    }

    async updateJob(newJobData: JobData) {
        newJobData = await this.checkAndProcessJobData(newJobData);

        const job = this.getJob(newJobData.id);
        await job.destroy();

        // Remove job from joblist
        this.jobList = this.jobList.filter((job) => {
            return job.jobData.id !== newJobData.id;
        });

        // Update job data in DB
        let jobDataIndex = this._db.data.jobs.findIndex((jobData) => {
            return jobData.id === job.jobData.id;
        });

        let jobData = this._db.data.jobs[jobDataIndex];

        console.debug(jobData);

        jobData.name = newJobData.name;
        jobData.cron = newJobData.cron;
        jobData.hostname = newJobData.hostname;
        jobData.hostname = newJobData.hostname;
        jobData.port = newJobData.port;
        jobData.username = newJobData.username;
        jobData.password = newJobData.password;
        jobData.customExecutable = newJobData.customExecutable;

        console.debug(jobData);

        await this._db.write();

        // Add back to joblist
        const newJob = new Job(jobData, this.dataDir);
        this.jobList.push(newJob);

        return newJob;
    }

    private generateJobID() : number {
        let id = 0;
        for (let job of this._db.data.jobs) {
            if (job.id > id) {
                id = job.id;
            }
        }
        return id + 1;
    }

    async deleteJob(id: number) {
        let job = this.getJob(id);

        // Stop the Job
        await job.destroy();

        // Remove from JobList
        let index = this.jobList.indexOf(job);
        this.jobList.splice(index, 1);

        // Remove from DB
        let jobDataIndex = this._db.data.jobs.findIndex((jobData) => {
            return jobData.id === id;
        });

        this._db.data.jobs.splice(jobDataIndex, 1);

        // Write to DB
        await this._db.write();

        SseManager.getInstance().deleteJob(id);
    }
}

import { apiRouter } from "./routers/api-router";
import { Job } from "./job";
import { SseManager } from "./sse-manager";

