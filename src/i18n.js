import i18n from 'i18next'
import Backend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import translationEn from './locales/en.i18n.json';
import translationZhHk from './locales/zh_hk.i18n.json';

i18n.use(Backend).use(LanguageDetector).use(initReactI18next).init({
    fallbackLng: 'en',
    debug: true,
    resources: {
        en: {translation: translationEn},
        zh_hk: {translation: translationZhHk},
    },
    detection: {
        order: ['queryString', 'cookie'],
        cache: ['cookie']
    },
    interpolation: {
        escapeValue: false,
        prefix:"%",
        suffix:"$",
    }
})

export default i18n