import { Request, Response } from 'express';
import { Tool } from '../models';

export const createTool = async (req: Request, res: Response) => {
  try {
    const { name, description, status, condition } = req.body;

    const tool = await Tool.create({
      name,
      description,
      status,
      condition,
    });

    res.status(201).json(tool);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getTools = async (req: Request, res: Response) => {
  try {
    const tools = await Tool.findAll();
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

export const updateTool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, status, condition } = req.body;
    const tool = await Tool.findByPk(id);
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    await tool.update({ name, description, status, condition });
    res.status(200).json(tool);
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

export const checkoutTool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tool = await Tool.findByPk(id);
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    if (tool.status !== 'available') {
      return res.status(400).json({ message: 'Tool is not available' });
    }
    await tool.update({ status: 'in_use' });
    res.status(200).json(tool);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export const checkinTool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tool = await Tool.findByPk(id);
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    if (tool.status !== 'in_use') {
      return res.status(400).json({ message: 'Tool is not in use' });
    }
    await tool.update({ status: 'available' });
    res.status(200).json(tool);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
} 