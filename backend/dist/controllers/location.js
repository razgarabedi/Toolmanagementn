"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLocation = exports.createLocation = exports.getLocations = void 0;
const models_1 = require("../models");
const utils_1 = require("../lib/utils");
const getLocations = async (req, res) => {
    try {
        const locations = await models_1.Location.findAll();
        res.status(200).json({ data: locations });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.getLocations = getLocations;
const createLocation = async (req, res) => {
    try {
        const { name } = req.body;
        const location = await models_1.Location.create({ name });
        res.status(201).json(location);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating location', error });
    }
};
exports.createLocation = createLocation;
const deleteLocation = async (req, res) => {
    await (0, utils_1.deleteResource)(req, res, models_1.Location, 'Location', { model: models_1.Tool, as: 'tools' });
};
exports.deleteLocation = deleteLocation;
