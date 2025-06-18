"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResource = void 0;
const i18n_1 = __importDefault(require("../i18n"));
const deleteResource = async (req, res, model, resourceName, association) => {
    try {
        const { id } = req.params;
        const resource = await model.findByPk(id, {
            include: association ? [{ model: association.model, as: association.as }] : [],
        });
        if (!resource) {
            return res.status(404).json({ message: `${resourceName} not found` });
        }
        if (association && resource[association.as] && resource[association.as].length > 0) {
            return res.status(400).json({
                message: i18n_1.default.t('resourceInUse', { resource: resourceName }),
            });
        }
        await resource.destroy();
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: `Error deleting ${resourceName}`, error });
    }
};
exports.deleteResource = deleteResource;
