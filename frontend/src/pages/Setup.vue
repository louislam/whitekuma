<template>
    <transition name="slide-fade" appear>
        <div class="form-container" data-cy="setup-form">
            <div class="form">
                <form @submit.prevent="submit">
                    <div>
                        <object width="64" height="64" data="/icon.svg" />
                        <div style="font-size: 28px; font-weight: bold; margin-top: 5px;">
                            WhiteKuma
                        </div>
                    </div>

                    <p class="mt-3">
                        {{ $t("Create your admin account") }}
                    </p>

                    <div v-if="false" class="form-floating">
                        <select id="language" v-model="$i18n.locale" class="form-select">
                            <option v-for="(lang, i) in $i18n.availableLocales" :key="`Lang${i}`" :value="lang">
                                {{ $i18n.messages[lang].languageName }}
                            </option>
                        </select>
                        <label for="language" class="form-label">{{ $t("Language") }}</label>
                    </div>

                    <div class="form-floating mt-3">
                        <input id="floatingInput" v-model="username" type="text" class="form-control" placeholder="Username" required data-cy="username-input">
                        <label for="floatingInput">{{ $t("Username") }}</label>
                    </div>

                    <div class="form-floating mt-3">
                        <input id="floatingPassword" v-model="password" type="password" class="form-control" placeholder="Password" required data-cy="password-input">
                        <label for="floatingPassword">{{ $t("Password") }}</label>
                    </div>

                    <div class="form-floating mt-3">
                        <input id="repeat" v-model="repeatPassword" type="password" class="form-control" placeholder="Repeat Password" required data-cy="password-repeat-input">
                        <label for="repeat">{{ $t("Repeat Password") }}</label>
                    </div>

                    <button class="w-100 btn btn-primary mt-3" type="submit" :disabled="processing" data-cy="submit-setup-form">
                        {{ $t("Create") }}
                    </button>
                </form>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import { useToast } from "vue-toastification";
import axios from "axios";
const toast = useToast();

export default {
    data() {
        return {
            processing: false,
            username: "",
            password: "",
            repeatPassword: "",
        };
    },
    watch: {
        "$i18n.locale"() {
            localStorage.locale = this.$i18n.locale;
        },
    },
    async create() {
        const needSetup : boolean = (await axios.get("/api/need-setup")).data;
        if (!needSetup) {
            this.$router.push("/");
        }
    },
    methods: {
        /**
         * Submit form data for processing
         * @returns {void}
         */
        async submit() {
            this.processing = true;

            if (this.password !== this.repeatPassword) {
                toast.error(this.$t("PasswordsDoNotMatch"));
                this.processing = false;
                return;
            }

            try {
                const res = await axios.post("/api/setup", {
                    username: this.username,
                    password: this.password,
                });
                this.$root.showSuccess("Created Successfully");
                this.$router.push("/login");
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
    > .form-select {
        padding-left: 1.3rem;
        padding-top: 1.525rem;
        line-height: 1.35;

        ~ label {
            padding-left: 1.3rem;
        }
    }

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
