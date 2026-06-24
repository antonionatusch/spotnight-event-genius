import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { PasswordGate } from '@/components/PasswordGate';
import { OWNER_DEMO_PASSWORD } from '@/lib/demo-access';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/owner/events/new')({
  component: NewEvent,
});

function NewEvent() {
  return (
    <PasswordGate
      storageKey="owner"
      title="Panel propietario"
      subtitle="Ingresá la clave para crear eventos desde el panel del boliche."
      password={OWNER_DEMO_PASSWORD}
    >
      <NewEventContent />
    </PasswordGate>
  );
}

function NewEventContent() {
  const setRole = useStore((s) => s.setRole);
  const addEvent = useStore((s) => s.addEvent);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    date: '',
    start: '22:00',
    end: '04:00',
    description: '',
    imageUrl: '',
    location: '',
    priceGen: 80,
    capGen: 200,
    priceVip: 200,
    capVip: 20,
    priceMesa: 500,
    capMesa: 10,
  });
  const f =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: e.target.type === 'number' ? +e.target.value : e.target.value });

  useEffect(() => {
    setRole('owner');
  }, [setRole]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEvent({
      id: crypto.randomUUID(),
      name: form.name || 'Nuevo evento',
      venueName: 'SpotNight Club',
      date: form.date || 'Sáb 14 Jun',
      startTime: form.start,
      endTime: form.end,
      location: form.location || 'Equipetrol',
      description: form.description || 'Evento nocturno.',
      imageUrl:
        form.imageUrl || 'https://images.unsplash.com/photo-1571266028243-d220bc562b09?w=1200&q=80',
      status: 'active',
      ticketTypes: [
        {
          id: 't1',
          name: 'General',
          price: form.priceGen,
          capacity: form.capGen,
          available: form.capGen,
        },
        {
          id: 't2',
          name: 'VIP',
          price: form.priceVip,
          capacity: form.capVip,
          available: form.capVip,
        },
        {
          id: 't3',
          name: 'Mesa',
          price: form.priceMesa,
          capacity: form.capMesa,
          available: form.capMesa,
        },
      ],
    });
    toast.success('Evento creado');
    navigate({ to: '/owner/dashboard' });
  };

  const input =
    'w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary';
  const label = 'text-[11px] font-bold tracking-widest text-muted-foreground';

  return (
    <div className="px-4 py-4">
      <header className="mb-4 flex items-center gap-3">
        <Link
          to="/owner/dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold">Crear evento</h1>
      </header>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <p className={label}>NOMBRE</p>
          <input
            className={input}
            value={form.name}
            onChange={f('name')}
            placeholder="Neon Friday"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className={label}>FECHA</p>
            <input
              className={input}
              value={form.date}
              onChange={f('date')}
              placeholder="Sáb 14 Jun"
            />
          </div>
          <div>
            <p className={label}>UBICACIÓN</p>
            <input
              className={input}
              value={form.location}
              onChange={f('location')}
              placeholder="Equipetrol"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className={label}>INICIO</p>
            <input className={input} value={form.start} onChange={f('start')} />
          </div>
          <div>
            <p className={label}>FIN</p>
            <input className={input} value={form.end} onChange={f('end')} />
          </div>
        </div>
        <div>
          <p className={label}>DESCRIPCIÓN</p>
          <textarea
            className={input + ' min-h-20'}
            value={form.description}
            onChange={f('description')}
          />
        </div>
        <div>
          <p className={label}>IMAGEN URL</p>
          <input className={input} value={form.imageUrl} onChange={f('imageUrl')} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-3 space-y-3">
          <p className="text-xs font-bold tracking-widest text-primary">TICKETS</p>
          {(['Gen', 'Vip', 'Mesa'] as const).map((kind) => (
            <div key={kind} className="grid grid-cols-2 gap-2">
              <div>
                <p className={label}>PRECIO {kind.toUpperCase()}</p>
                <input
                  type="number"
                  className={input}
                  value={form[`price${kind}` as keyof typeof form] as number}
                  onChange={f(`price${kind}` as keyof typeof form)}
                />
              </div>
              <div>
                <p className={label}>CUPOS {kind.toUpperCase()}</p>
                <input
                  type="number"
                  className={input}
                  value={form[`cap${kind}` as keyof typeof form] as number}
                  onChange={f(`cap${kind}` as keyof typeof form)}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl gradient-primary py-3.5 text-sm font-bold text-white glow-primary"
        >
          Crear evento
        </button>
      </form>
    </div>
  );
}
