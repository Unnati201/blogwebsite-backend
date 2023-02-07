const cors = require("cors");
const express = require("express");
const PORT = 3002|| process.env.PORT;
const { connection } = require("./connection");

const userRoutes = require("./routes/users");
const blogRoutes = require("./routes/blogs");

const app = express();



app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/blogs", blogRoutes);

app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route does not exists",
  });
});

app.listen(PORT, async () => {
  const { db } = await connection();

  const isDbExists = await db.listCollections().toArray();

  if (isDbExists.length) {
    console.log(`DB Connected..`);
    console.log(`Server running on port - ${PORT}`);
  }
});
