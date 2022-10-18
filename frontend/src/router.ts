import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/Home.vue";

const routes = [
    {
        path: "/",
        component: Home,
    },
];

export const router = createRouter({
    linkActiveClass: "active",
    history: createWebHistory(),
    routes,
});
