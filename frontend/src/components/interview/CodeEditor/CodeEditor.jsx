/* import React, { useEffect, useRef, useState } from "react";
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";
import LanguageDropdown from "../LanguageDropdown/LanguageDropdown";
import Output from "../Output/Output";
import "./CodeEditor.css"; 

function CodeEditor({ socket, roomId }) {
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("c");
  const [version, setVersion] = useState("10.2.0");

  const editorRef = useRef(null);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
    editor.focus();
  }

  function handleEditorChange(value, event) {
    setValue(value);
    if (socket && roomId) {
      socket.emit("message", { room: roomId, data: value });
    }
  }

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleReceiveMessage = (data) => {
      setValue(data);
    };

    const handleReceiveLanguage = ({ language, version }) => {
      setLanguage(language);
      setVersion(version);
    };

    const handleWelcome = (s) => {
      console.log(s);
    };

    socket.on("recieve-message", handleReceiveMessage);
    socket.on("recieve-language", handleReceiveLanguage);
    socket.on("welcome", handleWelcome);

    return () => {
      socket.off("recieve-message", handleReceiveMessage);
      socket.off("recieve-language", handleReceiveLanguage);
      socket.off("welcome", handleWelcome);
    };
  }, [socket, roomId]);

  return (
    <>
      <div className="code-editor-container">
        <div>
          <div className="language-selector">
            <p className="language-label">Language:</p>
            <LanguageDropdown
              langSetter={setLanguage}
              verSetter={setVersion}
              socket={socket}
              lang={language}
              ver={version}
              roomId={roomId}
            />
          </div>
          <Editor
            height="50vh"
            theme="vs-dark"
            width="50vw"
            language={language}
            value={value}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            className="editor"
          />
        </div>
        <Output
          version={version}
          language={language}
          value={value}
          socket={socket}
          roomId={roomId}
        />
      </div>
    </>
  );
}

export default CodeEditor;
 */


import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import LanguageDropdown from "../LanguageDropdown/LanguageDropdown";
import Output from "../Output/Output";
import "./CodeEditor.css";

function CodeEditor({ socket, roomId }) {
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("c");
  const [version, setVersion] = useState("10.2.0");

  const editorRef = useRef(null);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    editor.focus();

    // Ensure bold font is applied to all tokens
    monaco.editor.defineTheme("bold-theme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "FFFFFF", fontStyle: "bold" }, // Default style
        // Add other token rules if needed
      ],
      colors: {
        "editor.foreground": "#FFFFFF",
      },
    });
    monaco.editor.setTheme("bold-theme");
  }

  function handleEditorChange(value) {
    setValue(value);
    if (socket && roomId) {
      socket.emit("message", { room: roomId, data: value });
    }
  }

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleReceiveMessage = (data) => {
      setValue(data);
    };

    const handleReceiveLanguage = ({ language, version }) => {
      setLanguage(language);
      setVersion(version);
    };

    const handleWelcome = (s) => {
      console.log(s);
    };

    socket.on("recieve-message", handleReceiveMessage);
    socket.on("recieve-language", handleReceiveLanguage);
    socket.on("welcome", handleWelcome);

    return () => {
      socket.off("recieve-message", handleReceiveMessage);
      socket.off("recieve-language", handleReceiveLanguage);
      socket.off("welcome", handleWelcome);
    };
  }, [socket, roomId]);

  return (
    <div className="code-editor-container">
      <div>
        <div className="language-selector">
          <p className="language-label">Language:</p>
          <LanguageDropdown
            langSetter={setLanguage}
            verSetter={setVersion}
            socket={socket}
            lang={language}
            ver={version}
            roomId={roomId}
          />
        </div>
        <Editor
          height="50vh"
          theme="vs-dark"
          width="50vw"
          language={language}
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          className="editor"
          options={{
            fontFamily: 'Consolas, "Courier New", monospace',
            fontWeight: "bold", // Additional font weight setting
            fontSize: 14,
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
        />
      </div>
      <Output
        version={version}
        language={language}
        value={value}
        socket={socket}
        roomId={roomId}
      />
    </div>
  );
}

export default CodeEditor;