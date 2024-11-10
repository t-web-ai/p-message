const express = require("express");
const app = express();
const path = require("path");
const socket = require("socket.io");
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Listening at port ${PORT}...`);
});

app.use("/", express.static(path.join(__dirname, "public")));
const io = socket(server);
let online = [];
io.on("connection", (socket) => {
    socket.on("createPairOfNameAndId", username => {
        let user = {
            "id": socket.id,
            "name": username
        };
        online.push(user);
        io.to(user.id).emit("getPairOfNameAndId", user);
        io.emit("getOnlineUsers", online);
        console.log(online)
    });

    socket.on("sendMessage", data => {
        let point = online.findIndex((v) => {
            return v.id == data.receiver;
        });
        let sender = online.find((v) => {
            return v.id == data.sender;
        });
        if (socket.id == data.sender && point >= 0)
            io.to(data.receiver).emit("getMessage", data, sender.name);
    });

    socket.on("viewMessage", (receiverID, senderID) => {
        let point = online.findIndex((v) => {
            return v.id == receiverID;
        });
        if (socket.id == senderID && point >= 0) {
            console.log("Ok")
            io.to(socket.id).emit("viewMessage", socket.id, receiverID);
        }

    })


    socket.on("disconnect", () => {
        let point = online.findIndex((v, i, a) => {
            return v.id == `${socket.id}`;
        });
        if (point >= 0) {
            online.splice(point, 1);
            io.emit("getOnlineUsers", online);
        }

    });
});