import { Request, Response } from 'express';
import { Tool, Maintenance, Booking } from '../models';
import sequelize from '../db';
import { Op } from 'sequelize';

interface SummaryItem {
    status: string;
    count: string;
}

export const getInventorySummary = async (req: Request, res: Response) => {
    try {
        const summary = await Tool.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status']
        });

        const formattedSummary = (summary as unknown as SummaryItem[]).reduce((acc, item) => {
            acc[item.status] = parseInt(item.count, 10);
            return acc;
        }, {} as Record<string, number>);

        res.status(200).json(formattedSummary);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const getMaintenanceSummary = async (req: Request, res: Response) => {
    try {
        const summary = await Maintenance.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status']
        });
        
        const formattedSummary = (summary as unknown as SummaryItem[]).reduce((acc, item) => {
            acc[item.status] = parseInt(item.count, 10);
            return acc;
        }, {} as Record<string, number>);

        res.status(200).json(formattedSummary);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const getUtilizationSummary = async (req: Request, res: Response) => {
    try {
        const summary = await Booking.findAll({
            attributes: [
                'toolId',
                [sequelize.fn('COUNT', sequelize.col('toolId')), 'bookingCount']
            ],
            group: ['toolId', 'tool.id'],
            order: [[sequelize.fn('COUNT', sequelize.col('toolId')), 'DESC']],
            limit: 5,
            include: [{model: Tool, as: 'tool', attributes: ['name']}]
        });

        res.status(200).json(summary);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const getMaintenanceCostReport = async (req: Request, res: Response) => {
    try {
        const report = await Maintenance.findAll({
            attributes: [
                'toolId',
                [sequelize.fn('SUM', sequelize.col('cost')), 'totalCost']
            ],
            group: ['toolId', 'tool.id'],
            include: [{ model: Tool, as: 'tool', attributes: ['name'] }],
            raw: true,
        });
        res.status(200).json(report);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export const getUtilizationReport = async (req: Request, res: Response) => {
    try {
        const tools = await Tool.findAll({
            attributes: [
                'id', 
                'name',
                'usageCount',
            ],
        });

        const bookings = await Booking.findAll({
            where: { status: ['completed', 'checked-in'] },
            attributes: ['toolId', 'startDate', 'endDate'],
        });
        
        const durationMap = bookings.reduce((acc, booking) => {
            if (booking.toolId && booking.startDate && booking.endDate) {
                const duration = new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime();
                acc[booking.toolId] = (acc[booking.toolId] || 0) + duration;
            }
            return acc;
        }, {} as Record<number, number>);

        const report = tools.map(tool => ({
            id: tool.id,
            name: tool.name,
            usageCount: tool.usageCount,
            totalDuration: durationMap[tool.id] || 0
        }));

        res.status(200).json(report);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export const getMissingToolsReport = async (req: Request, res: Response) => {
    try {
        const missingTools = await Booking.findAll({
            where: {
                status: 'active',
                endDate: {
                    [Op.lt]: new Date()
                }
            },
            include: ['tool', 'user']
        });
        res.status(200).json(missingTools);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
} 