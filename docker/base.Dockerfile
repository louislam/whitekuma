FROM node:18-buster-slim
RUN apt update && \
    apt --yes --no-install-recommends install curl && \
    curl -LsS https://r.mariadb.com/downloads/mariadb_repo_setup | bash && \
    apt --yes --no-install-recommends install mariadb-backup && \
    rm -rf /var/lib/apt/lists/* && \
    apt --yes autoremove

RUN npm install -g ts-node@~10.9.1



