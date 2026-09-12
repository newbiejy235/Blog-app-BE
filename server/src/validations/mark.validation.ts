import z from "zod";

export const markValidation = z.object({
  postId: z.coerce.number().int().positive(),
});
