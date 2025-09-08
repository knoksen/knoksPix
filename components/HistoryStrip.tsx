import React from 'react';

interface HistoryStripProps {
  items: File[];
  activeIndex: number;
  onJump: (idx: number) => void;
}

const HistoryStrip: React.FC<HistoryStripProps> = ({ items, activeIndex, onJump }) => {
  if (!items.length) return null;
  return (
    <div className="flex gap-2 overflow-x-auto py-2 px-2 bg-gray-900/40 rounded-lg border border-gray-700/60 w-full mt-4">
      {items.map((file, i) => (
        <button
          key={file.name + i}
          onClick={() => onJump(i)}
          className={`min-w-16 h-16 rounded-md border relative group flex items-center justify-center text-[10px] font-medium tracking-tight ${i === activeIndex ? 'border-blue-400 ring-2 ring-blue-400/40' : 'border-gray-600 hover:border-gray-400'}`}
          title={file.name}
        >
          {i === activeIndex && <span className="absolute -top-1 -right-1 bg-blue-500 text-[9px] px-1 rounded">Now</span>}
          {i + 1}
        </button>
      ))}
    </div>
  );
};

export default HistoryStrip;
