'use client';
export default function Progress({ step, total }: { step: number; total: number; }) {
  const pct = Math.round((step/total)*100);
  return (
    <div className="w-full" aria-label="Progreso">
      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full">
        <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{pct}%</p>
    </div>
  );
}
