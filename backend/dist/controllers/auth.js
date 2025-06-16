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
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        const existingUser = yield models_1.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const userCount = yield models_1.User.count();
        let roleName = 'user';
        if (userCount === 0) {
            roleName = 'admin';
        }
        const role = yield models_1.Role.findOne({ where: { name: roleName } });
        if (!role) {
            return res.status(500).json({ message: `Default role '${roleName}' not found.` });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
        const user = yield models_1.User.create({
            username,
            email,
            password_hash: hashedPassword,
            role_id: role.id,
        });
        res.status(201).json({ message: 'User created successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield models_1.User.findOne({
            where: { email },
            include: [{ model: models_1.Role, as: 'role' }]
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isPasswordCorrect = yield bcryptjs_1.default.compare(password, user.password_hash);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        if (!user.role) {
            return res.status(404).json({ message: "Role not found for user" });
        }
        const token = jsonwebtoken_1.default.sign({ email: user.email, id: user.id, role: user.role.name, username: user.username }, process.env.JWT_SECRET || 'your-super-secret-key', {
            expiresIn: '1h',
        });
        res.status(200).json({ result: user, token });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.login = login;
