<template>
    <transition name="slide-fade" appear>
        <div v-if="job && job.loaded">
            <h1>
                {{ job.name }}
            </h1>

            <div>
                <div class="mb-1">
                    <Pill v-if="job.isRunning" type="info">Running</Pill> <Pill v-if="job.active" type="primary">Active</Pill> <Pill v-if="!job.active" type="danger">Inactive</Pill> {{ job.cron }}
                </div>
                <div class="mb-3">
                    Next Backup: {{ formatDate(job.nextDate) }}
                </div>
            </div>

            <div class="functions mb-3">
                <div class="btn-group" role="group">
                    <button class="btn btn-primary" @click="backupNow">
                        <font-awesome-icon icon="database" /> {{ $t("Backup Now") }}
                    </button>

                    <button v-if="job.active" class="btn btn-normal" @click="pause">
                        <font-awesome-icon icon="pause" /> {{ $t("Pause") }}
                    </button>

                    <button v-if="!job.active" class="btn btn-normal" @click="resume">
                        <font-awesome-icon icon="play" /> {{ $t("Resume") }}
                    </button>

                    <router-link :to=" '/job/' + job.id +'/edit' " class="btn btn-normal">
                        <font-awesome-icon icon="edit" /> {{ $t("Edit") }}
                    </router-link>

                    <button class="btn btn-danger" @click="deleteDialog">
                        <font-awesome-icon icon="trash" /> {{ $t("Delete this Job") }}
                    </button>
                </div>
            </div>

            <h4 class="mb-3">Backup List</h4>

            <div class="functions mb-3">
                <div class="btn-group" role="group">
                    <button class="btn btn-danger" @click="deleteDialog">
                        <font-awesome-icon icon="trash" /> {{ $t("Delete All Backups") }}
                    </button>
                </div>
            </div>

            <div class="shadow-box">
                <span v-if="job.backupList.length === 0" class="d-flex align-items-center justify-content-center my-3">
                    {{ $t("No Backup") }}
                </span>

                <div
                    v-for="(item, index) in job.backupList"
                    :key="index"
                    class="item scheduled"
                >
                    <div class="left-part">
                        <div
                            class="circle"
                        ></div>
                        <div class="info">
                            <div class="title">
                                {{ formatDate(item.date) }}
                            </div>
                            <div class="status">
                                Increment Size: {{ size(item.size) }}<br />
                                Total Size: ~{{ size(item.totalSize) }}
                            </div>
                        </div>
                    </div>

                    <div class="buttons">
                        <div class="btn-group" role="group">
                            <button class="btn btn-normal" @click="deleteDialog(item.id)">
                                <font-awesome-icon icon="trash" /> {{ $t("Export to Data Directory") }}
                            </button>

                            <router-link :to="'/maintenance/edit/' + item.id" class="btn btn-normal">
                                <font-awesome-icon icon="edit" /> {{ $t("Download (tar.gz)") }}
                            </router-link>

                            <button v-if="false" class="btn btn-danger" @click="deleteDialog(item.id)">
                                <font-awesome-icon icon="trash" /> {{ $t("Delete") }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import axios from "axios";
import { dayjs } from "../dayjs.js";
import { SQL_DATETIME_FORMAT } from "../../../shared/util";
import Pill from "../components/Pill.vue";

export default {

    components: {
        Pill,
    },

    data() {
        return {

        };
    },

    computed: {
        job() {
            return this.$root.jobList[this.id];
        },

        id() {
            return this.$route.params.id;
        },
    },

    async mounted() {
        try {
            const res = await axios.get("/api/job/" + this.id);
            this.$root.jobList[res.data.job.id] = res.data.job;
        } catch (e) {
            this.$root.showError(e);
        }
    },

    methods: {

        async backupNow() {
            try {
                await axios.get("/api/job/" + this.id + "/backup-now");
            } catch (e) {
                this.$root.showError(e);
            }
        },

        async pause() {
            try {
                await axios.get("/api/job/" + this.id + "/pause");
            } catch (e) {
                this.$root.showError(e);
            }
        },

        async resume() {
            try {
                await axios.get("/api/job/" + this.id + "/resume");
            } catch (e) {
                this.$root.showError(e);
            }
        },

        formatDate(value) : string {
            if (!value) {
                return "N/A";
            }
            return dayjs(value).format(SQL_DATETIME_FORMAT);
        },

        size(b) : string {
            let kb = Math.round(b / 1024);

            if (kb === 0) {
                return b + "B";
            }

            let mb = Math.round(kb / 1024);

            if (mb === 0) {
                return kb + "KB";
            }

            let gb = Math.round(mb / 1024);

            if (gb === 0) {
                return mb + "MB";
            } else {
                return gb + "GB";
            }

        }
    }

};
</script>

<style lang="scss" scoped>
@import "../assets/vars.scss";

.item {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    border-radius: 10px;
    transition: all ease-in-out 0.15s;
    justify-content: space-between;
    padding: 10px;
    min-height: 90px;
    margin-bottom: 5px;

    &:hover {
        background-color: $highlight-white;
    }

    &.under-maintenance {
        background-color: rgba(23, 71, 245, 0.16);

        &:hover {
            background-color: rgba(23, 71, 245, 0.3) !important;
        }

        .circle {
            background-color: $maintenance;
        }
    }

    &.scheduled {
        .circle {
            background-color: $primary;
        }
    }

    &.inactive {
        .circle {
            background-color: $danger;
        }
    }

    &.ended {
        .left-part {
            opacity: 0.3;
        }

        .circle {
            background-color: $dark-font-color;
        }
    }

    &.unknown {
        .circle {
            background-color: $dark-font-color;
        }
    }

    .left-part {
        display: flex;
        gap: 12px;
        align-items: center;

        .circle {
            width: 25px;
            height: 25px;
            overflow: auto;
            border-radius: 50rem;
        }

        .info {
            .title {
                font-weight: bold;
                font-size: 20px;
            }

            .status {
                font-size: 14px;
            }
        }
    }

    .buttons {
        display: flex;
        gap: 8px;
    }
}

.dark {
    .item {
        &:hover {
            background-color: $dark-bg2;
        }
    }
}
</style>
