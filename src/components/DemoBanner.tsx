export function DemoBanner() {
  return (
    <aside aria-label="Demo mode notice" className="bg-night text-night-text text-sm border-b border-night-text/20">
      <p className="mx-auto max-w-7xl px-4 sm:px-6 py-2">
        <strong className="text-signal">Demo mode:</strong> all reviews shown are <strong>fictional sample content</strong>, not real reviews. Connect Supabase to publish real content.
      </p>
    </aside>
  );
}
