import { Bot } from 'lucide-react';
import logoImage from '@assets/generated_images/MyACCOBot_finance-themed_logo_e4c31375.png';
import { PRODUCT_NAME } from '@/utils/config';

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
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <img 
              src={logoImage} 
              alt={PRODUCT_NAME} 
              className="w-10 h-10 rounded-lg"
            />
          </div>
        </div>
      )}
      <div className={`${
        isUser 
          ? 'max-w-[50%] bg-primary/10 border text-foreground px-5 py-4 rounded-2xl backdrop-blur-sm' 
          : 'w-full text-foreground px-2 py-3'
      }`} data-testid={`message-${isUser ? 'user' : 'bot'}`}>
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
}