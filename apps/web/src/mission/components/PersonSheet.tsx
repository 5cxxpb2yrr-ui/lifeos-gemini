import { useState } from 'react';
import { CaptureChips } from './CaptureChips';
import { findPerson, parseCap } from '../lib/capture';
import { daysUntil } from '../lib/dates';
import type { Nav } from '../nav';
import { useStore } from '../store';
import type { PersonRec } from '../types';
import { btn, btnP, field, lbl, row } from '../ui';

export function PersonSheet({ person, nav }: { person: PersonRec; nav: Nav }) {
  const { inbox, archive, data, logContact, savePerson } = useStore();
  const [phone, setPhone] = useState(person.phone ?? '');
  const [freq, setFreq] = useState(String(person.frequencyDays ?? ''));
  const g = person.lastContact ? -daysUntil(person.lastContact) : null;
  const first = person.name.split(' ')[0];
  const mentions = [...inbox, ...archive].filter((t) => parseCap(t).people.some((w) => findPerson(w, data.people)?.id === person.id));
  return (
    <div>
      <h2 className="text-xl font-semibold">{person.name}</h2>
      <p className="text-sm text-[var(--text-2)]">{person.relationship || 'No relationship set'} · {g === null ? 'No contact logged' : `${g} days since contact`}{person.frequencyDays ? ` · goal every ${person.frequencyDays} days` : ''}</p>
      {person.phone && <div className="mt-3 flex gap-2"><a className={`${btnP} grid flex-1 place-items-center`} href={`tel:${person.phone}`}>Call</a><a className={`${btn} grid flex-1 place-items-center`} href={`sms:${person.phone}`}>Text</a></div>}
      <h4 className={lbl}>Phone</h4><input className={field} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <h4 className={lbl}>Contact every (days)</h4><input className={field} type="number" inputMode="numeric" value={freq} onChange={(e) => setFreq(e.target.value)} placeholder="e.g. 14" />
      <h4 className={lbl}>Captures mentioning {first}</h4>
      {mentions.length ? mentions.map((t, i) => <div key={i} className={row}><span>{parseCap(t).text || t}<CaptureChips parsed={parseCap(t)} people={data.people} /></span></div>) : <p className="text-sm text-[var(--text-2)]">None yet. Try @{first} in Capture.</p>}
      <div className="mt-3 flex gap-2">
        <button onClick={() => logContact(person.id)} className={`${btnP} flex-1`}>Log contact today</button>
        <button onClick={() => savePerson(person.id, { phone: phone.trim() || undefined, frequencyDays: Number(freq) || undefined })} className={`${btn} flex-1`}>Save</button>
      </div>
      <button onClick={nav.pop} className={`${btn} mt-2 w-full`}>‹ Back</button>
    </div>
  );
}
