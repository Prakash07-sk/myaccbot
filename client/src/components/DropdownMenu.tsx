import { useState } from 'react';
import { FolderOpen, Link2, Plus } from 'lucide-react';
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
          className="rounded-xl hover-elevate min-w-10 min-h-10"
          data-testid="button-dropdown-trigger"
        >
          <Plus className="w-4 h-4 text-emerald-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 rounded-xl animate-in slide-in-from-top-2 duration-200"
        data-testid="dropdown-content"
      >
        <DropdownMenuItem 
          onClick={handleBrowserClick}
          className="cursor-pointer gap-3 hover-elevate rounded-lg m-1"
          data-testid="dropdown-item-browser"
        >
          <FolderOpen className="w-4 h-4 text-blue-500" />
          <span>Browse Files</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleGoogleDriveClick}
          className="cursor-pointer gap-3 hover-elevate rounded-lg m-1"
          data-testid="dropdown-item-googledrive"
        >
          <Link2 className="w-4 h-4 text-green-500" />
          <span>Google Drive</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPrimitive>
  );
}