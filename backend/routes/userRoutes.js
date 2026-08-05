const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const User = require("../models/User");

router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { name, targetRole, phone, experience, skills } = req.body;

    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (targetRole !== undefined) update.targetRole = String(targetRole).trim();
    if (phone !== undefined) update.phone = String(phone).trim();
    if (experience !== undefined) update.experience = String(experience).trim();
    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        update.skills = skills.map((skill) => String(skill).trim()).filter(Boolean);
      } else {
        update.skills = String(skills)
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);
      }
    }

    const user = await User.findByIdAndUpdate(req.userId, update, {
      new: true,
      runValidators: true,
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
