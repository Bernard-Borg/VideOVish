/// <reference types="vite/client" />

declare module "*.vue" {
    import type { DefineComponent } from "vue";
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

export type NotificationType = "info" | "success" | "warning" | "error";

export type Notification = {
    text: string;
    type: NotificationType;
    timeout?: number;
};

export type NotificationWithId = Notification & { id: string };
