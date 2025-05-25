import React, { useContext, useState, useEffect } from "react";
import { InterviewContext } from "../../../context/InterviewContext";
import { FaCopy, FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./PopupModal.css"; 

function PopupModal() {
  const { setStatus, peerId, roomId, setRoomId, socketConnected } = useContext(InterviewContext);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && peerId) {
      setRoomId(peerId);
    }
  }, [isOpen, peerId, setRoomId]);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const openModal = () => {
    setStatus("interviewer");
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);
  
  const closeModalAndJoin = () => {
    setIsOpen(false);
    navigate("/interview/room");
  };
  
  const handleCopyRoomId = () => {
    if (roomId.length) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
    }
  };

  return (
    <div>
      <button className="start-interview-btn" onClick={openModal}>
        Start an Interview
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Room ID</h2>
              <button className="close-modal-btn" onClick={closeModal}>
                &times;
              </button>
            </div>
            <div className="room-id-container">
              <p className="room-id">
                {roomId.length ? roomId : socketConnected ? "Generating Room ID..." : "Connecting..."}
              </p>
              {copied ? (
                <FaCheck className="copy-icon copied" />
              ) : (
                <FaCopy
                  className="copy-icon"
                  onClick={handleCopyRoomId}
                />
              )}
            </div>
            <p className="room-id-instruction">
              Share this Room ID with the interviewee to connect.
            </p>
            <div className="modal-footer">
              <button className="close-btn" onClick={closeModal}>
                Close
              </button>
              <button
                className="start-interview-modal-btn"
                onClick={closeModalAndJoin}
                disabled={!roomId.length}
              >
                Start Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PopupModal;
