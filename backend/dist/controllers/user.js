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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRole = exports.getUsers = void 0;
const models_1 = require("../models");
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield models_1.User.findAll({
            include: [{ model: models_1.Role, as: 'role', attributes: ['name'] }],
            attributes: ['id', 'username', 'email', 'createdAt', 'updatedAt']
        });
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.getUsers = getUsers;
const updateUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { roleId } = req.body;
        const currentUserId = req.user.id;
        if (parseInt(id, 10) === currentUserId) {
            return res.status(403).json({ message: 'Admins cannot change their own role.' });
        }
        const user = yield models_1.User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const role = yield models_1.Role.findByPk(roleId);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        yield user.update({ role_id: role.id });
        const updatedUser = yield models_1.User.findByPk(id, {
            include: [{ model: models_1.Role, as: 'role', attributes: ['name'] }],
            attributes: ['id', 'username', 'email', 'createdAt', 'updatedAt']
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.updateUserRole = updateUserRole;
