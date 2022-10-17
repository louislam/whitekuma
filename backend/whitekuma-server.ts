import { apiRouter } from "./routers/api-router";
import express, { Express } from "express";
import { MariaBackupMethod } from "./methods/mariabackup-method";
import { Database } from "./database";
import Cryptr from "cryptr";
import { Job } from "./job";
import consoleStamp from "console-stamp";

export class WhiteKumaServer {

    public version : string = "unknown";
    private static instance : WhiteKumaServer;
    private app : Express = express();

    readonly ENV_PREFIX = "WK_";

    private port : number = 3011;
    private dataDir : string = "./data";
    private db! : Database;
    private _cryptr! : Cryptr;
    private jobList : Job[] = [];

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

        console.debug("Adding API Router");
        this.app.use("/api", apiRouter);
        this.db = await Database.createDB(this.dataDir);
        this._cryptr = new Cryptr(this.db.data.secret);

        this.app.listen(this.port, () => {
            console.log(`⚡️Server is running at http://localhost:${this.port}`);
        });

        this.startJobs();
    }

    startJobs() {
        console.log("Prepare to Start All Jobs");

        if (this.db.data.jobs.length === 0) {
            console.log("No Jobs");
            return;
        }

        let jobDataList = this.db.data.jobs;

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

}
