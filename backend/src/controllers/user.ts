import { Request, Response } from 'express';
import { User, Role } from '../models';
import { AuthRequest } from '../middleware/auth';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.findAll({
            include: [{ model: Role, as: 'role', attributes: ['name'] }],
            attributes: ['id', 'username', 'email', 'createdAt', 'updatedAt']
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { roleId } = req.body;
        const currentUserId = req.user.id;

        if (parseInt(id, 10) === currentUserId) {
            return res.status(403).json({ message: 'Admins cannot change their own role.' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const role = await Role.findByPk(roleId);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        await user.update({ role_id: role.id });
        
        const updatedUser = await User.findByPk(id, {
            include: [{ model: Role, as: 'role', attributes: ['name'] }],
            attributes: ['id', 'username', 'email', 'createdAt', 'updatedAt']
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
}; 