import { Request, Response } from 'express';
import { Tool, Booking, User, ToolType, Location, Attachment, Manufacturer } from '../models';
import { Op, ValidationError, UniqueConstraintError, ForeignKeyConstraintError } from 'sequelize';
import { AuthRequest } from '../middleware/auth';
import sequelize from '../db';
import { Notification } from '../models';

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
        const { toolTypeId, rfid, serialNumber, status, condition, purchaseDate, cost, warrantyEndDate, locationId, manufacturerId, description, name } = req.body;

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
            status,
            condition,
            purchaseDate: (purchaseDate && !isNaN(new Date(purchaseDate).getTime())) ? purchaseDate : null,
            cost: (cost && !isNaN(parseFloat(cost))) ? parseFloat(cost) : null,
            warrantyEndDate: (warrantyEndDate && !isNaN(new Date(warrantyEndDate).getTime())) ? warrantyEndDate : null,
            locationId: (locationId && !isNaN(parseInt(locationId, 10))) ? parseInt(locationId, 10) : null,
            manufacturerId: (manufacturerId && !isNaN(parseInt(manufacturerId, 10))) ? parseInt(manufacturerId, 10) : null,
            description,
            name,
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

export const getTools = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const whereClause: any = {};

    const tools = await Tool.findAll({
      where: whereClause,
      include: [
        { 
            model: ToolType, 
            as: 'toolType',
            where: search ? { name: { [Op.like]: `%${search}%` } } : undefined
        },
        { model: User, as: 'currentOwner', attributes: ['id', 'username'] },
        { model: Booking, as: 'bookings' },
        { model: Location, as: 'location', attributes: ['id', 'name'] },
        { model: Manufacturer, as: 'manufacturer', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(tools);
  } catch (error) {
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
            { model: Location, as: 'location', attributes: ['id', 'name'] },
            { model: Manufacturer, as: 'manufacturer', attributes: ['id', 'name'] }
        ]
    });
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    res.status(200).json(tool);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const updateTool = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const t = await sequelize.transaction();

    try {
        const { toolTypeId, rfid, serialNumber, status, condition, purchaseDate, cost, warrantyEndDate, locationId, manufacturerId, description, name } = req.body;
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
            status,
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
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const tool = await Tool.findByPk(id);

    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    if (tool.status === 'in_use') {
        return res.status(400).json({ message: 'Tool is already in use.' });
    }
    
    if (tool.status === 'in_maintenance') {
        return res.status(400).json({ message: 'Tool is in maintenance.' });
    }

    const now = new Date();

    const existingBooking = await Booking.findOne({
        where: {
            toolId: tool.id,
            userId,
            status: 'booked',
            startDate: { [Op.lte]: now },
            endDate: { [Op.gte]: now }
        }
    });

    if (tool.status === 'booked' && !existingBooking) {
        return res.status(400).json({ message: 'Tool is booked by another user for this period.' });
    }

    if (existingBooking) {
        existingBooking.status = 'active';
        await existingBooking.save();
    } else {
        // Create a new booking if one doesn't exist
        await Booking.create({
            toolId: tool.id,
            userId,
            startDate: now,
            // Set a default end date, e.g., 2 weeks from now
            endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
            status: 'active'
        });
    }

    await tool.update({ status: 'in_use', currentOwnerId: userId });

    res.status(200).json(tool);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export const checkinTool = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const tool = await Tool.findByPk(id);

    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    if (tool.status !== 'in_use') {
      return res.status(400).json({ message: 'Tool is not checked out.' });
    }
    
    if (tool.currentOwnerId !== userId) {
        return res.status(403).json({ message: 'You are not the current owner of this tool.' });
    }

    const now = new Date();

    const activeBooking = await Booking.findOne({
        where: {
            toolId: tool.id,
            userId,
            status: 'active'
        }
    });
    
    if (activeBooking) {
        activeBooking.status = 'completed';
        activeBooking.endDate = now;
        await activeBooking.save();
    }

    tool.status = 'available';
    tool.currentOwnerId = undefined;
    tool.usageCount = (tool.usageCount || 0) + 1;
    await tool.save();

    const toolWithType = await Tool.findByPk(tool.id, { include: [{ model: ToolType, as: 'toolType' }] });

    // Notify admin (user ID 1)
    await Notification.create({
        userId: 1, // Assuming admin user has ID 1
        message: `Tool "${(toolWithType as any).toolType.name}" has been checked in by user #${userId}.`
    });

    res.status(200).json(toolWithType);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

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