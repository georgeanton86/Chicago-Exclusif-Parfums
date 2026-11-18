export default function HybridInspirations({ notes, dreamer = false }: {
  inspirations?: readonly string[];
  notes?: { top: string; heart: string; base: string };
  dreamer?: boolean;
}) {
  if (!notes) return null;
  return <div className="my-4 border-l-2 border-[#713d49] pl-4"><p className="eyebrow mb-3 text-[#713d49]">{dreamer ? "Dreamer scent notes" : "Scent notes"}</p><dl><div className="note-line"><dt>Top</dt><dd>{notes.top}</dd></div><div className="note-line"><dt>Heart</dt><dd>{notes.heart}</dd></div><div className="note-line"><dt>Base</dt><dd>{notes.base}</dd></div></dl></div>;
}
