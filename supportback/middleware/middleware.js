const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
  console.log("Headers:", req.headers);
  const token = req.headers.authorization?.split(" ")[1];
  console.log("Backend token:", token);
  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
    console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "invalid token" });
  }
};

module.exports = {
  authMiddleware,
};
