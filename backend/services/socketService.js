const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, { cors: { origin: "*" } });
  
  io.on('connection', (socket) => {
    socket.on('join', (userId) => socket.join(userId));
  });
};

const sendNotification = (userId, data) => {
  if (io) io.to(userId).emit('notification', data);
};

module.exports = { initSocket, sendNotification };