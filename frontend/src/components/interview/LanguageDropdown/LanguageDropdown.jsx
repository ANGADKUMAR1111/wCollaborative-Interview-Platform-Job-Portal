import React from "react";
import { languages } from "../../../constants.js";
import "./LanguageDropdown.css"; 

const LanguageDropdown = ({
  langSetter,
  verSetter,
  socket,
  lang,
  ver,
  roomId,
}) => {
  const handleChange = (event) => {
    const selectedLanguage = event.target.value;
    const selectedVersion = languages.find(
      (lang) => lang.name === selectedLanguage
    ).version;
    
    langSetter(selectedLanguage);
    verSetter(selectedVersion);
    
    if (socket && roomId) {
      socket.emit("change-language", {
        room: roomId,
        data: { language: selectedLanguage, version: selectedVersion },
      });
    }
  };

  return (
    <div className="dropdown-container">
      <select className="dropdown-select" value={lang} onChange={handleChange}>
        {languages.map((lang) => (
          <option key={lang.name} value={lang.name} className="dropdown-option">
            {lang.name.toUpperCase()} <span>{lang.version}</span>
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageDropdown;
