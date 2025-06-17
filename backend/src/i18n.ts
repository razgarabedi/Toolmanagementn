import i18n from 'i18next';
import Backend from 'i18next-fs-backend';
import { resolve } from 'path';

i18n
  .use(Backend)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    backend: {
      loadPath: resolve(__dirname, '../locales/{{lng}}/{{ns}}.json'),
    },
    ns: ['errors'],
    defaultNS: 'errors',
  });

export default i18n; 