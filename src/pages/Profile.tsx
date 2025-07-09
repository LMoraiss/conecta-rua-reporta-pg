
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { AppSidebar } from '@/components/AppSidebar';
import { TopBar } from '@/components/TopBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageTransition } from '@/components/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Calendar, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SidebarInset } from '@/components/ui/sidebar';

const Profile = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setFullName(session.user.user_metadata?.full_name || '');
        setAvatarUrl(session.user.user_metadata?.avatar_url || '');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setFullName(session.user.user_metadata?.full_name || '');
        setAvatarUrl(session.user.user_metadata?.avatar_url || '');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${session?.user?.id}_${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('report-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('report-images')
        .getPublicUrl(filePath);

      const newAvatarUrl = data.publicUrl;
      
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          avatar_url: newAvatarUrl,
          full_name: fullName
        }
      });

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(newAvatarUrl);
      toast.success('Foto de perfil atualizada com sucesso!');

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: fullName,
          avatar_url: avatarUrl
        }
      });

      if (error) {
        throw error;
      }

      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Erro ao atualizar perfil');
    }
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <PageTransition className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Você precisa fazer login para acessar seu perfil.</p>
          </CardContent>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex w-full">
      <AppSidebar session={session} onAuthClick={() => {}} />
      
      <SidebarInset className="flex-1">
        <TopBar session={session} onAuthClick={() => {}} />
        
        <div className="flex-1 p-6">
          <Breadcrumb />
          
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-glass border border-glass-border transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <User className="h-5 w-5 text-accent-blue" />
                  Meu Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage src={avatarUrl} alt="Avatar" />
                      <AvatarFallback className="bg-accent-blue text-white text-xl">
                        {getUserInitials(session.user.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2">
                      <Button
                        size="sm"
                        className="rounded-full h-8 w-8 p-0 bg-accent-blue hover:bg-accent-blue/90"
                        disabled={uploading}
                      >
                        <label className="cursor-pointer flex items-center justify-center w-full h-full">
                          {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={uploadAvatar}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Clique no ícone para alterar sua foto
                  </p>
                </div>

                {/* Profile Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Digite seu nome completo"
                      className="bg-white/80 dark:bg-gray-700/80"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={session.user.email || ''}
                        disabled
                        className="pl-10 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Membro desde</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(session.user.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={updateProfile}
                    className="w-full bg-accent-blue hover:bg-accent-blue/90"
                  >
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </PageTransition>
  );
};

export default Profile;
