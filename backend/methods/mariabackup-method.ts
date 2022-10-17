import { Method } from "./method";
import childProcess from "child_process";
import * as fs from "fs";
import path from "path";
import { dirSize, sb, sleep } from "../util";
import { WhiteKumaServer } from "../whitekuma-server";

export class MariaBackupMethod extends Method {

    async backup() {
        const baseBackup = path.join(this.baseDir, "base");
        const tempBaseDir = path.join(this.baseDir, "temp");

        // Remove Temp Dir
        if (fs.existsSync(tempBaseDir)) {
            fs.rmSync(tempBaseDir, {
                recursive: true,
                force: true
            });
        }
        fs.mkdirSync(tempBaseDir, { recursive: true });

        if (!fs.existsSync(baseBackup)) {

            await this.createBaseBackup(baseBackup, tempBaseDir);
        } else {
            await this.createIncrementalBackup(tempBaseDir);
        }

    }

    async createBaseBackup(baseBackup : string, tempBaseDir : string) {
        const tempBaseBackup = path.join(tempBaseDir, "base");
        await this.createBackup(baseBackup, tempBaseBackup);
    }

    async createIncrementalBackup(tempBaseDir : string) {
        const previousBackupDir = path.join(this.baseDir, this.getLastBackupName());

        let dirName;
        let finalDir;

        // For safe
        while (true) {
            dirName = Date.now().toString();
            finalDir = path.join(this.baseDir, dirName);

            if (fs.existsSync(finalDir)) {
                await sleep(1000);
            } else {
                break;
            }
        }

        const tempDir = path.join(tempBaseDir, dirName);

        await this.createBackup(finalDir, tempDir, previousBackupDir);
    }

    getLastBackupName() : string {
        return this.getBackupList().slice(-1)[0].name;
    }

    getBackupList() {
        const list = fs.readdirSync(this.baseDir, {
            withFileTypes: true
        }).filter((item) => {
            // Is Directory
            // Is `base` and number only
            return item.isDirectory() && (item.name === "base" || !isNaN(parseInt(item.name)));
        }).sort((a, b) => {
            // Luckily, `base` is the first element.
            return parseInt(a.name) - parseInt(b.name);
        });

        console.debug("getBackupList():");
        console.debug(list);

        return list;
    }

    private async createBackup(finalDir : string, tempDir : string, previousBackupDir : string | null = null) {
        let server = WhiteKumaServer.getInstance();

        console.log(sb(this.job.jobData.name), "finalDir: " + finalDir);
        console.log(sb(this.job.jobData.name), "tempDir: " + tempDir);
        console.log(sb(this.job.jobData.name), "previousBackupDir: " + previousBackupDir);

        await new Promise<void>((resolve, reject) => {
            let args = [
                "--compress",
                "--backup",
                "--target-dir=" + tempDir,
                "--host=" + this.job.jobData.hostname,
                "--port=" + this.job.jobData.port,
                "--user=" + this.job.jobData.username,
                "--password=" + server.cryptr.decrypt(this.job.jobData.password),
            ];

            if (previousBackupDir) {
                args.push("--incremental-basedir=" + previousBackupDir);
            }

            let child = childProcess.spawn(this.executable, args);

            child.stdout.setEncoding("utf-8");
            child.stdout.on("data", (data) => {
                console.log(sb(this.job.jobData.name), data.trim());
            });

            child.stderr.setEncoding("utf-8");
            child.stderr.on("data", (data) => {
                console.log(sb(this.job.jobData.name), data.trim());
            });

            child.on("exit", async (code) => {
                resolve();
            });

            child.on("error", (err) => {
                reject(err);
            });
        });

        fs.writeFileSync(path.join(tempDir, "info.json"), JSON.stringify({
            date: new Date().toJSON(),
            size: await dirSize(tempDir),
            previous: previousBackupDir,
        }));
        fs.renameSync(tempDir, finalDir);
    }

    async restore() {

    }

    get executable() {
        if (this.job.jobData.customExecutable) {
            return this.job.jobData.customExecutable;
        } else {
            return "mariabackup";
        }
    }
}
