import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { create, list, getOne, update, remove } from './issues.controller.js';

const router = Router();

router.get('/', list);
router.post('/', authenticate, create);
router.get('/:id', getOne);
router.patch('/:id', authenticate, update);
router.delete('/:id', authenticate, authorize('maintainer'), remove);

export default router;
