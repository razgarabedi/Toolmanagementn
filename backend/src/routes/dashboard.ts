import { Router } from 'express';
import { getInventorySummary, getMaintenanceSummary, getUtilizationSummary, getMaintenanceCostReport, getUtilizationReport, getMissingToolsReport } from '../controllers/dashboard';
import { auth, authorize } from '../middleware/auth';

const router = Router();

router.get('/inventory', [auth, authorize(['admin', 'manager'])], getInventorySummary);
router.get('/maintenance', [auth, authorize(['admin', 'manager'])], getMaintenanceSummary);
router.get('/utilization', [auth, authorize(['admin', 'manager'])], getUtilizationSummary);
router.get('/reports/maintenance-cost', [auth, authorize(['admin', 'manager'])], getMaintenanceCostReport);
router.get('/reports/utilization', [auth, authorize(['admin', 'manager'])], getUtilizationReport);
router.get('/reports/missing-tools', [auth, authorize(['admin', 'manager'])], getMissingToolsReport);

export default router; 