import { describe, it, expect } from 'vitest';
import { appState, setUser, setTheme, setLoading } from './store';

describe('App State (better-state)', () => {
  it('sets user, theme, and loading', () => {
    setUser({ id: '1', email: 'a@b.com', name: 'A' });
    setTheme('dark');
    setLoading(true);

    const s = appState.value;
    expect(s.user?.email).toBe('a@b.com');
    expect(s.theme).toBe('dark');
    expect(s.loading).toBe(true);
  });
});
