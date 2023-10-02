export type NotificationType = "info" | "success" | "warning" | "error";

export type Notification = {
    text: string;
    type: NotificationType;
    timeout?: number;
};

export type NotificationWithId = Notification & { id: string };

export type HelpEntryCategory = "playback" | "management";

export interface HelpEntry {
    description: string;
    keybind: string | Array<string>;
    category: HelpEntryCategory;
}
