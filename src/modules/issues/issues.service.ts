import { pool } from '../../db/index.js';
import AppError from '../../utils/AppError.js';
import type {
  CreateIssueInput,
  UpdateIssueInput,
  ListQuery,
  IssueType,
  IssueStatus,
} from './issues.validation.js';

type IssueRow = {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
};

type Reporter = { id: number; name: string; role: 'contributor' | 'maintainer' };

const attachReporters = async (issues: IssueRow[]) => {
  const ids = [...new Set(issues.map((i) => i.reporter_id))];
  const { rows } = await pool.query<Reporter>(
    'SELECT id, name, role FROM users WHERE id = ANY($1::int[])',
    [ids],
  );
  const map = new Map(rows.map((r) => [r.id, r]));
  return issues.map(({ reporter_id, ...rest }) => ({
    ...rest,
    reporter: map.get(reporter_id),
  }));
};

export const createIssue = async (data: CreateIssueInput, reporterId: number) => {
  const { rows } = await pool.query<IssueRow>(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    [data.title, data.description, data.type, reporterId],
  );
  return rows[0];
};

export const findIssue = async (id: number) => {
  const { rows } = await pool.query<IssueRow>(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues WHERE id = $1`,
    [id],
  );
  if (!rows[0]) throw new AppError(404, 'Issue not found');
  return rows[0];
};

export const getIssue = async (id: number) => {
  const issue = await findIssue(id);
  const [enriched] = await attachReporters([issue]);
  return enriched;
};

export const listIssues = async (q: ListQuery) => {
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (q.type) {
    params.push(q.type);
    conditions.push(`type = $${params.length}`);
  }
  if (q.status) {
    params.push(q.status);
    conditions.push(`status = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const order = q.sort === 'oldest' ? 'ASC' : 'DESC';

  const { rows } = await pool.query<IssueRow>(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues ${where} ORDER BY created_at ${order}, id ${order}`,
    params,
  );
  return attachReporters(rows);
};

export const updateIssue = async (id: number, fields: UpdateIssueInput) => {
  const allowed = ['title', 'description', 'type', 'status'] as const;
  const set: string[] = [];
  const values: unknown[] = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      values.push(fields[key]);
      set.push(`${key} = $${values.length}`);
    }
  }
  values.push(id);
  const { rows } = await pool.query<IssueRow>(
    `UPDATE issues SET ${set.join(', ')} WHERE id = $${values.length}
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    values,
  );
  return rows[0];
};

export const deleteIssue = async (id: number) => {
  const { rowCount } = await pool.query('DELETE FROM issues WHERE id = $1', [id]);
  if (!rowCount) throw new AppError(404, 'Issue not found');
};
