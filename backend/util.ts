import path from "path";
import { readdir, stat } from "fs/promises";
import type { Response } from "express";

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
