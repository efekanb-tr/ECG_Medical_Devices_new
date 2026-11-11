import React, { useState } from 'react';
import { Library, ArrowLeft, CheckCircle2, Copy, Filter, Search, Tag } from 'lucide-react';
import { ACADEMIC_REFERENCES, AcademicReference, ReferenceCategory } from '../data/knowledgeWheelData';

interface ReferenceLibraryScreenProps {
  onBackToEquations: () => void;
  onBackToSimulator: () => void;
}

const CATEGORIES: Array<'ALL' | ReferenceCategory> = [
  'ALL',
  '(A) Peer-Reviewed Journal & Conference Papers',
  '(B) International Regulatory Standards & Compliance Notes',
  '(C) Commercial ECG Manuals, Service Manuals & Component Datasheets',
];

export const ReferenceLibraryScreen: React.FC<ReferenceLibraryScreenProps> = ({
  onBackToEquations,
  onBackToSimulator,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | ReferenceCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredRefs = ACADEMIC_REFERENCES.filter((ref) => {
    const matchesCat = selectedCategory === 'ALL' || ref.category === selectedCategory;
    if (!matchesCat) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      ref.ieeeFormattedCitation.toLowerCase().includes(q) ||
      ref.usedForBadge.toLowerCase().includes(q) ||
      ref.authors.toLowerCase().includes(q) ||
      ref.title.toLowerCase().includes(q)
    );
  });

  const handleCopyCitation = (ref: AcademicReference) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(ref.ieeeFormattedCitation).catch(() => {});
    }
    setCopiedId(ref.id);
    window.setTimeout(() => {
      setCopiedId((prev) => (prev === ref.id ? null : prev));
    }, 2000);
  };

  return (
    <section
      data-testid="reference-library-screen"
      className="min-h-[calc(100vh-65px)] bg-white text-[#09318D] px-6 py-8 md:py-10"
    >
      <div className="max-w-6xl mx-auto w-full space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#09318D]/15">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#09318D]/70">
              <span>SCREEN 06 OF 06</span>
              <span aria-hidden="true">·</span>
              <span>IEEE / ISO-690 STANDARD FORMAT · ALL 16 INTERNATIONAL SOURCES</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-[#09318D] mt-1">
              International Scientific &amp; Technical Reference Library (IEEE Standard Format)
            </h1>
            <p className="text-xs sm:text-sm text-[#09318D]/80 mt-2 max-w-3xl leading-relaxed">
              Dedicated, searchable, and filterable bibliography of all <strong>16 international sources</strong> categorized into (A) Peer-Reviewed Journal &amp; Conference Papers, (B) International Regulatory Standards &amp; Compliance Notes, and (C) Commercial ECG Manuals, Service Manuals &amp; Component Datasheets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onBackToEquations}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#09318D]/25 bg-white text-[#09318D] font-bold text-xs hover:border-[#FD91CC] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#09318D]" />
              <span>Screen 5: Equations</span>
            </button>
            <button
              type="button"
              onClick={onBackToSimulator}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#09318D] text-white font-bold text-xs hover:bg-[#09318D]/90 transition-colors cursor-pointer"
            >
              <span>Screen 4: Live ECG Simulator</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 rounded-2xl bg-[#09318D]/[0.03] border border-[#09318D]/15 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#09318D]">
              <Filter className="w-4 h-4" />
              <span>SHOWING {filteredRefs.length} OF 16 VERIFIED SOURCES:</span>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#09318D]/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search author, DOI, OEM, or waveform..."
                aria-label="Search Reference Library"
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-[#09318D]/25 text-xs text-[#09318D] placeholder:text-[#09318D]/50 focus:outline-none focus:border-[#09318D]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#09318D] text-white border-[#09318D]'
                      : 'bg-white text-[#09318D] border-[#09318D]/20 hover:border-[#FD91CC]'
                  }`}
                >
                  {cat === 'ALL' ? 'All 16 Sources' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Complete 16 IEEE Reference Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRefs.map((ref) => {
            const isCopied = copiedId === ref.id;
            return (
              <article
                key={ref.id}
                data-testid={`ieee-ref-${ref.citationNumber.replace(/\[|\]/g, '')}`}
                className="p-5 rounded-2xl border-2 border-[#09318D]/20 bg-white hover:border-[#09318D] transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#09318D]/15">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#09318D] text-white font-mono text-xs font-bold">
                        {ref.citationNumber}
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-[#09318D]/80">
                        {ref.category}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#FD91CC]/30 text-[#09318D] font-mono text-[11px] font-bold">
                      {ref.year}
                    </span>
                  </div>

                  {/* Strict IEEE Standard Citation Block */}
                  <div className="mt-3 p-3.5 rounded-xl bg-[#09318D]/[0.03] border border-[#09318D]/15 font-mono text-xs text-[#09318D] leading-relaxed">
                    {ref.ieeeFormattedCitation}
                  </div>

                  {/* Prominent Badge Showing How Each Source Is Used in the Simulator */}
                  <div className="mt-3 p-2.5 rounded-xl bg-[#FD91CC]/25 border border-[#FD91CC] flex items-start gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#09318D] shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-[#09318D] leading-snug">
                      ({ref.usedForBadge})
                    </span>
                  </div>

                  <p className="text-xs text-[#09318D]/85 mt-2.5 leading-relaxed">
                    {ref.relevance}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[#09318D]/10 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-[#09318D]/70 truncate">
                    {ref.doiOrSpec}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCitation(ref)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FD91CC]/35 text-[#09318D] hover:bg-[#FD91CC] font-mono text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Copied IEEE</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy IEEE Citation</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Summary Footer Banner */}
        <div className="p-5 rounded-2xl bg-[#09318D] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Library className="w-5 h-5 text-[#FD91CC] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-white">
                Complete 16-Source International Scientific &amp; Technical Reference Library
              </h2>
              <p className="text-xs text-white/85 mt-0.5">
                Categorized across (A) Peer-Reviewed Journal &amp; Conference Papers [1–5, 16], (B) International Regulatory Standards &amp; Compliance Notes [6, 14, 15], and (C) Commercial ECG Manuals, Service Manuals &amp; Component Datasheets [7–13].
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
