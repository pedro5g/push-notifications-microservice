import type { Knex } from 'knex';
import type { ContextRepository } from './context.repository';

export class BaseRepository {
  context: ContextRepository;
  knex: Knex;

  constructor(ctx: ContextRepository) {
    this.context = ctx;
    this.knex = ctx.db;
  }

  protected parseSelect<T extends object, K extends keyof T = keyof T>(
    ...fields: K[]
  ): K[] extends readonly [] ? '*' : K[] {
    if (!fields || fields.length === 0) return '*' as any;
    return fields;
  }
}
