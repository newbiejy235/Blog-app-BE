import { db } from "../config/db";
import { categoriesTable } from "../config/schema";

async function seed() {
  await db.insert(categoriesTable).values([
    { kategoriBlog: "lifestyle" },
    { kategoriBlog: "business" },
    { kategoriBlog: "technology" },
    { kategoriBlog: "health" },
  ]);

  console.log("Kategori berhasil dibuat");
}

seed();