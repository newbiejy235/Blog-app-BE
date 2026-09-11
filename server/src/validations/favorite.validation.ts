import z from "zod"

export const favoriteValidation = z.object({
    userId : z.coerce.number().int().positive(),
    postId : z.coerce.number().int().positive(),

})