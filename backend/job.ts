import { Method } from "./methods/method";
import { JobData } from "./database";
import { MariaBackupMethod } from "./methods/mariabackup-method";
// @ts-ignore
import { Cron } from "croner";
import { sb } from "./util";
import { WhiteKumaServer } from "./whitekuma-server";
import { SseManager } from "./sse-manager";

export class Job {
    private readonly _jobData : JobData;
    private method : Method;
    private runningBackup : boolean = false;
    private runningRestore: boolean = false;
    private cron : Cron;

    toPublicJSON(includeBackUp = true) {
        const server = WhiteKumaServer.getInstance();
        let backupList;

        if (includeBackUp) {
            backupList = this.method.getBackupList().reverse();
        }

        let password = "";

        try {
            password = server.cryptr.decrypt(this._jobData.password);
        } catch (e) {
            console.error("Unable to decrypt password");
        }

        return {
            id: this.jobData.id,
            name: this.jobData.name,
            cron: this.jobData.cron,
            active: this.jobData.active,
            hostname: this.jobData.hostname,
            port: this.jobData.port,
            username: this.jobData.username,
            password,
            customExecutable: this.jobData.customExecutable,
            backupList,
            isRunning: this.runningBackup,
            nextDate: (this._jobData.active) ? this.cron.next()?.toJSON() : undefined,
            loaded: true,
        };
    }

    constructor(jobData : JobData, dataDir : string) {
        this._jobData = jobData;

        if (jobData.type === "mariabackup") {
            this.method = new MariaBackupMethod(this, dataDir);
        } else {
            throw new Error("Unknown Job Type");
        }

        this.cron = new Cron(this._jobData.cron);

        // The job will not start here
        this.cron.pause();

        console.debug(sb(this._jobData.name), "Is running after new: " + this.cron.running());
        this.cron.schedule(async () => {
            await this.backupNow();
        });
        console.debug(sb(this._jobData.name), "Is running after scheduled: " + this.cron.running());
    }

    async start() {
        if (this.cron.running()) {
            console.log(sb(this._jobData.name), "Job Already Started");
            return;
        }

        this.cron.resume();

        if (!this._jobData.active) {
            this._jobData.active = true;
            await WhiteKumaServer.getInstance().db.write();
        }

        SseManager.getInstance().sendJob(this);

        console.log(sb(this._jobData.name), "Job Started");
        console.debug(sb(this._jobData.name), "Is running: " + this.cron.running());
        console.debug(sb(this._jobData.name), "Next Date: " + this.cron.next());
    }

    async backupNow(throwError = false) {
        if (this.runningBackupOrRestore) {
            console.log(sb(this._jobData.name), "Already Running Backup or Restore. Skip.");
            return;
        }

        console.log(sb(this._jobData.name), "Creating Backup...");
        try {
            this.runningBackup = true;
            SseManager.getInstance().sendJob(this);
            await this.method.backup();
            this.runningBackup = false;
            SseManager.getInstance().sendJob(this, true);
            console.log(sb(this._jobData.name), "Backup done");
        } catch (e) {
            console.log(sb(this._jobData.name), "Backup failed");
            console.error(sb(this._jobData.name), e);
            this.runningBackup = false;
            SseManager.getInstance().sendJob(this);
            if (throwError) {
                throw e;
            }
        }
    }

    async restore(backupName : string) : Promise<string> {
        if (this.runningBackupOrRestore) {
            let errorMsg = "Running Backup or Restore currently, please try again later.";
            console.log(sb(this._jobData.name), errorMsg);
            throw new Error(errorMsg);
        }

        try {
            this.runningRestore = true;
            let dir = await this.method.restore(backupName);
            this.runningRestore = false;
            console.log(sb(this._jobData.name), "Restore done");
            return dir;
        } catch (e) {
            console.log(sb(this._jobData.name), "Restore failed");
            console.error(sb(this._jobData.name), e);
            this.runningRestore = false;
            throw e;
        }
    }

    /**
     * Stop the job and set it to inactive
     */
    async stopAndInactive() {
        console.log(sb(this._jobData.name), "Stop Job");
        this._jobData.active = false;
        this.cron.pause();
        await WhiteKumaServer.getInstance().db.write();
        SseManager.getInstance().sendJob(this);
    }

    /**
     * Destroy the job
     */
    async destroy() {
        console.log(sb(this._jobData.name), "Destroy Job");
        this.cron.stop();
    }

    get jobData(): JobData {
        return this._jobData;
    }

    get runningBackupOrRestore() : boolean {
        return this.runningBackup || this.runningRestore;
    }

}
