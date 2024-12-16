const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");

const call = document.getElementById("call");

// call은 처음에 숨겨져있음
call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    // console.log(cameras);
    // console.log(myStream.getVideoTracks()); // 사용중인 비디오 정보 확인
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      cameraSelect.appendChild(option);
    });
  } catch (error) {
    console.log(error);
  }
}

async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstrains = {
    audio: true,
    video: {
      deviceId: {
        exact: deviceId,
      },
    },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstrains : initialConstrains
    );
    // off 상태로 시작하기
    myStream.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });
    myStream.getVideoTracks().forEach((track) => {
      track.enabled = false;
    });
    // 비디오 넣어주기
    myFace.srcObject = myStream;
    // select option 설정
    if (!deviceId) {
      await getCameras();
    }
  } catch (error) {
    console.log(error);
  }
}

function handleMuteClick() {
  // console.log(myStream.getAudioTracks());
  myStream.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}

function handleCameraClick() {
  // console.log(myStream.getVideoTracks());
  myStream.getVideoTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

async function handleCamerachange() {
  // console.log(cameraSelect.value);
  await getMedia(cameraSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCamerachange);

// Welcome Form (join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function startMedia() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcome.querySelector("input");
  // console.log(input.value);
  roomName = input.value;
  socket.emit("join_room", roomName, startMedia);
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code

socket.on("welcome", async () => {
  // console.log("someone joined");
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  // console.log(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomName);
});

socket.on("offer", (offer) => {
  console.log(offer);
});

// RTC Code

function makeConnection() {
  myPeerConnection = new RTCPeerConnection();
  // console.log(myStream.getTracks());
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}
