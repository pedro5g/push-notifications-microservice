export interface MockTableOptions<
  TSchema extends Record<string, any>,
  TPrimary extends keyof TSchema,
  TUnique extends keyof TSchema = never
> {
  /**
   *  @property tableName - {String} name referent to table
   */
  tableName: string;
  /**
   *  @property schema - {TSchema} referent to table data schema
   *  usage example - if your entity is a class, using it pass as a type, if it's an interface or type then, make a type nesting
   *  @example
   *  - entity is class, do:
   *   { schema: User }
   *  - entity is an interface or type, do:
   *   { schema: {} as User }
   */
  schema: TSchema;
  /**
   * @property primaryKey - {String} references the field that is the primary key of the table
   * -  it will be applied all the behavior related to sql`CONSTRAINT PRIMARY KEY`
   *
   */
  primaryKey: TPrimary;
  /**
   * @property uniqueFields - {String[ ]} references the fields should be uniques
   * - it will be applied the behavior to similar the slq `CONSTRAINT UNIQUE`
   */
  uniqueFields?: TUnique[];
}

export class MockTable<
  TSchema extends Record<string, any>,
  TPrimary extends keyof TSchema,
  TUnique extends keyof TSchema = never
> {
  public readonly tableName: string;
  private readonly primaryKey: TPrimary;
  private readonly uniqueFields: Set<TUnique>;
  private readonly records: Map<TSchema[TPrimary], TSchema>;
  private readonly uniqueIndexes: Record<
    TUnique,
    Map<TSchema[TUnique], TSchema>
  >;

  constructor(options: MockTableOptions<TSchema, TPrimary, TUnique>) {
    const { tableName, primaryKey, uniqueFields = [] as TUnique[] } = options;
    this.tableName = tableName;
    this.primaryKey = primaryKey;
    this.uniqueFields = new Set(uniqueFields);
    this.records = new Map();
    this.uniqueIndexes = Object.fromEntries(
      uniqueFields.map((f) => [f, new Map()])
    ) as Record<TUnique, Map<TSchema[TUnique], TSchema>>;
  }

  toArray() {
    return [...this.records.values()];
  }

  findById(pk: TSchema[TPrimary]) {
    return this.records.get(pk) ?? null;
  }

  findUnique<K extends TPrimary | TUnique>(
    field: K,
    value: TSchema[K]
  ): TSchema | null {
    if (field === this.primaryKey) {
      return this.records.get(value as TSchema[TPrimary]) ?? null;
    }

    const index = this.uniqueIndexes[field as TUnique];
    if (!index) {
      throw new Error(
        `Field '${String(field)}' is not a unique field in table '${
          this.tableName
        }'.`
      );
    }

    return index.get(value as any) ?? null;
  }

  insert(data: TSchema) {
    const pk = data[this.primaryKey];

    if (this.records.has(pk)) {
      throw new Error(
        `Duplicate primary key '${String(this.primaryKey)}' in table '${
          this.tableName
        }'.`
      );
    }

    for (const field of this.uniqueFields) {
      const value = data[field];
      const index = this.uniqueIndexes[field];
      if (index?.has(value)) {
        throw new Error(
          `Duplicate unique field '${String(field)}' in table '${
            this.tableName
          }'.`
        );
      }
      index?.set(value, data);
    }

    this.records.set(pk, data);
    return data;
  }

  updateById(id: TSchema[TPrimary], data: Partial<TSchema>) {
    const existing = this.records.get(id);
    if (!existing) return null;

    if (this.primaryKey in data && data[this.primaryKey] !== id) {
      throw new Error(
        `Violated primary key '${String(
          this.primaryKey
        )}' consistence, primary key cannot be chanced.`
      );
    }

    const updated = { ...existing, ...data };

    for (const field of this.uniqueFields) {
      const index = this.uniqueIndexes[field];
      const value = updated[field];
      const existingConflict = index?.get(value);
      if (existingConflict && existingConflict[this.primaryKey] !== id) {
        throw new Error(
          `Duplicate unique field '${String(field)}' in table '${
            this.tableName
          }'.`
        );
      }
    }

    for (const field of this.uniqueFields) {
      const index = this.uniqueIndexes[field];
      if (!index) continue;
      const oldValue = existing[field];
      const newValue = updated[field];

      if (oldValue !== newValue) {
        index.delete(oldValue);
        index.set(newValue, updated);
      }
    }

    this.records.set(id, updated);
    return updated;
  }

  deleteById(id: TSchema[TPrimary]) {
    const record = this.records.get(id);
    if (!record) return false;

    for (const field of this.uniqueFields) {
      const index = this.uniqueIndexes[field];
      index?.delete(record[field]);
    }

    this.records.delete(id);
    return true;
  }
}

export function createMockTable<
  TSchema extends Record<string, any>,
  TPrimary extends keyof TSchema,
  TUnique extends keyof TSchema = never
>(
  options: MockTableOptions<TSchema, TPrimary, TUnique>
): MockTable<TSchema, TPrimary, TUnique> {
  return new MockTable(options);
}
