import Vue from "vue";
import VueI18n from "vue-i18n";
import {http} from './http'

Vue.use(VueI18n);

// loaded languages in app life-time.
const loadedLanguages = []

// VueI18n instance.
export const i18n = new VueI18n({
    locale: 'en', // set locale
    fallbackLocale: 'en',
    silentFallbackWarn: true,
    silentTranslationWarn: true
})

// i18nService
export const i18nService = {
    i18n,
    loadLanguageAsync
};

// setI18nLanguage will set the language in different places in the app.
function setI18nLanguage(lang) {
    i18n.locale = lang
    http.defaults.headers.common['Accept-Language'] = lang
    document.querySelector('html').setAttribute('lang', lang)
    return lang
}

// loadLanguageAsync - will load the given language.
// if the language was already loaded, it will only be set as locale.
// otherwise a request will be made.
// the second parameter defines if a request should be forced - used for reloads.
function loadLanguageAsync(lang, force) {
    if (typeof lang === "undefined") {
        lang = i18n.fallbackLocale
    }

    // If the language was already loaded
    if (loadedLanguages.includes(lang) && !force) {
        return Promise.resolve(setI18nLanguage(lang))
    }

    return http.get(`/lang/${lang}.json`).then(
        messages => {
            i18n.setLocaleMessage(lang, messages.data)
            loadedLanguages.push(lang)
            return setI18nLanguage(lang)
        }
    )
}
