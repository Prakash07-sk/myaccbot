import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DropdownMenu from './DropdownMenu';

interface ChatInputProps {
  onSendMessage?: (message: string) => void;
  onFolderSelected?: (folderPath: string) => void;
}

export default function ChatInput({ onSendMessage, onFolderSelected }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      console.log('Sending message:', inputValue);
      onSendMessage?.(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card p-6 rounded-b-2xl">
      <div className="max-w-4xl mx-auto">
        <div className="relative flex items-center bg-background border border-input rounded-2xl pr-2 min-h-14">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your financial data..."
            className="flex-1 px-4 py-4 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground rounded-2xl"
            data-testid="input-chat"
          />
          <div className="flex items-center gap-2">
            <DropdownMenu onFolderSelected={onFolderSelected} />
            <Button 
              onClick={handleSend} 
              size="icon"
              disabled={!inputValue.trim()}
              className="rounded-xl hover-elevate min-w-10 min-h-10"
              data-testid="button-send"
            >
              <Send className="w-4 h-4 text-primary-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}