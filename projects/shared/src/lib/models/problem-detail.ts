/** RFC 7807 Problem Details for HTTP APIs. */
export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  /** Field-level validation errors keyed by property name. */
  errors?: Record<string, string[]>;
}

export function isProblemDetail(value: unknown): value is ProblemDetail {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('title' in value || 'detail' in value || 'status' in value)
  );
}
