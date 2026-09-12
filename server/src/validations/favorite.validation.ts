import z from "zod";

export const favoriteValidation = z.object({
  // postId: z
  //   .string()
  //   .transform((val) => parseInt(val, 10))
  //   .pipe(z.number().positive()),
  postId: z.coerce.number().int().positive(),
});
