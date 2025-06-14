import { Router } from 'express';
import { createMaintenance, getToolMaintenanceHistory, updateMaintenance } from '../controllers/maintenance';
import { auth, authorize } from '../middleware/auth';

const router = Router();

router.post('/', [auth, authorize(['admin', 'manager'])], createMaintenance);
router.get('/tool/:toolId', auth, getToolMaintenanceHistory);
router.put('/:id', [auth, authorize(['admin', 'manager'])], updateMaintenance);

export default router; 