interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export default function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`${
        isUser 
          ? 'max-w-[50%] bg-primary/10 border border-primary/20 text-foreground px-5 py-4 rounded-3xl rounded-br-lg backdrop-blur-sm' 
          : 'w-full text-foreground px-2 py-3'
      }`} data-testid={`message-${isUser ? 'user' : 'bot'}`}>
        <p className={`${
          isUser ? 'text-sm leading-relaxed' : 'text-sm leading-relaxed'
        }`}>{message}</p>
      </div>
    </div>
  );
}