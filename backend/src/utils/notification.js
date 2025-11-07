const admin = require('firebase-admin');
const Notification = require('../models/Notification');

const sendNotification = async (userId, title, body, type, data = {}) => {
  try {
    // Save notification to database
    const notification = await Notification.create({
      user: userId,
      title,
      body,
      type,
      data,
    });

    // Send FCM push notification if user has FCM token
    const User = require('../models/User');
    const user = await User.findById(userId);

    if (user && user.fcmToken && admin.apps.length) {
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          notificationId: notification._id.toString(),
        },
        token: user.fcmToken,
      };

      await admin.messaging().send(message);
    }

    return notification;
  } catch (error) {
    console.error('Notification error:', error);
    return null;
  }
};

module.exports = { sendNotification };
