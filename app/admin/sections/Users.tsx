'use client'
import { useState } from 'react'
import { USERS, type UserRole } from '../data'

const COLS = 'grid grid-cols-[minmax(220px,2fr)_150px_110px_110px_110px] gap-3 border-b border-line px-4 py-2.5'

export function Users() {
  const [users, setUsers] = useState(() => USERS.map(u => ({ ...u, banned: false })))
  const patch = (i: number, p: Partial<(typeof users)[number]>) => setUsers(us => us.map((u, j) => (j === i ? { ...u, ...p } : u)))

  return (
    <div className="overflow-x-auto rounded-[14px] border border-line bg-surface">
      <div className="min-w-[760px]">
        <div className={`${COLS} text-[11px] font-bold text-ink-3`}><span>Pengguna</span><span>Role</span><span>Langganan</span><span>Bergabung</span><span>Status</span></div>
        {users.map((u, i) => (
          <div key={u.email} className={`${COLS} items-center`}>
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="grid size-[34px] flex-none place-items-center rounded-full bg-surface-2 text-xs font-extrabold text-ink-2">{u.name[0].toUpperCase()}</div>
              <div className="min-w-0"><div className="text-sm font-bold">{u.name}</div><div className="truncate text-xs text-ink-3">{u.email}</div></div>
            </div>
            <select value={u.role} onChange={e => patch(i, { role: e.target.value as UserRole })} className="h-[34px] rounded-lg border border-line bg-bg px-2 text-[13px] text-ink">
              {['Pembaca', 'Uploader', 'Editor', 'Admin'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <span className={`text-xs font-bold ${u.sub === 'Premium' ? 'text-accent-text' : 'text-ink-3'}`}>{u.sub}</span>
            <span className="font-mono text-xs text-ink-3">{u.joined}</span>
            <button onClick={() => patch(i, { banned: !u.banned })} className={`h-[30px] cursor-pointer rounded-lg border border-line bg-bg text-xs font-bold ${u.banned ? 'text-danger' : 'text-ok'}`}>{u.banned ? 'Diblokir' : 'Aktif'}</button>
          </div>
        ))}
      </div>
    </div>
  )
}
