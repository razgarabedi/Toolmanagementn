import User from './user';
import Tool from './tool';
import Role from './role';
import Booking from './booking';
import Maintenance from './maintenance';
import { SparePart } from './sparePart';
import { MaintenanceSparePart } from './maintenanceSparePart';
import { Location } from './location';
import { Notification } from './notification';
import { ToolType } from './toolType';
import { Attachment } from './attachment';
import { Category } from './category';
import { Manufacturer } from './manufacturer';

const models = {
  User,
  Tool,
  Role,
  Booking,
  Maintenance,
  SparePart,
  MaintenanceSparePart,
  Location,
  Notification,
  ToolType,
  Category,
  Manufacturer,
  Attachment,
};

Object.values(models).forEach((model: any) => {
  if (model.associate) {
    model.associate(models);
  }
});

export { User, Tool, Role, Booking, Maintenance, SparePart, MaintenanceSparePart, Location, Notification, ToolType, Category, Manufacturer, Attachment };
export default models; 