import React, { useContext, useState } from "react";
import { InterviewContext } from "../../../context/InterviewContext";
import { useNavigate } from "react-router-dom";
import "./InputModal.css"; 

function InputModal() {
  const { setStatus, setRoomId, socketConnected } = useContext(InterviewContext);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setInputValue("");
    setError("");
  };
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (error) setError("");
  };
  
  const closeModalAndJoin = () => {
    if (!inputValue.trim()) {
      setError("Please enter a valid Room ID");
      return;
    }
    
    setStatus("interviewee");
    setRoomId(inputValue.trim());
    setIsOpen(false);
    navigate("/interview/room");
  };

  return (
    <div>
      <button className="join-button" onClick={openModal}>
        Join an Interview
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Enter Room ID</h2>
              <button className="close-button" onClick={closeModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className={`room-input ${error ? 'input-error' : ''}`}
                placeholder="Paste Room ID here"
                value={inputValue}
                onChange={handleInputChange}
                disabled={!socketConnected}
              />
              {error && <p className="error-message">{error}</p>}
              {!socketConnected && (
                <p className="connection-status">
                  Connecting to server...
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="join-room-button" 
                onClick={closeModalAndJoin}
                disabled={!socketConnected || !inputValue.trim()}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InputModal;
 