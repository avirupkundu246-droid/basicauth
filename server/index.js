
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

const connectDB = require("./config/db");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://basicauth-lovat.vercel.app"
  ],
  credentials: true
}));


app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
  res.json({
    message: "Authentication API is running!",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

