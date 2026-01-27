<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { listen } from "@tauri-apps/api/event";
import { useNotification } from "./composables";
import Notification from "./components/Notification.vue";
import { useLocalStorage } from "@vueuse/core";
import type { NotificationWithId, Notification as NotificationType } from "./types";

const { add, remove } = useNotification();
let unlistenNotifications: (() => void) | undefined;

onMounted(() => {
    listen("app-notify", (event) => {
        const payload = event.payload as NotificationType;
        add(payload);
    }).then((unlisten) => {
        unlistenNotifications = unlisten;
    });
});

onUnmounted(() => {
    unlistenNotifications?.();
});

const store = useLocalStorage<{
    notifications: NotificationWithId[];
}>("notifications", {
    notifications: []
});
</script>

<template>
    <div class="fixed flex flex-col items-end w-full top-[40px] p-3 gap-3 z-100">
        <TransitionGroup name="notifications">
            <Notification
                v-for="notification in store.notifications"
                :key="notification.id"
                :message="notification.text"
                :type="notification.type"
                :expiryTime="notification.timeout"
                @close="remove(notification.id)"
            />
        </TransitionGroup>
    </div>
</template>

<style scoped>
.notifications-enter-active,
.notifications-leave-active {
    transition: all 0.5s ease;
}
.notifications-enter-from,
.notifications-leave-to {
    opacity: 0;
    transform: translateY(30px);
}
</style>
