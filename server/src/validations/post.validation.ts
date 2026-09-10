import { z } from "zod";

export const createPostSchema = z.object({
  userId: z.coerce.number().int().positive(),
  kategoriId: z.coerce.number().int().positive(),

  title: z
    .string()
    .min(3, "title minimal 3 huruf")
    .max(255, "title max 255 huruf"),

  content: z.string().min(10, "content minimal 10 huruf"),
});

export const postIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const userIdSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export const userPostParamsSchema = z.object({
  userId: z.coerce.number().int().positive(),
  postId: z.coerce.number().int().positive(),
});

export const updatePostSchema = z.object({
  title: z
    .string()
    .min(3, "title minimal 3 karakter")
    .max(255, "maksimal title 255 karakter")
    .optional(),

  content: z.string().min(10, "content minimal 10").optional(),
});

export const updatePostParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});
