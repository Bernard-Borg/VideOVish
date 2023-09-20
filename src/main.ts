import { createApp } from "vue";
import "./styles.css";
import App from "./App.vue";

import { router } from "./router";
import { useNotification } from "./composables";

const { add } = useNotification();

const app = createApp(App);

app.config.errorHandler = (err: unknown) => {
    add({
        text: (err as Error).message,
        type: "error",
        timeout: -1
    });
};

app.use(router).mount("#app");
