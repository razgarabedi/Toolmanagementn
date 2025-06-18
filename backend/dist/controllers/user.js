"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRole = exports.getUsers = void 0;
const models_1 = require("../models");
const getUsers = async (req, res) => {
    try {
        const users = await models_1.User.findAll({
            include: [{ model: models_1.Role, as: 'role', attributes: ['name'] }],
            attributes: ['id', 'username', 'email', 'createdAt', 'updatedAt']
        });
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.getUsers = getUsers;
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { roleId } = req.body;
        const currentUserId = req.user.id;
        if (parseInt(id, 10) === currentUserId) {
            return res.status(403).json({ message: 'Admins cannot change their own role.' });
        }
        const user = await models_1.User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const role = await models_1.Role.findByPk(roleId);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        await user.update({ role_id: role.id });
        const updatedUser = await models_1.User.findByPk(id, {
            include: [{ model: models_1.Role, as: 'role', attributes: ['name'] }],
            attributes: ['id', 'username', 'email', 'createdAt', 'updatedAt']
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.updateUserRole = updateUserRole;
