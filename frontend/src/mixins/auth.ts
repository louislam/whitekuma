export default {

    data() {
        return {
            username: null,
            remember: (localStorage.remember !== "0"),
        };
    },

    created() {
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

    },

    computed: {

        loggedIn() {
            return !!this.storage().token;
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
