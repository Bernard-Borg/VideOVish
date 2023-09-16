import { createApp } from "vue";
import "./css/help.css";
import "./css/styles.css";
import "./css/youtube.css";
import App from "./App.vue";

import { router } from "./router";

createApp(App).use(router).mount("#app");
