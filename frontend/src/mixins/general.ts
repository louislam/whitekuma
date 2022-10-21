import { useToast } from "vue-toastification";
import axios, { Axios, AxiosError } from "axios";
const toast = useToast();

export default {

    data() {
        return {

        };
    },

    beforeCreate() {
        if (process.env.NODE_ENV === "development") {
            axios.defaults.baseURL = "http://" + location.hostname + ":3011";
        }
    },

    created() {

    },

    methods: {

        /**
         * The storage currently in use
         * @returns {Storage}
         */
        storage() {
            return (this.remember) ? localStorage : sessionStorage;
        },

        /**
         * Show success or error toast dependant on response status code
         * @param {Object} res Response object
         */
        showRes(res) {
            if (res.ok) {
                toast.success(res.msg);
            } else {
                toast.error(res.msg);
            }
        },

        /**
         * Show a success toast
         * @param {string} msg Message to show
         */
        showSuccess(msg) {
            toast.success(msg);
        },

        showMsg(msg) {
            toast.info(msg);
        },

        /**
         * Show an error toast
         */
        showError(err : unknown) {
            let msg = "Unknown Error";
            if (typeof err === "string") {
                msg = err;
            } else if (
                err instanceof AxiosError &&
                err.response && err.response.data && err.response.data.msg
            ) {
                msg = err.response.data.msg;
            } else if (err instanceof Error) {
                msg = err.message;
            }
            toast.error(msg);
        },
    },

    computed: {
        /**
         *  Frontend Version
         *  It should be compiled to a static value while building the frontend.
         *  Please see ./config/vite.config.js, it is defined via vite.js
         * @returns {string}
         */
        frontendVersion() {
            // @ts-ignore
            // eslint-disable-next-line no-undef
            return FRONTEND_VERSION;
        },

        /**
         * Are both frontend and backend in the same version?
         * @returns {boolean}
         */
        isFrontendBackendVersionMatched() {
            if (!this.info.version) {
                return true;
            }
            return this.info.version === this.frontendVersion;
        }
    },

    watch: {
        // Reload the SPA if the server version is changed.
        "info.version"(to, from) {
            if (from && from !== to) {
                window.location.reload();
            }
        },
    },

};
