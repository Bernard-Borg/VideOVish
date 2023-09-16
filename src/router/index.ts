import Player from "../views/Player.vue";
import Help from "../views/Help.vue";
import YouTube from "../views/YouTube.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
    { path: "/", component: Player },
    { path: "/player", component: Player },
    { path: "/help", component: Help },
    { path: "/youtube", component: YouTube }
];

export const router = createRouter({
    history: createWebHistory(),
    routes
});
