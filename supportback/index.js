require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connection = require("./db/db");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

// Routers
const userRoutes = require("./routes/users");
const userRoute = require("./routes/userRoutes");
const authRouters = require("./routes/auth");
const blogRoutes = require("./routes/blogRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contactRoutes = require("./routes/contactRoutes");
const vacancyRoutes = require("./routes/vacancy");
const needsRoutes = require("./routes/needs");
const eventRoutes = require("./routes/events");
const donationRoutes = require("./routes/donationRoutes");

// Middlewares
const { authMiddleware } = require("./middleware/middleware");

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://temizdunya.az",
      "https://temizdunya.az",
      "https://www.temizdunya.az",
      "http://www.temizdunya.az",
    ],
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
connection();
app.use(express.json());

// HTTP server yaradılır
const server = http.createServer(app);

// Socket.io server qurulur
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://temizdunya.az",
      "https://temizdunya.az",
      "https://www.temizdunya.az",
      "http://www.temizdunya.az",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// io-nu bütün request-lərə əlavə edirik
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("Yeni bir admin/user qoşuldu:", socket.id);

  socket.on("disconnect", () => {
    console.log("Bir istifadəçi ayrıldı:", socket.id);
  });
});

// Routes
app.use("/api/v3/auth", authRouters);
app.use("/api/v3/users", userRoutes);
app.use("/api/v3/userProfile", authMiddleware, userRoute);
app.use("/api/v3/admin", adminRoutes);
app.use("/api/v3/admin/blogs", blogRoutes);
app.use("/api/v3/volunteer", volunteerRoutes);
app.use("/api/v3/contact", contactRoutes);
app.use("/api/v3/vacancies", vacancyRoutes);
app.use("/api/v3/needs", needsRoutes);
app.use("/api/v3/admin/events", eventRoutes);
app.use("/api/v3/admin/donations", donationRoutes);

// Port
const port = process.env.PORT || 8080;
server.listen(port, () => console.log(`🚀 Server is running on port ${port}`));

module.exports = io;
