<template>
    <div :class="classes">
        <!-- Desktop header -->
        <header v-if="! $root.isMobile" class="header py-3 mb-3 border-bottom">
            <router-link to="/" class="title-link">
                <object class="logo" width="40" height="40" data="/icon.svg" />
                <div>
                    <span class="fs-4 title">WhiteKuma</span> <span class="subtitle">MariaDB Backup Tool</span>
                </div>
            </router-link>

            <div v-if="$root.username != null" class="right">
                <a v-if="false" target="_blank" href="https://github.com/louislam/uptime-kuma/releases" class="btn btn-info me-3">
                    <font-awesome-icon icon="arrow-alt-circle-up" /> {{ $t("New Update") }}
                </a>

                <ul class="nav nav-pills">
                    <li class="nav-item">
                        <div class="dropdown dropdown-profile-pic">
                            <div class="nav-link" data-bs-toggle="dropdown">
                                <div class="profile-pic">{{ $root.usernameFirstChar }}</div>
                                <font-awesome-icon icon="angle-down" />
                            </div>

                            <!-- Header's Dropdown Menu -->
                            <ul class="dropdown-menu">
                                <!-- Username -->
                                <li>
                                    <i18n-t tag="span" keypath="signedInDisp" class="dropdown-item-text">
                                        <strong>{{ $root.username }}</strong>
                                    </i18n-t>
                                    <span v-if="false" class="dropdown-item-text">{{ $t("signedInDispDisabled") }}</span>
                                </li>

                                <li><hr class="dropdown-divider"></li>

                                <!-- Functions -->
                                <li>
                                    <router-link to="/settings/general" class="dropdown-item" :class="{ active: $route.path.includes('settings') }">
                                        <font-awesome-icon icon="cog" /> {{ $t("Settings") }}
                                    </router-link>
                                </li>

                                <li v-if="$root.loggedIn">
                                    <button class="dropdown-item" @click="$root.logout">
                                        <font-awesome-icon icon="sign-out-alt" />
                                        {{ $t("Logout") }}
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </div>
        </header>

        <main>
            <div class="container-fluid">
                <div class="row">
                    <div v-if="$root.loggedIn" class="col-12 col-md-5 col-xl-4">
                        <div>
                            <router-link to="/add" class="btn btn-primary mb-3"><font-awesome-icon icon="plus" /> {{ $t("Add Task") }}</router-link>
                        </div>
                        <JobList :scrollbar="true" />
                    </div>

                    <div :class="containerClass">
                        <!-- Add :key to disable vue router re-use the same component -->
                        <router-view :key="$route.fullPath" />
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script lang="ts">
import JobList from "./components/JobList.vue";

export default {

    components: {
        JobList
    },

    data() {
        return {};
    },

    computed: {

        containerClass() {
            if (!this.$root.loggedIn) {
                return {};
            } else {
                return {
                    "col-12": true,
                    "col-md-7": true,
                    "col-xl-8": true,
                    "mb-3": true,
                };
            }
        },

        // Theme or Mobile
        classes() {
            const classes = {};
            classes[this.$root.theme] = true;
            classes["mobile"] = this.$root.isMobile;
            return classes;
        },
    },
    created() {

    },
};
</script>

<style lang="scss" scoped>
@import "assets/vars.scss";

//d-flex flex-wrap justify-content-center
.header {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    padding: 0 1.5rem;
    align-items: center;
    height: 73px;

    .right {
        display: flex;
        flex-wrap: nowrap;
        justify-content: right;
        align-items: center;

        .nav {
            padding-left: 0;
        }
    }

    .title-link {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;

        .logo {

        }

        .title {
            font-weight: bold;
        }
    }
}

.container-fluid {
    width: 98%;
}

.nav-link {
    &.status-page {
        background-color: rgba(255, 255, 255, 0.1);
    }
}

.bottom-nav {
    z-index: 1000;
    position: fixed;
    bottom: 0;
    height: 60px;
    width: 100%;
    left: 0;
    background-color: #fff;
    box-shadow: 0 15px 47px 0 rgba(0, 0, 0, 0.05), 0 5px 14px 0 rgba(0, 0, 0, 0.05);
    text-align: center;
    white-space: nowrap;
    padding: 0 10px;

    a {
        text-align: center;
        width: 25%;
        display: inline-block;
        height: 100%;
        padding: 8px 10px 0;
        font-size: 13px;
        color: #c1c1c1;
        overflow: hidden;
        text-decoration: none;

        &.router-link-exact-active, &.active {
            color: $primary;
            font-weight: bold;
        }

        div {
            font-size: 20px;
        }
    }
}

main {
    min-height: calc(100vh - 160px);
}

// Profile Pic Button with Dropdown
.dropdown-profile-pic {
    user-select: none;

    .nav-link {
        cursor: pointer;
        display: flex;
        gap: 6px;
        align-items: center;
        background-color: rgba(200, 200, 200, 0.2);
        padding: 0.5rem 0.8rem;

        &:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
    }

    .dropdown-menu {
        transition: all 0.2s;
        padding-left: 0;
        padding-bottom: 0;
        margin-top: 8px !important;
        border-radius: 16px;
        overflow: hidden;

        .dropdown-divider {
            margin: 0;
            border-top: 1px solid rgba(0, 0, 0, 0.4);
            background-color: transparent;
        }

        .dropdown-item-text {
            font-size: 14px;
            padding-bottom: 0.7rem;
        }

        .dropdown-item {
            padding: 0.7rem 1rem;
        }

        .dark & {
            background-color: $dark-bg;
            color: $dark-font-color;
            border-color: $dark-border-color;

            .dropdown-item {
                color: $dark-font-color;

                &.active {
                    color: $dark-font-color2;
                    background-color: $highlight !important;
                }

                &:hover {
                    background-color: $dark-bg2;
                }
            }
        }
    }

    .profile-pic {
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        background-color: $primary;
        width: 24px;
        height: 24px;
        margin-right: 5px;
        border-radius: 50rem;
        font-weight: bold;
        font-size: 10px;
    }
}

.dark {
    header {
        background-color: $dark-header-bg;
        border-bottom-color: $dark-header-bg !important;

        span {
            color: #f0f6fc;
        }

        .subtitle {
            font-size: 13px;
            margin-left: 6px;
            color: #AAA;
        }
    }

    .bottom-nav {
        background-color: $dark-bg;
    }
}

</style>

