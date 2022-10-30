
After spending some time on this, I just finished it for my own use case.

However, I found that it is hard to dockerize it. Due to the limitation of mariabackup. Also there are so many case to be handled.

Moreover, even though I really enjoy using TypeScript, since Node.js is not native support for it, the deployment process will be a little bit complicated. I really hope Bun.js  or Deno could grow up soon.

So the development is stopped here for now.

# MariaDB Backup Tool by WhiteKuma

An easy-to-use MariaDB incremental backup tool.

## Motivation

- I was using `mysqldump` to backup my database, but it does not support incremental backup. It is not so efficient
- Cannot find an easy-to-use incremental backup tool
- `mariabackup` command line is a good tool, but it is too hard to use without GUI
- Full TypeScript project

## Reference

- https://backup.ninja/news/mariadb-backups-what-is-mariabackup
