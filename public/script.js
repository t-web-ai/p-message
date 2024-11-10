const socket = io();
let username = document.querySelector(".setName");
let firstBox = document.querySelector(".alert");
let info = document.querySelector("#username");
let list = document.querySelector("#list");

let receiverID;
let messageHistory = [];
let msgBox = document.querySelector(".msg-text");

function start() {
    let uname = username.value.trim();
    if (uname) {
        firstBox.classList.add("hide");

        //match name and id
        socket.emit("createPairOfNameAndId", uname);
        socket.on("getPairOfNameAndId", user => {
            console.log(user);
            info.classList.add(user.id);
            info.innerText = user.name;
            socket.on("getOnlineUsers", online => {
                let tmp = "";
                online.filter(v => {
                    return v.id != user.id;
                }).forEach((v) => {
                    tmp += `
                    <tr>
                        <td>
                            <input type="radio" name="user" value="${v.id}" onchange="choose(this)"><b>${v.name}</b>
                        </td>
                    </tr>
                    `;
                });
                list.innerHTML = tmp;
                receiverID = "";
                msgBox.innerHTML = "";
            })
        });
    }
}

document.forms[0].onsubmit = function () {
    if (receiverID) {
        let text = document.forms[0].children[0];
        if (text.value.trim()) {
            let msgObject = {
                "sender": info.classList[0],
                "receiver": receiverID,
                "message": text.value.trim()
            };
            messageHistory.push(msgObject);
            socket.emit("sendMessage", msgObject);
            let box = document.createElement("DIV");
            box.classList.add("y");
            let msg = document.createElement("DIV");
            msg.classList.add("you");
            let txt = document.createTextNode(msgObject.message);
            msg.appendChild(txt);
            box.appendChild(msg);
            msgBox.appendChild(box);
            msgBox.scrollTop = msgBox.scrollHeight;
            text.value = "";
        }
    } else {
        alert("You haven't selected anyone yet.");
    }
    return false;
}
socket.on("getMessage", (data, senderName) => {
    messageHistory.push(data);
    console.log(messageHistory);

    if (data.sender == receiverID) {
        let box = document.createElement("DIV");
        box.classList.add("o");
        let msg = document.createElement("DIV");
        msg.classList.add("other");
        let txt = document.createTextNode(data.message);
        msg.appendChild(txt);
        box.appendChild(msg);
        msgBox.appendChild(box);
        msgBox.scrollTop = msgBox.scrollHeight;
    } else {
        alert("Got a message from " + senderName);
    }
});





function choose(id) {
    receiverID = id.value;
    socket.emit("viewMessage", receiverID, info.classList[0]);
}
socket.on("viewMessage", (senderID, receiverID) => {
    msgBox.innerHTML = "";
    let tmp = "";
    let conv = messageHistory.filter((v) => {
        return (v.sender == senderID && v.receiver == receiverID) || (v.sender == receiverID && v.receiver == senderID);
    });
    conv.forEach((v) => {
        let box = document.createElement("DIV");
        let msg = document.createElement("DIV");
        if (v.sender == receiverID) {
            box.classList.add("o");
            msg.classList.add("other");
        } else {
            box.classList.add("y");
            msg.classList.add("you");
        }
        let txt = document.createTextNode(v.message);
        msg.appendChild(txt);
        box.appendChild(msg);
        msgBox.appendChild(box);
        msgBox.scrollTop = msgBox.scrollHeight;
    });
});