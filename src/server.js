import http from "http";
import WebSocket from "ws";
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

const server = http.createServer(app); // http 서버
const wss = new WebSocket.Server({ server }); // ws 서버

function handleConnection(socket) {
  console.log(socket);
}

wss.on("connection", handleConnection);

server.listen(3000, handleListen);
