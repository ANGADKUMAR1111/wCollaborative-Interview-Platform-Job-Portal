import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./Notepad.css";

function Notepad({ socket, roomId }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleTextChange = (data) => {
      setValue(data);
    };

    socket.on("recieve-text", handleTextChange);

    return () => {
      socket.off("recieve-text", handleTextChange);
    };
  }, [socket, roomId]);

  const handleChange = (newValue) => {
    setValue(newValue);
    if (socket && roomId) {
      socket.emit("text-change", { room: roomId, data: newValue });
    }
  };

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={handleChange}
      className="notepad-container" 
    />
  );
}

export default Notepad;