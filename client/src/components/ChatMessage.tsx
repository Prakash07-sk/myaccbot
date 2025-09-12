import { Bot } from 'lucide-react';
import logoImage from '@assets/generated_images/MyACCOBot_finance-themed_logo_e4c31375.png';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export default function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      {!isUser && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <img 
              src={logoImage} 
              alt="MYACCBOT" 
              className="w-5 h-5 rounded-lg"
            />
          </div>
        </div>
      )}
      <div className={`${
        isUser 
          ? 'max-w-[50%] bg-primary/10 border border-primary/20 text-foreground px-5 py-4 rounded-3xl rounded-br-md backdrop-blur-sm' 
          : 'w-full text-foreground px-2 py-3'
      }`} data-testid={`message-${isUser ? 'user' : 'bot'}`}>
        <p className={`${
          isUser ? 'text-sm leading-relaxed' : 'text-sm leading-relaxed'
        }`}>{message}</p>
      </div>
    </div>
  );
}