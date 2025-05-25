//socketRoutes.js

import * as socketController from "../controllers/socketController.js";

export const socketRoutes = (io) => {
  io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("join-room", (data) =>socketController.handleJoinRoom(socket, data));
    socket.on("call-user", (data) => socketController.handleCallUser(socket, data));
    socket.on("call-accepted", (data) => socketController.handleCallAccepted(socket, data));
     socket.on("call-disconnect", (data) => socketController.handleCallDisconnect(socket, data));
     socket.on("disconnect", () => socketController.handleUserDisconnect(socket));
});
};
