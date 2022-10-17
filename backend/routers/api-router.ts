import express from "express";
import SseStream from "ssestream";

export let apiRouter = express.Router();

apiRouter.get("/", (request, response) => {
    let result = {
        "version": ""
    };
    response.json(result);
});

// Job List
apiRouter.get("/jobs", (request, response) => {

});

// Get a Job
apiRouter.get("/job/:id", (request, response) => {

});

// Pause a Job
apiRouter.get("/job/:id/pause", (request, response) => {

});

// Resume a Job
apiRouter.get("/job/:id/resume", (request, response) => {

});

// Trigger Backup now
apiRouter.get("/job/:id/backup-now", (request, response) => {

});

// Create or Update a Job
apiRouter.post("/job", (request, response) => {

});

// Delete a Job
apiRouter.delete("/job/:id", (request, response) => {

});

// sse
apiRouter.get("/sse", (req, res) => {
    console.log("new connection");

    const sseStream = new SseStream(req);
    sseStream.pipe(res);
    const pusher = setInterval(() => {
        sseStream.write({
            event: "server-time",
            data: new Date().toTimeString()
        });
    }, 1000);

    res.on("close", () => {
        console.log("lost connection");
        clearInterval(pusher);
        sseStream.unpipe(res);
    });
});
