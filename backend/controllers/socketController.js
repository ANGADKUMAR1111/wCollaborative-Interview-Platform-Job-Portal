//socketController.js

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

export const handleJoinRoom = (socket, data) => {
  const { roomId, emailId } = data;
  console.log("User", emailId, "Joined Room", roomId);

  emailToSocketMapping.set(emailId, socket.id);
  socketToEmailMapping.set(socket.id, emailId);

  socket.join(roomId);
  socket.emit("joined-room", { roomId });
  socket.broadcast.to(roomId).emit("user-joined", { emailId });
};

export const handleCallUser = (socket, data) => {
  const { emailId, offer } = data;
  const fromEmail = socketToEmailMapping.get(socket.id);
  const socketId = emailToSocketMapping.get(emailId);

  if (socketId) {
    socket.to(socketId).emit("incoming-call", { from: fromEmail, offer });
  }
};


export const handleCallAccepted = (socket, data) => {
  const { emailId, ans } = data;
  const socketId = emailToSocketMapping.get(emailId);

  if (socketId) {
    socket.to(socketId).emit("call-accepted", { ans });
  }
};

export const handleCallDisconnect = (socket, data) => {
  const { emailId } = data;
  const socketId = emailToSocketMapping.get(emailId);
  const fromEmail = socketToEmailMapping.get(socket.id);

  if (socketId) {
    socket.to(socketId).emit("call-disconnected", { from: fromEmail });
  }
};

export const handleUserDisconnect = (socket) => {
  const emailId = socketToEmailMapping.get(socket.id);

  if (emailId) {
    emailToSocketMapping.delete(emailId);
    socketToEmailMapping.delete(socket.id);
    console.log(`User ${emailId} disconnected`);
  }
};
