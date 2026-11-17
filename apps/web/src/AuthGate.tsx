import { useState, type FormEvent, type ReactNode } from 'react';
import { Activity, ArrowRight, LoaderCircle, LockKeyhole } from 'lucide-react';
import { authClient } from './auth';

type AuthUser = { id: string; email: string; name?: string | null };

export default function AuthGate({ children }: { children: (user: AuthUser) => ReactNode }) {
  const { data: session, isPending, error } = authClient.useSession();

  if (isPending) {
    return <div className="grid min-h-screen place-items-center bg-[#080d16] text-slate-300"><div className="flex items-center gap-3 text-sm"><LoaderCircle className="animate-spin" size={18}/> Restoring your LifeOS session…</div></div>;
  }

  if (!session?.user) return <AuthScreen sessionError={error?.message} />;

  return <>{children({ id: session.user.id, email: session.user.email, name: session.user.name })}</>;
}

function AuthScreen({ sessionError }: { sessionError?: string }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(sessionError ?? '');
  const [notice, setNotice] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    setNotice('');
    try {
      const result = mode === 'signup'
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) throw new Error(result.error.message || 'Authentication failed.');
      if (mode === 'signup') setNotice('Your account is ready. Signing you in…');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not complete sign-in.');
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#080d16] px-4 py-10 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(37,99,235,.18),transparent_48%)]"/>
      <section className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-[#101a29]/95 p-6 shadow-2xl sm:p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-blue-300/20 bg-blue-400/10 text-blue-200"><Activity size={24}/></div>
          <div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-blue-300">Personal operating system</p><h1 className="text-2xl font-black">LifeOS<span className="text-amber-400">.</span></h1></div>
        </div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-amber-300">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</p>
        <h2 className="mt-2 text-2xl font-bold">{mode === 'signin' ? 'Pick up where you left off.' : 'A calmer way to stay on top of life.'}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">Your account keeps your LifeOS workspace separate from other people using this browser.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === 'signup' && <label className="block text-xs font-medium text-slate-400">Name<input autoComplete="name" required value={name} onChange={event=>setName(event.target.value)} className="mt-1.5 min-h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none focus:border-blue-400/60" placeholder="Your name"/></label>}
          <label className="block text-xs font-medium text-slate-400">Email<input type="email" autoComplete="email" required value={email} onChange={event=>setEmail(event.target.value)} className="mt-1.5 min-h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none focus:border-blue-400/60" placeholder="you@example.com"/></label>
          <label className="block text-xs font-medium text-slate-400">Password<input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} required value={password} onChange={event=>setPassword(event.target.value)} className="mt-1.5 min-h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none focus:border-blue-400/60" placeholder="At least 8 characters"/></label>
          {error && <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}
          {notice && <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">{notice}</p>}
          <button disabled={pending} type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 text-sm font-bold text-slate-950 disabled:cursor-wait disabled:opacity-60">{pending ? <LoaderCircle size={17} className="animate-spin"/> : <LockKeyhole size={16}/>} {mode === 'signin' ? 'Sign in securely' : 'Create account'} {!pending&&<ArrowRight size={16}/>}</button>
        </form>
        <div className="mt-6 border-t border-white/[.07] pt-5 text-center text-sm text-slate-400">
          {mode === 'signin' ? "New to LifeOS?" : 'Already have an account?'}{' '}
          <button onClick={()=>{setMode(mode==='signin'?'signup':'signin');setError('');setNotice('');}} className="font-semibold text-blue-300 hover:text-blue-200">{mode === 'signin' ? 'Create an account' : 'Sign in'}</button>
        </div>
        <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-500">Authentication is managed by Neon. Your current workspace is stored locally in this browser and is not yet synced across devices.</p>
      </section>
    </main>
  );
}
