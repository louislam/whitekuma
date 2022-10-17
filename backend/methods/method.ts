import { Job } from "../job";
import path from "path";

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
    }

    abstract backup(): Promise<void>;
    abstract restore(): Promise<void>;

    get baseDir(): string {
        if (this.job.jobData.storagePath) {
            return this.job.jobData.storagePath;
        } else {
            return this._baseDir;
        }
    }
}
