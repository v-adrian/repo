let captureInterval;
let currentRequest = null;
let isLeavingPage = false;

console.log("ASDAWD");
$(document).ready(function () {
  console.log("ASDAWD");
  // Set up the interval to capture frames every 25 seconds
  startCaptureInterval();
});

function startCaptureInterval() {
  // Delay the initial frame capture and recognition by 2 seconds
  setTimeout(function () {
    captureFrame();
    // Set up the interval to capture frames every 15 seconds
    captureInterval = setInterval(captureFrame, 15000);
  }, 3000);
}

function captureFrame() {
  if (isLeavingPage) {
    return;
  }

  if (currentRequest) {
    currentRequest.abort();
  }

  currentRequest = $.ajax({
    url: "/capture_frame/",
    type: "GET",
    success: function (data, textStatus, xhr) {
      console.log(xhr.status);
      if (xhr.status === 204) {
        console.log("Face not detected in frame");
      } else {
        console.log("Received frame");
        const base64DataUrl = `data:image/jpeg;base64,${data}`;

        capturedFrame.src = base64DataUrl;
        capturedFrame.style.display = "block";

        sendFrameForRecognition(base64DataUrl);
        console.log("Frame sent for recognition");
      }
    },
    error: function (error) {
      console.error(error);
    },
  });
}

clearInterval(captureInterval);

function sendFrameForRecognition(frameDataUrl) {
  // Cancel the request if the page is about to be unloaded
  if (isLeavingPage) {
    return;
  }

  if (currentRequest) {
    currentRequest.abort();
  }

  // Send the captured frame data URL to the 'face_recognition' view
  currentRequest = $.ajax({
    url: "/face_recognition/",
    type: "POST",
    data: {
      frame: frameDataUrl,
    },
    headers: {
      "X-CSRFToken": csrfToken,
    },
    success: function (data) {
      criminalImage.src = "";
      console.log(data);

      // Display data in the HTML elements
      if (data != 0) {
        $("#verified").text("Verification: " + data[0].verified);
        $("#distance").text("Distance: " + data[0].distance);
        $("#identity").text("Identity: " + data[0].identity);
        $("#threshold").text("Threshold: " + data[0].threshold);
        $("#model").text("Model: " + data[0].model);
        $("#detector_backend").text(
          "Detector Backend: " + data[0].detector_backend
        );
        $("#similarity_metric").text(
          "Similarity Metric: " + data[0].similarity_metric
        );
        $("#facial_areas").text("Facial Areas: " + data[0].facial_areas);
        $("#time").text("Time: " + data[0].time);
        criminalImage.src = `data:image/jpeg;base64,${data[0].criminal_image}`;
        criminalImage.style.display = "block";
        send_email();
      } else {
        $("#verified").text("Verification: ");
        $("#distance").text("Distance: ");
        $("#identity").text("Identity: ");
        $("#threshold").text("Threshold: ");
        $("#model").text("Model: ");
        $("#detector_backend").text("Detector Backend: ");
        $("#similarity_metric").text("Similarity Metric: ");
        $("#facial_areas").text("Facial Areas: ");
        $("#time").text("Time: ");
      }
    },
    error: function (error) {
      console.error(error);
    },
  });
}

function send_email(asd) {
  currentRequest = $.ajax({
    url: "/send_email/",
    type: "GET",
    headers: {
      "X-CSRFToken": csrfToken,
    },
    success: function () {
      console.log("send_email javascript");
    },
    error: function (error) {
      console.error(error);
    },
  });
}
