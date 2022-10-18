import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/Home.vue";
import Setup from "./pages/Setup.vue";
import Login from "./pages/Login.vue";

const routes = [
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
];

export const router = createRouter({
    linkActiveClass: "active",
    history: createWebHistory(),
    routes,
});
