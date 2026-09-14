import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { db } from "../../config/db";
import { commentsTable, usersTable } from "../../config/schema";
import {
  commentSchema,
  getCommentSchema,
} from "../../validations/comment.validation";
import { and, eq } from "drizzle-orm";

class CommentController {
  postComment = async (req: Request, res: Response) => {
    try {
      const commentValidation = commentSchema.parse(req.body);
      const { userId, postId, comment } = commentValidation;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User belum login",
        });
      }

      // const userId = req.user.id;

      const userComments = await db.insert(commentsTable).values({
        userId,
        postId,
        comment,
      });

      return res.status(200).json({
        success: true,
        message: "berhasil post comment",
      });
    } catch (error) {
      console.error("Comment error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  getComment = async (req: Request, res: Response) => {
    try {
      const commentValidation = getCommentSchema.parse(req.params);
      const { postId } = commentValidation;

      const userComments = await db
        .select({
          id: commentsTable.id,
          postId: commentsTable.postId,
          userId: commentsTable.userId,
          username: usersTable.username,
          comment: commentsTable.comment,
          createdAt: commentsTable.createdAt,
        })
        .from(commentsTable)
        .leftJoin(usersTable, eq(commentsTable.userId, usersTable.id))
        .where(eq(commentsTable.postId, postId));

      if (userComments.length === 0) {
        return res.status(404).json({
          success: false,
          message: "tidak ada comment",
        });
      }

      return res.status(200).json({
        success: true,
        message: "berhasil ambil data user comment",
        data: userComments,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
}

export default new CommentController();
