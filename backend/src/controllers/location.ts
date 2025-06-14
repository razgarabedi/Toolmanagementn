import { Request, Response } from 'express';
import { Location } from '../models';

export const getLocations = async (req: Request, res: Response) => {
    try {
        const locations = await Location.findAll();
        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const createLocation = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const location = await Location.create({ name });
        res.status(201).json(location);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
}; 