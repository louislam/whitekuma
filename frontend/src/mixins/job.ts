import axios from "axios";

let sseClient;
let reconnectInterval = null;

export default {
    data() {
        return {
            jobList: {},
            connectedSSE: false,
        };
    },

    async created() {

    },

    watch: {

    },

    methods: {
        connectSSE() {

            sseClient = this.$sse.create({
                url: axios.defaults.baseURL + "/api/sse",
            });

            sseClient.on("message", (msg) => {
                console.log("Unknown Msg: " + msg);
            });
            sseClient.on("job", this.jobUpdate);

            // Catch any errors (ie. lost connections, etc.)
            sseClient.on("error", (e) => {
                console.error("lost connection or failed to parse!", e);
                this.connectedSSE = false;

                if (!reconnectInterval) {
                    reconnectInterval = setInterval(() => {
                        if (!this.connectedSSE) {
                            console.log("Try to reconnect sse");
                            sseClient.connect();
                        } else {
                            window.clearInterval(reconnectInterval);
                        }
                    }, 5000);
                }

            });

            sseClient.connect()
                .then(sse => {
                    console.log("Connected to SSE");
                    this.connectedSSE = true;
                })
                .catch((err) => {
                    console.error("Failed to connect to SSE", err);
                });

        },

        jobUpdate(job) {
            console.info(job);
        }
    }
};
