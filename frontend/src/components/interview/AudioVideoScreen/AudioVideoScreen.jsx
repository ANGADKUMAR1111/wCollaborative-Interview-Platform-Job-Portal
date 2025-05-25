//AudioVideoScreen.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { InterviewContext } from "../../../context/InterviewContext";
import Notepad from "../Notepad/Notepad";
import CodeEditor from "../CodeEditor/CodeEditor";
import "./AudioVideoScreen.css"; 

function AudioVideoScreen() {
  const { roomId, peerInstance, status, socket } = useContext(InterviewContext);
  const remoteVideoRef = useRef(null);
  const currentUserVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
    });

    socket.emit("joinRoom", roomId);
    
    return () => {
      if (socket) {
        socket.emit("leaveRoom", roomId);
      }
    };
  }, [socket, roomId]);

  useEffect(() => {
    const getUserMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        if (currentUserVideoRef.current) {
          currentUserVideoRef.current.srcObject = stream;
          setLocalStream(stream);
        }
        
        return stream;
      } catch (err) {
        console.error("Failed to get local stream", err);
        return null;
      }
    };

    const setupPeerConnection = async () => {
      if (!peerInstance.current) {
        peerInstance.current = new Peer({
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" }
            ]
          }
        });
      }
      
      const stream = await getUserMedia();
      if (!stream) return;

      // Handle incoming calls
      peerInstance.current.on("call", async (call) => {
        console.log("Receiving call from:", call.peer);
        
        call.answer(stream);
        
        call.on("stream", (remoteStream) => {
          console.log("Received remote stream");
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            setConnected(true);
          }
        });
        
        call.on("error", (err) => {
          console.error("Call error:", err);
        });
        
        call.on("close", () => {
          console.log("Call closed");
        });
      });
      
      // If we're the interviewee, initiate the call
      if (status === "interviewee" && roomId) {
        initiateCall(roomId, stream);
      }
    };
    
    setupPeerConnection();
    
    return () => {
      // Clean up stream on component unmount
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [peerInstance, status, roomId]);
  
  const initiateCall = (remotePeerId, stream) => {
    console.log("Initiating call to:", remotePeerId);
    try {
      if (!peerInstance.current) {
        console.error("Peer instance not initialized");
        return;
      }

      const call = peerInstance.current.call(remotePeerId, stream);
      
      call.on("stream", (remoteStream) => {
        console.log("Received remote stream from call");
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          setConnected(true);
        }
      });
      
      call.on("error", (err) => {
        console.error("Call error:", err);
      });
      
      call.on("close", () => {
        console.log("Call closed");
      });
    } catch (err) {
      console.error("Failed to initiate call:", err);
    }
  };

  return (
    <>
      <div className="container">
        <div className="video-container">
          <video
            ref={currentUserVideoRef}
            autoPlay
            playsInline
            muted
            className="video"
          />
          <div className="video-status">{connected ? "Connected" : "Waiting for connection..."}</div>
        </div>
        <Notepad socket={socket} roomId={roomId} />
        <div className="video-container">
          <video ref={remoteVideoRef} autoPlay playsInline className="video" />
        </div>
      </div>
      <div>
        <CodeEditor socket={socket} roomId={roomId} />
      </div>
    </>
  );
}

export default AudioVideoScreen;
