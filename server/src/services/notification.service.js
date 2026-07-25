const Notification = require('../models/Notification');

/**
 * Creates in-app notification & logs simulated SMS/Email
 */
const createNotification = async ({ userId, message, type = 'stock', email }) => {
  try {
    const notif = await Notification.create({
      user: userId,
      message,
      type,
      read: false
    });

    console.log(`[SIMULATED NOTIFICATION]: (${type}) User ID: ${userId} -> "${message}"`);

    return notif;
  } catch (err) {
    console.error('Error creating notification:', err.message);
    return null;
  }
};

module.exports = {
  createNotification
};
