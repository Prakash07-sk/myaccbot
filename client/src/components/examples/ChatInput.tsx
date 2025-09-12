import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChatInput from '../ChatInput'

export default function ChatInputExample() {
  return (
    <div className="h-40 flex items-end bg-background">
      <div className="w-full">
        <ChatInput 
          onSendMessage={(message) => console.log('Message sent:', message)}
          onFolderSelected={(path) => console.log('Folder selected:', path)}
        />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          theme="dark"
        />
      </div>
    </div>
  )
}