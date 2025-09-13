import { useState } from 'react';
import Header from './Header';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { sendChatMessage } from '@/services/apiService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

export default function ChatPage() {
  console.log('ChatPage component is rendering');
  // todo: remove mock functionality - replace with real chat state management
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m MYACCBOT, your financial assistant. How can I help you analyze your financial data today?',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const handleSendMessage = async (messageText: string) => {

    const lastFiveMessages = messages.slice(-5)?.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text)
    }));

    const getUserResponse = await sendChatMessage({
      conversation_history: lastFiveMessages,
      query: messageText
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);

    // Handle the API response properly
    if (getUserResponse) {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: typeof getUserResponse === 'string' ? getUserResponse : getUserResponse.answer || 'Sorry, I couldn\'t process your request.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
    }
  };

  const handleFolderSelected = (folderPath: string) => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      text: `✅ Data successfully stored from: ${folderPath}. I've processed your financial documents and I'm ready to help you analyze them. You can now start asking questions about your data!`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="rounded-t-2xl overflow-hidden">
        <Header />
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-2" data-testid="chat-messages">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              isUser={message.isUser}
            />
          ))}
        </div>
      </div>

      <div className="rounded-b-2xl overflow-hidden">
        <ChatInput 
          onSendMessage={handleSendMessage}
          onFolderSelected={handleFolderSelected}
        />
      </div>
    </div>
  );
}