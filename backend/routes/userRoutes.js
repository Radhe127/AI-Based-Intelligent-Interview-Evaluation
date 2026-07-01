const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const User = require("../models/User");

router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { targetRole, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { ...(targetRole !== undefined && { targetRole }), ...(phone !== undefined && { phone }) },
      { new: true }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
