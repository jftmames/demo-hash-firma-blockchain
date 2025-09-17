export default function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-auto rounded-xl bg-gray-900 text-gray-100 p-4 text-xs"><code>{children}</code></pre>
  );
}
