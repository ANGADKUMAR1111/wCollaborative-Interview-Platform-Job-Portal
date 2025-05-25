import React from "react";
import InputModal from "../../components/Interview/InputModal/InputModal";
import PopupModal from "../../components/Interview/PopupModal/PopupModal";
import "./InterviewHome.css";

function InterviewHome() {
  return (
    <>
      <div className="hero-container">
        <div className="hero-content">
          <p className="hero-title">Welcome!<br/> In Your Interview Process</p>
         
          <div className="hero-buttons">
            <PopupModal />
            <InputModal />
          </div>
        </div>
        <div className="hero-image">
          <img src="/interview-assets/job-interview.gif" alt="Interview GIF" />
        </div>
      </div>

      <div className="features-container">
        <div className="features-title">Our Features</div>
        <div className="feature-item reverse">
          <p className="feature-text">
            <strong>Audio and Video Calls: </strong>Communicate seamlessly with
            crystal-clear audio and video.
          </p>
          <img
            src="https://miro.medium.com/v2/resize:fit:828/format:webp/1*NLSe2SyjfxdbEqFsOWHhlg.png"
            className="feature-image"
            alt=""
          />
        </div>

        <div className="feature-item">
          <p className="feature-text">
            <strong>Collaborative Code Editor: </strong>Code together in
            real-time with syntax highlighting and autocompletion.
          </p>
          <img src="/interview-assets/code-editor.png" className="feature-image" alt="" />
        </div>

        <div className="feature-item reverse">
          <p className="feature-text text-end">
            <strong>Text Editor: </strong>Take notes and plan your solutions
            with our integrated text editor.
          </p>
          <img src="/interview-assets/text-editor.png" className="feature-image" alt="" />
        </div>
      </div>

      <div className="how-it-works-container">
        <div className="how-it-works-title">How it works?</div>
        <div className="how-it-works-content">
          <p className="how-it-works-text">
            <strong>Create or Join an Interview:</strong> Choose to start or
            join an interview session.
          </p>
          <p className="how-it-works-text">
            <strong>Collaborate and Practice:</strong> Use our tools to practice
            and improve your interview skills.
          </p>
        </div>
      </div>
    </>
  );
}

export default InterviewHome; 