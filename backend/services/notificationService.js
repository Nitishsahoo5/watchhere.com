const Notification = require('../models/Notification');
const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = new Server(server, { cors: { origin: "*" } });
  
  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      socket.join(userId);
    });
  });
};

const createNotification = async (data) => {
  const notification = new Notification(data);
  await notification.save();
  await notification.populate(['sender', 'video']);
  
  if (io) {
    io.to(data.recipient.toString()).emit('notification', notification);
  }
  
  return notification;
};

const getNotifications = async (userId) => {
  return Notification.find({ recipient: userId })
    .populate(['sender', 'video'])
    .sort({ createdAt: -1 })
    .limit(50);
};

const markAsRead = async (notificationId) => {
  return Notification.findByIdAndUpdate(notificationId, { read: true });
};

module.exports = { initializeSocket, createNotification, getNotifications, markAsRead };