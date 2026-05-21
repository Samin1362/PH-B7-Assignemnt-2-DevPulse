import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import {
  createIssue,
  deleteIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
} from './issues.controller.js';

const router = Router();

router.get('/', getAllIssues);
router.post('/', authenticate, createIssue);
router.get('/:id', getIssueById);
router.patch('/:id', authenticate, updateIssue);
router.delete('/:id', authenticate, authorize('maintainer'), deleteIssue);

export default router;
