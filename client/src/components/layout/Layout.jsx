import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { selectUser } from '../../store/slices/authSlice';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = useSelector(selectUser);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Main content */}
      <div className="flex-1  focus:outline-none">
        {/* Header */}
        <Header 
          user={user} 
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        {/* Page content */}
        <main className="flex-1 relative z-0 overflow-y-auto py-6">
          <div className="mx-auto px-4 sm:px-6 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
