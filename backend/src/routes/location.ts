import { Router } from 'express';
import { getLocations, createLocation } from '../controllers/location';
import { auth, authorize } from '../middleware/auth';

const router = Router();

router.get('/', auth, getLocations);
router.post('/', [auth, authorize(['admin', 'manager'])], createLocation);

export default router; 