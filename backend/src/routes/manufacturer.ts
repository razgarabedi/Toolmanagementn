import { Router } from 'express';
import { createManufacturer, getManufacturers } from '../controllers/manufacturer';
import { auth, authorize } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.post('/', [auth, authorize(['admin']), upload.single('logo')], createManufacturer as any);
router.get('/', auth, getManufacturers as any);

export default router; 