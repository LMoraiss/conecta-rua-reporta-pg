
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { toast } from 'sonner';
import logoImg from '@/assets/logo.png';

interface HeaderProps {
  session: Session | null;
  onAuthClick: () => void;
}

const Header = ({ session, onAuthClick }: HeaderProps) => {
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Erro ao fazer logout');
    } else {
      toast.success('Logout realizado com sucesso');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="Conecta Rua" className="w-8 h-8 object-contain" />
          <h2 className="text-xl font-semibold text-gray-900">Conecta Rua</h2>
        </div>
        
        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:block">
                Olá, {session.user.email}
              </span>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Sair</span>
              </Button>
            </div>
          ) : (
            <Button
              onClick={onAuthClick}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
