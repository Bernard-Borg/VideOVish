import { HelpEntry } from "../types";

const Connector = {
    TO: "to",
    AND: "and",
    OR: "or"
};

const helpEntries: HelpEntry[] = [
    {
        description: "PLAY/PAUSE",
        keybind: "SPACE",
        category: "playback"
    },
    {
        description: "SLOW DOWN VIDEO",
        keybind: "S",
        category: "playback"
    },
    {
        description: "SPEED UP VIDEO",
        keybind: "D",
        category: "playback"
    },
    {
        description: "REWIND 5 SECONDS",
        keybind: "←",
        category: "playback"
    },
    {
        description: "FORWARD 5 SECONDS",
        keybind: "→",
        category: "playback"
    },
    {
        description: "FORWARD 10 SECONDS",
        keybind: "J",
        category: "playback"
    },
    {
        description: "FORWARD 10 SECONDS",
        keybind: "K",
        category: "playback"
    },
    {
        description: "INCREASE VOLUME",
        keybind: "↑",
        category: "playback"
    },
    {
        description: "DECREASE VOLUME",
        keybind: "↓",
        category: "playback"
    },
    {
        description: "MUTE/UNMUTE",
        keybind: "M",
        category: "playback"
    },
    {
        description: "SEEK LOCATION",
        keybind: ["0", Connector.TO, "9"],
        category: "playback"
    },
    {
        description: "HELP MENU",
        keybind: ["F1", Connector.AND, "CTRL", Connector.AND, "/"],
        category: "management"
    },
    {
        description: "TOGGLE FULLSCREEN",
        keybind: "F11",
        category: "management"
    },
    {
        description: "PICK LOCAL VIDEO",
        keybind: ["CTRL", Connector.AND, "O"],
        category: "management"
    },
    {
        description: "CLOSE SECONDARY WINDOW",
        keybind: "ESC",
        category: "management"
    }
];

export { helpEntries, Connector };
