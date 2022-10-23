<template>
    <transition name="slide-fade" appear>
        <div class="form-container">
            <div class="form">
                <form @submit.prevent="submit">
                    <h1 class="h3 mb-3 fw-normal" />

                    <div class="form-floating">
                        <input id="floatingInput" v-model="username" type="text" class="form-control" placeholder="Username">
                        <label for="floatingInput">{{ $t("Username") }}</label>
                    </div>

                    <div class="form-floating mt-3">
                        <input id="floatingPassword" v-model="password" type="password" class="form-control" placeholder="Password">
                        <label for="floatingPassword">{{ $t("Password") }}</label>
                    </div>

                    <div class="form-check mb-3 mt-3 d-flex justify-content-center pe-4">
                        <div class="form-check">
                            <input id="remember" v-model="$root.remember" type="checkbox" value="remember-me" class="form-check-input">

                            <label class="form-check-label" for="remember">
                                {{ $t("Remember me") }}
                            </label>
                        </div>
                    </div>
                    <button class="w-100 btn btn-primary" type="submit" :disabled="processing">
                        {{ $t("Login") }}
                    </button>

                    <div v-if="res && !res.ok" class="alert alert-danger mt-3" role="alert">
                        {{ res.msg }}
                    </div>
                </form>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import axios from "axios";

export default {
    data() {
        return {
            processing: false,
            username: "",
            password: "",
        };
    },

    async beforeCreate() {
        const needSetup : boolean = (await axios.get("/api/need-setup")).data;
        if (needSetup) {
            console.log("Need Setup");
            this.$router.push("/setup");
        }

        // If loggedIn, get out
        if (this.$root.loggedIn) {
            this.$router.push("/");
        }
    },

    mounted() {
        document.title += " - Login";
    },

    unmounted() {
        document.title = document.title.replace(" - Login", "");
    },

    methods: {
        /** Submit the user details and attempt to log in */
        async submit() {
            this.processing = true;

            try {
                const res = await axios.post("/api/login", {
                    username: this.username,
                    password: this.password,
                });

                this.$root.storage().token = res.data.token;
                this.$root.storage().username = res.data.username;
                this.$root.username = res.data.username;
                this.$router.push("/");

            } catch (e) {
                this.$root.showError(e);
            }

            this.processing = false;
        },
    },
};
</script>

<style lang="scss" scoped>
.form-container {
    display: flex;
    align-items: center;
    padding-top: 40px;
    padding-bottom: 40px;
}

.form-floating {
    > label {
        padding-left: 1.3rem;
    }

    > .form-control {
        padding-left: 1.3rem;
    }
}

.form {
    width: 100%;
    max-width: 330px;
    padding: 15px;
    margin: auto;
    text-align: center;
}
</style>
