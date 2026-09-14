import { Request, Response } from "express";
import {
  userIdSchema,
  userPostParamsSchema,
} from "../../validations/post.validation";
import { db } from "../../config/db";
import { postsTable, usersTable } from "../../config/schema";
import { and, desc, eq } from "drizzle-orm";

export class UsersController {
  getPostByUserId = async (req: Request, res: Response) => {
    try {
      const validatedParams = userIdSchema.parse(req.params);
      const { userId } = validatedParams;

      const posts = await db
        .select()
        .from(postsTable)
        .where(
          and(
            eq(postsTable.userId, userId),
            eq(postsTable.status, "published"),
          ),
        )
        .orderBy(desc(postsTable.createdAt));

      return res.status(200).json({
        success: true,
        message: "user post retrieved successfully",
        data: {
          posts,
        },
      });
    } catch (error: any) {
      console.error("get post by user id ERROR : ", error);

      return res.status(500).json({
        success: false,
        message: "internal server error",
        error: error.message,
      });
    }
  };
  getUserInfo = async (req: Request, res: Response) => {
    try {
      const validatedParams = userIdSchema.parse(req.params);
      const { userId } = validatedParams;

      const user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId));

      return res.status(200).json({
        success: true,
        message: "user post retrieved successfully",
        data: {
          user,
        },
      });
    } catch (error: any) {
      console.error("get post by user id ERROR : ", error);

      return res.status(500).json({
        success: false,
        message: "internal server error",
        error: error.message,
      });
    }
  };

  getUserPost = async (req: Request, res: Response) => {
    try {
      const validatedParams = userPostParamsSchema.parse(req.params);
      const { userId, postId } = validatedParams;

      const posts = await db
        .select()
        .from(postsTable)
        .where(
          and(
            eq(postsTable.id, postId),
            eq(postsTable.userId, userId),
            eq(postsTable.status, "published"),
          ),
        );

      if (!posts) {
        return res.status(404).json({
          success: false,
          message: "post not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "user post retrieved successfully",
        data: {
          posts,
        },
      });
    } catch (error: any) {
      console.error("get post by user id ERROR : ", error);

      return res.status(500).json({
        success: false,
        message: "internal server error",
        error: error.message,
      });
    }
  };
}

export default new UsersController();
