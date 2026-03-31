const socket = io();
const username = document.querySelector("#set-name");
const promptNameBox = document.querySelector("#prompt-name-box");
const info = document.querySelector("#username");
const list = document.querySelector("#list");
const receiverInfo = document.querySelector("#receiver");
const auth = document.querySelector("#auth");
const inputBox = document.querySelector("#input-box");
const sideBar = document.querySelector("#side-bar");
const backButton = document.querySelector("#back-button");
const messageBox = document.querySelector("#message-box");
const alertBox = document.querySelector("#alert-box");

class User {
  setId(id) {
    this.id = id;
  }
  setName(name) {
    this.name = name;
  }
  getId() {
    return this.id;
  }
  getName() {
    return this.name;
  }
}

class Message {
  constructor(sender, receiver, message) {
    this.sender = sender;
    this.receiver = receiver;
    this.message = message;
  }
}

const owner = new User();
const receiver = new User();

let messageHistory = [];

function renderUserName(id, name, checked) {
  return `<tr class="font-semibold">
            <td class="border-b border-gray-300">
              <input type="radio" name="user" value="${id}" onclick="choose('${id}', '${name}')" 
                id="${id}"
                ${checked && "checked"}
                class="[&:checked+label>div]:bg-gray-300 hidden">
              <label for="${id}" >
                <div class="p-2">
                <div class="break-all">${name}</div>
                <div>ID : ${id.slice(0, 5)}*****</div>
                </div>
              </label>
             </td>
          </tr>`;
}

function renderAlertBoxMessage(title, description) {
  return `<div class="bg-gray-500/70 backdrop-blur-[2px] text-white w-70 rounded-lg p-2 px-4">
        <div class="font-semibold flex justify-between">
          <div class="text-gray-300">${title}</div>
          <div onclick="closeAlertBox()">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-x-lg"
              viewBox="0 0 16 16"
            >
              <path
                d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"
              />
            </svg>
          </div>
        </div>
        <div class="font-semibold break-all text-white cursor-pointer">${description}</div>
      </div>`;
}

function showAlertBox(boxInfo) {
  alertBox.innerHTML = boxInfo;
}
function closeAlertBox() {
  alertBox.innerHTML = "";
}

function resetMessageBox() {
  receiver.setId(null);
  receiver.setName(null);
  messageBox.innerHTML = "";
  receiverInfo.innerText = "?";
  auth.scrollLeft = 0;
}

function start() {
  // check username is empty or not
  if (username.value.trim()) {
    promptNameBox.classList.add("hidden");
    auth.classList.remove("hidden");

    // register user account
    socket.emit("createPairOfNameAndId", username.value.trim());
  }
}

socket.on("getPairOfNameAndId", (user) => {
  info.classList.add(user.id);
  info.innerText = `Hello, ${user.name}`;
  owner.setId(user.id);
  owner.setName(user.name);
});

socket.on("getOnlineUsers", (users) => {
  list.innerHTML = users
    .filter((v) => v.id != owner.getId())
    .map((v) => renderUserName(v.id, v.name, v.id == receiver.getId()))
    .join("");

  const isUserOnline = users.find((user) => user.id == receiver.getId());
  if (!isUserOnline) resetMessageBox();
});

document.forms[0].onsubmit = function () {
  if (receiver.getId()) {
    if (inputBox.value.trim()) {
      let message = new Message(
        owner.getId(),
        receiver.getId(),
        inputBox.value.trim()
      );
      messageHistory.push(message);
      socket.emit("sendMessage", message);

      renderSentMessage(message.message);
      scrollMessageToBottom();
      resetInputBox();
    }
  } else {
    showAlertBox(
      renderAlertBoxMessage("Warning", "You haven't selected anyone yet.")
    );

    setTimeout(closeAlertBox, 3500);
  }
  return false;
};

function scrollMessageToBottom() {
  messageBox.scrollTop = messageBox.scrollHeight;
}
function resetInputBox() {
  inputBox.value = "";
}

function renderSentMessage(message) {
  let outerBoxContainer = document.createElement("div");
  let messageBoxContainer = document.createElement("div");

  outerBoxContainer.classList.add("flex", "justify-end", "py-2");
  messageBoxContainer.classList.add(
    "bg-gray-200",
    "font-semibold",
    "m-1",
    "px-4",
    "py-2",
    "break-all",
    "max-w-4/5",
    "w-fit",
    "relative",
    "after:absolute",
    "after:content-['']",
    "after:border-x-5",
    "after:border-y-7",
    "after:border-transparent",
    "after:border-t-gray-200",
    "after:top-full",
    "after:right-2"
  );

  let messageText = document.createTextNode(message);
  messageBoxContainer.appendChild(messageText);
  outerBoxContainer.appendChild(messageBoxContainer);
  messageBox.appendChild(outerBoxContainer);
}

socket.on("getMessage", (data, senderName) => {
  messageHistory.push(data);

  if (data.sender == receiver.getId()) {
    renderReceivedMessage(data.message);
    scrollMessageToBottom();
  } else {
    showAlertBox(
      renderAlertBoxMessage(
        "Notification",
        `<div onclick="viewMessage('${data.sender}','${senderName}')">View the message</div>`
      )
    );
    setTimeout(closeAlertBox, 3500);
  }
});

function viewMessage(id, name) {
  choose(id, name);
  document.getElementById(`${id}`).click();
}

function renderReceivedMessage(message) {
  let outerBoxContainer = document.createElement("div");
  let messageBoxContainer = document.createElement("div");

  outerBoxContainer.classList.add("flex", "justify-start", "py-2");
  messageBoxContainer.classList.add(
    "bg-black",
    "text-white",
    "font-semibold",
    "m-1",
    "px-4",
    "py-2",
    "break-all",
    "max-w-4/5",
    "w-fit",
    "relative",
    "after:absolute",
    "after:content-['']",
    "after:border-x-5",
    "after:border-y-7",
    "after:border-transparent",
    "after:border-t-black",
    "after:top-full",
    "after:left-2"
  );
  let messageText = document.createTextNode(message);
  messageBoxContainer.appendChild(messageText);
  outerBoxContainer.appendChild(messageBoxContainer);
  messageBox.appendChild(outerBoxContainer);
}

function choose(id, name) {
  auth.scrollLeft = auth.scrollWidth;
  receiver.setId(id);
  receiver.setName(name);
  receiverInfo.innerText = `${receiver.getName()}`;
  socket.emit("viewMessage", receiver.getId(), owner.getId());
}

backButton.onclick = resetMessageBox;

socket.on("viewMessage", (senderID, receiverID) => {
  messageBox.innerHTML = "";
  let conersation = messageHistory.filter((v) => {
    return (
      (v.sender == senderID && v.receiver == receiverID) ||
      (v.sender == receiverID && v.receiver == senderID)
    );
  });
  conersation.forEach((data) => {
    if (data.sender == receiverID) {
      renderReceivedMessage(data.message);
    } else {
      renderSentMessage(data.message);
    }
    scrollMessageToBottom();
  });
});
