import { useEffect } from 'react';

interface HotkeyConfig {
  combo: string;              // e.g. 'ctrl+z'
  handler: (e: KeyboardEvent) => void;
  preventDefault?: boolean;
}

const match = (e: KeyboardEvent, combo: string) => {
  const parts = combo.toLowerCase().split('+').map(p => p.trim());
  const key = e.key.toLowerCase();
  const wantCtrl = parts.includes('ctrl');
  const wantShift = parts.includes('shift');
  const wantAlt = parts.includes('alt');
  const wantMeta = parts.includes('meta');
  const main = parts.find(p => !['ctrl','shift','alt','meta'].includes(p));
  return (!!main && main === key) &&
    (!!wantCtrl === e.ctrlKey) &&
    (!!wantShift === e.shiftKey) &&
    (!!wantAlt === e.altKey) &&
    (!!wantMeta === e.metaKey);
};

export function useHotkeys(hotkeys: HotkeyConfig[]) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      for (const hk of hotkeys) {
        if (match(e, hk.combo)) {
          if (hk.preventDefault) e.preventDefault();
          hk.handler(e);
          break;
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hotkeys]);
}
