// Navbar superior de SaludGO
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Heart, LogOut, User, LayoutDashboard, CreditCard, DollarSign, Download } from 'lucide-react';

const LOGO_URL = 'https://miaoda-conversation-file.s3cdn.medo.dev/user-c9ugee7yctts/app-c9ugo1hloj5t/20260612/WhatsApp Image 2026-06-04 at 11.09.37 PM.jpeg';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, profile, isSubscribed, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2"
      >
        <img src={LOGO_URL} alt="SaludGO" className="h-8 w-8 rounded-full object-cover" />
        <span className="font-bold text-lg">SaludGO</span>
      </button>

      <div className="flex items-center gap-2">
        {/* Botón instalar app */}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 text-xs gap-1 hidden md:flex"
          onClick={() => navigate('/instalar')}
        >
          <Download className="w-3.5 h-3.5" />
          Instalar app
        </Button>
        {user && profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 focus:outline-none">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profile.avatar_url || ''} />
                  <AvatarFallback className="bg-accent text-accent-foreground text-sm font-bold">
                    {profile.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2">
                <p className="font-medium text-sm truncate">{profile.full_name || 'Usuario'}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {profile.role === 'doctor' ? 'Médico' : profile.role === 'admin' ? 'Administrador' : 'Paciente'}
                </p>
                {profile.role === 'user' && (
                  <Badge
                    className={`mt-1 text-xs ${isSubscribed ? 'bg-success/15 text-success border-success/30' : 'bg-destructive/15 text-destructive border-destructive/30'}`}
                    variant="outline"
                  >
                    {isSubscribed ? 'Suscrito ✓' : 'Sin suscripción'}
                  </Badge>
                )}
              </div>
              <DropdownMenuSeparator />
              {profile.role === 'doctor' && (
                <DropdownMenuItem onClick={() => navigate('/doctor/dashboard')}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Mi panel
                </DropdownMenuItem>
              )}
              {profile.role === 'admin' && (
                <>
                  <DropdownMenuItem onClick={() => navigate('/admin/earnings')}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Mis ganancias
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Administración
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                Mi perfil
              </DropdownMenuItem>
              {profile.role === 'user' && !isSubscribed && (
                <DropdownMenuItem
                  onClick={() => navigate('/subscribe')}
                  className="text-accent font-semibold focus:text-accent"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Suscribirme — $7/mes
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            size="sm"
            className="h-8 bg-accent hover:bg-accent/90 text-accent-foreground text-xs"
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
          </Button>
        )}
      </div>
    </header>
  );
}
