import { Model } from 'sequelize';
import { Request, Response } from 'express';
import i18n from '../i18n';

export const deleteResource = async (
  req: Request,
  res: Response,
  model: any,
  resourceName: string,
  association?: { model: any; as: string }
) => {
  try {
    const { id } = req.params;
    const resource = await model.findByPk(id, {
      include: association ? [{ model: association.model, as: association.as }] : [],
    });

    if (!resource) {
      return res.status(404).json({ message: `${resourceName} not found` });
    }

    if (association && (resource as any)[association.as] && (resource as any)[association.as].length > 0) {
      return res.status(400).json({
        message: i18n.t('resourceInUse', { resource: resourceName }),
      });
    }

    await resource.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: `Error deleting ${resourceName}`, error });
  }
}; 