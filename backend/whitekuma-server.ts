import { Application, etaEngine, oakAdapter, viewEngine } from "./deps.ts";
import { apiRoutes, frontendRoutes } from "./routers.ts";
import { MariaBackupMethod } from "./methods/mariabackup-method.ts";

export class WhiteKumaServer {
    private static instance: WhiteKumaServer;

    private app: Application = new Application();

    static getInstance() {
        if (!this.instance) {
            this.instance = new WhiteKumaServer();
        }
        return this.instance;
    }

    constructor() {
        this.init();
    }

    init() {
        this.app.use(
            viewEngine(oakAdapter, etaEngine, {
                viewRoot: "./backend/views/",
            }),
        );

        // Routes
        this.app.use(apiRoutes);
        this.app.use(frontendRoutes);
    }

    run() {
        console.log("Welcome to Whitekuma!");

        this.app.listen({
            port: 3011,
        });

        const method = new MariaBackupMethod();

        console.log("Started");
    }

    close() {
    }
}
