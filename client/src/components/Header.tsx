import logoImage from '@assets/generated_images/MyACCOBot_finance-themed_logo_e4c31375.png';

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <img 
          src={logoImage} 
          alt="MyACCOBot Logo" 
          className="w-8 h-8"
          data-testid="img-logo"
        />
        <h1 className="text-lg font-semibold text-foreground" data-testid="text-app-title">
          MyACCOBot
        </h1>
      </div>
      <div className="text-sm text-muted-foreground" data-testid="text-subtitle">
        Financial Assistant
      </div>
    </header>
  );
}