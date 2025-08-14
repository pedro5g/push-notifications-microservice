import { HTTP_STATUS } from "@/utils/constraints";
import z from "zod";
import { badRequestSchema } from "./utils.validators";

export const getUserProfileResponse = {
  [HTTP_STATUS.OK]: z.object({
    ok: z.boolean(),
    message: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.email(),
      status: z.enum([
        "active",
        "inactive",
        "suspended",
        "pending_verification",
      ]),
      email_verified_at: z.coerce.date().nullable(),
      last_login_at: z.coerce.date().nullable(),
      created_at: z.coerce.date(),
      updated_at: z.coerce.date().nullable(),
      settings: z.object({
        id: z.string(),
        language: z.string(),
        email_notifications: z.boolean(),
        push_notifications: z.boolean(),
        webhook_notifications: z.boolean(),
        max_projects: z.number(),
        max_web_hooks_per_project: z.number(),
        max_notifications_per_month: z.number(),
        created_at: z.coerce.date(),
        updated_at: z.coerce.date().nullable(),
      }),
    }),
  }),
  [HTTP_STATUS.UNAUTHORIZED]: badRequestSchema,
};
