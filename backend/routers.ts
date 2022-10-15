import { Router } from "./deps.ts";

// Frontend Router
const frontendRouter = new Router();

frontendRouter.get("/", (ctx) => {
    ctx.render("index.eta");
});

const frontendRoutes = (new Router()).use(
    "/",
    frontendRouter.routes(),
    frontendRouter.allowedMethods(),
).routes();

// API Router
const apiRouter = new Router();

apiRouter.get("/", (ctx) => {
    ctx.response.body = {};
});

const apiRoutes = (new Router()).use(
    "/api",
    apiRouter.routes(),
    apiRouter.allowedMethods(),
).routes();

export { apiRoutes, frontendRoutes };
