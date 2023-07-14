import type enJSON from "@locales/en-US.json"
import messages from "@intlify/unplugin-vue-i18n/messages"
import { createI18n, type IntlDateTimeFormat } from "vue-i18n"

export enum LocaleCode {
    IT_IT = "it-IT",
    EN_US = "en-US",
    de_DE = "de-DE",
    es_ES = "es-ES",
    fr_FR = "fr-FR",
}

/**
 * Keys are locale codes in RFC 5646 (what browsers use).
 * 
 * The `dir` property is the text direction.
 * @see [HTML `dir` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir)
 *
 * The `name` property is the localized name of the language.
 * @see [name source](https://en.wikipedia.org/wiki/List_of_language_names)
 */
export const Locales = {
    [LocaleCode.IT_IT]: { dir: "ltr", name: "Italiano" },
    [LocaleCode.EN_US]: { dir: "ltr", name: "English" },
    [LocaleCode.de_DE]: { dir: "ltr", name: "Deutsch" },
    [LocaleCode.es_ES]: { dir: "ltr", name: "Español" },
    [LocaleCode.fr_FR]: { dir: "ltr", name: "Français" },
} as const;

type MessageSchema = typeof enJSON;

const createDateTimeFormats = (): Record<LocaleCode, IntlDateTimeFormat> => {
    const defaultFormats: IntlDateTimeFormat = {
        shortest: { year: "numeric", month: "numeric", day: "numeric" },
    }

    return Object.fromEntries(
        Object.keys(Locales).map((locale) => [locale, defaultFormats])
    ) as Record<LocaleCode, IntlDateTimeFormat>
}

export default createI18n<[MessageSchema], LocaleCode, false>({
    messages,
    legacy: false,
    locale: localStorage.currentLocale || LocaleCode.EN_US,
    fallbackLocale: LocaleCode.EN_US,
    datetimeFormats: createDateTimeFormats(),
})