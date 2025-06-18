import { Request, Response } from 'express';
import { Tool, Booking, User, ToolType, Location, Attachment, Manufacturer, Maintenance, Category } from '../models';
import { Op, ValidationError, UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';
import { AuthRequest } from '../middleware/auth';
import sequelize from '../db';
import { Notification } from '../models';

// Add this interface to augment the tool type
interface ToolWithAssociations extends Tool {
    maintenances?: Maintenance[];
    bookings?: Booking[];
}

export const getToolTypes = async (req: Request, res: Response) => {
    try {
        const toolTypes = await ToolType.findAll({
            include: [{
                model: Tool,
                as: 'instances',
                include: [
                    { model: User, as: 'currentOwner', attributes: ['id', 'username'] }
                ]
            }],
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json(toolTypes);
    } catch (error) {
        console.error("Error fetching tool types:", error);
        res.status(500).json({ message: 'Something went wrong', error });
    }
};

export const createTool = async (req: AuthRequest, res: Response) => {
    const t = await sequelize.transaction();
    try {
        const { toolTypeId, rfid, serialNumber, condition, purchaseDate, cost, warrantyEndDate, locationId, manufacturerId, description, name } = req.body;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const instanceImage = files?.instanceImage ? files.instanceImage[0].path : undefined;

        if (!toolTypeId) {
            return res.status(400).json({
                message: "Validation Error",
                errors: [{ field: 'toolTypeId', message: 'A tool type is required.' }]
            });
        }

        const tool = await Tool.create({
            toolTypeId: parseInt(toolTypeId, 10),
            rfid,
            serialNumber,
            condition,
            purchaseDate: (purchaseDate && !isNaN(new Date(purchaseDate).getTime())) ? purchaseDate : null,
            cost: (cost && !isNaN(parseFloat(cost))) ? parseFloat(cost) : null,
            warrantyEndDate: (warrantyEndDate && !isNaN(new Date(warrantyEndDate).getTime())) ? warrantyEndDate : null,
            locationId: (locationId && !isNaN(parseInt(locationId, 10))) ? parseInt(locationId, 10) : null,
            manufacturerId: (manufacturerId && !isNaN(parseInt(manufacturerId, 10))) ? parseInt(manufacturerId, 10) : null,
            description,
            name,
            status: 'available',
            instanceImage,
        }, { transaction: t });

        if (files?.attachments) {
            const attachments = files.attachments.map(file => ({
                fileName: file.originalname,
                filePath: file.path,
                toolId: tool.id
            }));
            await Attachment.bulkCreate(attachments, { transaction: t });
        }

        await t.commit();
        const result = await Tool.findByPk(tool.id, { include: ['attachments', 'manufacturer']});
        res.status(201).json(result);
    } catch (error: any) {
        await t.rollback();
        if (error instanceof ValidationError || error instanceof UniqueConstraintError) {
            return res.status(400).json({
                message: "Validation Error",
                errors: (error as any).errors.map((e: any) => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }
        if (error instanceof ForeignKeyConstraintError) {
            const field = (error as any).fields[0] || 'unknown_field';
            return res.status(400).json({
                message: "Validation Error",
                errors: [{
                    field: field,
                    message: `Referenced entity for ${field} does not exist.`
                }]
            });
        }
        console.error("Error creating tool:", error);
        if (error.message.includes('File upload only supports')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error creating tool', error });
    }
};

const calculateToolStatus = (tool: ToolWithAssociations) => {
    const now = new Date();
    
    const hasActiveMaintenance = tool.maintenances?.some(m => m.status === 'in_progress');
    if (hasActiveMaintenance) return 'in_maintenance';

    const hasActiveBooking = tool.bookings?.some(b => b.status === 'active');
    if (hasActiveBooking) return 'in_use';

    const hasUpcomingOrPendingBooking = tool.bookings?.some(b => 
        b.status === 'approved' || b.status === 'pending'
    );
    if (hasUpcomingOrPendingBooking) return 'booked';
    
    const hasUpcomingMaintenance = tool.maintenances?.some(m => m.status === 'scheduled');
    if (hasUpcomingMaintenance) return 'in_maintenance';

    return 'available';
}

export const getTools = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const where: any = {};

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { rfid: { [Op.like]: `%${search}%` } },
                { serialNumber: { [Op.like]: `%${search}%` } },
            ];
        }

        const tools = await Tool.findAll({
            where,
            include: [
                { model: Location, as: 'location' },
                { model: ToolType, as: 'toolType', include: [{ model: Category, as: 'category' }] },
                { model: Booking, as: 'bookings', required: false },
                { model: Maintenance, as: 'maintenances', required: false }
            ],
            order: [['name', 'ASC']]
        });

        const toolsWithStatus = tools.map(tool => {
            const toolJson = tool.toJSON() as any;
            toolJson.status = calculateToolStatus(tool as ToolWithAssociations);
            const activeBooking = toolJson.bookings?.find((b: any) => b.status === 'active');
            toolJson.activeBooking = activeBooking ? { id: activeBooking.id } : null;
            return toolJson;
        });

        res.status(200).json(toolsWithStatus);
    } catch (error) {
        console.error("Error in getTools:", error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const getTool = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tool = await Tool.findByPk(id, {
            include: [
                { model: ToolType, as: 'toolType' },
                { model: User, as: 'currentOwner', attributes: ['id', 'username'] },
                { model: Booking, as: 'bookings' },
                { model: Maintenance, as: 'maintenances' },
                { model: Location, as: 'location', attributes: ['id', 'name'] },
                { model: Manufacturer, as: 'manufacturer', attributes: ['id', 'name'] },
                { model: Attachment, as: 'attachments' }
            ]
        });
        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }

        const toolJson = tool.toJSON() as any;
        toolJson.status = calculateToolStatus(tool as ToolWithAssociations);
        
        res.status(200).json(toolJson);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const updateTool = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const t = await sequelize.transaction();

    try {
        const { toolTypeId, rfid, serialNumber, condition, purchaseDate, cost, warrantyEndDate, locationId, manufacturerId, description, name } = req.body;
        const tool = await Tool.findByPk(id, { transaction: t });

        if (!tool) {
            await t.rollback();
            return res.status(404).json({ message: 'Tool not found' });
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const instanceImage = files?.instanceImage ? files.instanceImage[0].path : tool.instanceImage;

        if (!toolTypeId) {
            return res.status(400).json({
                message: "Validation Error",
                errors: [{ field: 'toolTypeId', message: 'A tool type is required.' }]
            });
        }

        await tool.update({
            toolTypeId: parseInt(toolTypeId, 10),
            rfid,
            serialNumber,
            condition,
            purchaseDate: (purchaseDate && !isNaN(new Date(purchaseDate).getTime())) ? purchaseDate : null,
            cost: (cost && !isNaN(parseFloat(cost))) ? parseFloat(cost) : null,
            warrantyEndDate: (warrantyEndDate && !isNaN(new Date(warrantyEndDate).getTime())) ? warrantyEndDate : null,
            locationId: (locationId && !isNaN(parseInt(locationId, 10))) ? parseInt(locationId, 10) : null,
            manufacturerId: (manufacturerId && !isNaN(parseInt(manufacturerId, 10))) ? parseInt(manufacturerId, 10) : null,
            description,
            name,
            instanceImage
        }, { transaction: t });

        if (files?.attachments) {
            await Attachment.destroy({ where: { toolId: id }, transaction: t });
            const attachments = files.attachments.map(file => ({
                fileName: file.originalname,
                filePath: file.path,
                toolId: tool.id
            }));
            await Attachment.bulkCreate(attachments, { transaction: t });
        }

        await t.commit();
        const updatedTool = await Tool.findByPk(id, { include: ['attachments', 'manufacturer']});
        res.status(200).json(updatedTool);

    } catch (error: any) {
        await t.rollback();
        console.error("Error updating tool:", error);
        if (error instanceof ValidationError || error instanceof UniqueConstraintError) {
            return res.status(400).json({
                message: "Validation Error",
                errors: (error as any).errors.map((e: any) => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }
        if (error instanceof ForeignKeyConstraintError) {
            const field = (error as any).fields[0] || 'unknown_field';
            return res.status(400).json({
                message: "Validation Error",
                errors: [{
                    field: field,
                    message: `Referenced entity for ${field} does not exist.`
                }]
            });
        }
        console.error("Full error object:", JSON.stringify(error, null, 2));
        if (error.message.includes('File upload only supports')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ 
            message: 'Error updating tool', 
            error: error.message, 
            stack: error.stack 
        });
    }
};

export const deleteTool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tool = await Tool.findByPk(id);
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    await tool.destroy();
    res.status(204).json({ message: 'Tool deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const checkoutTool = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    const t = await sequelize.transaction();

    try {
        const tool = await Tool.findByPk(id, { 
            include: [
                { model: Booking, as: 'bookings' },
                { model: Maintenance, as: 'maintenances' }
            ], 
            transaction: t 
        });
        if (!tool) {
            await t.rollback();
            return res.status(404).json({ message: 'Tool not found' });
        }

        const toolStatus = calculateToolStatus(tool as ToolWithAssociations);
        if (toolStatus !== 'available') {
            await t.rollback();
            return res.status(400).json({ message: `Tool is not available for checkout. Current status: ${toolStatus}` });
        }

        const now = new Date();
        let booking = await Booking.findOne({
            where: {
                toolId: id,
                userId: userId,
                status: 'booked',
                startDate: { [Op.lte]: now },
                endDate: { [Op.gte]: now }
            },
            transaction: t
        });

        if (booking) {
            await booking.update({ status: 'active' }, { transaction: t });
        } else {
            // No pre-existing booking found, create a new one for immediate checkout
            const toolWithAssocs = tool as ToolWithAssociations;
            const isUnavailable = toolWithAssocs.bookings?.some((b: Booking) =>
                (b.status === 'approved' || b.status === 'active') &&
                new Date(b.startDate) < new Date(now.getTime() + 1) &&
                new Date(b.endDate) > now
            ) || toolWithAssocs.maintenances?.some((m: Maintenance) =>
                (m.status === 'scheduled' || m.status === 'in_progress') &&
                new Date(m.startDate) < new Date(now.getTime() + 1) &&
                (m.endDate ? new Date(m.endDate) : new Date(m.startDate)) > now
            );

            if (isUnavailable) {
                await t.rollback();
                return res.status(409).json({ message: 'Tool is booked or in maintenance and cannot be checked out.' });
            }

            booking = await Booking.create({
                toolId: tool.id,
                userId: userId,
                startDate: now,
                endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Default 1 week
                status: 'active',
            }, { transaction: t });
        }

        await tool.update({ currentOwnerId: userId }, { transaction: t });

        await t.commit();
        res.status(200).json(booking);
    } catch (error) {
        await t.rollback();
        console.error("Checkout error:", error);
        res.status(500).json({ message: 'Something went wrong during checkout.' });
    }
};

export const checkinTool = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const t = await sequelize.transaction();

    try {
        const tool = await Tool.findByPk(id, { transaction: t });
        if (!tool) {
            await t.rollback();
            return res.status(404).json({ message: 'Tool not found' });
        }

        const now = new Date();
        const booking = await Booking.findOne({
            where: {
                toolId: id,
                status: 'active',
                // Optional: check if the current user is the one who checked it out
                // userId: req.user.id
            },
            order: [['startDate', 'DESC']],
            transaction: t
        });

        if (!booking) {
            await t.rollback();
            return res.status(400).json({ message: 'No active booking found for this tool to check in.' });
        }

        await booking.update({ status: 'completed', endDate: now }, { transaction: t });
        await tool.update({ currentOwnerId: undefined }, { transaction: t });

        await t.commit();
        res.status(200).json({ message: 'Tool checked in successfully.' });
    } catch (error) {
        await t.rollback();
        console.error("Checkin error:", error);
        res.status(500).json({ message: 'Something went wrong during check-in.' });
    }
};

export const getMyCheckedOutTools = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const tools = await Tool.findAll({ 
            where: { currentOwnerId: userId },
            include: [{ model: ToolType, as: 'toolType' }]
        });
        res.status(200).json(tools);
    } catch (error) {
        console.error("Error in getMyCheckedOutTools:", error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export const getMyTools = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const tools = await Tool.findAll({
            where: { currentOwnerId: userId },
            include: ['category', 'location', 'toolType', 'bookings', 'maintenances']
        });
        res.status(200).json(tools);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user tools', error });
    }
}; 