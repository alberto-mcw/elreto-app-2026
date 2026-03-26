import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, ChefHat, Zap, MapPin, Mail, Calendar, ShieldCheck, Ban } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  alias: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  total_energy: number;
  banned_at: string | null;
  created_at: string;
}

const AdminUserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [points, setPoints] = useState('');
  const [concept, setConcept] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const [{ data: prof }, { data: roles }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, user_id, display_name, alias, email, avatar_url, bio, city, country, total_energy, banned_at, created_at')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId),
      ]);
      setProfile(prof ?? null);
      setIsAdmin(roles?.some(r => r.role === 'admin') ?? false);
      setLoading(false);
    };
    load();
  }, [userId]);

  const handleAssign = async () => {
    const amount = parseInt(points, 10);
    if (!amount || amount < 1 || amount > 10000) {
      toast.error('Introduce un número de puntos válido (1–10000)');
      return;
    }
    if (!concept.trim()) {
      toast.error('El concepto no puede estar vacío');
      return;
    }
    setAssigning(true);
    const { error } = await supabase.rpc('admin_assign_points', {
      p_target_user_id: userId,
      p_amount: amount,
      p_concept: concept.trim(),
    } as any);
    setAssigning(false);
    if (error) {
      toast.error(`Error al asignar puntos: ${error.message}`);
      return;
    }
    toast.success(`✅ ${amount.toLocaleString()} puntos asignados a ${profile?.display_name ?? 'usuario'}`);
    setPoints('');
    setConcept('');
    // Refresh energy display
    setProfile(prev => prev ? { ...prev, total_energy: prev.total_energy + amount } : prev);
  };

  const avatarIsEmoji = profile?.avatar_url && !profile.avatar_url.startsWith('http');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate('/admin/usuarios')}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a usuarios
        </Button>

        {loading && (
          <p className="text-muted-foreground text-center py-16">Cargando perfil…</p>
        )}

        {!loading && !profile && (
          <p className="text-destructive text-center py-16">Usuario no encontrado.</p>
        )}

        {!loading && profile && (
          <div className="space-y-6">
            {/* Profile card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl overflow-hidden">
                    {avatarIsEmoji ? (
                      <span>{profile.avatar_url}</span>
                    ) : profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <ChefHat className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold truncate">{profile.display_name ?? '—'}</h1>
                      {profile.alias && (
                        <span className="text-sm text-muted-foreground">@{profile.alias}</span>
                      )}
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      )}
                      {profile.banned_at && (
                        <span className="inline-flex items-center gap-1 text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                          <Ban className="w-3 h-3" /> Baneado
                        </span>
                      )}
                    </div>
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{profile.bio}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <span className="font-semibold text-foreground">{profile.total_energy.toLocaleString()}</span>
                    <span>puntos</span>
                  </div>
                  {(profile.city || profile.country) && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{[profile.city, profile.country].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  {profile.email && (
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{profile.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>Registrado el {new Date(profile.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assign points form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Asignar puntos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="points">Puntos a asignar</Label>
                  <Input
                    id="points"
                    type="number"
                    min={1}
                    max={10000}
                    placeholder="Ej: 50"
                    value={points}
                    onChange={e => setPoints(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="concept">Concepto</Label>
                  <Input
                    id="concept"
                    type="text"
                    maxLength={120}
                    placeholder="Ej: Premio por participación especial…"
                    value={concept}
                    onChange={e => setConcept(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleAssign}
                  disabled={assigning || !points || !concept.trim()}
                >
                  {assigning ? 'Asignando…' : 'Asignar puntos'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminUserProfile;
