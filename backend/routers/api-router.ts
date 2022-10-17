import express from "express";

export let apiRouter = express.Router();

apiRouter.get("/", (request, response) => {
    let result = { };
    response.json(result);
});
