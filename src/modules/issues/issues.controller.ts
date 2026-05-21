import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync.js';
import sendResponse from '../../utils/sendResponse.js';
import AppError from '../../utils/AppError.js';
import {
  createIssueSchema,
  issueIdParamSchema,
  issuesQuerySchema,
  updateIssueSchema,
} from './issues.validation.js';
import * as issuesService from './issues.service.js';

export const createIssue = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Authentication required');
  }
  const input = createIssueSchema.parse(req.body);
  const issue = await issuesService.createIssue(input, req.user.id);
  sendResponse(res, StatusCodes.CREATED, {
    success: true,
    message: 'Issue created successfully',
    data: issue,
  });
});

export const getAllIssues = catchAsync(async (req: Request, res: Response) => {
  const query = issuesQuerySchema.parse(req.query);
  const issues = await issuesService.getAllIssues(query);
  sendResponse(res, StatusCodes.OK, {
    success: true,
    data: issues,
  });
});

export const getIssueById = catchAsync(async (req: Request, res: Response) => {
  const { id } = issueIdParamSchema.parse(req.params);
  const issue = await issuesService.getIssueById(id);
  sendResponse(res, StatusCodes.OK, {
    success: true,
    data: issue,
  });
});

export const updateIssue = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Authentication required');
  }

  const { id } = issueIdParamSchema.parse(req.params);
  const input = updateIssueSchema.parse(req.body);

  const existing = await issuesService.findIssueRowById(id);

  if (req.user.role === 'contributor') {
    if (existing.reporter_id !== req.user.id) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'You can only update your own issues',
      );
    }
    if (existing.status !== 'open') {
      throw new AppError(
        StatusCodes.CONFLICT,
        `Cannot edit issue with status '${existing.status}'`,
      );
    }
    if (input.status !== undefined) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'Contributors cannot change issue status',
      );
    }
  }

  const updated = await issuesService.updateIssue(id, input);

  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: 'Issue updated successfully',
    data: updated,
  });
});

export const deleteIssue = catchAsync(async (req: Request, res: Response) => {
  const { id } = issueIdParamSchema.parse(req.params);
  await issuesService.deleteIssue(id);
  sendResponse(res, StatusCodes.OK, {
    success: true,
    message: 'Issue deleted successfully',
  });
});
