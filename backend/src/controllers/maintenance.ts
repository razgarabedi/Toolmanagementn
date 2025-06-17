import { Request, Response } from 'express';
import { Maintenance, Tool } from '../models';

export const createMaintenance = async (req: Request, res: Response) => {
    try {
        const { toolId, description, cost, startDate, endDate, status } = req.body;

        const tool = await Tool.findByPk(toolId);
        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }

        const maintenance = await Maintenance.create({
            toolId,
            description,
            cost,
            startDate,
            endDate,
            status,
        });

        res.status(201).json(maintenance);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const getToolMaintenanceHistory = async (req: Request, res: Response) => {
    try {
        const { toolId } = req.params;
        const history = await Maintenance.findAll({ where: { toolId }, order: [['startDate', 'DESC']] });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const updateMaintenance = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { description, cost, startDate, endDate, status } = req.body;

        const maintenance = await Maintenance.findByPk(id);
        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }

        await maintenance.update({ description, cost, startDate, endDate, status });

        res.status(200).json(maintenance);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
} 