import { useState } from 'react';

export enum MessageType {
  Assistant = 'Assistant',
  User = 'User',
}

interface Message {
  type: MessageType;
  message: string;
}

const useMessageManager = (): {
  messages: Message[];
  addMessage: (type: MessageType, message: string) => void;
} => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (type: MessageType, message: string) => {
    const newMessage: Message = {
      type,
      message,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  return {
    messages,
    addMessage,
  };
};

export default useMessageManager;
