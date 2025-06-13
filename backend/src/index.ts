import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import sequelize from './db';
import './models';
import authRoutes from './routes/auth';
import toolRoutes from './routes/tool';

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

sequelize.sync().then(() => {
  console.log('Database synced');
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}); 