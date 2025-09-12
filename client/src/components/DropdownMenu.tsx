import { useState } from 'react';
import { FolderOpen, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu as DropdownMenuPrimitive, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'react-toastify';
import { sendFolderPath } from '../services/apiService';

interface DropdownMenuProps {
  onFolderSelected?: (folderPath: string) => void;
}

export default function DropdownMenu({ onFolderSelected }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleBrowserClick = async () => {
    console.log('Browser option clicked');
    
    // Simulate folder dialog (in real Electron app, this would use window.electron)
    const confirmed = window.confirm("We only support XML format files from this folder. Is that okay?");
    
    if (confirmed) {
      // Mock folder path for demonstration
      const mockFolderPath = "/Users/Desktop/financial-documents";
      
      try {
        await sendFolderPath(mockFolderPath);
        toast.success('Folder path sent successfully!');
        onFolderSelected?.(mockFolderPath);
      } catch (error) {
        toast.error('Failed to send folder path');
        console.error('API Error:', error);
      }
    }
    
    setIsOpen(false);
  };

  const handleGoogleDriveClick = () => {
    console.log('Google Drive option clicked');
    toast.info('Google Drive support is coming soon!');
    setIsOpen(false);
  };

  return (
    <DropdownMenuPrimitive open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          size="icon" 
          variant="ghost" 
          className="text-muted-foreground hover-elevate"
          data-testid="button-dropdown-trigger"
        >
          <span className="text-lg">+</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 animate-in slide-in-from-top-2 duration-200"
        data-testid="dropdown-content"
      >
        <DropdownMenuItem 
          onClick={handleBrowserClick}
          className="cursor-pointer gap-2 hover-elevate"
          data-testid="dropdown-item-browser"
        >
          <FolderOpen className="w-4 h-4" />
          <span>Browser</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleGoogleDriveClick}
          className="cursor-pointer gap-2 hover-elevate"
          data-testid="dropdown-item-googledrive"
        >
          <Link2 className="w-4 h-4" />
          <span>Google Drive</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPrimitive>
  );
}