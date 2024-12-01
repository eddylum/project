import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Settings, LogOut, BarChart3, Package, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Logo from './Logo';

export default function Sidebar() {
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
    { icon: Building2, label: 'Propriétés', path: '/dashboard/properties' },
    { icon: RefreshCw, label: 'Synchronisation', path: '/dashboard/sync' },
    { icon: Package, label: 'Commandes', path: '/dashboard/orders' },
    { icon: BarChart3, label: 'Analyses', path: '/dashboard/analytics' },
    { icon: Settings, label: 'Paramètres', path: '/dashboard/settings' },
  ];

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 fixed left-0 top-0">
      <div className="flex items-center p-4 border-b">
        <Logo className="h-8 w-auto text-emerald-600" />
      </div>
      <nav className="mt-8 flex flex-col h-[calc(100%-5rem)]">
        <div className="flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 ${
                  isActive ? 'bg-emerald-50 text-emerald-600' : ''
                }`
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </div>
        <button 
          onClick={handleSignOut}
          className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 w-full mb-4"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Déconnexion
        </button>
      </nav>
    </div>
  );
}