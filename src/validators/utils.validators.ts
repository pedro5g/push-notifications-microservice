import z from 'zod';

export const validateErrorSchema = z
  .object({
    ok: z.boolean(),
    message: z.string(),
    errors: z.array(
      z.object({
        field: z.string(),
        message: z.string(),
      })
    ),
    errorCode: z.string(),
  })
  .meta({
    title: 'Validate error',
    description: 'Client could not be retry request without modify',
  });
