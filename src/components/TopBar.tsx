
import { SidebarTrigger } from '@/components/ui/sidebar';
import logoImg from '@/assets/logo.png';

export function TopBar() {
  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Conecta Rua" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-lg font-bold text-foreground">Conecta Rua</h1>
              <p className="text-xs text-muted-foreground">Ponta Grossa - PR</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
