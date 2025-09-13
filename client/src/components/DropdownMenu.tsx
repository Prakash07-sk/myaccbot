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
  console.log("Browser option clicked");

  try {
    let folderPath: string | null = null;

    // ✅ Electron flow
    if ((window as any).electron?.selectFolder) {
      folderPath = await (window as any).electron.selectFolder();

      if (folderPath) {
        // 👉 Just print the folder path
        console.log("FOOOOOO", folderPath);
      } else {
        console.log("No folder selected");
      }
    } 
    // ✅ Browser fallback
    else {
      const input = document.createElement("input");
      input.type = "file";
      (input as any).webkitdirectory = true;
      input.onchange = (e: any) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          // Only print the top-level folder name
          const folderName = files[0].webkitRelativePath.split("/")[0];
          console.log("fileee", folderName);  // e.g. Document (not full path)
        }
      };
      input.click();
    }
  } catch (error: any) {
    console.error("Error while selecting folder:", error);
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
          <span>Browse Folder</span>
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
