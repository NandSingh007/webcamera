import React, { useRef, useState, useCallback } from "react";
import "./homeStyles.css";
import Webcam from "react-webcam";
import axios from "axios";

const Home = () => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [videoSrc, setVideoSrc] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    console.log("imageSrc", imageSrc);
    if (imageSrc) {
      axios
        .post("http://localhost:5000/upload-image", { image: imageSrc })
        .then((response) => {
          console.log("Image uploaded successfully", response.data);
        })
        .catch((error) => {
          console.error("Error uploading image", error);
        });
    }
  }, [webcamRef, setImgSrc]);

  const handleStartCaptureClick = useCallback(() => {
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm"
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  }, [webcamRef, setCapturing, mediaRecorderRef]);

  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStopCaptureClick = useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
  }, [mediaRecorderRef, setCapturing]);

  const handleDownload = useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm"
      });
      const url = URL.createObjectURL(blob);
      const formData = new FormData();
      formData.append("video", blob, "recorded-video.webm");

      axios
        .post("http://localhost:5000/upload-video", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then((response) => {
          console.log("Video uploaded successfully", response.data);
          setVideoSrc(url);
        })
        .catch((error) => {
          console.error("Error uploading video", error);
        });
    }
  }, [recordedChunks]);

  return (
    <div className="main-container">
      <div className="camera-section">
        <h1>Capture the Picture!</h1>
        <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
        <br />
        <button onClick={capture} className="button">
          Capture photo
        </button>
      </div>

      <div className="camera-section">
        {imgSrc && <img src={imgSrc} alt="Captured" />}
      </div>

      <div className="camera-section">
        <h1>Record a Video!</h1>
        {capturing ? (
          <button onClick={handleStopCaptureClick} className="button">
            Stop Recording
          </button>
        ) : (
          <button onClick={handleStartCaptureClick} className="button">
            Start Recording
          </button>
        )}
        {recordedChunks.length > 0 && (
          <button onClick={handleDownload} className="button">
            Download
          </button>
        )}
      </div>

      <div className="camera-section">
        {videoSrc && (
          <video controls>
            <source src={videoSrc} type="video/webm" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  );
};

export default Home;

// import React from "react";

// const Home = () => {
//   return <div> lorem10</div>;
// };

// export default Home;
