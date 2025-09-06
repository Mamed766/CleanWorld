const router = require("express").Router();
const { User } = require("../models/user");
const PasswordResetToken = require("../models/resetPassword");
const Joi = require("joi");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const sendMail = require("../utils/sendMail");

// LOGIN
router.post("/", async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(401).send({ message: "Invalid Email or Password" });

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(401).send({ message: "Invalid Email or Password" });

    const token = user.generateAuthToken();
    res.status(200).send({ data: token, message: "Logged in successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    await PasswordResetToken.findOneAndDelete({ userId: user._id });
    await new PasswordResetToken({ userId: user._id, token }).save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // ✅ utils/sendMail funksiyası ilə mail göndər
    const emailSent = await sendMail(
      user.email,
      `Click to reset your password: ${resetLink}`
    );

    if (!emailSent)
      return res.status(500).send({ message: "Failed to send email" });

    res.send({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

// RESET PASSWORD
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { error } = validateResetPassword(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const passwordReset = await PasswordResetToken.findOne({
      token: req.params.token,
    });
    if (!passwordReset)
      return res.status(400).send({ message: "Invalid or expired token" });

    const user = await User.findById(passwordReset.userId);
    if (!user) return res.status(400).send({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
    await user.save();

    await PasswordResetToken.deleteOne({ _id: passwordReset._id });

    res.send({ message: "Password has been reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

const validateResetPassword = (data) => {
  const schema = Joi.object({
    password: Joi.string().min(6).required().label("Password"),
  });
  return schema.validate(data);
};

module.exports = router;
