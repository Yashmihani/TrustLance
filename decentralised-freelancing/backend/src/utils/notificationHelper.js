// backend/src/utils/notificationHelper.js
// Helper to create notifications from anywhere in the backend

const Notification = require('../models/Notification');

const createNotification = async ({
  recipientId,
  type,
  title,
  message,
  link = '',
  projectId = null,
}) => {
  try {
    await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      link,
      project: projectId,
    });
  } catch (error) {
    // Never let notification errors break the main flow
    console.error('Notification creation failed:', error.message);
  }
};

module.exports = { createNotification };