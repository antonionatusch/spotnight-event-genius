import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { LockKeyhole } from 'lucide-react';

const unlockedDemoAccess = new Set<string>();

type PasswordGateProps = {
  storageKey: string;
  title: string;
  subtitle: string;
  password: string;
  children: ReactNode;
};

export function PasswordGate({
  storageKey,
  title,
  subtitle,
  password,
  children,
}: PasswordGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setUnlocked(unlockedDemoAccess.has(storageKey));
  }, [storageKey]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (value.trim() !== password) {
      setError('Contraseña incorrecta');
      return;
    }

    unlockedDemoAccess.add(storageKey);
    setError('');
    setUnlocked(true);
  };

  if (unlocked) return <>{children}</>;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-2xl"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary glow-primary">
          <LockKeyhole className="h-7 w-7 text-white" />
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs font-black tracking-widest text-primary">ACCESO DEMO</p>
          <h1 className="mt-1 text-2xl font-black">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="mt-5 space-y-2">
          <label
            className="text-[11px] font-bold tracking-widest text-muted-foreground"
            htmlFor={`${storageKey}-password`}
          >
            CONTRASEÑA
          </label>
          <input
            id={`${storageKey}-password`}
            type="password"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="w-full rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary"
            placeholder="Ingresá la clave de demo"
            autoComplete="off"
          />
          {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
        </div>

        <button
          type="submit"
          className="mt-5 w-full rounded-2xl gradient-primary py-3 text-sm font-bold text-white glow-primary"
        >
          Entrar
        </button>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Clave documentada en el README del proyecto.
        </p>
      </form>
    </main>
  );
}
