import { Knex } from "knex";
import type { Tables } from "knex/types/tables";

export type LogicalOperator = "$or" | "$and" | "$not";
export type Operator =
  | "$eq"
  | "$ne"
  | "$gt"
  | "$gte"
  | "$lt"
  | "$lte"
  | "$in"
  | "$nin"
  | "$like"
  | "$ilike"
  | "$null"
  | "$between"
  | "$contains"
  | "$contained"
  | "$overlap"
  | "$startsWith"
  | "$endsWith";
export type Direction = "asc" | "desc";
export type PaginationStrategy = "cursor" | "offset" | "hybrid";
export type Primitive = string | number | boolean | null;
export type Conditional = {
  [field: string]:
    | {
        [K in Operator]?: Primitive | Primitive[];
      }
    | Primitive;
};
export interface LogicalFilter {
  $or?: Filter[];
  $and?: Filter[];
  $not?: Filter;
}
export type Filter = string | Conditional | LogicalFilter;
export interface PaginationOptions {
  cursor?: string;
  limit?: number;
  cursorField?: string;
  cursorDirection?: Direction;
  page?: number;
  pageSize?: number;
  strategy?: PaginationStrategy;
  maxOffsetLimit?: number;
}

export interface QueryResult<T> {
  data: T[];
  pagination: {
    hasNext: boolean;
    hasPrev?: boolean;
    nextCursor?: string;
    prevCursor?: string;
    currentPage?: number;
    totalPages?: number;
    totalCount?: number;
    limit: number;
  };
}

export interface QueryOptions<TTableName extends keyof Tables> {
  filter?: Filter;
  sort?: Record<string, Direction>;
  pagination?: PaginationOptions;
  select?: (keyof Tables[TTableName]["base"])[] | string[] | ["*"];
  relations?: string[];
}

export class KnexQueryBuilder<TableName extends keyof Tables> {
  private knex: Knex;
  private tableName: TableName;

  constructor(knex: Knex, tableName: TableName) {
    this.knex = knex;
    this.tableName = tableName;
  }

  async find<T>(
    options: QueryOptions<TableName> = {}
  ): Promise<QueryResult<T>> {
    const {
      filter,
      sort = {},
      pagination = {},
      select = ["*"],
      relations = [],
    } = options;

    let countQuery = this.knex(this.tableName);
    let dataQuery = this.knex(this.tableName);

    dataQuery = dataQuery.select(
      parseSelect(select as string[], this.tableName)
    );

    for (const relation of relations) {
      dataQuery = this.applyJoin(dataQuery, relation);
      countQuery = this.applyJoin(countQuery, relation);
    }

    if (filter) {
      dataQuery = this.applyFilters(dataQuery, filter);
      countQuery = this.applyFilters(countQuery, filter);
    }

    dataQuery = this.applySorting(dataQuery, sort);

    const paginationResult = await this.applyPagination<T>(
      dataQuery,
      countQuery,
      pagination
    );

    return paginationResult;
  }

  private applyFilters(query: Knex.QueryBuilder, filter: Filter) {
    const parsedFilter = parseFilter(filter);
    if (!isObject(parsedFilter)) {
      return query;
    }

    if (this.hasLogicalOperators(parsedFilter)) {
      return query.where((builder) => {
        this.processFilter(builder, parsedFilter);
      });
    }

    this.processFilter(query, parsedFilter);
    return query;
  }

  private hasLogicalOperators(filter: any): boolean {
    if (!isObject(filter)) return false;
    return Object.keys(filter).some(
      (key) => key === "$or" || key === "$and" || key === "$not"
    );
  }

  private processFilter(builder: Knex.QueryBuilder, filter: any) {
    if (!isObject(filter)) return;

    Object.keys(filter).forEach((key) => {
      const value = filter[key];

      switch (key as keyof LogicalFilter) {
        case "$or":
          (value as Filter[]).forEach((subFilter, index) => {
            const parsedSubFilter = parseFilter(subFilter);
            if (index === 0) {
              builder.where((subBuilder) => {
                this.processFilter(subBuilder, parsedSubFilter);
              });
            } else {
              builder.orWhere((subBuilder) => {
                this.processFilter(subBuilder, parsedSubFilter);
              });
            }
          });
          break;
        case "$and":
          (value as Filter[]).forEach((subFilter) => {
            const parsedSubFilter = parseFilter(subFilter);
            builder.where((subBuilder) => {
              this.processFilter(subBuilder, parsedSubFilter);
            });
          });
          break;
        case "$not":
          builder.whereNot((notBuilder) => {
            const parsedSubFilter = parseFilter(value);
            this.processFilter(notBuilder, parsedSubFilter);
          });
          break;
        default:
          this.applyCondition(builder, key, value);
      }
    });
  }

  private applyCondition(builder: Knex.QueryBuilder, path: string, value: any) {
    if (path.includes(".")) {
      this.applyRelationCondition(builder, path, value);
    } else {
      this.applySimpleCondition(builder, path, value);
    }
  }

  private applySimpleCondition(
    builder: Knex.QueryBuilder,
    field: string,
    value: any
  ) {
    const fieldPath = normalizeFieldPath(field, this.tableName);

    if (value === null) {
      builder.whereNull(fieldPath);
      return;
    }

    if (!isObject(value)) {
      builder.where(fieldPath, value);
      return;
    }

    Object.keys(value).forEach((operator) => {
      this.evaluateOperator(
        builder,
        fieldPath,
        operator as Operator,
        value[operator]
      );
    });
  }

  private applyRelationCondition(
    builder: Knex.QueryBuilder,
    path: string,
    value: any
  ): void {
    if (value === null) {
      builder.whereNull(path);
      return;
    }

    if (!isObject(value) || Array.isArray(value)) {
      builder.where(path, value);
      return;
    }

    Object.keys(value).forEach((operator) => {
      this.evaluateOperator(
        builder,
        path,
        operator as Operator,
        value[operator]
      );
    });
  }

  private evaluateOperator(
    builder: Knex.QueryBuilder,
    field: string,
    operator: Operator,
    expectedValue: any
  ): void {
    switch (operator) {
      case "$eq":
        builder.where(field, expectedValue);
        break;

      case "$ne":
        builder.whereNot(field, expectedValue);
        break;

      case "$gt":
        builder.where(field, ">", expectedValue);
        break;

      case "$gte":
        builder.where(field, ">=", expectedValue);
        break;

      case "$lt":
        builder.where(field, "<", expectedValue);
        break;

      case "$lte":
        builder.where(field, "<=", expectedValue);
        break;

      case "$in":
        if (!Array.isArray(expectedValue)) {
          throw new Error(
            `Operator $in expects an array but received: ${typeof expectedValue}`
          );
        }
        builder.whereIn(field, expectedValue);
        break;

      case "$nin":
        if (!Array.isArray(expectedValue)) {
          throw new Error(
            `Operator $nin expects an array but received: ${typeof expectedValue}`
          );
        }
        builder.whereNotIn(field, expectedValue);
        break;

      case "$like":
        builder.where(field, "like", expectedValue);
        break;

      case "$ilike":
        builder.where(field, "ilike", expectedValue);
        break;

      case "$null":
        if (expectedValue === true) {
          builder.whereNull(field);
        } else {
          builder.whereNotNull(field);
        }
        break;

      case "$between":
        if (!Array.isArray(expectedValue) || expectedValue.length !== 2) {
          throw new Error(`Operator $between expects an array of two elements`);
        }
        //@ts-ignore
        builder.whereBetween(field, expectedValue);
        break;

      case "$contains":
        builder.whereRaw(`?? @> ?`, [field, stringify(expectedValue)]);
        break;

      case "$contained":
        builder.whereRaw(`?? <@ ?`, [field, stringify(expectedValue)]);
        break;

      case "$overlap":
        builder.whereRaw(`?? && ?`, [field, stringify(expectedValue)]);
        break;

      case "$startsWith":
        builder.where(field, "like", `${expectedValue}%`);
        break;

      case "$endsWith":
        builder.where(field, "like", `%${expectedValue}`);
        break;

      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }

  private applySorting(
    query: Knex.QueryBuilder,
    sort: Record<string, Direction>
  ) {
    Object.entries(sort).forEach(([field, direction]) => {
      const fieldPath = normalizeFieldPath(field, this.tableName);
      query.orderBy(fieldPath, direction);
    });
    return query;
  }

  private async applyPagination<T>(
    dataQuery: Knex.QueryBuilder,
    countQuery: Knex.QueryBuilder,
    pagination: PaginationOptions
  ): Promise<QueryResult<T>> {
    const {
      strategy = "hybrid",
      limit = 20,
      maxOffsetLimit = 1000,
    } = pagination;

    let actualStrategy = strategy;
    if (strategy === "hybrid") {
      if (pagination.cursor) {
        actualStrategy = "cursor";
      } else if (pagination.page && pagination.page * limit > maxOffsetLimit) {
        actualStrategy = "cursor";
      } else {
        actualStrategy = "offset";
      }
    }

    if (actualStrategy === "cursor") {
      return this.applyCursorPagination(dataQuery, pagination);
    } else {
      return this.applyOffsetPagination(dataQuery, countQuery, pagination);
    }
  }

  private async applyCursorPagination<T>(
    query: Knex.QueryBuilder,
    pagination: PaginationOptions
  ): Promise<QueryResult<T>> {
    const {
      cursor,
      limit = 20,
      cursorField = "id",
      cursorDirection = "desc",
    } = pagination;

    const fieldPath = normalizeFieldPath(cursorField, this.tableName);

    if (cursor) {
      const operator = cursorDirection === "desc" ? "<" : ">";
      query.where(fieldPath, operator, cursor);
    }

    query.orderBy(fieldPath, cursorDirection);
    query.limit(limit + 1);

    const result = await query;
    const hasNext = result.length > limit;
    const data = hasNext ? result.slice(0, limit) : result;

    let nextCursor: string | undefined, prevCursor: string | undefined;

    if (hasNext && data.length > 0) {
      const lastItem = data[data.length - 1];
      nextCursor = this.extractCursorValue(lastItem, cursorField);
    }

    if (cursor && data.length > 0) {
      const firstItem = data[0];
      prevCursor = this.extractCursorValue(firstItem, cursorField);
    }

    return {
      data: data as T[],
      pagination: {
        hasNext,
        hasPrev: !!cursor,
        nextCursor,
        prevCursor,
        limit,
      },
    };
  }

  private async applyOffsetPagination<T>(
    dataQuery: Knex.QueryBuilder,
    countQuery: Knex.QueryBuilder,
    pagination: PaginationOptions
  ): Promise<QueryResult<T>> {
    const { page = 1, pageSize = 20 } = pagination;

    const offset = (page - 1) * pageSize;

    const [{ count }] = await countQuery.count("* as count");
    const totalCount = parseInt(count as string, 10);
    const totalPages = Math.ceil(totalCount / pageSize);

    dataQuery.limit(pageSize).offset(offset);

    const data = await dataQuery;

    return {
      data: data as T[],
      pagination: {
        hasNext: page < totalPages,
        hasPrev: page > 1,
        currentPage: page,
        totalPages,
        totalCount,
        limit: pageSize,
      },
    };
  }

  private applyJoin(
    query: Knex.QueryBuilder,
    relation: string
  ): Knex.QueryBuilder {
    const [relationTable, joinField] = relation.split(".");
    const joinCondition = joinField || "id";

    return query.leftJoin(
      relationTable!,
      `${this.tableName}.${relation}_id`,
      `${relationTable}.${joinCondition}`
    );
  }

  private extractCursorValue(item: any, cursorField: string): string {
    const fields = cursorField.split(".");
    let value = item;

    for (const field of fields) {
      value = value[field];
    }

    return String(value);
  }
}

export function isNotNullish<T = unknown>(
  data: T
): data is NonNullable<typeof data> {
  return data !== undefined && data !== null;
}
export function isObject(data: unknown): data is Record<string, any> {
  return isNotNullish(data) && typeof data === "object" && !Array.isArray(data);
}

export function stringify<T = unknown>(value: T): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

export function normalizeFieldPath(field: string, tableName: string) {
  return field.includes(".") ? field : `${tableName}.${field}`;
}

export function parseSelect(fields: string[], tableName: string) {
  const uniqueFields = new Set(fields);
  return [...uniqueFields].map((field) => normalizeFieldPath(field, tableName));
}

export function parseFilter(filter: Filter): Filter | null {
  if (!filter) return null;
  if (typeof filter === "string") {
    try {
      filter = JSON.parse(filter);
    } catch {
      return null;
    }
  }
  return filter;
}
