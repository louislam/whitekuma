<template>
    <transition name="slide-fade" appear>
        <div>
            <h1 class="mb-3">{{ pageName }}</h1>
            <form @submit.prevent="submit">
                <div class="shadow-box">
                    <div class="row">
                        <div class="col-md-6">
                            <!-- Friendly Name -->
                            <div class="mb-3">
                                <label for="name" class="form-label">{{ $t("Friendly Name") }}</label>
                                <input id="name" v-model="job.name" type="text" class="form-control" required>
                            </div>

                            <!-- Cron -->
                            <div class="mb-3">
                                <label for="cron" class="form-label">Cron</label>
                                <input id="cron" v-model="job.cron" type="text" class="form-control" required>
                            </div>

                            <h2 class="my-4">MariaDB Info</h2>

                            <!-- Hostname -->
                            <div class="mb-3">
                                <label for="hostname" class="form-label">Hostname</label>
                                <input id="hostname" v-model="job.hostname" type="text" class="form-control" required>
                            </div>

                            <!-- Port -->
                            <div class="mb-3">
                                <label for="port" class="form-label">{{ $t("Port") }}</label>
                                <input id="port" v-model="job.port" type="number" class="form-control" required min="0" max="65535" step="1">
                            </div>

                            <!-- Username -->
                            <div class="mb-3">
                                <label for="username" class="form-label">Username</label>
                                <input id="username" v-model="job.username" type="text" class="form-control" required>
                            </div>

                            <!-- Password -->
                            <div class="mb-3">
                                <label for="password" class="form-label">Password</label>
                                <input id="password" v-model="job.password" autocomplete="new-password" type="password" class="form-control">
                            </div>

                            <h2 class="my-4">Advanced</h2>

                            <!-- customExecutable -->
                            <div class="mb-3">
                                <label for="customExecutable" class="form-label">Custom Executable</label>
                                <input id="customExecutable" v-model="job.customExecutable" type="text" class="form-control" placeholder="mariabackup">
                            </div>

                            <!-- Save Button -->
                            <div class="mt-4 mb-1">
                                <button type="submit" class="btn btn-primary">{{ $t("Save") }}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </transition>
</template>

<script lang="ts">

import axios from "axios";

export default {
    components: {

    },

    data() {
        return {
            processing: false,
            job: {
                // Do not add default value here, please check init() method
            },
        };
    },

    computed: {
        pageName() {
            return this.$t((this.isAdd) ? "Add Backup Job" : "Edit");
        },

        isAdd() {
            return this.$route.path === "/add";
        },

        isEdit() {
            return this.$route.path.endsWith("/edit");
        },
    },
    watch: {
        "$route.fullPath"() {
            this.init();
        },
    },
    mounted() {
        this.init();
    },
    methods: {

        async init() {
            if (this.isAdd) {
                this.job = {
                    cron: "*/20 * * * *",
                };
            } else if (this.isEdit) {
                this.processing = true;

                try {
                    const res = await axios.get(`/api/job/${this.$route.params.id}`);
                    this.job = res.data.job;
                } catch (e) {
                    this.$root.showError(e);
                } finally {
                    this.processing = false;
                }
            }

        },

        /**
         * Submit the form data for processing
         * @returns {void}
         */
        async submit() {
            this.processing = true;

            try {
                const res = await axios.post("/api/job", this.job);
                const job = res.data.job;
                this.$router.push("/job/" + job.id);
            } catch (e) {
                this.$root.showError(e);
            } finally {
                this.processing = false;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
    .shadow-box {
        padding: 20px;
    }
</style>
