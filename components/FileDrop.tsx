'use client';
import { useCallback } from 'react';

type Props = { onFiles: (files: File[]) => void };
export default function FileDrop({ onFiles }: Props) {
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onFiles(Array.from(e.target.files));
  }, [onFiles]);
  return (
    <label className="block cursor-pointer">
      <span className="label">Sube archivos</span>
      <input className="mt-1 block w-full" type="file" multiple onChange={onChange} />
    </label>
  );
}
