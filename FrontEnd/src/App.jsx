import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import StudentLogin from "./pages/StudentLogin";
import ForgotPassword from "./pages/ForgotPassword";
import StudentHome from "./pages/StudentHome";
import SignupPage from "./pages/SignupPage";
import ClerkLogin from "./pages/ClerkLogin";
import ClerkSignUp from "./pages/ClerkSignUp";
import EIDPage from "./pages/EIDPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import FaceVerify from "./pages/FaceVerify";
import RegisterFace from "./pages/RegisterFace";
import TestPay from "./TestPay";
import LostFound from "./pages/LostFound";
import Announcements from "./pages/Announcements";
import Notes from "./pages/Notes";
import WalletPage from "./pages/WalletPage";
import About from "./pages/About";
import Help from "./pages/Help";
import Navbar from "./components/Navbar"; // Keep for Admin/Legacy pages if needed, or remove if unused

function App() {
  return (
    <>
      <Routes>
        {/* MAIN ENTRY */}
        <Route path="/" element={<LandingPage />} />

        {/* CLERK FLOW */}
        <Route path="/clerk-login" element={<ClerkLogin />} />
        <Route path="/clerk-signup" element={<ClerkSignUp />} />

        {/* LEGACY STUDENT FLOW */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/forgot-password" element={<ForgotPassword />} />
        <Route path="/student/home" element={<StudentHome />} />
        <Route path="/student/register-face" element={<RegisterFace />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Modules (accessed from Student Home) */}
        <Route path="/eid" element={<EIDPage />} />
        <Route path="/lost" element={<LostFound />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/student/wallet" element={<WalletPage />} />
        <Route path="/pay" element={<TestPay />} />

        {/* ADMIN FLOW */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* UTILS */}
        <Route path="/face" element={<FaceVerify />} />

        {/* INFO PAGES */}
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </>
  );
}

export default App;

