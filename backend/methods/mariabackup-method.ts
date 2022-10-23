import { Method } from "./method";
import childProcess from "child_process";
import * as fs from "fs";
import path from "path";
import { BackupInfoJSON, dirSize, readJSON, sb, sleep } from "../util";
import { WhiteKumaServer } from "../whitekuma-server";
import * as os from "os";
import { SQL_DATETIME_FORMAT } from "../../shared/util";
import dayjs from "dayjs";

export class MariaBackupMethod extends Method {

    async backup() : Promise<BackupInfoJSON> {
        const baseBackup = path.join(this.baseDir, "base");

        if (!fs.existsSync(baseBackup)) {
            return await this.createBaseBackup(baseBackup);
        } else {
            return await this.createIncrementalBackup();
        }

    }

    async createBaseBackup(baseBackup : string) {
        return await this.createBackup(baseBackup);
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

        return await this.createBackup(finalDir, this.getLastBackupName());
    }

    getLastBackupName() : string {
        return this.getBackupNameList().slice(-1)[0].name;
    }

    getBackupNameList() : fs.Dirent[] {
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

    getBackupList(): BackupInfoJSON[] {
        let result = [];

        for (let dirent of this.getBackupNameList()) {
            let currentBackupName = dirent.name;
            let p = path.join(this.baseDir, currentBackupName);
            let info = readJSON<BackupInfoJSON>(path.join(p, "info.json"));
            result.push(info);
        }

        return result;
    }

    private async createBackup(finalDir : string, previousBackupName : string | null = null) : Promise<BackupInfoJSON> {
        this.createDirIfNotExists();

        let server = WhiteKumaServer.getInstance();

        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "whitekuma_temp_backup_"));
        let previousBackupDir : string | null = null;

        if (previousBackupName) {
            previousBackupDir = path.join(this.baseDir, previousBackupName);
        }

        console.log(sb(this.job.jobData.name), "finalDir: " + finalDir);
        console.log(sb(this.job.jobData.name), "tempDir: " + tempDir);
        console.log(sb(this.job.jobData.name), "previousBackupDir: " + previousBackupDir);

        await new Promise<void>((resolve, reject) => {
            let args = [
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
                // Some normal msg write here, so don't use console.error
                console.log(sb(this.job.jobData.name), data.trim());
            });

            child.on("exit", async (code) => {
                console.debug(sb(this.job.jobData.name), "Exit Code: " + code);
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error("Exit Code: " + code));
                }
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
            dir: finalDir,
            date: new Date().toJSON(),
            size,
            totalSize,
            previousBackupName: previousBackupName,
            previousBackupDir: previousBackupDir,
        };

        fs.writeFileSync(path.join(tempDir, "info.json"), JSON.stringify(info));
        fs.renameSync(tempDir, finalDir);
        return info;
    }

    async restore(backupName : string) : Promise<string> {
        this.createDirIfNotExists();

        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "whitekuma_temp_restore_"));

        const stack : BackupInfoJSON[] = [];

        let currentBackupName = backupName;

        // From selected backup down to the `base`
        while (true) {
            let p = path.join(this.baseDir, currentBackupName);
            let info = readJSON<BackupInfoJSON>(path.join(p, "info.json"));

            if (!info || typeof info !== "object") {
                throw new Error("Invalid Backup: info.json is not an object");
            }

            // TODO: Check free space

            stack.push(info);

            if (info.previousBackupName) {
                currentBackupName = info.previousBackupName;
            } else {
                break;
            }
        }

        // Copy the base to temp
        let info = stack.pop();

        if (!info) {
            throw new Error("No base?");
        }

        // Start from base
        while (true) {
            await this.prepareRestore(info, tempDir);
            info = stack.pop();

            if (!info) {
                break;
            }
        }

        // Move to <baseDir>/restore/<timestamp>
        const finalDir = path.join(this.baseDir, "restore", `restore-${dayjs().format(SQL_DATETIME_FORMAT)}`);

        fs.renameSync(tempDir, finalDir);
        return finalDir;
    }

    private async prepareRestore(info: BackupInfoJSON, tempDir: string) {
        const isBase = !info.previousBackupDir;

        if (isBase) {
            fs.cpSync(info.dir, tempDir, {
                recursive: true,
            });
        }

        await new Promise<void>((resolve, reject) => {
            let args = [
                "--prepare",
                "--target-dir=" + tempDir,
            ];

            if (!isBase) {
                args.push("--incremental-basedir=" + info.dir);
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
                console.debug(sb(this.job.jobData.name), "Exit Code: " + code);

                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error("Exit Code: " + code));
                }
            });

            child.on("error", (err) => {
                reject(err);
            });
        });
    }

    get executable() {
        if (this.job.jobData.customExecutable) {
            return this.job.jobData.customExecutable;
        } else {
            return "mariabackup";
        }
    }
}
