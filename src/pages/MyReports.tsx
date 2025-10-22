
import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { TopBar } from '@/components/TopBar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent } from '@/components/ui/card';

const MyReports = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex w-full">
      <AppSidebar />
      
      <SidebarInset className="flex-1">
        <TopBar />
        
        <div className="flex-1 p-6">
          <Breadcrumb />
          
          <div className="flex items-center justify-center h-96">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6 text-center">
                <h2 className="text-xl font-semibold mb-2">Meus Relatórios</h2>
                <p className="text-gray-600">
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
