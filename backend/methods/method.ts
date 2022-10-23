import { Job } from "../job";
import path from "path";
import fs from "fs";
import { BackupInfoJSON } from "../util";

export abstract class Method {
    private readonly _baseDir! : string;
    protected job! : Job;

    constructor(job : Job, dataDir: string) {
        this.job = job;

        if (this.job.jobData.storagePath) {
            this._baseDir = this.job.jobData.storagePath;
        } else {
            this._baseDir = path.join(dataDir, this.job.jobData.id.toString());
        }

        this.createDirIfNotExists();
    }

    createDirIfNotExists() {
        if (!fs.existsSync(this._baseDir)) {
            fs.mkdirSync(this._baseDir, {
                recursive: true,
            });
        }

        // Create Restore Folder
        const restorePath = path.join(this._baseDir, "restore");

        if (!fs.existsSync(restorePath)) {
            fs.mkdirSync(restorePath, {
                recursive: true,
            });
        }
    }

    abstract backup(): Promise<BackupInfoJSON>;
    abstract restore(backupName : string): Promise<string>;
    abstract getBackupList(): BackupInfoJSON[];

    get baseDir(): string {
        if (this.job.jobData.storagePath) {
            return this.job.jobData.storagePath;
        } else {
            return this._baseDir;
        }
    }
}
