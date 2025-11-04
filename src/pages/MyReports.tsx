
import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { TopBar } from '@/components/TopBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';

const MyReports = () => {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <AppSidebar />
      
      <SidebarInset className="flex-1 pb-20 md:pb-0">
        <TopBar />
        
        <div className="flex-1 p-6">
          <Breadcrumb />
          
          <div className="flex items-center justify-center h-96">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6 text-center">
                <h2 className="text-xl font-semibold mb-2">Meus Relatórios</h2>
                <p className="text-muted-foreground">
                  Esta página mostrará seus relatórios.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
};

export default MyReports;
