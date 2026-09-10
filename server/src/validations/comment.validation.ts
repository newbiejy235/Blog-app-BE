import z from "zod";

export const commentSchema = z.object({
  postId: z.coerce.number().int().positive(),
  userId: z.coerce.number().int().positive(),
  comment: z
    .string()
    .min(1, "comment minimal 1 huruf")
    .max(255, "comment max 255 huruf"),
});

export const getCommentSchema = z.object({
  postId: z.coerce.number().int().positive(),
});

