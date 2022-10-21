import { createI18n } from "vue-i18n/dist/vue-i18n.esm-browser.prod.js";
import en from "./languages/en.json";

const languageList = {

};

let messages = {
    en,
};

for (let lang in languageList) {
    messages[lang] = {
        languageName: languageList[lang]
    };
}

export const currentLocale = () => localStorage.locale
    || languageList[navigator.language] && navigator.language
    || languageList[navigator.language.substring(0, 2)] && navigator.language.substring(0, 2)
    || "en";

export const i18n = createI18n({
    locale: currentLocale(),
    fallbackLocale: "en",
    silentFallbackWarn: true,
    silentTranslationWarn: true,
    messages: messages,
});
