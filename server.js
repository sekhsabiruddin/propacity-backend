require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const userRoutes = require("./routes/userRoutes");
const folderRoutes = require("./routes/folderRoutes");
const fileRoutes = require("./routes/fileRoutes");

// It is middlleware
app.use(bodyParser.json());

// Routes
app.use("/users", userRoutes);
app.use("/folders", folderRoutes);
app.use("/files", fileRoutes);

// It my Server port
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
