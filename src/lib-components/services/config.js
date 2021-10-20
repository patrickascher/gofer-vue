import {i18nService} from './i18n';
import {http} from './http';

let goferConfig = {}

export default class config {
    static load(cfg) {
        goferConfig = cfg
        http.defaults.baseURL = this.get("webserver.domain")
        console.log("base:",http.defaults.baseURL)
        i18nService.loadLanguageAsync(_.get(cfg, "webserver.translation.defaultLanguage", "en"), false)
    }

    static get(config = null) {
        if (config === null) {
            return goferConfig
        }
        return _.get(goferConfig, config, null)
    }
}
