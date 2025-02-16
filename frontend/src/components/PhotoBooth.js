import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PhotoBooth = ({ setCapturedImages }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImages, setImages] = useState([]);
  const [filter, setFilter] = useState("none");
  const [countdown, setCountdown] = useState(null);
  const [capturing, setCapturing] = useState(false);

  // Automatically start the camera when the component mounts
  useEffect(() => {
    startCamera();
  }, []);

  // Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.style.transform = "scaleX(-1)"; // mirrored camera
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  // Countdown to take 4 pictures automatically
  const startCountdown = () => {
    if (capturing) return;
    setCapturing(true);

    let photosTaken = 0;
    const newCapturedImages = [];

    const captureSequence = () => {
      if (photosTaken >= 4) {
        setCountdown(null);
        setCapturing(false);
        setCapturedImages((prevImages) => [...prevImages, ...newCapturedImages].slice(-4));
        setImages((prevImages) => [...prevImages, ...newCapturedImages].slice(-4)); 
        navigate("/preview");
        return;
      }

      let timeLeft = 3;
      setCountdown(timeLeft);

      const timer = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);

        if (timeLeft === 0) {
          clearInterval(timer);
          const imageUrl = capturePhoto();
          if (imageUrl) {
            newCapturedImages.push(imageUrl);
            setImages((prevImages) => [...prevImages, imageUrl]);
          }
          photosTaken += 1;
          setTimeout(captureSequence, 1000);
        }
      }, 1000);
    };

    captureSequence();
  };

  // Capture Photo
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.filter = filter;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageUrl = canvas.toDataURL("image/png");
      return imageUrl;
    }
  };

  return (
    <div className="photo-booth">
      {countdown !== null && <h2 className="countdown">{countdown}</h2>}

      <div className="photo-container">
        <div className="camera-container">
          <video ref={videoRef} autoPlay className="video-feed" />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="preview-side">
          {capturedImages.map((image, index) => (
            <img key={index} src={image} alt={`Captured ${index + 1}`} className="side-preview" />
          ))}
        </div>
      </div>
      

      <div className="controls">
        <button onClick={startCountdown} disabled={capturing}>Start Capture :)</button>
      </div>

      <div className="filters">
        <button onClick={() => setFilter("none")}>No Filter</button>
        <button onClick={() => setFilter("grayscale(100%)")}>Grayscale</button>
        <button onClick={() => setFilter("sepia(100%)")}>Sepia</button>
      </div>
    </div>
  );
};


export default PhotoBooth;
