import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import {
  createIssue,
  deleteIssue,
  getAllIssues,
  getIssueById,
} from './issues.controller.js';

const router = Router();

router.get('/', getAllIssues);
router.post('/', authenticate, createIssue);
router.get('/:id', getIssueById);
router.delete('/:id', authenticate, authorize('maintainer'), deleteIssue);

export default router;
