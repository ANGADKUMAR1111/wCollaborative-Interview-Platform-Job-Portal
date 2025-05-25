import { useContext, useEffect } from "react";
import "./App.css";
import { Context } from "./main";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import Home from "./components/Home/Home";
import Jobs from "./components/Job/Jobs";
import JobDetails from "./components/Job/JobDetails";
import Application from "./components/Application/Application";
import MyApplications from "./components/Application/MyApplications";
import PostJob from "./components/Job/PostJob";
import NotFound from "./components/NotFound/NotFound";
import MyJobs from "./components/Job/MyJobs";
import Form from "./components/ResumeComponent/Form";
import InterviewHome from "./pages/Interview/InterviewHome";
import InterviewRoom from "./pages/Interview/InterviewRoom";
import Chatbot from "./components/Chatbot/Chatbot";
import AssistantPage from "./pages/Assistant/AssistantPage";

// Component to handle the app content with routing
const AppContent = () => {
  const location = useLocation();
  const { isAuthorized, setIsAuthorized, setUser, user } = useContext(Context);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/v1/user/getuser",
          {
            withCredentials: true,
          }
        );
        setUser(response.data.user);
        setIsAuthorized(true);
      } catch (error) {
        setIsAuthorized(false);
      }
    };
    fetchUser();
  }, [isAuthorized]);

  // Only show the floating chatbot on non-assistant pages
  const showChatbot =
    isAuthorized &&
    user?.role === "Job Seeker" &&
    location.pathname !== "/assistant";

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/job/getall" element={<Jobs />} />
        <Route path="/job/:id" element={<JobDetails />} />
        <Route path="/application/:id" element={<Application />} />
        <Route path="/applications/me" element={<MyApplications />} />
        <Route path="/job/post" element={<PostJob />} />
        <Route path="/job/me" element={<MyJobs />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/resumedeveloped" element={<Form />} />
        <Route path="/interview" element={<InterviewHome />} />
        <Route path="/interview/room" element={<InterviewRoom />} />
      </Routes>
      {showChatbot && <Chatbot />}
      <Footer />
      <Toaster />
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
