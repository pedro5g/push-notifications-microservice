import type { MockTable } from "./mock-table";

export type Database = Record<string, MockTable<any, any, any>>;

type StringOperators = "!=" | "=" | "like" | "ilike" | "in" | "nin";
type NumberOperators = ">" | "<" | "=" | "!=" | ">=" | "<=" | "in" | "nin";
type BooleanOperators = "!=" | "=";
type DateOperators = ">" | "<" | "=" | "!=" | ">=" | "<=" | "in" | "nin";

type OperatorForType<T> = T extends string
  ? StringOperators
  : T extends number
  ? NumberOperators
  : T extends boolean
  ? BooleanOperators
  : T extends Date
  ? DateOperators
  : never;

type ValuePerOperator<TEntity, TOperator> = TOperator extends "in" | "nin"
  ? TEntity[]
  : TEntity;

type Clausure<TTable extends Record<string, any>> = [
  keyof TTable,
  OperatorForType<TTable[keyof TTable]>,
  TTable[keyof TTable]
];

type Filter<TTable extends Record<string, any>> = (
  | Partial<TTable>
  | Clausure<TTable>
)[];

type ExtractEntity<T> = T extends MockTable<infer P, any, any> ? P : never;
type ExtractUniqueFields<T> = T extends MockTable<any, infer P, infer U>
  ? P | U
  : never;

type OrderBy<T> = { field: keyof T; direction: "asc" | "desc" };

export class MockQueryBuilder<
  TDatabase extends Database,
  TTable extends keyof TDatabase = keyof TDatabase,
  TEntity = ExtractEntity<TDatabase[TTable]>,
  TOmist extends string = never
> {
  private _table: TDatabase[TTable];
  private _where: Filter<ExtractEntity<TDatabase[TTable]>>;
  private _select: (keyof ExtractEntity<TDatabase[TTable]> | "*")[] = ["*"];
  private _orderBy: OrderBy<ExtractEntity<TDatabase[TTable]>> | null;
  private _offset: number | null;
  private _limit: number | null;

  constructor(
    table: TDatabase[TTable],
    filters: Filter<ExtractEntity<TDatabase[TTable]>> = [],
    fields: (keyof ExtractEntity<TDatabase[TTable]> | "*")[] = ["*"],
    orderBy: OrderBy<ExtractEntity<TDatabase[TTable]>> | null = null,
    offset: number | null = null,
    limit: number | null = null
  ) {
    this._table = table;
    this._where = filters;
    this._select = fields;
    this._orderBy = orderBy;
    this._offset = offset;
    this._limit = limit;
  }

  where<
    K extends keyof ExtractEntity<TDatabase[TTable]>,
    O extends OperatorForType<ExtractEntity<TDatabase[TTable]>[K]>
  >(
    filter: K,
    operator: O,
    value: ValuePerOperator<ExtractEntity<TDatabase[TTable]>[K], O>
  ): Omit<
    MockQueryBuilder<TDatabase, TTable, TEntity, TOmist | "where">,
    TOmist | "where"
  >;
  where<K extends keyof ExtractEntity<TDatabase[TTable]>>(
    filter:
      | Partial<ExtractEntity<TDatabase[TTable]>>
      | Partial<{
          [K in keyof ExtractEntity<TDatabase[TTable]>]:
            | Partial<ExtractEntity<TDatabase[TTable]>[K]>[]
            | Partial<ExtractEntity<TDatabase[TTable]>[K]>;
        }>,
    operator?: OperatorForType<ExtractEntity<TDatabase[TTable]>[K]>,
    value?: any
  ): Omit<
    MockQueryBuilder<TDatabase, TTable, TEntity, TOmist | "where">,
    TOmist | "where"
  >;
  where<K extends keyof ExtractEntity<TDatabase[TTable]>>(
    filter:
      | keyof ExtractEntity<TDatabase[TTable]>
      | Partial<ExtractEntity<TDatabase[TTable]>>
      | Partial<{
          [K in keyof ExtractEntity<TDatabase[TTable]>]:
            | Partial<ExtractEntity<TDatabase[TTable]>[K]>[]
            | Partial<ExtractEntity<TDatabase[TTable]>[K]>;
        }>,
    operator: OperatorForType<ExtractEntity<TDatabase[TTable]>[K]>,
    value: any
  ): Omit<
    MockQueryBuilder<TDatabase, TTable, TEntity, TOmist | "where">,
    TOmist | "where"
  > {
    const __resolvedFilters =
      typeof filter === "string"
        ? ([filter, operator, value] as Clausure<
            ExtractEntity<TDatabase[TTable]>
          >)
        : (filter as Partial<ExtractEntity<TDatabase[TTable]>>);
    const newFilters = [...this._where, __resolvedFilters];
    return new MockQueryBuilder<TDatabase, TTable, TEntity, TOmist | "where">(
      this._table,
      newFilters,
      this._select,
      this._orderBy,
      this._offset,
      this._limit
    ) as Omit<
      MockQueryBuilder<TDatabase, TTable, TEntity, TOmist | "where">,
      TOmist | "where"
    >;
  }

  select<F extends (keyof ExtractEntity<TDatabase[TTable]>)[] | ["*"]>(
    ...fields: F
  ) {
    type TNewEntity = typeof fields extends "*"
      ? ExtractEntity<TDatabase[TTable]>
      : typeof fields extends (keyof ExtractEntity<TDatabase[TTable]>)[]
      ? F["length"] extends 0
        ? ExtractEntity<TDatabase[TTable]>
        : Pick<ExtractEntity<TDatabase[TTable]>, F[number]>
      : ExtractEntity<TDatabase[TTable]>;
    return new MockQueryBuilder<
      TDatabase,
      TTable,
      TNewEntity,
      TOmist | "select" | "delete" | "update"
    >(
      this._table,
      this._where,
      fields ?? "*",
      this._orderBy,
      this._offset,
      this._limit
    ) as Omit<
      MockQueryBuilder<
        TDatabase,
        TTable,
        TNewEntity,
        TOmist | "select" | "delete" | "update"
      >,
      TOmist | "select" | "delete" | "update"
    >;
  }

  orderBy(
    field: keyof ExtractEntity<TDatabase[TTable]>,
    direction: "asc" | "desc"
  ) {
    return new MockQueryBuilder(
      this._table,
      this._where,
      this._select,
      {
        field,
        direction,
      },
      this._offset,
      this._limit
    ) as Omit<
      MockQueryBuilder<
        TDatabase,
        TTable,
        TEntity,
        TOmist | "orderBy" | "delete" | "update" | "findUnique"
      >,
      TOmist | "orderBy" | "delete" | "update" | "findUnique"
    >;
  }

  findMany(): TEntity[] {
    let results = this._table.toArray() as ExtractEntity<TDatabase[TTable]>[];

    if (this._where && this._where.length > 0) {
      for (const filter of this._where) {
        if (Array.isArray(filter)) {
          const [field, operator, value] = filter;
          results = results.filter((row) => {
            switch (typeof value) {
              case "string":
                return this.resolverString(
                  row[field],
                  operator as StringOperators,
                  value
                );
              case "number":
              case "bigint":
                return this.resolverNumber(
                  row[field],
                  operator as NumberOperators,
                  value
                );
              case "boolean":
                return this.resolverBoolean(
                  row[field],
                  operator as BooleanOperators,
                  value
                );
              case "object":
                if (value && Array.isArray(value)) {
                  return this.resolverArray(
                    row[field],
                    operator as "in" | "nin",
                    value
                  );
                }
                if (Object.prototype.toString.call(value) === "[object Date]") {
                  return this.resolverDate(
                    row[field],
                    operator as DateOperators,
                    value
                  );
                }
                throw new Error(`Invalid value type, value '${value}'`);
              default:
                throw new Error(`Invalid value type, value '${value}'`);
            }
          });
        } else {
          results = results.filter((row) => {
            const isMatch = Object.keys(filter).every((key) => {
              const rowValue = row[key as keyof typeof row];
              const filterValue = filter[key as keyof typeof row];

              if (filterValue && Array.isArray(filterValue)) {
                return filterValue.includes(rowValue);
              }
              return rowValue === filterValue;
            });
            return isMatch;
          });
        }
      }
    }

    if (this._orderBy) {
      const { field, direction } = this._orderBy;
      results.sort((a, b) => {
        if (a[field] < b[field]) return direction === "asc" ? -1 : 1;
        if (a[field] > b[field]) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    if (!this._select.includes("*")) {
      results = results.map((row) =>
        Object.fromEntries(
          Object.entries(row).filter(([key]) =>
            this._select.includes(key as keyof TEntity)
          )
        )
      ) as any;
    }

    if (
      (this._offset !== null && this._offset !== undefined) ||
      (this._limit !== null && this._limit !== undefined)
    ) {
      const offset = this._offset ?? 0;
      const limit = this._limit ?? results.length;

      if (offset < 0 || limit < 0) {
        throw new Error("Offset and limit must be non-negative numbers.");
      }

      results = results.slice(offset, offset + limit);
    }

    return results as any;
  }

  findFirst(): TEntity | null {
    return this.findMany()[0] ?? (null as any);
  }

  findUnique<K extends ExtractUniqueFields<TDatabase[TTable]>>(
    field: K,
    value: ExtractEntity<TDatabase[TTable]>[K]
  ): TEntity | null;
  findUnique<
    K extends ExtractUniqueFields<TDatabase[TTable]>
  >(): TEntity | null;
  findUnique<K extends ExtractUniqueFields<TDatabase[TTable]>>(
    field?: K,
    value?: ExtractEntity<TDatabase[TTable]>[K]
  ): TEntity | null {
    let uniqueField = ["@@NON_UNIQUE_FIELD__", ""] as any;

    if (field && value) {
      uniqueField = [field, value];
    } else {
      let hasUniqueFieldInFilter = false;
      for (const filter of this._where) {
        if (Array.isArray(filter)) {
          const [field, _, value] = filter;
          if (
            (this._table["uniqueFields"] as Set<any>).has(field) ||
            this._table["primaryKey"] === field
          ) {
            uniqueField = [field, value];
            hasUniqueFieldInFilter = true;
            break;
          }
        } else {
          Object.keys(filter).forEach((field) => {
            if (
              (this._table["uniqueFields"] as Set<any>).has(field) ||
              this._table["primaryKey"] === field
            ) {
              uniqueField = [field, filter[field as keyof typeof filter]];
              hasUniqueFieldInFilter = true;
            }
          });
        }
        if (hasUniqueFieldInFilter) break;
      }
    }
    let result = this._table.findUnique(uniqueField[0], uniqueField[1]);

    if (!result) return null;

    if (!this._select.includes("*")) {
      result = Object.fromEntries(
        Object.entries(result).filter(([key]) =>
          this._select.includes(key as keyof TEntity)
        )
      );
    }

    return result;
  }

  update(data: Partial<ExtractEntity<TDatabase[TTable]>>) {
    this.appendPrimaryKey();
    const results = this.findMany() as ExtractEntity<TDatabase[TTable]>[];

    for (const row of results) {
      this._table.updateById(row[this._table["primaryKey"]], data);
    }

    return results.length;
  }

  delete() {
    this.appendPrimaryKey();
    const toDelete = this.findMany() as ExtractEntity<TDatabase[TTable]>[];
    for (const row of toDelete) {
      this._table.deleteById(row[this._table["primaryKey"]]);
    }
    return toDelete.length;
  }

  offset(offset: number) {
    return new MockQueryBuilder(
      this._table,
      this._where,
      this._select,
      this._orderBy,
      offset,
      this._limit
    ) as Omit<
      MockQueryBuilder<
        TDatabase,
        TTable,
        TEntity,
        TOmist | "offset" | "delete" | "update" | "findUnique"
      >,
      TOmist | "offset" | "delete" | "update" | "findUnique"
    >;
  }

  limit(limit: number) {
    return new MockQueryBuilder(
      this._table,
      this._where,
      this._select,
      this._orderBy,
      this._offset,
      limit
    ) as Omit<
      MockQueryBuilder<
        TDatabase,
        TTable,
        TEntity,
        TOmist | "limit" | "delete" | "update" | "findUnique"
      >,
      TOmist | "limit" | "delete" | "update" | "findUnique"
    >;
  }

  private appendPrimaryKey() {
    if (this._select.includes("*")) return;

    if (!this._select.includes(this._table["primaryKey"])) {
      this._select.push(this._table["primaryKey"]);
    }
  }

  private resolverString(
    row: string,
    operator: StringOperators,
    value: string
  ) {
    switch (operator) {
      case "=":
        return row === value;
      case "!=":
        return row !== value;
      case "like":
        return row.includes(value);
      case "ilike":
        return row.toLowerCase().includes(value.toLowerCase());
      default:
        return true;
    }
  }

  private resolverNumber(
    row: number,
    operator: NumberOperators,
    value: number
  ) {
    switch (operator) {
      case "=":
        return row === value;
      case "!=":
        return row !== value;
      case "<":
        return row < value;
      case ">":
        return row > value;
      case ">=":
        return row >= value;
      case "<=":
        return row <= value;
      default:
        return true;
    }
  }

  private resolverBoolean(
    row: boolean,
    operator: BooleanOperators,
    value: boolean
  ) {
    switch (operator) {
      case "=":
        return row === value;
      case "!=":
        return row !== value;
      default:
        return true;
    }
  }

  private resolverDate(
    row: Date | string,
    operator: DateOperators,
    value: Date | string
  ) {
    const rowTime = new Date(row).getTime();
    const valueTime = new Date(value).getTime();

    switch (operator) {
      case "=":
        return rowTime === valueTime;
      case "!=":
        return rowTime !== valueTime;
      case ">":
        return rowTime > valueTime;
      case "<":
        return rowTime < valueTime;
      case ">=":
        return rowTime >= valueTime;
      case "<=":
        return rowTime <= valueTime;
      default:
        return true;
    }
  }

  private resolverArray(row: any, operator: "in" | "nin", value: any[]) {
    switch (operator) {
      case "in":
        return value.includes(row);
      case "nin":
        return !value.includes(row);
      default:
        return true;
    }
  }
}

export function createMockQueryBuilder<
  TDatabase extends Database,
  TTable extends keyof TDatabase = keyof TDatabase,
  TEntity = ExtractEntity<TDatabase[TTable]>,
  TOmist extends string = never
>(table: TDatabase[TTable]) {
  return new MockQueryBuilder<TDatabase, TTable, TEntity, TOmist>(table);
}
