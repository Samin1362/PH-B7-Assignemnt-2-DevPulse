import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import {
  createIssue,
  deleteIssue,
  getIssueById,
} from './issues.controller.js';

const router = Router();

router.post('/', authenticate, createIssue);
router.get('/:id', getIssueById);
router.delete('/:id', authenticate, authorize('maintainer'), deleteIssue);

export default router;
