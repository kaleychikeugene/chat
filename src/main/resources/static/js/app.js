'use strict';


import ChatWindow from "./chatWindow.js";


let nameInput = $('#name');
let usernamePage = document.querySelector('#username-page');
let chatPage = document.querySelector('#chat-page');
let usernameForm = document.querySelector('#usernameForm');
let messageForm = document.querySelector('#messageForm');
let messageInput = document.querySelector('#message');
let messageArea = document.querySelector('#messageArea');
let connectingElement = document.querySelector('.connecting');
let usernameDisplay = document.querySelector('#username-display');
let userItem = $('#user-item');

let stompClient = null;
let currentSubscription;
let username = null;
let userList = [];
let recipient = null;
let chat = null;

function connect(event) {
    username = nameInput.val().trim();
    if (username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        let socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}

function init() {
    usernameDisplay.textContent = username;

    if (currentSubscription) {
        currentSubscription.unsubscribe();
    }
    currentSubscription = stompClient.subscribe(`/users`, onMessageReceived);
    currentSubscription = stompClient.subscribe(`/online`, onOnlineReceived);

    stompClient.send('/app/chat/addUser',
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    );
}

function onConnected() {
    init();
    connectingElement.classList.add('hidden');
}

function onError() {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}

function sendMessage(event) {
    let chatMessage = {
        sender: username,
        recipient: recipient,
        content: messageInput.value,
        type: 'CHAT'
    };
    stompClient.send(`/app/chat/sendMessage/${recipient}`, {}, JSON.stringify(chatMessage));
    messageInput.value = '';
    renderMessage(chatMessage);
    event.preventDefault();
}

function renderMessage(message) {

    let divElement = document.createElement('div');
    divElement.classList.add('div-message');
    let messageElement = document.createElement('li');
    messageElement.classList.add('chat-message');
    messageElement.style.cssFloat = 'right';

    let avatarElement = document.createElement('i');
    let avatarText = document.createTextNode(message.sender[0]);
    avatarElement.appendChild(avatarText);
    avatarElement.style['background-color'] = ChatWindow.getAvatarColor(message.sender);

    messageElement.appendChild(avatarElement);

    let usernameElement = document.createElement('span');
    let usernameText = document.createTextNode(message.sender);
    usernameElement.appendChild(usernameText);
    messageElement.appendChild(usernameElement);

    let textElement = document.createElement('p');
    let messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);
    divElement.appendChild(messageElement);

    messageArea.appendChild(divElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

function renderUserList() {
    userItem.empty();
    userList.forEach((user) => {
        let divElement = document.createElement('div');
        let buttonElement = document.createElement('button');
        buttonElement.classList.add('user-it');
        buttonElement.addEventListener("click", function (event) {
            $('.user-it').removeClass('active');
            let e = event.target;
            e.classList.add('active');
            recipient = user;
            if (chat && chat.recipient === user) return;
            else {
                if (chat)
                    chat.uns();
                chat = new ChatWindow(username, user, stompClient)
            }
        });
        buttonElement.appendChild(document.createTextNode(user));
        divElement.appendChild(buttonElement);
        userItem.append(divElement);
    });
    userItem.scrollTop = userItem.scrollHeight;
}

function onMessageReceived(payload) {
    let message = JSON.parse(payload.body);
    if (message.type === "JOIN" && message.sender !== username) {
        userList.push(message.sender);
        stompClient.send('/app/chat/online', {},
            JSON.stringify({sender: username, type: 'JOIN'})
        );
    }
    else if (message.type === "LEAVE")
        userList = userList.filter((user) => user !== message.sender);
    renderUserList()
}

function onOnlineReceived(payload) {
    let message = JSON.parse(payload.body);
    if (message.sender !== username) {
        if (!userList.length || (userList.length && !userList.includes(message.sender)))
            userList.push(message.sender);
        renderUserList()
    }
}

$(document).ready(function () {
    usernamePage.classList.remove('hidden');
    usernameForm.addEventListener('submit', connect, true);
    messageForm.addEventListener('submit', sendMessage, true);
});
