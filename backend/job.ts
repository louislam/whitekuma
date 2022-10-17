import { Method } from "./methods/method";
import { JobData } from "./database";
import { MariaBackupMethod } from "./methods/mariabackup-method";
// @ts-ignore
import { Cron } from "croner";
import { sb } from "./util";

export class Job {
    private readonly _jobData : JobData;
    private method : Method;
    private running : boolean = false;

    constructor(jobData : JobData, dataDir : string) {
        this._jobData = jobData;

        if (jobData.type === "mariabackup") {
            this.method = new MariaBackupMethod(this, dataDir);
        } else {
            throw new Error("Unknown Job Type");
        }
    }

    start() {
        Cron(this._jobData.cron, async () => {
            if (this.running) {
                return;
            }

            console.log(sb(this._jobData.name), "Creating Backup...");
            try {
                this.running = true;
                await this.method.backup();
                console.log(sb(this._jobData.name), "Backup done");
            } catch (e) {
                console.log(sb(this._jobData.name), "Backup failed");
                console.error(sb(this._jobData.name), e);
            }
            this.running = false;
        });
        console.log(sb(this._jobData.name), "Job Started");
    }

    stop() {
        console.log(sb(this._jobData.name), "Stop Job");
    }

    get jobData(): JobData {
        return this._jobData;
    }
}
