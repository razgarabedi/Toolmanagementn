"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./db"));
require("./models");
const auth_1 = __importDefault(require("./routes/auth"));
const tool_1 = __importDefault(require("./routes/tool"));
const user_1 = __importDefault(require("./routes/user"));
const booking_1 = __importDefault(require("./routes/booking"));
const maintenance_1 = __importDefault(require("./routes/maintenance"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const sparePart_1 = __importDefault(require("./routes/sparePart"));
const location_1 = __importDefault(require("./routes/location"));
const notification_1 = __importDefault(require("./routes/notification"));
const category_1 = __importDefault(require("./routes/category"));
const manufacturer_1 = __importDefault(require("./routes/manufacturer"));
const toolType_1 = __importDefault(require("./routes/toolType"));
const models_1 = require("./models");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Werkzeugmeister Pro API');
});
app.use('/api/auth', auth_1.default);
app.use('/api/tools', tool_1.default);
app.use('/api/users', user_1.default);
app.use('/api/bookings', booking_1.default);
app.use('/api/maintenance', maintenance_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/spare-parts', sparePart_1.default);
app.use('/api/locations', location_1.default);
app.use('/api/notifications', notification_1.default);
app.use('/api/categories', category_1.default);
app.use('/api/manufacturers', manufacturer_1.default);
app.use('/api/tool-types', toolType_1.default);
app.get('/api/roles', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield models_1.Role.findAll();
        res.status(200).json(roles);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
}));
db_1.default.sync().then(() => {
    console.log('Database synced');
    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    });
}).catch((err) => {
    console.error('Failed to sync database:', err);
});
