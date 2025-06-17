import { Request, Response } from 'express';
import { Category, ToolType } from '../models';
import { deleteResource } from '../lib/utils';

export const createCategory = async (req: Request, res: Response) => {
    const { name } = req.body;
    try {
        const category = await Category.create({ name });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error });
    }
};

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json({ data: categories });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    await deleteResource(req, res, Category, 'Category', { model: ToolType, as: 'toolTypes' });
}; 