const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // Authentication middleware for socket connections
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization?.startsWith('Bearer ')
        ? socket.handshake.headers.authorization.split(' ')[1]
        : null);

    if (token) {
      try {
        socket.user = jwt.verify(token, process.env.JWT_SECRET);
      } catch (_err) {
        socket.user = null;
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id, socket.user ? `(User: ${socket.user.userId})` : '(Guest)');

    // Join class room
    socket.on('join-class', ({ classId, userId }) => {
      socket.join(`class-${classId}`);
      socket.to(`class-${classId}`).emit('user-joined', { userId });
    });

    // Teacher-student chat
    socket.on('send-message', ({ roomId, message, sender }) => {
      io.to(roomId).emit('receive-message', { message, sender, time: new Date() });
    });

    // Live class events
    socket.on('live-class-start', ({ classId, teacherId }) => {
      io.to(`class-${classId}`).emit('class-started', { teacherId, time: new Date() });
    });

    // Announcement
    socket.on('announce', ({ schoolId, message }) => {
      io.to(`school-${schoolId}`).emit('announcement', { message, time: new Date() });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
