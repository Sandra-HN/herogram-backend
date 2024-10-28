require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models"); // Import the Sequelize instance
const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/files");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000; // Use the port from the .env file or default to 5000

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
  "http://localhost:3000",
  "https://herogram-frontend.vercel.app",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use("/uploads", express.static("uploads"));
n;
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

// Sync Sequelize and start the server
sequelize
  .sync()
  .then(() => {
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });
