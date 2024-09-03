'use client';

import React from 'react';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm an AI Mental Health ChatBot. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    const newMessage = { role: 'user', content: message };
    const updatedMessages = [
      ...messages,
      newMessage,
      { role: 'assistant', content: '' },
    ];

    setMessage("");
    setMessages(updatedMessages);

    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedMessages),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      let result = "";
      return reader.read().then(function processText ({done, value}){
        if(done){
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true });
        
        // Format the response content
        const formattedText = text.replace(/\*\*/g, '\n');

        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + formattedText },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction={'column'}
        width="40%"
        height="95%"
        border="3px solid cadetblue"
        p={2}
        spacing={3}
        className="chat-background"
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'cadetblue' 
                    : 'tan'
                }
                color="aliceblue"
                borderRadius={16}
                p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Please ask your question here"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{
              backgroundColor: '#d1e7dd',
            }}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
