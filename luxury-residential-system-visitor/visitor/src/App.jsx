import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Home } from "./pages/Home";
import About from "./pages/About";
import Navbar from "./component/Navbar";
import FeaturesPage from "./pages/FeaturesPage";
import Contact from "./pages/Contact";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OnlineDemo from "./pages/OnlineDemo";
import Profile from "./component/Profile";
import ProfileEdit from "./component/ProfileEdit";




function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Navbar/>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/about" element={<About/>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/OnlineDemo" element={<OnlineDemo/>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profileedit" element={<ProfileEdit />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 
