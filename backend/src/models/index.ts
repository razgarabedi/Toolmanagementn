import User from './user';
import Tool from './tool';
import Role from './role';
import Booking from './booking';
import Maintenance from './maintenance';
import { SparePart } from './sparePart';
import { MaintenanceSparePart } from './maintenanceSparePart';
import { Location } from './location';
import { Notification } from './notification';

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
};

Object.values(models).forEach((model: any) => {
  if (model.associate) {
    model.associate(models);
  }
});

export { User, Tool, Role, Booking, Maintenance, SparePart, MaintenanceSparePart, Location, Notification };
export default models; 