# 🎓 CampusConnect: AI-Powered Smart Campus Portal

**CampusConnect** is a comprehensive, full-stack campus management solution that leverages Artificial Intelligence to streamline student security, financial transactions, and administrative workflows.

🚀 **Live Demo:** [https://campus-connect-ui-eta.vercel.app/](https://campus-connect-ui-eta.vercel.app/)

---

## 👨‍💻 Recruiter & Tester Access
To explore the platform without registration, use the following demo account:

| Role | Roll Number | Password |
| :--- | :--- | :--- |
| **Student (Tester)** | `1` | `User@123` |
| **Admin** | `admin` | `admin123` |

---

## ✨ Key Features

### 🔐 AI Face Recognition Security
- **Secure Authentication**: AI-based face verification for identity confirmation.
- **Liveness Detection**: Prevents spoofing attempts using photos or videos.
- **Dynamic e-ID**: Generates secure, time-bound digital identity cards after successful face verification.

### 💳 Integrated Digital Wallet
- **Seamless Payments**: Students can maintain a balance to pay for campus services, fines, or events.
- **Razorpay Integration**: Secure top-ups and transaction processing.

### 📂 Academic & Admin Management
- **Notes Archive**: Centralized repository for course materials and lecture notes.
- **Admin Dashboard**: Real-time management of student records, verification requests, and campus-wide announcements.
- **Lost & Found**: Dedicated portal for reporting and tracking lost items on campus.

---

## 🛠️ Technical Stack

### **Frontend**
- **React.js** (Vite)
- **Vanilla CSS** (Modern UI/UX with Glassmorphism)
- **Lucide React** (Iconography)

### **Backend**
- **Node.js** & **Express**
- **MongoDB Atlas** (Database)
- **Nodemailer** (OTP & Communication)
- **Bcryptjs** (Secure Password Hashing)

### **AI & Microservices**
- **Python (Flask)**: Core Face Recognition API.
- **DeepFace & InsightFace**: Advanced AI models for facial embedding and comparison.
- **Hugging Face Spaces**: Hosting for the AI Face Service.

---

## 🚀 Deployment

- **Frontend**: Hosted on **Vercel**.
- **Backend API**: Hosted on **Render**.
- **AI Service**: Hosted on **Hugging Face Spaces**.

---

## 🛠️ Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/parthkk0/CampusConnect.git
   cd CampusConnect
   ```

2. **Backend Setup:**
   ```bash
   cd BackEnd
   npm install
   # Create a .env file with MONGO_URI, EMAIL_USER, EMAIL_PASS
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   cd FrontEnd
   npm install
   npm run dev
   ```

---

## 👤 Author
**Parth Kadam**  
*Full Stack Developer & AI Enthusiast*  

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat&logo=linkedin)](https://www.linkedin.com/in/your-profile)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=flat&logo=github)](https://github.com/parthkk0)

---
*Developed as a project to demonstrate AI integration in modern web applications.*
