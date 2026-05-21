import AppError from '../../utils/AppError.js';

export type IssueType = 'bug' | 'feature_request';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';
export type SortOrder = 'newest' | 'oldest';

export type CreateIssueInput = {
  title: string;
  description: string;
  type: IssueType;
};

export type UpdateIssueInput = {
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
};

export type ListQuery = {
  sort: SortOrder;
  type?: IssueType;
  status?: IssueStatus;
};

const isIssueType = (v: unknown): v is IssueType =>
  v === 'bug' || v === 'feature_request';

const isIssueStatus = (v: unknown): v is IssueStatus =>
  v === 'open' || v === 'in_progress' || v === 'resolved';

export const validateCreateIssue = (raw: unknown): CreateIssueInput => {
  if (!raw || typeof raw !== 'object') throw new AppError(400, 'Invalid request body');
  const { title, description, type } = raw as Record<string, unknown>;

  if (typeof title !== 'string' || !title.trim()) throw new AppError(400, 'Title is required');
  if (title.trim().length > 150) throw new AppError(400, 'Title must be at most 150 characters');
  if (typeof description !== 'string' || description.trim().length < 20) {
    throw new AppError(400, 'Description must be at least 20 characters');
  }
  if (!isIssueType(type)) throw new AppError(400, 'Type must be bug or feature_request');

  return { title: title.trim(), description: description.trim(), type };
};

export const validateUpdateIssue = (raw: unknown): UpdateIssueInput => {
  if (!raw || typeof raw !== 'object') throw new AppError(400, 'Invalid request body');
  const { title, description, type, status } = raw as Record<string, unknown>;
  const result: UpdateIssueInput = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) throw new AppError(400, 'Title must be non-empty');
    if (title.trim().length > 150) throw new AppError(400, 'Title must be at most 150 characters');
    result.title = title.trim();
  }
  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim().length < 20) {
      throw new AppError(400, 'Description must be at least 20 characters');
    }
    result.description = description.trim();
  }
  if (type !== undefined) {
    if (!isIssueType(type)) throw new AppError(400, 'Invalid type');
    result.type = type;
  }
  if (status !== undefined) {
    if (!isIssueStatus(status)) throw new AppError(400, 'Invalid status');
    result.status = status;
  }

  if (Object.keys(result).length === 0) throw new AppError(400, 'At least one field is required');
  return result;
};

export const validateId = (raw: unknown): number => {
  const id = Number((raw as { id?: unknown })?.id);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, 'Invalid issue id');
  return id;
};

export const validateListQuery = (raw: unknown): ListQuery => {
  const q = (raw ?? {}) as Record<string, unknown>;

  const sort = q.sort ?? 'newest';
  if (sort !== 'newest' && sort !== 'oldest') {
    throw new AppError(400, 'sort must be newest or oldest');
  }

  const result: ListQuery = { sort };

  if (q.type !== undefined) {
    if (!isIssueType(q.type)) throw new AppError(400, 'Invalid type filter');
    result.type = q.type;
  }
  if (q.status !== undefined) {
    if (!isIssueStatus(q.status)) throw new AppError(400, 'Invalid status filter');
    result.status = q.status;
  }

  return result;
};
