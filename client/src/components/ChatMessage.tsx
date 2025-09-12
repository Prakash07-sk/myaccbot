interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export default function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-xs lg:max-w-md px-5 py-4 ${
        isUser 
          ? 'bg-primary text-primary-foreground rounded-3xl rounded-br-lg' 
          : 'bg-card border border-card-border text-card-foreground rounded-3xl rounded-bl-lg'
      }`} data-testid={`message-${isUser ? 'user' : 'bot'}`}>
        <p className="text-sm leading-relaxed">{message}</p>
        {timestamp && (
          <p className="text-xs opacity-70 mt-2" data-testid="text-timestamp">
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}