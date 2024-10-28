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
app.use(cors());

app.use("/uploads", express.static("uploads"));
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
