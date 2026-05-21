import { StatusCodes } from 'http-status-codes';
import { pool } from '../../db/index.js';
import AppError from '../../utils/AppError.js';
import type {
  CreateIssueInput,
  IssuesQueryInput,
} from './issues.validation.js';

export interface IssueRow {
  id: number;
  title: string;
  description: string;
  type: 'bug' | 'feature_request';
  status: 'open' | 'in_progress' | 'resolved';
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Reporter {
  id: number;
  name: string;
  role: 'contributor' | 'maintainer';
}

export type IssueWithReporter = Omit<IssueRow, 'reporter_id'> & {
  reporter: Reporter;
};

export const createIssue = async (
  input: CreateIssueInput,
  reporterId: number,
): Promise<IssueRow> => {
  const result = await pool.query<IssueRow>(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    [input.title, input.description, input.type, reporterId],
  );
  return result.rows[0] as IssueRow;
};

export const getIssueById = async (
  id: number,
): Promise<IssueWithReporter> => {
  const issueRes = await pool.query<IssueRow>(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues WHERE id = $1`,
    [id],
  );

  if (issueRes.rowCount === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Issue not found');
  }

  const issue = issueRes.rows[0] as IssueRow;

  const reporterRes = await pool.query<Reporter>(
    'SELECT id, name, role FROM users WHERE id = $1',
    [issue.reporter_id],
  );

  const reporter: Reporter = reporterRes.rows[0] ?? {
    id: issue.reporter_id,
    name: 'Unknown',
    role: 'contributor',
  };

  const { reporter_id: _r, ...rest } = issue;
  return { ...rest, reporter };
};

export const getAllIssues = async (
  query: IssuesQueryInput,
): Promise<IssueWithReporter[]> => {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (query.type) {
    params.push(query.type);
    conditions.push(`type = $${params.length}`);
  }
  if (query.status) {
    params.push(query.status);
    conditions.push(`status = $${params.length}`);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const order = query.sort === 'oldest' ? 'ASC' : 'DESC';

  const issuesRes = await pool.query<IssueRow>(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues ${where} ORDER BY created_at ${order}, id ${order}`,
    params,
  );

  if (issuesRes.rowCount === 0) return [];

  const reporterIds = [
    ...new Set(issuesRes.rows.map((r) => r.reporter_id)),
  ];

  const reportersRes = await pool.query<Reporter>(
    'SELECT id, name, role FROM users WHERE id = ANY($1::int[])',
    [reporterIds],
  );

  const reporterMap = new Map<number, Reporter>();
  for (const r of reportersRes.rows) reporterMap.set(r.id, r);

  return issuesRes.rows.map((issue) => {
    const { reporter_id, ...rest } = issue;
    const reporter: Reporter = reporterMap.get(reporter_id) ?? {
      id: reporter_id,
      name: 'Unknown',
      role: 'contributor',
    };
    return { ...rest, reporter };
  });
};

export const deleteIssue = async (id: number): Promise<void> => {
  const result = await pool.query(
    'DELETE FROM issues WHERE id = $1 RETURNING id',
    [id],
  );
  if (result.rowCount === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Issue not found');
  }
};
