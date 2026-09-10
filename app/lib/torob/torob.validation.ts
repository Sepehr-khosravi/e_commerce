import { z } from "zod";

const pageUrlsSchema = z
  .object({
    page_urls: z
      .array(z.string().url())
      .min(1),
  })
  .strict();

const pageUniquesSchema = z
  .object({
    page_uniques: z
      .array(z.string().min(1))
      .min(1),
  })
  .strict();

const pageSchema = z
  .object({
    page: z
      .number()
      .int()
      .positive(),

    sort: z.enum([
      "date_added_desc",
      "date_updated_desc",
    ]),
  })
  .strict();

const cursorSchema = z
  .object({
    sort: z.literal("product_id_desc"),

    cursor: z
      .string()
      .min(1)
      .optional(),
  })
  .strict();

export const torobRequestSchema = z.union([
  pageUrlsSchema,
  pageUniquesSchema,
  pageSchema,
  cursorSchema,
]);

export type ValidatedTorobRequest = z.infer<
  typeof torobRequestSchema
>;