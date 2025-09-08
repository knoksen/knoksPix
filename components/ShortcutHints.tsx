import React, { useState } from 'react';

const shortcuts = [
  { keys: 'Ctrl + Z', action: 'Undo last edit' },
  { keys: 'Ctrl + Y', action: 'Redo edit' },
  { keys: 'Ctrl + S', action: 'Download current image' },
];

const ShortcutHints: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button onClick={() => setOpen(o=>!o)} className="px-3 py-2 text-xs font-semibold rounded-md bg-gray-800/70 border border-gray-600 text-gray-200 hover:bg-gray-700/70 backdrop-blur shadow">
        {open ? 'Hide Shortcuts' : 'Shortcuts'}
      </button>
      {open && (
        <div className="mt-2 w-64 p-4 rounded-lg bg-gray-900/80 border border-gray-700 text-gray-100 text-xs space-y-2 shadow-lg animate-fade-in backdrop-blur">
          <h4 className="font-semibold text-gray-200 text-sm">Keyboard Shortcuts</h4>
          <ul className="space-y-1">
            {shortcuts.map(s => (
              <li key={s.keys} className="flex justify-between gap-2">
                <span className="text-gray-400">{s.action}</span>
                <span className="font-mono bg-gray-700/60 px-1 rounded text-gray-100">{s.keys}</span>
              </li>
            ))}
          </ul>
          <p className="pt-1 text-[10px] text-gray-500">More coming soon</p>
        </div>
      )}
    </div>
  );
};

export default ShortcutHints;