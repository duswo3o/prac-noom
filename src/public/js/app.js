const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");

// backend에 연결
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

// connection이 open일 때 사용하는 listener 등록
socket.addEventListener("open", () => {
  console.log("Connected to Server ✅");
});

// message를 받았을 때 사용하는 listener 등록
socket.addEventListener("message", (message) => {
  //   console.log("New message: ", message.data);
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

// 서버가 오프라인이 되었을 때 사용하는 listener 등록
socket.addEventListener("close", () => {
  console.log("Disconnected to Server ❌");
});

// // 메세지 보내기
// // 즉시 실행되는 것을 원하지 않기 때문에 setTimeout 사용
// setTimeout(() => {
//   socket.send("hello from the Browser!");
// }, 10000);

function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message", input.value));
  const li = document.createElement("li");
  li.innerText = `You: ${input.value}`;
  messageList.append(li);
  //   console.log(input.value);
  input.value = "";
}

function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
