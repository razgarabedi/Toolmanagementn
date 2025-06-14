import { Request, Response } from 'express';
import { Tool, Booking, User } from '../models';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth';
import sequelize from '../db';
import { Location } from '../models';
import { Notification } from '../models';

export const createTool = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, status, condition, type, purchaseDate, locationId } = req.body;
    const tool = await Tool.create({
      name,
      description,
      status,
      condition,
      type,
      purchaseDate,
      locationId,
    });
    res.status(201).json(tool);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getTools = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const whereClause: any = {};
    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }

    const tools = await Tool.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'currentOwner', attributes: ['id', 'username'] },
        { model: Booking, as: 'bookings' },
        { model: Location, as: 'location', attributes: ['id', 'name'] }
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
    const tool = await Tool.findByPk(id);
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    res.status(200).json(tool);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const updateTool = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, status, condition, type, purchaseDate, locationId } = req.body;
    const tool = await Tool.findByPk(id);
    if (tool) {
      await tool.update({ name, description, status, condition, type, purchaseDate, locationId });
      res.status(200).json(tool);
    } else {
      res.status(404).json({ message: 'Tool not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
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

    // Notify admin (user ID 1)
    await Notification.create({
        userId: 1, // Assuming admin user has ID 1
        message: `Tool "${tool.name}" has been checked in by user #${userId}.`
    });

    res.status(200).json(tool);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export const getMyCheckedOutTools = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const tools = await Tool.findAll({ 
            where: { currentOwnerId: userId },
        });
        res.status(200).json(tools);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
} 