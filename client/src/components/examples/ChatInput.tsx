import ChatInput from '../ChatInput'

export default function ChatInputExample() {
  return (
    <div className="h-32 flex items-end bg-background">
      <div className="w-full">
        <ChatInput 
          onSendMessage={(message) => console.log('Message sent:', message)}
          onFolderSelected={(path) => console.log('Folder selected:', path)}
        />
      </div>
    </div>
  )
}