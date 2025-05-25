import Peer from "peerjs";
import React, { useState, createContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

export const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState("");
  const [roomId, setRoomId] = useState("");
  const [peerId, setPeerId] = useState("");
  const peerInstance = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    // Create socket connection
    const newSocket = io("http://localhost:4000/", {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setSocketConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setSocketConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    setSocket(newSocket);

    // Create peer instance
    if (!peerInstance.current) {
      const peer = new Peer({
        debug: 3,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        },
      });

      peer.on("open", (id) => {
        console.log("Peer connection opened with ID:", id);
        setPeerId(id);
      });

      peer.on("error", (err) => {
        console.error("Peer connection error:", err);
      });

      peerInstance.current = peer;
    }

    // Cleanup function
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  return (
    <InterviewContext.Provider
      value={{
        status,
        setStatus,
        roomId,
        setRoomId,
        peerInstance,
        peerId,
        socket,
        socketConnected,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};
