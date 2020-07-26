// js for sidebar dropdown
function uiShowHide() {
  var b = document.getElementById("uiDrpdwn");
  if(b.style.display === "block"){
    document.getElementById("arrRght").style = "transform: rotate(0deg)";
    document.getElementById("brdrToggle").style = "border-color: #113937; background: #113937";
    document.getElementById("brdrToggle").onmouseover = function() {
      this.style.backgroundColor = "#205a58";
      this.style.borderColor = "#5DC16B";
    }
    document.getElementById("brdrToggle").onmouseout = function() {
      this.style.backgroundColor = "#113937";
      this.style.borderColor = "#113937";
    }
  }
  else {
    document.getElementById("arrRght").style = "transform: rotate(90deg)";
    document.getElementById("brdrToggle").style = "border-color: #5DC16B; background: #205a58";
  }
}

$(document).ready(function(){
  $("#drpwndLi").click(function(){
    $("#uiDrpdwn").slideToggle("slow");
  });
});

//  toggle sidebar
function toggleHide() {
  var a = document.getElementById("sideMnu");
  if(a.style.width === "230px") {
    document.getElementById("sideMnu").style = "width: 0px;";
    document.getElementById("appcontnt").style = "margin-left: 0px;";
  }
  else {
    document.getElementById("sideMnu").style = "width: 230px;";
    document.getElementById("appcontnt").style = "margin-left: 0px;";
  }
}

// face detection
const video = document.getElementById("video");
let predictedAges = [];

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/models")
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => (video.srcObject = stream),
    err => console.error(err)
  );
}

video.addEventListener("playing", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  var a = document.getElementById("video-frame");
  a.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    const age = resizedDetections[0].age;
    const interpolatedAge = interpolateAgePredictions(age);
    const bottomRight = {
      x: resizedDetections[0].detection.box.bottomRight.x - 50,
      y: resizedDetections[0].detection.box.bottomRight.y
    };

    new faceapi.draw.DrawTextField(
      [`${faceapi.utils.round(interpolatedAge, 0)} years`],
      bottomRight
    ).draw(canvas);
  }, 100);
});

function interpolateAgePredictions(age) {
  predictedAges = [age].concat(predictedAges).slice(0, 30);
  const avgPredictedAge =
    predictedAges.reduce((total, a) => total + a) / predictedAges.length;
  return avgPredictedAge;
}
