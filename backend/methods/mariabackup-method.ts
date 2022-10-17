import { Method } from "./method";
import childProcess from "child_process";
import * as fs from "fs";
import path from "path";
import { sb } from "../util";
import { WhiteKumaServer } from "../whitekuma-server";

export class MariaBackupMethod extends Method {

    async backup() {
        const baseBackup = path.join(this.baseDir, "base");
        const temp = path.join(this.baseDir, "temp");
        const tempBaseBackup = path.join(temp, "base");

        // Remove Temp Dir
        if (fs.existsSync(temp)) {
            fs.rmSync(temp, {
                recursive: true,
                force: true
            });
        }
        fs.mkdirSync(temp, { recursive: true });

        if (!fs.existsSync(baseBackup)) {
            await this.createBaseBackup(baseBackup, tempBaseBackup);
        } else {
            let child = childProcess.spawn("mariabackup", [
                "--compress",
                "--backup",
                //"--target-dir=" + currentNum,
                //  "--incremental-basedir=" + previousNum,
                "--user=",
                "--password="
            ]);
            //  --host=<service_name>  --port=3306 --user=root --password=<pass>

            child.stdout.on("data", (data) => {
                console.log(sb(this.job.jobData.name), data);
            });

            child.stderr.on("data", (data) => {
                console.log(sb(this.job.jobData.name), data);
            });

        }

    }

    createBaseBackup(baseBackup : string, tempBaseBackup : string) {
        let server = WhiteKumaServer.getInstance();

        return new Promise<void>((resolve, reject) => {
            let child = childProcess.spawn(this.executable, [
                "--compress",
                "--backup",
                "--target-dir=" + tempBaseBackup,
                "--host=" + this.job.jobData.hostname,
                "--port=" + this.job.jobData.port,
                "--user=" + this.job.jobData.username,
                "--password=" + server.cryptr.decrypt(this.job.jobData.password),
            ]);

            child.stdout.setEncoding("utf-8");
            child.stdout.on("data", (data) => {
                console.log(sb(this.job.jobData.name), data);
            });

            child.stderr.setEncoding("utf-8");
            child.stderr.on("data", (data) => {
                console.log(sb(this.job.jobData.name), data);
            });

            child.on("exit", (code) => {
                fs.renameSync(tempBaseBackup, baseBackup);
                resolve();
            });

            child.on("error", (err) => {
                reject(err);
            });
        });

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
