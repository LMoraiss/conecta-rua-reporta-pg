
import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { TopBar } from '@/components/TopBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageTransition } from '@/components/PageTransition';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { SidebarInset } from '@/components/ui/sidebar';

const Profile = () => {
  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex w-full">
      <AppSidebar />
      
      <SidebarInset className="flex-1 pb-16 md:pb-0">
        <TopBar />
        
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
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Aqui você poderá gerenciar seu perfil.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>

      <BottomNavigation />
    </PageTransition>
  );
};

export default Profile;
