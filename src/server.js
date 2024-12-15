import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";
import express from "express";

const app = express();

// console.log("hello");

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

// 유저가 public으로 가게 되면 __dirname+"public" 폴더를 보여줌
app.use("/public", express.static(__dirname + "/public"));

// home으로 가면 request, response를 받고 res.render를 함(home을 렌더)
app.get("/", (req, res) => res.render("home"));
// home 이외의 url로 이동하면 home으로 redirect
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);

const httpServer = http.createServer(app); // http 서버
// const wss = new WebSocket.Server({ server }); // ws 서버
const wsServer = SocketIO(httpServer); // socket IO 서버

// public room 반환 함수
function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  //   const sids = wsServer.socket.adapter.sids;
  //   const rooms = wsServer.socket.adapter.rooms;

  // public room list 만들기
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anonymous";
  // 이벤트 발생시 실행
  socket.onAny((event) => {
    console.log(`Socket Event:${event}`);
  });
  // room 입장시 실행
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname);
    wsServer.sockets.emit("room_change", publicRooms());
  });
  // 연결 종료 직전에 발생
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickname);
    });
  });
  // 연결 종료 후 실행
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  // 새로운 메세지 입력시 실행
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

// // fake Database
// const sockets = [];

// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nickname"] = "Anonymous"; // 닉네임을 설정하지 않은 유저들에 대해 기본값 설정
//   console.log("Connected to Browser ✅");
//   socket.on("close", () => console.log("Disconnected from the Browser ❌"));
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg.toString("utf-8"));
//     switch (message.type) {
//       case "new_message":
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${socket.nickname} : ${message.payload}`)
//         );
//       case "nickname":
//         // console.log(message.payload);
//         socket["nickname"] = message.payload;
//     }
//   });
// });

httpServer.listen(3000, handleListen);
