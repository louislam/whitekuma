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

        const filename = path.join(dataDir, "config.json");
        const lowDB = new Low(new JSONFile<Data>(filename));
        await lowDB.read();

        if (!lowDB.data) {
            lowDB.data = {
                secret: "",
                jobs: [],
                users: [],
            };
            await lowDB.write();
        }

        if (!lowDB.data.secret && !process.env.WK_SECRET) {
            lowDB.data.secret = crypto.randomBytes(32).toString("hex");
            await lowDB.write();
        }

        return new Database(lowDB);
    }

    get data() : Data {
        // @ts-ignore As it must be set in createDB(), it never be null.
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

export type JobSimple = {
    id: number;
    name: string;
    active: boolean;
    loaded: boolean;
}

export type User = {
    username: string;
    password: string;
}

export type Data = {
    secret: string;
    jobs: JobData[];
    users: User[];
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
