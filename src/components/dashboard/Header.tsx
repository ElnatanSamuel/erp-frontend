'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '../../utils/authClient';
import { logout, initialsOf } from '../../state/auth';

export default function Header({ title, subtitle, icon }: { title?: string; subtitle?: string; icon?: React.ReactNode }) {
  const today = new Date();
  const dateStr = today.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  async function onLogout() {
    setOpen(false);
    await logout();
    // Force a full page reload to clear all state
    if (typeof window !== 'undefined') {
      window.location.replace('/auth/login');
    }
  }

  return (
    <header className="flex items-center justify-between relative">
      <div>
        {title ? (
          <div>
            <div className="flex items-center gap-2 text-blue-600">
              {icon ?? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
              )}
              <h1 className="text-lg sm:text-xl font-semibold">{title}</h1>
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        ) : (
          <Welcome dateStr={dateStr} />
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          className="relative h-9 w-9 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          aria-label="Notifications"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12 22a2 2 0 002-2H10a2 2 0 002 2zM18 16v-5a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z" />
          </svg>
        </button>

        <div className="flex items-center gap-3" ref={menuRef}>
          <UserBadge />
          <button
            onClick={() => setOpen((v) => !v)}
            className="h-8 w-8 grid place-items-center rounded-md hover:bg-gray-100"
            aria-label="Open user menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-400" fill="currentColor">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 top-14 w-48 bg-white rounded-xl shadow-lg border border-gray-100 p-2">
              <MenuItem icon={LogoutIcon} label="Logout" onClick={onLogout} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Welcome({ dateStr }: { dateStr: string }) {
  const [name, setName] = useState('User');
  
  useEffect(() => {
    authClient.getMe().then(({ data }) => {
      const userName = data?.user?.name || 'User';
      setName(userName);
    }).catch(() => {});
  }, []);
  
  return (
    <div>
      <h1 className="text-[22px] sm:text-2xl font-semibold text-gray-900">
        Welcome, {name} <span className="align-middle">👋</span>
      </h1>
      <p className="text-xs sm:text-sm text-gray-500">Today is {dateStr}</p>
    </div>
  );
}

function UserBadge() {
  const [name, setName] = useState('User');
  const initials = initialsOf(name);
  
  useEffect(() => {
    authClient.getMe().then(({ data }) => {
      const userName = data?.user?.name || 'User';
      setName(userName);
    }).catch(() => {});
  }, []);
  
  return (
    <>
      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white grid place-items-center text-sm font-semibold">
        {initials}
      </div>
      <div className="hidden sm:block leading-tight">
        <div className="text-sm font-medium text-gray-900">{name}</div>
        <div className="text-xs text-gray-500">HR Office</div>
      </div>
    </>
  );
}

function MenuItem({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-50 text-gray-800">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

function UserIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
    </svg>
  );
}
function SettingsIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.14 12.94a7.48 7.48 0 000-1.88l2.03-1.58a.5.5 0 00.12-.64l-1.92-3.32a.5.5 0 00-.6-.22l-2.39.96a7.5 7.5 0 00-1.63-.94l-.36-2.54a.5.5 0 00-.5-.42h-3.84a.5.5 0 00-.5.42L8.85 3.52c-.57.23-1.11.53-1.63.94l-2.39-.96a.5.5 0 00-.6.22L2.31 7.04a.5.5 0 00.12.64l2.03 1.58c-.05.31-.08.62-.08.94s.03.63.08.94l-2.03 1.58a.5.5 0 00-.12.64l1.92 3.32c.14.24.43.34.68.22l2.39-.96c.52.41 1.06.71 1.63.94l.36 2.54c.05.25.26.42.5.42h3.84c.24 0 .45-.17.5-.42l.36-2.54c.57-.23 1.11-.53 1.63-.94l2.39.96c.25.12.54.02.68-.22l1.92-3.32a.5.5 0 00-.12-.64l-2.03-1.58zM12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" />
    </svg>
  );
}
function LogoutIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M10 17l1.41-1.41L8.83 13H20v-2H8.83l2.58-2.59L10 7l-5 5 5 5zM4 5h6V3H4a2 2 0 00-2 2v14a2 2 0 002 2h6v-2H4V5z" />
    </svg>
  );
}
