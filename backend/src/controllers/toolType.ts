import { Request, Response } from 'express';
import { ToolType } from '../models';

export const createToolType = async (req: Request, res: Response) => {
    try {
        const { name, description, categoryId } = req.body;
        const image = req.file ? req.file.path : undefined;

        const newToolType = await ToolType.create({
            name,
            description,
            categoryId,
            image,
        });

        res.status(201).json(newToolType);
    } catch (error: any) {
        if (error.message.includes('File upload only supports')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Something went wrong', error });
    }
};

export const getToolTypes = async (req: Request, res: Response) => {
    try {
        const toolTypes = await ToolType.findAll({ include: ['category'] });
        res.status(200).json(toolTypes);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching tool types', error });
    }
}; 