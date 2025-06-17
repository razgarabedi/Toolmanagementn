import { Router } from 'express';
import { getLocations, createLocation, deleteLocation } from '../controllers/location';
import { auth, authorize } from '../middleware/auth';

const router = Router();

router.get('/', auth, getLocations);
router.post('/', [auth, authorize(['admin', 'manager'])], createLocation);
router.delete('/:id', [auth, authorize(['admin'])], deleteLocation);

export default router; 