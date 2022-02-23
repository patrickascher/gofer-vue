import {i18nService} from './i18n';
import {http} from './http';

let goferConfig = {}

export default class config {
    static load(cfg) {
        goferConfig = cfg
        http.defaults.baseURL = this.get("webserver.domain")
        i18nService.loadLanguageAsync(_.get(cfg, "webserver.translation.defaultLanguage", "en"), false)

        // loading browser language if exists
        let language = navigator.languages && navigator.languages[0] || // Chrome / Firefox
            navigator.language ||   // All browsers
            navigator.userLanguage; // IE <= 10
        i18nService.loadLanguageAsync(language.substring(0,2), false)
    }

    static get(config = null) {
        if (config === null) {
            return goferConfig
        }
        return _.get(goferConfig, config, null)
    }
}
