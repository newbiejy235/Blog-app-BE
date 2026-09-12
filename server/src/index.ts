import express from "express";
import authRotes from "./routes/auth/auth.route";
import postRouter from "./routes/post/post.routes";
import userRouter from "./routes/users/users.route";
import comment from "./routes/comment/comment.routes"
import favorite from "./routes/favorite/favorite.route"
import mark from "./routes/mark/mark.route"
import cors from "cors";

const app = express();
const PORT = 5000;
app.use(cors());

app.use(express.json());
app.use("/api/v1/auth", authRotes);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/comment", comment)
app.use("/api/v1/favorite", favorite)
app.use("/api/v1/mark", mark)

app.get("/", (req, res) => {
  res.send("helllo");
});

app.listen(PORT, () => {
  console.log(`Server running at  http://localhost:${PORT}/ see changes`);
});
