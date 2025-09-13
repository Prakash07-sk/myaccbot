import { useState } from 'react';
import { FolderOpen, Link2, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu as DropdownMenuPrimitive, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { showInfo } from '@/utils/toastUtils';
import { BrowseDeviceAPI, GoogleDriveAPI } from '@/services/dataService';

interface DropdownMenuProps {
  onFolderSelected?: (folderPath: string) => void;
}

export default function DropdownMenu({ onFolderSelected }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const handleBrowserClick = async () => {
    console.log("Browser option clicked");
    setIsLoading(true);

    try {
      let folderPath: string | null = null;

      // ✅ Electron flow - use the correct API
      if ((window as any).electronAPI?.selectFolder) {
        folderPath = await (window as any).electronAPI.selectFolder();

        if (folderPath) {
          console.log("Selected folder path:", folderPath); // Full absolute path like "C:/Documents/MyApp"
          const response = await BrowseDeviceAPI({ path: folderPath });
          console.log("Response from device:", response);
          
          // Call the callback if provided
          if (onFolderSelected) {
            onFolderSelected(folderPath);
          }
        } else {
          console.log("No folder selected");
        }
      } 
      // ✅ Browser fallback - limited to relative paths for security
      else {
        const input = document.createElement("input");
        input.type = "file";
        (input as any).webkitdirectory = true;
        input.onchange = async (e: any) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            // Get the relative path of the selected folder
            // The first file's webkitRelativePath includes the folder and file, e.g. "folder/sub/file.txt"
            // To get the folder path, remove the file name from the first file's webkitRelativePath
            const firstFilePath = files[0].webkitRelativePath;
            const lastSlashIndex = firstFilePath.lastIndexOf('/');
            let folderPath = '';
            if (lastSlashIndex !== -1) {
              folderPath = firstFilePath.substring(0, lastSlashIndex);
            } else {
              folderPath = firstFilePath; // fallback, should not happen
            }
            console.log("Selected folder (relative path):", folderPath); // e.g. "Document/subfolder"
            console.log("Note: Browser cannot access full file system paths for security reasons");
            
            // Make API call for browser fallback
            const response = await BrowseDeviceAPI({ path: folderPath });
            
            // Call the callback if provided
            if (onFolderSelected) {
              onFolderSelected(folderPath);
            }
          }
        };
        input.click();
      }
    } catch (error: any) {
      console.error("Error while selecting folder:", error);
      // Error toast is already handled by axios interceptor
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };


  const handleGoogleDriveClick = async () => {
    console.log('Google Drive option clicked');
    setIsLoading(true);
    
    try {
      // For now, just show a coming soon message
      showInfo("Google Drive support is coming soon!", { title: "Coming Soon" });
    } catch (error) {
      console.error('Error with Google Drive:', error);
      // Error toast is already handled by axios interceptor
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <DropdownMenuPrimitive open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          size="icon" 
          variant="ghost" 
          className="rounded-xl hover-elevate min-w-10 min-h-10"
          data-testid="button-dropdown-trigger"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 text-emerald-500" />
          )}
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
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          ) : (
            <FolderOpen className="w-4 h-4 text-blue-500" />
          )}
          <span>Browse Folder</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleGoogleDriveClick}
          className="cursor-pointer gap-3 hover-elevate rounded-lg m-1"
          data-testid="dropdown-item-googledrive"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
          ) : (
            <Link2 className="w-4 h-4 text-green-500" />
          )}
          <span>Google Drive</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPrimitive>
  );
}
