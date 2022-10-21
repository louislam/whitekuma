import axios from "axios";

export default {

    data() {
        return {
            username: null,
            remember: (localStorage.remember !== "0"),
        };
    },

    beforeCreate() {
        axios.interceptors.request.use((config) => {
            const token = this.$root.storage().token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    },

    created() {
        this.username = this.$root.storage().username;
        this.checkLogin();
    },

    methods: {

        checkLogin() {
            if (this.$route.fullPath !== "/login" && this.$route.fullPath !== "/setup") {
                if (!this.loggedIn) {
                    this.$router.push("/login");
                }
            }
        },

        logout() {
            this.storage().removeItem("token");
            this.username = null;
            this.$router.push("/login");
        },

    },

    computed: {

        loggedIn() {
            return !!this.username;
        },

        usernameFirstChar() {
            if (typeof this.username == "string" && this.username.length >= 1) {
                return this.username.charAt(0).toUpperCase();
            } else {
                return "🐻";
            }
        },
    },

    watch: {

        remember() {
            localStorage.remember = (this.remember) ? "1" : "0";
        },

        "$route.fullPath"(path) {
            this.checkLogin();
        },
    },

};
