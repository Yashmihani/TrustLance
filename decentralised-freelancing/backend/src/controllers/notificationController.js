// backend/src/controllers/notificationController.js

const Notification = require('../models/Notification');

// GET /api/notifications — get all notifications for current user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .populate('project', 'title')
      .sort('-createdAt')
      .limit(50);

    // Count unread
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead:    false,
    });

    res.json({ success: true, notifications, unreadCount });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/notifications/:id/read — mark one as read
const markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/notifications/read-all — mark all as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/notifications/:id — delete one notification
const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id:       req.params.id,
      recipient: req.user._id,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/notifications — clear all
const clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll,
};