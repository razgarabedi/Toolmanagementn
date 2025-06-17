import { Request, Response } from 'express';
import { ToolType, Tool, Category } from '../models';
import { deleteResource } from '../lib/utils';

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
        const toolTypes = await ToolType.scope('withInstances').findAll({
            include: [{ model: Category, as: 'category' }]
        });
        res.status(200).json({ data: toolTypes });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tool types' });
    }
};

export const deleteToolType = async (req: Request, res: Response) => {
    await deleteResource(req, res, ToolType, 'Tool Type', { model: Tool, as: 'instances' });
};

export const updateToolType = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, categoryId } = req.body;
        const image = req.file ? req.file.path : undefined;

        const toolType = await ToolType.findByPk(id);

        if (!toolType) {
            return res.status(404).json({ message: 'Tool type not found' });
        }

        toolType.name = name ?? toolType.name;
        toolType.description = description ?? toolType.description;
        toolType.categoryId = categoryId ?? toolType.categoryId;
        if (image) {
            toolType.image = image;
        }

        await toolType.save();

        const updatedToolType = await ToolType.scope('withInstances').findByPk(id, {
            include: [{ model: Category, as: 'category' }]
        });

        res.status(200).json(updatedToolType);
    } catch (error: any) {
        if (error.message.includes('File upload only supports')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Something went wrong', error });
    }
}; 