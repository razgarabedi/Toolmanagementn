import { Request, Response } from 'express';
import { SparePart, MaintenanceSparePart } from '../models';
import sequelize from '../db';

export const getSpareParts = async (req: Request, res: Response) => {
    try {
        const spareParts = await SparePart.findAll();
        res.status(200).json(spareParts);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const createSparePart = async (req: Request, res: Response) => {
    try {
        const { name, quantity } = req.body;
        const sparePart = await SparePart.create({ name, quantity });
        res.status(201).json(sparePart);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const updateSparePart = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, quantity } = req.body;
        const sparePart = await SparePart.findByPk(id);
        if (sparePart) {
            await sparePart.update({ name, quantity });
            res.status(200).json(sparePart);
        } else {
            res.status(404).json({ message: 'Spare part not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const deleteSparePart = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const sparePart = await SparePart.findByPk(id);
        if (sparePart) {
            await sparePart.destroy();
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Spare part not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const assignPartToMaintenance = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {
        const { maintenanceId, sparePartId, quantityUsed } = req.body;

        const sparePart = await SparePart.findByPk(sparePartId, { transaction: t });
        if (!sparePart || sparePart.quantity < quantityUsed) {
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient spare part quantity.' });
        }
        
        await MaintenanceSparePart.create({ maintenanceId, sparePartId, quantityUsed }, { transaction: t });
        
        sparePart.quantity -= quantityUsed;
        await sparePart.save({ transaction: t });
        
        await t.commit();
        res.status(201).json({ message: 'Spare part assigned successfully' });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Something went wrong' });
    }
}; 