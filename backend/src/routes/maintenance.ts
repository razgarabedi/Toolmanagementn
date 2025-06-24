import { Router } from 'express';
import { createMaintenance, getToolMaintenanceHistory, updateMaintenance, getAllMaintenance, finishMaintenance } from '../controllers/maintenance';
import { auth, authorize } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.get('/', auth, getAllMaintenance);
router.post('/', [auth, authorize(['admin', 'manager'])], createMaintenance);
router.get('/tool/:toolId', auth, getToolMaintenanceHistory);
router.put('/:id', [auth, authorize(['admin', 'manager'])], updateMaintenance);
router.patch('/:id/finish', [auth, authorize(['admin', 'manager']), upload.single('file')], finishMaintenance);

export default router; 