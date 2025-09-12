interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export default function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-md ${
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-card border border-card-border text-card-foreground'
      }`} data-testid={`message-${isUser ? 'user' : 'bot'}`}>
        <p className="text-sm">{message}</p>
        {timestamp && (
          <p className="text-xs opacity-70 mt-1" data-testid="text-timestamp">
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}