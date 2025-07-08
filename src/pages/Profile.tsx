
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { AppSidebar } from '@/components/AppSidebar';
import { TopBar } from '@/components/TopBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import AuthModal from '@/components/AuthModal';

const Profile = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setFullName(session.user.user_metadata?.full_name || '');
        setAvatarUrl(session.user.user_metadata?.avatar_url || '');
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setFullName(session.user.user_metadata?.full_name || '');
        setAvatarUrl(session.user.user_metadata?.avatar_url || '');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSaveProfile = async () => {
    if (!session?.user) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: avatarUrl,
        }
      });

      if (error) {
        toast.error('Erro ao salvar perfil');
      } else {
        toast.success('Perfil atualizado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!session?.user?.email) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        session.user.email,
        {
          redirectTo: `${window.location.origin}/`,
        }
      );

      if (error) {
        toast.error('Erro ao enviar email de redefinição');
      } else {
        toast.success('Email de redefinição enviado!');
      }
    } catch (error) {
      toast.error('Erro ao enviar email de redefinição');
    }
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex w-full">
        <AppSidebar session={session} />
        
        <SidebarInset className="flex-1">
          <TopBar 
            session={session} 
            onAuthClick={() => setAuthModalOpen(true)}
          />
          
          <div className="flex-1 p-6">
            <Breadcrumb />
            
            <div className="flex items-center justify-center h-96">
              <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                  <CardTitle>Acesso Necessário</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">
                    Você precisa estar logado para acessar seu perfil.
                  </p>
                  <Button onClick={() => setAuthModalOpen(true)}>
                    Fazer Login
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>

        <AuthModal 
          open={authModalOpen}
          onOpenChange={setAuthModalOpen}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex w-full">
      <AppSidebar session={session} />
      
      <SidebarInset className="flex-1">
        <TopBar 
          session={session} 
          onAuthClick={() => setAuthModalOpen(true)}
        />
        
        <div className="flex-1 p-6">
          <Breadcrumb />
          
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
              <p className="text-gray-600">Gerencie suas informações pessoais</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl} alt={fullName || session.user.email || ''} />
                    <AvatarFallback className="bg-accent-blue text-white text-xl">
                      {fullName ? fullName.substring(0, 2).toUpperCase() : getUserInitials(session.user.email || 'U')}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Digite seu nome completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={session.user.email || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      O email não pode ser alterado
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="avatarUrl">URL do Avatar</Label>
                    <Input
                      id="avatarUrl"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://exemplo.com/avatar.jpg"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Redefinir Senha</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Enviaremos um link para redefinir sua senha por email.
                    </p>
                    <Button variant="outline" onClick={handlePasswordReset}>
                      Enviar Link de Redefinição
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
};

export default Profile;
