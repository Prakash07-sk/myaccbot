import ChatMessage from '../ChatMessage'

export default function ChatMessageExample() {
  return (
    <div className="space-y-4 p-4 bg-background">
      <ChatMessage 
        message="Hello! How can I help you with your financial queries today?"
        isUser={false}
      />
      <ChatMessage 
        message="I need help analyzing our quarterly expenses"
        isUser={true}
      />
      <ChatMessage 
        message="I'd be happy to help you analyze your quarterly expenses. Could you please share the expense data files?"
        isUser={false}
      />
    </div>
  )
}