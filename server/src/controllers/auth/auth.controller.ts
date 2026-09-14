import dotenv from "dotenv";
import { Request, Response } from "express";
import { registerSchema, loginSchema } from "../../validations/auth.validation";
import { db } from "../../config/db";
import { eq, and } from "drizzle-orm";
import { usersTable } from "../../config/schema";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";


dotenv.config();

export class AuthController {
  register = async (req: Request, res: Response) => {
    const validateData = registerSchema.parse(req.body);
    const { username, email, password } = validateData;

    const existingEmail = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already exist",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [insertUser] = await db
      .insert(usersTable)
      .values({
        username: username,
        password: hashedPassword,
        email: email,
      })
      .$returningId();

    const newUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, insertUser.id),
    });

    return res.status(201).json({
      success: true,
      data: {
        users: {
          id: newUser?.id,
          username: newUser?.username,
          email: newUser?.email,
          role: newUser?.role,
        },
      },
    });
  };

  login = async (req: Request, res: Response) => {
    const validateLogin = loginSchema.parse(req.body);
    const { email, password } = validateLogin;

    const isValidEmail = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });

    if (!isValidEmail) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password.",
      });
    }

    const hashedPassword = await bcrypt.compare(
      password,
      isValidEmail.password,
    );
    console.log("data hashed", hashedPassword);
    const token = Jwt.sign(
      {
        id: isValidEmail.id,
        username: isValidEmail.username,
        email: isValidEmail.email,
        role: isValidEmail.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" },
    );

    if (!hashedPassword) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password.",
      });
    }

    const findUsername = await db.query.usersTable.findFirst({
      columns: {
        username: true,
      },
      where: eq(usersTable.email, email),
    });

    return res.status(200).json({
      success: true,
      message: `success login, welcome ${findUsername?.username}`,
      data: {
        token: token,
        users: {
          id : isValidEmail.id,
          email: isValidEmail.email,
          username: findUsername?.username,
          role : isValidEmail.role
        },
      },
    });
  };
}

export default new AuthController();

