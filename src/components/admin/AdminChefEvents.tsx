import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, ChefHat, Clock, Users, Eye, Image, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChefEvent {
  id: string;
  title: string;
  description: string | null;
  chef_name: string;
  chef_avatar_url: string | null;
  twitch_url: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  ingredients: any[];
  utensils: any[];
  rules: string | null;
  evaluation_criteria: string | null;
  cover_image_url: string | null;
  final_dish_image_url: string | null;
  energy_reward: number;
  created_at: string;
}

interface ChefStep {
  id?: string;
  step_number: number;
  title: string;
  description: string;
  duration_seconds: number;
  photo_required: boolean;
  reference_image_url: string;
  tips: string;
}

const defaultFormData = {
  title: '',
  description: '',
  chef_name: '',
  chef_avatar_url: '',
  twitch_url: '',
  scheduled_at: '',
  duration_minutes: 60,
  status: 'draft',
  ingredients: [] as string[],
  utensils: [] as string[],
  rules: '',
  evaluation_criteria: '',
  cover_image_url: '',
  final_dish_image_url: '',
  energy_reward: 50,
};

const defaultStep: ChefStep = {
  step_number: 1,
  title: '',
  description: '',
  duration_seconds: 300,
  photo_required: false,
  reference_image_url: '',
  tips: '',
};

export const AdminChefEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<ChefEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stepsDialogOpen, setStepsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChefEvent | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [steps, setSteps] = useState<ChefStep[]>([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [utensilInput, setUtensilInput] = useState('');
  const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('chef_events')
      .select('*')
      .order('scheduled_at', { ascending: false });
    setEvents((data || []) as unknown as ChefEvent[]);
    setLoading(false);
  };

  const openCreate = () => {
    setEditingEvent(null);
    setFormData(defaultFormData);
    setDialogOpen(true);
  };

  const openEdit = (event: ChefEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      chef_name: event.chef_name,
      chef_avatar_url: event.chef_avatar_url || '',
      twitch_url: event.twitch_url,
      scheduled_at: event.scheduled_at ? new Date(event.scheduled_at).toISOString().slice(0, 16) : '',
      duration_minutes: event.duration_minutes,
      status: event.status,
      ingredients: Array.isArray(event.ingredients) ? event.ingredients : [],
      utensils: Array.isArray(event.utensils) ? event.utensils : [],
      rules: event.rules || '',
      evaluation_criteria: event.evaluation_criteria || '',
      cover_image_url: event.cover_image_url || '',
      final_dish_image_url: event.final_dish_image_url || '',
      energy_reward: event.energy_reward,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.chef_name || !formData.twitch_url || !formData.scheduled_at) {
      toast({ title: 'Completa los campos obligatorios', variant: 'destructive' });
      return;
    }

    const payload = {
      ...formData,
      scheduled_at: new Date(formData.scheduled_at).toISOString(),
      ingredients: formData.ingredients,
      utensils: formData.utensils,
      created_by: user?.id,
    };

    if (editingEvent) {
      const { error } = await supabase.from('chef_events').update(payload).eq('id', editingEvent.id);
      if (error) toast({ title: 'Error al actualizar', variant: 'destructive' });
      else toast({ title: 'Evento actualizado ✓' });
    } else {
      const { error } = await supabase.from('chef_events').insert(payload);
      if (error) toast({ title: 'Error al crear', variant: 'destructive' });
      else toast({ title: 'Evento creado ✓' });
    }

    setDialogOpen(false);
    fetchEvents();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('chef_events').delete().eq('id', id);
    toast({ title: 'Evento eliminado' });
    fetchEvents();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from('chef_events').update({ status }).eq('id', id);
    fetchEvents();
  };

  // Steps management
  const openSteps = async (eventId: string) => {
    setSelectedEventId(eventId);
    const { data } = await supabase
      .from('chef_event_steps')
      .select('*')
      .eq('event_id', eventId)
      .order('step_number', { ascending: true });
    setSteps((data || []).map((s: any) => ({
      id: s.id,
      step_number: s.step_number,
      title: s.title,
      description: s.description || '',
      duration_seconds: s.duration_seconds,
      photo_required: s.photo_required,
      reference_image_url: s.reference_image_url || '',
      tips: s.tips || '',
    })));
    setStepsDialogOpen(true);
  };

  const addStep = () => {
    setSteps(prev => [...prev, { ...defaultStep, step_number: prev.length + 1 }]);
  };

  const removeStep = (index: number) => {
    setSteps(prev => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_number: i + 1 })));
  };

  const updateStep = (index: number, field: keyof ChefStep, value: any) => {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleUploadReferenceImage = async (index: number, file: File) => {
    if (!selectedEventId) return;
    const ext = file.name.split('.').pop();
    const path = `events/${selectedEventId}/steps/${index + 1}-ref.${ext}`;
    const { error } = await supabase.storage.from('chef-events').upload(path, file, { upsert: true });
    if (error) {
      toast({ title: 'Error al subir imagen', variant: 'destructive' });
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('chef-events').getPublicUrl(path);
    updateStep(index, 'reference_image_url', publicUrl);
  };

  const saveSteps = async () => {
    if (!selectedEventId) return;
    // Delete existing then re-insert
    await supabase.from('chef_event_steps').delete().eq('event_id', selectedEventId);
    
    const stepsData = steps.map(s => ({
      event_id: selectedEventId,
      step_number: s.step_number,
      title: s.title,
      description: s.description || null,
      duration_seconds: s.duration_seconds,
      photo_required: s.photo_required,
      reference_image_url: s.reference_image_url || null,
      tips: s.tips || null,
    }));

    if (stepsData.length > 0) {
      const { error } = await supabase.from('chef_event_steps').insert(stepsData);
      if (error) { toast({ title: 'Error guardando pasos', variant: 'destructive' }); return; }
    }
    toast({ title: `${stepsData.length} pasos guardados ✓` });
    setStepsDialogOpen(false);
  };

  // View submissions
  const openSubmissions = async (eventId: string) => {
    const { data: participants } = await supabase
      .from('chef_event_participants')
      .select('*')
      .eq('event_id', eventId);
    
    if (participants && participants.length > 0) {
      const enriched = await Promise.all(
        (participants as any[]).map(async (p) => {
          const { data: profile } = await supabase.from('profiles').select('display_name, avatar_url, email').eq('user_id', p.user_id).maybeSingle();
          const { data: subs } = await supabase.from('chef_step_submissions').select('*').eq('participant_id', p.id);
          return { ...p, profile, submissions: subs || [] };
        })
      );
      setSubmissions(enriched);
    } else {
      setSubmissions([]);
    }
    setSubmissionsDialogOpen(true);
  };

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, ingredientInput.trim()] }));
      setIngredientInput('');
    }
  };

  const addUtensil = () => {
    if (utensilInput.trim()) {
      setFormData(prev => ({ ...prev, utensils: [...prev.utensils, utensilInput.trim()] }));
      setUtensilInput('');
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'draft': return 'secondary';
      case 'published': return 'default';
      case 'live': return 'destructive';
      case 'finished': return 'outline';
      default: return 'secondary';
    }
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case 'draft': return 'Borrador';
      case 'published': return 'Publicado';
      case 'live': return '🔴 EN DIRECTO';
      case 'finished': return 'Finalizado';
      default: return s;
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Clock className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-unbounded text-xl font-bold">Sigue al Chef</h2>
          <p className="text-sm text-muted-foreground">Crea y gestiona eventos de cocina en directo</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Nuevo evento
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ChefHat className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No hay eventos creados aún</p>
            <Button onClick={openCreate} variant="outline" className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Crear primer evento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map(event => (
            <Card key={event.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Cover */}
                  {event.cover_image_url && (
                    <div className="w-full md:w-48 h-32 md:h-auto flex-shrink-0">
                      <img src={event.cover_image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-unbounded font-bold text-lg">{event.title}</h3>
                          <Badge variant={statusColor(event.status)}>{statusLabel(event.status)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <ChefHat className="w-3.5 h-3.5" /> {event.chef_name}
                          <span className="mx-1">·</span>
                          <Clock className="w-3.5 h-3.5" /> {event.duration_minutes} min
                          <span className="mx-1">·</span>
                          {format(new Date(event.scheduled_at), "d MMM yyyy, HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Select value={event.status} onValueChange={(v) => handleStatusChange(event.id, v)}>
                        <SelectTrigger className="w-36 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Borrador</SelectItem>
                          <SelectItem value="published">Publicado</SelectItem>
                          <SelectItem value="live">En directo</SelectItem>
                          <SelectItem value="finished">Finalizado</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openSteps(event.id)}>
                        <GripVertical className="w-3.5 h-3.5" /> Pasos
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openSubmissions(event.id)}>
                        <Users className="w-3.5 h-3.5" /> Entregas
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => openEdit(event)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive gap-1.5" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE/EDIT EVENT DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-unbounded">
              {editingEvent ? 'Editar evento' : 'Nuevo evento "Sigue al Chef"'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Título del evento *</Label>
                <Input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="Ej: Paella Valenciana con Chef García" />
              </div>
              <div>
                <Label>Chef / Influencer *</Label>
                <Input value={formData.chef_name} onChange={e => setFormData(p => ({ ...p, chef_name: e.target.value }))} placeholder="Nombre del chef" />
              </div>
              <div>
                <Label>URL Twitch *</Label>
                <Input value={formData.twitch_url} onChange={e => setFormData(p => ({ ...p, twitch_url: e.target.value }))} placeholder="https://twitch.tv/canal" />
              </div>
              <div>
                <Label>Fecha y hora *</Label>
                <Input type="datetime-local" value={formData.scheduled_at} onChange={e => setFormData(p => ({ ...p, scheduled_at: e.target.value }))} />
              </div>
              <div>
                <Label>Duración (min)</Label>
                <Input type="number" value={formData.duration_minutes} onChange={e => setFormData(p => ({ ...p, duration_minutes: parseInt(e.target.value) || 60 }))} />
              </div>
              <div>
                <Label>Puntos de energía</Label>
                <Input type="number" value={formData.energy_reward} onChange={e => setFormData(p => ({ ...p, energy_reward: parseInt(e.target.value) || 50 }))} />
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="live">En directo</SelectItem>
                    <SelectItem value="finished">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Descripción</Label>
              <Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} />
            </div>

            <div>
              <Label>URL imagen de portada</Label>
              <Input value={formData.cover_image_url} onChange={e => setFormData(p => ({ ...p, cover_image_url: e.target.value }))} placeholder="https://..." />
            </div>

            <div>
              <Label>URL imagen plato final (referencia para IA)</Label>
              <Input value={formData.final_dish_image_url} onChange={e => setFormData(p => ({ ...p, final_dish_image_url: e.target.value }))} placeholder="https://..." />
            </div>

            {/* Ingredients */}
            <div>
              <Label>Ingredientes</Label>
              <div className="flex gap-2 mb-2">
                <Input value={ingredientInput} onChange={e => setIngredientInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addIngredient())} placeholder="Añadir ingrediente..." />
                <Button type="button" size="sm" variant="outline" onClick={addIngredient}>+</Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.ingredients.map((ing, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setFormData(p => ({ ...p, ingredients: p.ingredients.filter((_, j) => j !== i) }))}>
                    {ing} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Utensils */}
            <div>
              <Label>Utensilios</Label>
              <div className="flex gap-2 mb-2">
                <Input value={utensilInput} onChange={e => setUtensilInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUtensil())} placeholder="Añadir utensilio..." />
                <Button type="button" size="sm" variant="outline" onClick={addUtensil}>+</Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.utensils.map((ut, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 cursor-pointer" onClick={() => setFormData(p => ({ ...p, utensils: p.utensils.filter((_, j) => j !== i) }))}>
                    {ut} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Reglas</Label>
              <Textarea value={formData.rules} onChange={e => setFormData(p => ({ ...p, rules: e.target.value }))} rows={2} placeholder="Normas del reto..." />
            </div>

            <div>
              <Label>Criterios de evaluación</Label>
              <Textarea value={formData.evaluation_criteria} onChange={e => setFormData(p => ({ ...p, evaluation_criteria: e.target.value }))} rows={2} placeholder="Qué se va a valorar..." />
            </div>

            <Button onClick={handleSave} className="w-full">
              {editingEvent ? 'Guardar cambios' : 'Crear evento'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* STEPS DIALOG */}
      <Dialog open={stepsDialogOpen} onOpenChange={setStepsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-unbounded">Gestionar pasos de la receta</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {steps.map((step, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-unbounded">Paso {step.step_number}</Badge>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeStep(i)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Input value={step.title} onChange={e => updateStep(i, 'title', e.target.value)} placeholder="Nombre del paso" />
                    </div>
                    <div className="col-span-2">
                      <Textarea value={step.description} onChange={e => updateStep(i, 'description', e.target.value)} placeholder="Descripción / instrucciones" rows={2} />
                    </div>
                    <div>
                      <Label className="text-xs">Duración (seg)</Label>
                      <Input type="number" value={step.duration_seconds} onChange={e => updateStep(i, 'duration_seconds', parseInt(e.target.value) || 300)} />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <Switch checked={step.photo_required} onCheckedChange={v => updateStep(i, 'photo_required', v)} />
                      <Label className="text-sm">Foto obligatoria</Label>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Imagen de referencia</Label>
                      <div className="flex gap-2 items-center">
                        <Input value={step.reference_image_url} onChange={e => updateStep(i, 'reference_image_url', e.target.value)} placeholder="URL o sube una imagen" className="flex-1" />
                        <label className="cursor-pointer">
                          <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUploadReferenceImage(i, e.target.files[0])} />
                          <Button type="button" size="sm" variant="outline" asChild><span><Image className="w-4 h-4" /></span></Button>
                        </label>
                      </div>
                      {step.reference_image_url && (
                        <img src={step.reference_image_url} alt="" className="mt-2 h-20 rounded-lg object-cover" />
                      )}
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Tips / Consejos</Label>
                      <Input value={step.tips} onChange={e => updateStep(i, 'tips', e.target.value)} placeholder="Ej: Cuidado con la temperatura del aceite" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" className="w-full gap-2" onClick={addStep}>
              <Plus className="w-4 h-4" /> Añadir paso
            </Button>

            <Button className="w-full" onClick={saveSteps}>
              Guardar {steps.length} paso{steps.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SUBMISSIONS/PARTICIPANTS DIALOG */}
      <Dialog open={submissionsDialogOpen} onOpenChange={setSubmissionsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-unbounded">Participantes y entregas</DialogTitle>
          </DialogHeader>
          
          {submissions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aún no hay participantes</p>
          ) : (
            <div className="space-y-4">
              {submissions.map((p: any) => (
                <Card key={p.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        {p.profile?.display_name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{p.profile?.display_name || 'Sin nombre'}</p>
                        <p className="text-xs text-muted-foreground">{p.profile?.email}</p>
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        Paso {p.current_step} · {p.status}
                      </Badge>
                    </div>
                    {p.submissions.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {p.submissions.map((s: any) => (
                          <div key={s.id} className="relative">
                            {s.photo_url && (
                              <img src={s.photo_url} alt="" className="w-full aspect-square rounded-lg object-cover" />
                            )}
                            <Badge className="absolute bottom-1 right-1 text-[10px]" variant={s.status === 'evaluated' ? 'default' : 'secondary'}>
                              {s.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
