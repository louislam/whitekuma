import { Method } from "./method";
import childProcess from "child_process";
import * as fs from "fs";
import path from "path";
import { BackupInfoJSON, dirSize, readJSON, sb, sleep } from "../util";
import { WhiteKumaServer } from "../whitekuma-server";
import * as os from "os";

export class MariaBackupMethod extends Method {

    async backup() {
        const baseBackup = path.join(this.baseDir, "base");

        if (!fs.existsSync(baseBackup)) {
            await this.createBaseBackup(baseBackup);
        } else {
            await this.createIncrementalBackup();
        }

    }

    async createBaseBackup(baseBackup : string) {
        await this.createBackup(baseBackup);
    }

    async createIncrementalBackup() {
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

        await this.createBackup(finalDir, this.getLastBackupName());
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
            // Put `base` in the first
            if (a.name === "base") {
                return -1;
            }
            if (b.name === "base") {
                return 1;
            }
            return parseInt(a.name) - parseInt(b.name);
        });

        console.debug("getBackupList():");
        console.debug(list);

        return list;
    }

    private async createBackup(finalDir : string, previousBackupName : string | null = null) {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "whitekuma_temp_backup_"));
        let previousBackupDir : string | null = null;

        if (previousBackupName) {
            previousBackupDir = path.join(this.baseDir, previousBackupName);
        }

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

        let size = await dirSize(tempDir);
        let totalSize : number;

        if (previousBackupDir) {
            const previousInfoPath = path.join(previousBackupDir, "info.json");
            let previousInfo : BackupInfoJSON = readJSON<BackupInfoJSON>(previousInfoPath);
            totalSize = previousInfo.totalSize + size;
        } else {
            totalSize = size;
        }

        let info : BackupInfoJSON = {
            date: new Date().toJSON(),
            size,
            totalSize,
            previousBackupName: previousBackupName,
            previousBackupDir: previousBackupDir,
        };

        fs.writeFileSync(path.join(tempDir, "info.json"), JSON.stringify(info));
        fs.renameSync(tempDir, finalDir);
    }

    async restore(backupName : string) {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "whitekuma_temp_restore_"));

        const stack : BackupInfoJSON[] = [];

        let currentBackupName = backupName;

        // From selected backup down to the `base`
        while (true) {
            let info = readJSON<BackupInfoJSON>(path.join(this.baseDir, currentBackupName, "info.json"));
            stack.push(info);
            if (info.previousBackupName) {
                currentBackupName = info.previousBackupName;
            } else {
                break;
            }
        }

        // Start from base
        while (true) {
            let info = stack.pop();

            if (!info) {
                break;
            }

            // For base
            // mariabackup --prepare --apply-log-only --target-dir=/tmp/mariadb/backup/

            // For others
            // mariabackup --prepare --apply-log-only --target-dir=/tmp/mariadb/backup/ --incremental-dir=/tmp/mariadb/backup/increment/
            // mariabackup --prepare --apply-log-only --target-dir=/tmp/mariadb/backup/ --incremental-dir=/tmp/mariadb/backup/incrementNew/
        }
    }

    get executable() {
        if (this.job.jobData.customExecutable) {
            return this.job.jobData.customExecutable;
        } else {
            return "mariabackup";
        }
    }
}
