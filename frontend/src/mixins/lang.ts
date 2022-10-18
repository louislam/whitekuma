import { currentLocale } from "../i18n";
// @ts-ignore
const langModules = import.meta.glob("../languages/*.ts");

export default {
    data() {
        return {
            language: currentLocale(),
        };
    },

    async created() {
        if (this.language !== "en") {
            await this.changeLang(this.language);
        }
    },

    watch: {
        async language(lang) {
            await this.changeLang(lang);
        },
    },

    methods: {
        /** Change the application language */
        async changeLang(lang) {
            let message = (await langModules["../languages/" + lang + ".js"]()).default;
            this.$i18n.setLocaleMessage(lang, message);
            this.$i18n.locale = lang;
            localStorage.locale = lang;
        }
    }
};
