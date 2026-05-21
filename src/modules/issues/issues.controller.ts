import type { Request, Response } from 'express';
import AppError from '../../utils/AppError.js';
import {
  validateCreateIssue,
  validateUpdateIssue,
  validateId,
  validateListQuery,
} from './issues.validation.js';
import * as service from './issues.service.js';

export const create = async (req: Request, res: Response) => {
  const data = validateCreateIssue(req.body);
  const issue = await service.createIssue(data, req.user!.id);
  res.status(201).json({
    success: true,
    message: 'Issue created successfully',
    data: issue,
  });
};

export const list = async (req: Request, res: Response) => {
  const issues = await service.listIssues(validateListQuery(req.query));
  res.status(200).json({ success: true, data: issues });
};

export const getOne = async (req: Request, res: Response) => {
  const id = validateId(req.params);
  const issue = await service.getIssue(id);
  res.status(200).json({ success: true, data: issue });
};

export const update = async (req: Request, res: Response) => {
  const id = validateId(req.params);
  const body = validateUpdateIssue(req.body);
  const existing = await service.findIssue(id);

  if (req.user!.role === 'contributor') {
    if (existing.reporter_id !== req.user!.id)
      throw new AppError(403, 'You can only update your own issues');
    if (existing.status !== 'open')
      throw new AppError(409, `Cannot edit issue with status '${existing.status}'`);
    if (body.status !== undefined)
      throw new AppError(403, 'Contributors cannot change issue status');
  }

  const updated = await service.updateIssue(id, body);
  res.status(200).json({
    success: true,
    message: 'Issue updated successfully',
    data: updated,
  });
};

export const remove = async (req: Request, res: Response) => {
  const id = validateId(req.params);
  await service.deleteIssue(id);
  res.status(200).json({ success: true, message: 'Issue deleted successfully' });
};
