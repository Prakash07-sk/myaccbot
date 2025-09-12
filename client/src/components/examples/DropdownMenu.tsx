import DropdownMenu from '../DropdownMenu'

export default function DropdownMenuExample() {
  return (
    <div className="flex justify-center p-8 bg-background">
      <DropdownMenu 
        onFolderSelected={(path) => console.log('Folder selected:', path)}
      />
    </div>
  )
}