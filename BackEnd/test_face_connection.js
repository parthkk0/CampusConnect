const axios = require('axios');
const FACE_SERVICE_URL = "http://127.0.0.1:8000";

async function testFaceService() {
    try {
        console.log("Checking health endpoint...");
        const health = await axios.get(`${FACE_SERVICE_URL}/health`);
        console.log("Health OK:", health.data);

        console.log("Testing POST /register-face with bad data to see if it reaches the server...");
        const res = await axios.post(`${FACE_SERVICE_URL}/register-face`, { userId: "123", image: "data:image/png;base64,xxxx" });
        console.log("Success:", res.data);
    } catch (err) {
        if (err.response) {
            console.log("Server responded with error:", err.response.data);
        } else {
            console.error("Connection failed:", err.message);
        }
    }
}
testFaceService();
