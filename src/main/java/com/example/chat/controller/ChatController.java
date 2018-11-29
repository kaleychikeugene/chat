package com.example.chat.controller;

import com.example.chat.entity.ChatMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @Autowired
    private SimpMessageSendingOperations messagingTemplate;

    @MessageMapping("/chat/sendMessage/{recipient}")
    public void sendMessage(@DestinationVariable String recipient, @Payload ChatMessage chatMessage) {
        messagingTemplate.convertAndSend("/user/" + recipient, chatMessage);
    }

    @MessageMapping("/chat/addUser")
    public void addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        messagingTemplate.convertAndSend("/users", chatMessage);
    }

    @MessageMapping("/chat/online")
    public void online(@Payload ChatMessage chatMessage) {
        messagingTemplate.convertAndSend("/online", chatMessage);
    }
}
