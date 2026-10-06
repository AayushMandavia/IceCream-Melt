import { createClient, Client, InStatement } from '@libsql/client';
import { D1DatabaseLike, D1PreparedStatementLike, D1ResultLike } from './types';

export class LibSqlPreparedStatement implements D1PreparedStatementLike {
  private boundValues: unknown[] = [];

  constructor(
    private client: Client,
    private sql: string,
  ) {}

  bind(...values: unknown[]): D1PreparedStatementLike {
    const next = new LibSqlPreparedStatement(this.client, this.sql);
    next.boundValues = values.length === 1 && Array.isArray(values[0]) ? values[0] : values;
    return next;
  }

  getSql(): string {
    return this.sql;
  }

  getBoundValues(): unknown[] {
    return this.boundValues;
  }

  async first<T = unknown>(colName?: string): Promise<T | null> {
    const res = await this.client.execute({
      sql: this.sql,
      args: this.boundValues as any[],
    });

    if (!res.rows || res.rows.length === 0) {
      return null;
    }

    const row = res.rows[0] as unknown as Record<string, unknown>;
    if (colName) {
      return (row[colName] as T) ?? null;
    }
    return row as T;
  }

  async all<T = unknown>(): Promise<D1ResultLike<T>> {
    const res = await this.client.execute({
      sql: this.sql,
      args: this.boundValues as any[],
    });

    return {
      results: (res.rows as unknown as T[]) ?? [],
      success: true,
      meta: {
        changes: res.rowsAffected,
        last_row_id: Number(res.lastInsertRowid ?? 0),
      },
    };
  }

  async run<T = unknown>(): Promise<D1ResultLike<T>> {
    const res = await this.client.execute({
      sql: this.sql,
      args: this.boundValues as any[],
    });

    return {
      results: [],
      success: true,
      meta: {
        changes: res.rowsAffected,
        last_row_id: Number(res.lastInsertRowid ?? 0),
      },
    };
  }
}

export class LibSqlD1Adapter implements D1DatabaseLike {
  constructor(private client: Client) {}

  prepare(query: string): D1PreparedStatementLike {
    return new LibSqlPreparedStatement(this.client, query);
  }

  async exec(query: string): Promise<void> {
    await this.client.executeMultiple(query);
  }

  async batch<T = unknown>(statements: D1PreparedStatementLike[]): Promise<D1ResultLike<T>[]> {
    const inStatements: InStatement[] = statements.map((s) => {
      const sqlPrep = s as LibSqlPreparedStatement;
      return {
        sql: sqlPrep.getSql ? sqlPrep.getSql() : (s as any).sql,
        args: sqlPrep.getBoundValues ? (sqlPrep.getBoundValues() as any[]) : (s as any).boundValues ?? [],
      };
    });

    const results = await this.client.batch(inStatements, 'write');
    return results.map((res) => ({
      results: (res.rows as unknown as T[]) ?? [],
      success: true,
      meta: {
        changes: res.rowsAffected,
        last_row_id: Number(res.lastInsertRowid ?? 0),
      },
    }));
  }

  getClient(): Client {
    return this.client;
  }
}

export function createLibSqlDatabase(url: string, authToken?: string): D1DatabaseLike {
  const client = createClient({
    url,
    authToken,
  });
  return new LibSqlD1Adapter(client);
}
