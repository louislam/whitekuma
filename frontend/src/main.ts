import "bootstrap";
import { createApp, h } from "vue";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import App from "./App.vue";
import "./assets/app.scss";
import { i18n } from "./i18n";
import { FontAwesomeIcon } from "./icon";
import { router } from "./router";

import datetime from "./mixins/datetime";
import mobile from "./mixins/mobile";
import auth from "./mixins/auth";
import job from "./mixins/job";
import theme from "./mixins/theme";
import lang from "./mixins/lang";
import general from "./mixins/general";

// TODO: Issue after build dist
// Call extend() dead
/*
import * as dayjs from "dayjs";
import * as timezone from "dayjs/plugin/timezone";
import * as utc from "dayjs/plugin/utc";
import * as relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);*/

const app = createApp({
    mixins: [
        auth,
        theme,
        mobile,
        datetime,
        lang,
        job,
        general,
    ],
    data() {
        return {
        };
    },
    render: () => h(App),
});

app.use(router);
app.use(i18n);

const options = {
    position: "bottom-right",
};

app.use(Toast, options);
app.component("FontAwesomeIcon", FontAwesomeIcon);
app.mount("#app");
