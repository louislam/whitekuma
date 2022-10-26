import SseStream from "ssestream";
import { Response, Request } from "express";
import { Job } from "./job";

export class SseManager {

    static instance : SseManager | null = null;
    sseStreamList : SseStream[] = [];

    static getInstance() {
        if (!this.instance) {
            this.instance = new SseManager();
        }
        return this.instance;
    }

    subscribe(req: Request, res: Response) {
        const sse = new SseStream(req);
        sse.pipe(res);

        res.on("close", () => {
            console.debug("[sse] lost connection");
            sse.unpipe(res);

            let index = this.sseStreamList.indexOf(sse);
            if (index !== -1) {
                this.sseStreamList.splice(index, 1);
            }
        });

        this.sseStreamList.push(sse);
        return sse;
    }

    sendJob(job : Job, includeBackupList = false) {
        console.debug("[sse] sendJob");
        this.sendMessage(job.toPublicJSON(includeBackupList), "job");
    }

    sendMessage(data : object, event : string | undefined = undefined) {
        console.debug("[sse] sendMessage");
        // Copy the array to prevent the array is being changed in for-loop
        let list = [ ...this.sseStreamList ];

        if (list.length === 0) {
            console.debug("[sse] no connections?");
            console.debug(this.sseStreamList);
            console.debug(list);
        }

        for (let sseStream of list) {
            if (!sseStream.closed) {
                console.debug("[sse] send sse msg");
                try {
                    sseStream.write({
                        event,
                        data
                    });
                } catch (e) {
                    console.debug(e);
                }
            } else {
                console.log("[sse] closed?");
            }
        }
    }

}
