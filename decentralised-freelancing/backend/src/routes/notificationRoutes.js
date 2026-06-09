// backend/src/routes/notificationRoutes.js

const express = require('express');
const router  = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll,
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// All routes require auth
router.get('/',              authenticate, getNotifications);
router.put('/read-all',      authenticate, markAllAsRead);
router.put('/:id/read',      authenticate, markAsRead);
router.delete('/',           authenticate, clearAll);
router.delete('/:id',        authenticate, deleteNotification);

module.exports = router;