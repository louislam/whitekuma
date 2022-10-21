import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import EmptyLayout from "./EmptyLayout.vue";
import Home from "./pages/Home.vue";
import Setup from "./pages/Setup.vue";
import Login from "./pages/Login.vue";
import EditJob from "./pages/EditJob.vue";
import JobDetails from "./pages/JobDetails.vue";

const routes : RouteRecordRaw[] = [
    {
        path: "/",
        component: Home,
    },
    {
        path: "/login",
        component: Login,
    },
    {
        path: "/setup",
        component: Setup,
    },
    {
        path: "/add",
        component: EditJob,
    },
    {
        path: "/job/:id",
        component: EmptyLayout,
        children: [
            {
                path: "/job/:id",
                component: JobDetails,
            },
            {
                path: "/job/:id/edit",
                component: EditJob,
            },
        ],
    },

];

export const router = createRouter({
    linkActiveClass: "active",
    history: createWebHistory(),
    routes,
});
