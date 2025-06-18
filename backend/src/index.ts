import './i18n';
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import sequelize from './db';
import path from 'path';
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
import categoryRoutes from './routes/category';
import manufacturerRoutes from './routes/manufacturer';
import toolTypeRoutes from './routes/toolType';
import { Role } from './models';
import './lib/cron';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});

// Make io available for other modules
export { io };

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/categories', categoryRoutes);
app.use('/api/manufacturers', manufacturerRoutes);
app.use('/api/tool-types', toolTypeRoutes);

app.get('/api/roles', async (req, res) => {
    try {
        const roles = await Role.findAll();
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

io.on('connection', (socket) => {
  // Expect the client to send their userId after connecting
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
    }
  });
});

sequelize.sync().then(() => {
  console.log('Database synced');
  server.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}).catch((err) => {
    console.error('Failed to sync database:', err);
}); 