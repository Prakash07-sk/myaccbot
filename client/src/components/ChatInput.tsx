import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className="border-t border-border bg-card p-4">
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me about your financial data..."
          className="flex-1 bg-background border-input"
          data-testid="input-chat"
        />
        <DropdownMenu onFolderSelected={onFolderSelected} />
        <Button 
          onClick={handleSend} 
          size="icon"
          disabled={!inputValue.trim()}
          className="hover-elevate"
          data-testid="button-send"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}