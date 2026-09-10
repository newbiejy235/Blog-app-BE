import {
  mysqlTable,
  mysqlEnum,
  int,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/mysql-core";

export const USER_ROLES = ["user", "admin", "guest"] as const;

export const POST_STATUS = ["delete", "published"] as const;

export const POST_CATEGORIES = [
  "lifestyle",
  "business",
  "technology",
  "health",
] as const;

// USERS
export const usersTable = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 50 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", USER_ROLES).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// CATEGORIES
export const categoriesTable = mysqlTable("tabel_kategoori", {
  id: int("id").autoincrement().primaryKey(),
  kategoriBlog: mysqlEnum("kategori", POST_CATEGORIES).notNull(),
});

// POSTS
export const postsTable = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  kategori: int("kategori")
    .notNull()
    .references(() => categoriesTable.id),
  imageUrl: text("image_url"), // Kolom untuk simpan URL gambar
  imagePublicId: varchar("image_public_id", { length: 255 }), // Kolom untuk simpan Public ID Cloudinary
  status: mysqlEnum("status", POST_STATUS).notNull().default("published"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// COMMENTS
export const commentsTable = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("post_id")
    .notNull()
    .references(() => postsTable.id, { onDelete: "cascade" }),
  userId: int("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
