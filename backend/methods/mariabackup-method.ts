import { Method } from "./method.ts";

export class MariaBackupMethod extends Method {
    private process;

    async run() {
        this.process = Deno.run({ cmd: ["winver"] });
        console.log(await this.process.status());
    }

    async stop() {
    }
}
