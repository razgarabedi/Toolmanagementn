import { Router } from 'express';
import { getSpareParts, createSparePart, updateSparePart, deleteSparePart, assignPartToMaintenance } from '../controllers/sparePart';
import { auth, authorize } from '../middleware/auth';

const router = Router();

router.get('/', [auth, authorize(['admin', 'manager'])], getSpareParts);
router.post('/', [auth, authorize(['admin', 'manager'])], createSparePart);
router.put('/:id', [auth, authorize(['admin', 'manager'])], updateSparePart);
router.delete('/:id', [auth, authorize(['admin', 'manager'])], deleteSparePart);
router.post('/assign', [auth, authorize(['admin', 'manager'])], assignPartToMaintenance);

export default router; 