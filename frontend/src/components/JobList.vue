<template>
    <div class="shadow-box mb-3" :style="boxStyle">
        <div v-if="false" class="list-header">
            <div class="placeholder"></div>
            <div class="search-wrapper">
                <a v-if="searchText == ''" class="search-icon">
                    <font-awesome-icon icon="search" />
                </a>
                <a v-if="searchText != ''" class="search-icon" @click="clearSearchText">
                    <font-awesome-icon icon="times" />
                </a>
                <form>
                    <input v-model="searchText" class="form-control search-input" :placeholder="$t('Search...')" autocomplete="off" />
                </form>
            </div>
        </div>
        <div class="job-list" :class="{ scrollbar: scrollbar }">
            <div v-if="$root.jobList.length === 0 && loaded" class="text-center mt-3">
                {{ $t("No Task, please") }} <router-link to="/add">{{ $t("add one") }}</router-link>
            </div>

            <router-link v-for="(job, index) in $root.jobList" :key="index" :to="'/job/' + job.id" class="item" :class="{ 'disabled': ! job.active }">
                <Pill type="primary">Active</Pill>
                <div class="info">
                    {{ job.name }}
                </div>
            </router-link>
        </div>
    </div>
</template>

<script lang="ts">

import axios from "axios";
import Pill from "./Pill.vue";

export default {
    components: {
        Pill,
    },
    props: {
        /** Should the scrollbar be shown */
        scrollbar: {
            type: Boolean,
        },
    },
    data() {
        return {
            searchText: "",
            windowTop: 0,
            loaded: false,
        };
    },
    computed: {
        /**
         * Improve the sticky appearance of the list by increasing its
         * height as user scrolls down.
         * Not used on mobile.
         */
        boxStyle() {
            if (window.innerWidth > 550) {
                return {
                    height: `calc(100vh - 160px + ${this.windowTop}px)`,
                };
            } else {
                return {
                    height: "calc(100vh - 160px)",
                };
            }
        },
    },
    async mounted() {
        window.addEventListener("scroll", this.onScroll);

        try {
            const res = await axios.get("/api/job-list");

            for (let id in res.data.jobList) {
                if (!this.$root.jobList[id]) {
                    this.$root.jobList[id] = res.data.jobList[id];
                }
            }

            // Connect here, because it should be logged in.
            this.$root.connectSSE();

        } catch (e) {
            this.$root.showError(e);
        }

        this.loaded = true;

    },
    beforeUnmount() {
        window.removeEventListener("scroll", this.onScroll);
    },
    methods: {
        /** Handle user scroll */
        onScroll() {
            if (window.top.scrollY <= 133) {
                this.windowTop = window.top.scrollY;
            } else {
                this.windowTop = 133;
            }
        },

        /** Clear the search bar */
        clearSearchText() {
            this.searchText = "";
        }
    },
};
</script>

<style lang="scss" scoped>
@import "../assets/vars.scss";

.job-list {
    &.scrollbar {
        overflow-y: auto;
        height: calc(100% - 65px);
    }

    @media (max-width: 770px) {
        &.scrollbar {
            height: calc(100% - 40px);
        }
    }

    .item {
        display: flex;
        align-items: center;
        height: 60px;
        text-decoration: none;
        padding: 0 15px;
        gap: 10px;
        border-radius: 10px;
        transition: all ease-in-out 0.15s;

        &.disabled {
            opacity: 0.3;
        }

        .info {
            white-space: nowrap;
            overflow: hidden;
            height: 27px;
            display: flex;
        }

        &:hover {
            background-color: $highlight-white;
        }

        &.active {
            background-color: #cdf8f4;
        }
        .tags {
            // Removes margin to line up tags list with uptime percentage
            margin-left: -0.25rem;
        }
    }
}

.shadow-box {
    height: calc(100vh - 150px);
    position: sticky;
    top: 10px;
}

.small-padding {
    padding-left: 5px !important;
    padding-right: 5px !important;
}

.list-header {
    border-bottom: 1px solid #dee2e6;
    border-radius: 10px 10px 0 0;
    margin: -10px;
    margin-bottom: 10px;
    padding: 10px;
    display: flex;
    justify-content: space-between;

    .dark & {
        background-color: $dark-header-bg;
        border-bottom: 0;
    }
}

@media (max-width: 770px) {
    .list-header {
        margin: -20px;
        margin-bottom: 10px;
        padding: 5px;
    }
}

.search-wrapper {
    display: flex;
    align-items: center;
}

.search-icon {
    padding: 10px;
    color: #c0c0c0;
}

.search-input {
    max-width: 15em;
}

.dark {
    .job-list {
        .item {
            &:hover {
                background-color: $dark-bg2;
            }

            &.active {
                background-color: $dark-bg2;
            }
        }
    }
}

</style>
