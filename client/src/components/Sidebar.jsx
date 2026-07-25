import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  History, 
  Terminal, 
  Boxes, 
  UserCheck, 
  Sliders, 
  BarChart3 
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return null;

  const role = user.role;

  const adminLinks = [
    { to: '/admin', label: 'Dashboard & Analytics', icon: LayoutDashboard },
    { to: '/admin/verification-queue', label: 'KYC Verification Queue', icon: UserCheck },
    { to: '/admin/stock-allocation', label: 'Stock Allocation', icon: Boxes },
    { to: '/admin/complaints', label: 'Grievance Management', icon: MessageSquare },
    { to: '/admin/settings', label: 'System Settings', icon: Sliders }
  ];

  const distributorLinks = [
    { to: '/distributor', label: 'Shop Dashboard', icon: LayoutDashboard },
    { to: '/distributor/epos', label: 'e-POS Terminal', icon: Terminal },
    { to: '/distributor/stock', label: 'Inventory Stock', icon: Boxes },
    { to: '/distributor/slots', label: 'Expected Bookings', icon: Calendar }
  ];

  const consumerLinks = [
    { to: '/consumer', label: 'Dashboard Overview', icon: LayoutDashboard },
    { to: '/consumer/ration-book', label: 'Digital Ration Book', icon: BookOpen },
    { to: '/consumer/slots', label: 'Slot Booking', icon: Calendar },
    { to: '/consumer/complaints', label: 'Assisted Complaints', icon: MessageSquare },
    { to: '/consumer/history', label: 'Transaction History', icon: History }
  ];

  const links = role === 'admin' ? adminLinks : role === 'distributor' ? distributorLinks : consumerLinks;

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 hidden md:block min-h-[calc(100vh-65px)] p-4 space-y-6">
      <div className="px-3 py-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          {role} Workspace
        </span>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin' || link.to === '/distributor' || link.to === '/consumer'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
