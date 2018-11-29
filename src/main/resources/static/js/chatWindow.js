const colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

export default class ChatWindow {

    constructor(user, recipient, stomp) {
        this.recipient = recipient;
        this.chatContainer = $('.chat-container');
        this.resipientDisplay = $('#user-display');
        this.messageInput = $('#message');
        this.messageArea = $('#messageArea');
        this.subsc=stomp.subscribe(`/user/${user}`, ChatWindow.onMessage);

        this.init()
    }

    init() {
        this.chatContainer.removeClass('hidden');
        this.messageArea.empty();
        this.resipientDisplay.text(this.recipient);
        this.messageInput.value = ""
    }

    uns(){
        this.subsc.unsubscribe()
    }

    static getAvatarColor(messageSender) {
        let hash = 0;
        for (let i = 0; i < messageSender.length; i++) {
            hash = 31 * hash + messageSender.charCodeAt(i);
        }
        let index = Math.abs(hash % colors.length);
        return colors[index];
    }

    static onMessage(payload) {
        let message = JSON.parse(payload.body);

        let divElement = document.createElement('div');
        divElement.classList.add('div-message');
        let messageElement = document.createElement('li');
        messageElement.classList.add('chat-message');

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

        let messageArea = document.querySelector('#messageArea');
        messageArea.appendChild(divElement);
        messageArea.scrollTop = messageArea.scrollHeight;
    }
}