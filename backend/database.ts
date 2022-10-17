import path from "path";
import crypto from "crypto";

export class Database {

    private lowDB! : Low<Data>;

    constructor(lowDB : Low<Data>) {
        this.lowDB = lowDB;
    }

    static async createDB(dataDir : string) : Promise<Database> {
        // LowDB is an ES Module, have to load using await, so put here
        let { Low, JSONFile } = await import("lowdb");

        const filename = path.join(dataDir, "db.json");
        const lowDB = new Low(new JSONFile<Data>(filename));
        await lowDB.read();

        if (!lowDB.data) {
            lowDB.data = {
                secret: "",
                jobs: []
            };
            await lowDB.write();
        }

        if (!lowDB.data.secret) {
            lowDB.data.secret = crypto.randomBytes(32).toString("hex");
            await lowDB.write();
        }

        return new Database(lowDB);
    }

    get data() : Data {
        if (!this.lowDB.data) {
            this.lowDB.data = {
                secret: "",
                jobs: []
            };
        }
        return this.lowDB.data;
    }

    read() {
        return this.lowDB.read();
    }

    write() {
        return this.lowDB.write();
    }

    reload() {
        return this.read();
    }
}

export type JobData = {
    id: number;
    name: string;
    cron: string;
    type: string;
    active: boolean;
    hostname: string;
    port: string;
    username: string;
    password: string;
    storage: string;
    storagePath: string;
    customExecutable: string;
}

export type Data = {
    secret: string;
    jobs: JobData[];
}

/**
 * Copy from node_modules\lowdb\lib\Low.d.ts
 * As I don't know how to import it through `await import();`
 */
export interface Adapter<T> {
    read: () => Promise<T | null>;
    write: (data: T) => Promise<void>;
}

export declare class Low<T = unknown> {
    adapter: Adapter<T>;
    data: T | null;
    constructor(adapter: Adapter<T>);
    read(): Promise<void>;
    write(): Promise<void>;
}
