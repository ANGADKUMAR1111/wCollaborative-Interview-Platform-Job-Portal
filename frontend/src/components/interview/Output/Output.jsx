import React, { useEffect, useState } from "react";
import "./Output.css";

function Output({ language, version, value, socket, roomId }) {
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");

  const handleRun = async () => {
    try {
      const reqBody = {
        language,
        version,
        files: [
          {
            content: value,
          },
        ],
        stdin: input,
      };
      const res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      });

      const data = await res.json();
      const outputText = data.run.stdout + "\n" + data.run.stderr;
      setOutput(outputText);
      
      if (socket && roomId) {
        socket.emit("output-change", {
          room: roomId,
          data: outputText,
        });
      }
    } catch (error) {
      console.error("Code execution error:", error);
      setOutput("Error running code. Please try again.");
    }
  };

  function handleChange(event) {
    const newValue = event.target.value;
    setInput(newValue);
    if (socket && roomId) {
      socket.emit("input-change", { room: roomId, data: newValue });
    }
  }

  useEffect(() => {
    if (!socket) return;
    
    const handleInputChange = (data) => {
      setInput(data);
    };
    
    const handleOutputChange = (data) => {
      setOutput(data);
    };

    socket.on("recieve-input", handleInputChange);
    socket.on("recieve-output", handleOutputChange);

    return () => {
      socket.off("recieve-input", handleInputChange);
      socket.off("recieve-output", handleOutputChange);
    };
  }, [socket]);

  return (
    <div className="output-container">
      <div>
        <button className="run-button" onClick={handleRun}>
          Run
        </button>
      </div>
      <h3 className="input-label">Input</h3>
      <textarea
        className="textarea-input"
        value={input}
        onChange={handleChange}
        placeholder="Enter input here..."
      />
      <h3 className="output-label">Output</h3>
      <div className="output-box">{output}</div>
    </div>
  );
}

export default Output;