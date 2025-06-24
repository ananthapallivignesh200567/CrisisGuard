const express = require('express');
const Family = require('../models/Family');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Create family group
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    const family = new Family({
      name,
      adminId: req.userId,
      members: [{
        userId: req.userId,
        role: 'admin',
        relationship: 'self'
      }]
    });

    await family.save();

    // Update user's family group
    await User.findByIdAndUpdate(req.userId, { familyGroup: family._id });

    res.status(201).json({ family });
  } catch (error) {
    console.error('Create family error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get family details
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.familyGroup) {
      return res.status(404).json({ message: 'No family group found' });
    }

    const family = await Family.findById(user.familyGroup)
      .populate('members.userId', 'profile email lastActive')
      .populate('adminId', 'profile email');

    res.json({ family });
  } catch (error) {
    console.error('Get family error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add family member
router.post('/invite', authMiddleware, async (req, res) => {
  try {
    const { email, relationship } = req.body;

    const user = await User.findById(req.userId);
    if (!user.familyGroup) {
      return res.status(400).json({ message: 'No family group found' });
    }

    const family = await Family.findById(user.familyGroup);
    if (family.adminId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only admin can invite members' });
    }

    const invitedUser = await User.findOne({ email });
    if (!invitedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (invitedUser.familyGroup) {
      return res.status(400).json({ message: 'User already in a family group' });
    }

    // Add to family
    family.members.push({
      userId: invitedUser._id,
      relationship,
      role: 'member'
    });

    await family.save();

    // Update invited user's family group
    invitedUser.familyGroup = family._id;
    await invitedUser.save();

    res.json({ message: 'Family member added successfully' });
  } catch (error) {
    console.error('Add family member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update member permissions
router.put('/member/:memberId/permissions', authMiddleware, async (req, res) => {
  try {
    const { permissions } = req.body;

    const user = await User.findById(req.userId);
    const family = await Family.findById(user.familyGroup);

    if (family.adminId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only admin can update permissions' });
    }

    const member = family.members.id(req.params.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.permissions = { ...member.permissions, ...permissions };
    await family.save();

    res.json({ message: 'Permissions updated successfully' });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get family emergency plan
router.get('/emergency-plan', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const family = await Family.findById(user.familyGroup);

    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    res.json({ emergencyPlan: family.emergencyPlan });
  } catch (error) {
    console.error('Get emergency plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;