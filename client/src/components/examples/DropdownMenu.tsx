import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DropdownMenu from '../DropdownMenu'

export default function DropdownMenuExample() {
  return (
    <div className="flex justify-center p-8 bg-background">
      <DropdownMenu 
        onFolderSelected={(path) => console.log('Folder selected:', path)}
      />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        theme="dark"
      />
    </div>
  )
}