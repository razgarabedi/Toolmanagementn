"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attachment = exports.Manufacturer = exports.Category = exports.ToolType = exports.Notification = exports.Location = exports.MaintenanceSparePart = exports.SparePart = exports.Maintenance = exports.Booking = exports.Role = exports.Tool = exports.User = void 0;
const user_1 = __importDefault(require("./user"));
exports.User = user_1.default;
const tool_1 = __importDefault(require("./tool"));
exports.Tool = tool_1.default;
const role_1 = __importDefault(require("./role"));
exports.Role = role_1.default;
const booking_1 = __importDefault(require("./booking"));
exports.Booking = booking_1.default;
const maintenance_1 = __importDefault(require("./maintenance"));
exports.Maintenance = maintenance_1.default;
const sparePart_1 = require("./sparePart");
Object.defineProperty(exports, "SparePart", { enumerable: true, get: function () { return sparePart_1.SparePart; } });
const maintenanceSparePart_1 = require("./maintenanceSparePart");
Object.defineProperty(exports, "MaintenanceSparePart", { enumerable: true, get: function () { return maintenanceSparePart_1.MaintenanceSparePart; } });
const location_1 = require("./location");
Object.defineProperty(exports, "Location", { enumerable: true, get: function () { return location_1.Location; } });
const notification_1 = require("./notification");
Object.defineProperty(exports, "Notification", { enumerable: true, get: function () { return notification_1.Notification; } });
const toolType_1 = require("./toolType");
Object.defineProperty(exports, "ToolType", { enumerable: true, get: function () { return toolType_1.ToolType; } });
const attachment_1 = require("./attachment");
Object.defineProperty(exports, "Attachment", { enumerable: true, get: function () { return attachment_1.Attachment; } });
const category_1 = require("./category");
Object.defineProperty(exports, "Category", { enumerable: true, get: function () { return category_1.Category; } });
const manufacturer_1 = require("./manufacturer");
Object.defineProperty(exports, "Manufacturer", { enumerable: true, get: function () { return manufacturer_1.Manufacturer; } });
const models = {
    User: user_1.default,
    Tool: tool_1.default,
    Role: role_1.default,
    Booking: booking_1.default,
    Maintenance: maintenance_1.default,
    SparePart: sparePart_1.SparePart,
    MaintenanceSparePart: maintenanceSparePart_1.MaintenanceSparePart,
    Location: location_1.Location,
    Notification: notification_1.Notification,
    ToolType: toolType_1.ToolType,
    Category: category_1.Category,
    Manufacturer: manufacturer_1.Manufacturer,
    Attachment: attachment_1.Attachment,
};
Object.values(models).forEach((model) => {
    if (model.associate) {
        model.associate(models);
    }
});
exports.default = models;
