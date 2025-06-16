import { Request, Response } from 'express';
import { Manufacturer } from '../models';

export const createManufacturer = async (req: Request, res: Response) => {
    const { name } = req.body;
    const logo = req.file ? req.file.path : undefined;
    try {
        const manufacturer = await Manufacturer.create({ name, logo });
        res.status(201).json(manufacturer);
    } catch (error: any) {
        if (error.message.includes('File upload only supports')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error creating manufacturer', error });
    }
};

export const getManufacturers = async (req: Request, res: Response) => {
    try {
        const manufacturers = await Manufacturer.findAll();
        res.status(200).json(manufacturers);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching manufacturers', error });
    }
}; 