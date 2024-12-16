import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

// 유저가 public으로 가게 되면 __dirname+"public" 폴더를 보여줌
app.use("/public", express.static(__dirname + "/public"));

// home으로 가면 request, response를 받고 res.render를 함(home을 렌더)
app.get("/", (req, res) => res.render("home"));
// home 이외의 url로 이동하면 home으로 redirect
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app); // http 서버
const wsServer = SocketIO(httpServer); // socket IO 서버

wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome");
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
