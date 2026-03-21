import React, { useRef } from "react";

export default function FaceCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    videoRef.current.play();
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const imageBase64 = canvas.toDataURL("image/jpeg");
    onCapture(imageBase64);
  };

  return (
    <div>
      <video ref={videoRef} style={{ width: "350px" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={{ marginTop: "10px" }}>
        <button onClick={startCamera}>Start Camera</button>
        <button onClick={capturePhoto}>Capture Photo</button>
      </div>
    </div>
  );
}
