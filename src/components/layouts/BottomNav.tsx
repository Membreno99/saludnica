// Bottom navigation bar para SaludGO (mobile-first)
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Stethoscope, FileText, User, LayoutDashboard } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  const isDoctor = profile?.role === 'doctor' || profile?.role === 'admin';

  const patientNavItems = [
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: Stethoscope, label: 'Médicos', path: '/doctors' },
    { icon: FileText, label: 'Mis consultas', path: '/patient/dashboard' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  const doctorNavItems = [
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: LayoutDashboard, label: 'Panel', path: '/doctor/dashboard' },
    { icon: FileText, label: 'Exámenes', path: '/doctor/exams' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  const items = isDoctor ? doctorNavItems : patientNavItems;
  const current = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-pb">
      <div className="flex items-stretch max-w-lg mx-auto">
        {items.map(({ icon: Icon, label, path }) => {
          const active = current === path || (path !== '/' && current.startsWith(path));
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`bottom-nav-item flex-1 transition-colors ${
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-primary' : ''}`} />
              <span className={active ? 'text-primary font-semibold' : ''}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
