# MariaDB Backup Tool by WhiteKuma

An easy-to-use MariaDB incremental backup tool.

## Motivation

- Currently, I am using `mysqldump` to backup my database, but it does not support incremental backup. It is not so efficient.
- `mariabackup` command line is a good tool, but it is too hard to use without GUI.
- Want to try Deno instead of Node.js. I honestly love it, but the Deno community seems to be dead, a lot of modules have not updated for a year. So I switch back to Node.js 
- Want to try full ES Module project, but also it is not supported by all packages. Switched back to CommonJS.
- Full TypeScript project

## Reference

https://backup.ninja/news/mariadb-backups-what-is-mariabackup
