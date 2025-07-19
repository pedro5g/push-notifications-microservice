import { env } from "@/config/env"
import type { Knex } from "knex"

export default {
  client: "pg",
  connection: {
    host: env.PG_DATABASE_HOST,
    port: env.PG_DATABASE_PORT,
    database: env.PG_DATABASE_NAME,
    user: env.PG_DATABASE_USERNAME,
    password: env.PG_DATABASE_PASSWORD,
  },
} satisfies Knex.Config

