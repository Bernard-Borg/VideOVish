import { useLocalStorage } from "@vueuse/core";
import { Notification, NotificationWithId } from "./vite-env";
import { v4 as uuid } from "uuid";
import { WebviewWindow } from "@tauri-apps/api/window";
import { Ref, isRef, onMounted, onUnmounted } from "vue";

const store = useLocalStorage<{
    notifications: NotificationWithId[];
}>("notifications", {
    notifications: []
});

const useNotification = () => {
    const add = (options: Notification) => {
        const uniqueId = uuid();

        store.value.notifications.push({
            id: uniqueId,
            text: options.text,
            type: options.type,
            timeout: options.timeout === -1 ? Number.MAX_SAFE_INTEGER : options.timeout ?? 0
        });
    };

    const remove = (id: string) => {
        const indexToRemove = store.value.notifications.findIndex((x) => x.id === id);

        if (indexToRemove !== undefined && indexToRemove > -1) {
            store.value.notifications.splice(indexToRemove, 1);
        }
    };

    return { add, remove };
};

const useWindowClose = (label: string, disableBlur: boolean | Ref<boolean> = false) => {
    const closeWindow = async () => {
        await WebviewWindow.getByLabel(label)?.close();
    };

    const eventHandler = (e: KeyboardEvent) => {
        if (e.code === "Escape") {
            closeWindow();
        }
    };

    WebviewWindow.getByLabel(label)?.listen("tauri://blur", () => {
        if (isRef(disableBlur)) {
            if (!disableBlur.value) {
                closeWindow();
            }
        } else {
            if (!disableBlur) {
                closeWindow();
            }
        }
    });

    onMounted(() => {
        window.addEventListener("keydown", eventHandler);
    });

    onUnmounted(() => {
        window.removeEventListener("keydown", eventHandler);
    });

    return { closeWindow };
};

export { useNotification, useWindowClose };
