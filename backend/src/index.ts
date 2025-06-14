import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import sequelize from './db';
import './models';
import authRoutes from './routes/auth';
import toolRoutes from './routes/tool';
import userRoutes from './routes/user';
import bookingRoutes from './routes/booking';
import maintenanceRoutes from './routes/maintenance';
import dashboardRoutes from './routes/dashboard';
import sparePartRoutes from './routes/sparePart';
import locationRoutes from './routes/location';
import notificationRoutes from './routes/notification';
import { Role } from './models';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Werkzeugmeister Pro API');
});

app.use('/api/auth', authRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/spare-parts', sparePartRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/roles', async (req, res) => {
    try {
        const roles = await Role.findAll();
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

sequelize.sync().then(() => {
  console.log('Database synced');
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}); 