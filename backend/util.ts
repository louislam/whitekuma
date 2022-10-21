import path from "path";
import { readdir, stat } from "fs/promises";
import { JobData, User } from "./database";
import fs from "fs";
import { Request } from "express";

export function sb(text : string) {
    return `[${text}]`;
}

/**
 * From: https://stackoverflow.com/questions/30448002/how-to-get-directory-size-in-node-js-without-recursively-going-through-directory
 * @param directory
 */
export async function dirSize(directory : string) {
    const files = await readdir(directory);
    const stats = files.map((file : string) => {
        return stat(path.join(directory, file));
    });
    return (await Promise.all(stats)).reduce((accumulator, { size }) => accumulator + size, 0);
}

export function sleep(ms : number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export type BackupInfoJSON = {
    dir: string;
    date: string;
    size: number;
    totalSize: number;
    previousBackupName: string | null,
    previousBackupDir: string | null;
}

export function readJSON<T>(path: string) : T {
    return JSON.parse(fs.readFileSync(path, "utf-8"));
}

