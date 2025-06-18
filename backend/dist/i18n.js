"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const i18next_fs_backend_1 = __importDefault(require("i18next-fs-backend"));
const path_1 = require("path");
i18next_1.default
    .use(i18next_fs_backend_1.default)
    .init({
    lng: 'en',
    fallbackLng: 'en',
    backend: {
        loadPath: (0, path_1.resolve)(__dirname, '../locales/{{lng}}/{{ns}}.json'),
    },
    ns: ['errors'],
    defaultNS: 'errors',
});
exports.default = i18next_1.default;
