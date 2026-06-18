// Panel de ganancias del administrador — SaludGO
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign, TrendingUp, Stethoscope, FileText,
  Calendar, ArrowLeft, Users, BanknoteIcon
} from 'lucide-react';
import Navbar from '@/components/layouts/Navbar';

interface AdminEarning {
  id: string;
  service_type: 'consultation' | 'exam_interpretation';
  total_amount: number;
  platform_commission: number;
  doctor_amount: number;
  specialty: string | null;
  status: 'pending' | 'confirmed' | 'refunded';
  created_at: string;
  profiles_user?: { full_name: string | null };
  profiles_doctor?: { full_name: string | null };
}

interface EarningSummary {
  totalGanancias: number;
  gananciasMes: number;
  totalConsultasGenerales: number;
  totalConsultasEspecialistas: number;
  pendientes: number;
}

export default function AdminEarningsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState<AdminEarning[]>([]);
  const [summary, setSummary] = useState<EarningSummary>({
    totalGanancias: 0,
    gananciasMes: 0,
    totalConsultasGenerales: 0,
    totalConsultasEspecialistas: 0,
    pendientes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role !== 'admin') { navigate('/'); return; }
    loadEarnings();
  }, [profile]);

  const loadEarnings = async () => {
    const { data } = await supabase
      .from('admin_earnings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    const rows = Array.isArray(data) ? data : [];
    setEarnings(rows);

    const now = new Date();
    const mesActual = now.getMonth();
    const anioActual = now.getFullYear();

    const confirmed = rows.filter(r => r.status === 'confirmed');
    const estesMes = confirmed.filter(r => {
      const d = new Date(r.created_at);
      return d.getMonth() === mesActual && d.getFullYear() === anioActual;
    });

    setSummary({
      totalGanancias: confirmed.reduce((s, r) => s + Number(r.platform_commission), 0),
      gananciasMes: estesMes.reduce((s, r) => s + Number(r.platform_commission), 0),
      totalConsultasGenerales: confirmed.filter(r =>
        r.service_type === 'consultation' && Number(r.platform_commission) === 1
      ).length,
      totalConsultasEspecialistas: confirmed.filter(r =>
        r.service_type === 'consultation' && Number(r.platform_commission) === 2
      ).length,
      pendientes: rows.filter(r => r.status === 'pending').reduce((s, r) => s + Number(r.platform_commission), 0),
    });

    setLoading(false);
  };

  const formatFecha = (iso: string) => {
    return new Date(iso).toLocaleDateString('es-NI', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const badgeStatus = (status: string) => {
    if (status === 'confirmed') return <Badge className="bg-success/15 text-success border-success/30 text-xs" variant="outline">Confirmado</Badge>;
    if (status === 'pending')   return <Badge className="bg-warning/15 text-warning border-warning/30 text-xs" variant="outline">Pendiente</Badge>;
    return <Badge variant="outline" className="text-xs text-destructive">Reembolsado</Badge>;
  };

  const confirmedRows = earnings.filter(r => r.status === 'confirmed');
  const pendingRows   = earnings.filter(r => r.status === 'pending');

  return (
    <div className="min-h-screen bg-background pb-8">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-4">

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </button>

        <h1 className="text-xl font-bold mb-1 text-balance">Mis ganancias</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Comisiones de SaludGO como dueño y administrador
        </p>

        {/* Acceso rápido gestión de pagos */}
        <Card className="mb-5 border-primary/30 cursor-pointer hover:border-primary/60 transition-colors"
          onClick={() => navigate('/admin/payments')}>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <BanknoteIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Gestión de pagos</p>
              <p className="text-xs text-muted-foreground">Confirma cobros y paga a médicos semanalmente</p>
            </div>
            <span className="text-xs text-primary font-medium shrink-0">Abrir →</span>
          </CardContent>
        </Card>

        {/* Tarjetas de resumen */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-12 w-full bg-muted" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className="h-full border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground font-medium">Total ganado</span>
                </div>
                <p className="text-2xl font-bold text-primary">${summary.totalGanancias.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">USD confirmados</p>
              </CardContent>
            </Card>

            <Card className="h-full border-success/20 bg-success/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-xs text-muted-foreground font-medium">Este mes</span>
                </div>
                <p className="text-2xl font-bold text-success">${summary.gananciasMes.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">USD este mes</p>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Stethoscope className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground font-medium">Especialistas</span>
                </div>
                <p className="text-xl font-bold">{summary.totalConsultasEspecialistas}</p>
                <p className="text-xs text-muted-foreground">× $2 c/u</p>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground font-medium">Medicina general</span>
                </div>
                <p className="text-xl font-bold">{summary.totalConsultasGenerales}</p>
                <p className="text-xs text-muted-foreground">× $1 c/u</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pendientes de cobro */}
        {summary.pendientes > 0 && (
          <Card className="mb-5 border-warning/30 bg-warning/5">
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-warning shrink-0" />
              <div>
                <p className="text-sm font-semibold">Ganancias pendientes de confirmación</p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-bold text-warning">${summary.pendientes.toFixed(2)} USD</span> — se confirman cuando el pago es procesado por Stripe
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla de movimientos */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Historial de comisiones
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Tabs defaultValue="confirmados">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="confirmados" className="flex-1">
                  Confirmados ({confirmedRows.length})
                </TabsTrigger>
                <TabsTrigger value="pendientes" className="flex-1">
                  Pendientes ({pendingRows.length})
                </TabsTrigger>
              </TabsList>

              {(['confirmados', 'pendientes'] as const).map(tab => {
                const rows = tab === 'confirmados' ? confirmedRows : pendingRows;
                return (
                  <TabsContent key={tab} value={tab}>
                    {loading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full bg-muted" />
                        ))}
                      </div>
                    ) : rows.length === 0 ? (
                      <div className="text-center py-8">
                        <DollarSign className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {tab === 'confirmados'
                            ? 'Aún no hay ganancias confirmadas'
                            : 'No hay pagos pendientes'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {rows.map(e => (
                          <div key={e.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                              e.service_type === 'consultation' ? 'bg-primary/10' : 'bg-accent/10'
                            }`}>
                              {e.service_type === 'consultation'
                                ? <Stethoscope className="w-4 h-4 text-primary" />
                                : <FileText className="w-4 h-4 text-accent" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {e.service_type === 'consultation'
                                  ? `Consulta — ${e.specialty || 'Medicina General'}`
                                  : 'Interpretación de exámenes'}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatFecha(e.created_at)}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {badgeStatus(e.status)}
                                <span className="text-xs text-muted-foreground">
                                  Total cobrado: ${Number(e.total_amount).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-base font-bold text-primary">
                                +${Number(e.platform_commission).toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">tu comisión</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* Resumen de modelo de negocio */}
        <Card className="mt-4 bg-muted/40">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Tu modelo de comisiones</p>
            <div className="space-y-1">
              {[
                { label: 'Consulta general ($9)', comision: '$1', medico: '$8' },
                { label: 'Consulta especialista ($18)', comision: '$2', medico: '$16' },
                { label: 'Interpretación examen ($7)', comision: '$1', medico: '$6' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between text-xs py-1 border-b border-border last:border-0">
                  <span className="text-foreground">{row.label}</span>
                  <div className="flex gap-3">
                    <span className="text-primary font-bold">Tú: {row.comision}</span>
                    <span className="text-muted-foreground">Médico: {row.medico}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
