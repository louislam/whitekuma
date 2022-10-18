import { useToast } from "vue-toastification";
const toast = useToast();

export default {

    data() {
        return {
            username: null,
            remember: (localStorage.remember !== "0"),
            loggedIn: false,
        };
    },

    created() {
        window.addEventListener("resize", this.onResize);

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
        toastRes(res) {
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
        toastSuccess(msg) {
            toast.success(msg);
        },

        /**
         * Show an error toast
         * @param {string} msg Message to show
         */
        toastError(msg) {
            toast.error(msg);
        },
    },

    computed: {

        usernameFirstChar() {
            if (typeof this.username == "string" && this.username.length >= 1) {
                return this.username.charAt(0).toUpperCase();
            } else {
                return "🐻";
            }
        },

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

        remember() {
            localStorage.remember = (this.remember) ? "1" : "0";
        },

        "$route.fullPath"(newValue, oldValue) {

        },

    },

};
