import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Check, BookOpen } from 'lucide-react';
import { SURAHS } from '../data/surahs';
import { SurahMeta } from '../types';

interface SurahSearchSelectProps {
  selectedSurahId: number;
  onSelectSurah: (surahId: number) => void;
  className?: string;
  buttonLabelPrefix?: string;
  theme?: 'light' | 'dark';
}

// Normalizer: strips accents, lowercases, handles Turkish chars
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[âäàá]/g, 'a')
    .replace(/[îïíì]/g, 'i')
    .replace(/[ûüúù]/g, 'u')
    .replace(/[ôöóò]/g, 'o')
    .replace(/[ç]/g, 'c')
    .replace(/[ş]/g, 's')
    .replace(/[ğ]/g, 'g')
    .replace(/[ı]/g, 'i')
    .replace(/[^a-z0-9]/g, '');
}

// Levenshtein distance for fuzzy misspelling check
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// Check character multiset overlap (handles anagrams/scrambled like "naisy" -> "yasin")
function charOverlapScore(query: string, target: string): number {
  if (!query || !target) return 0;
  const qCounts: Record<string, number> = {};
  for (const ch of query) qCounts[ch] = (qCounts[ch] || 0) + 1;

  let matches = 0;
  for (const ch of target) {
    if (qCounts[ch] && qCounts[ch] > 0) {
      matches++;
      qCounts[ch]--;
    }
  }

  // Jaccard-like score on letter counts
  const total = Math.max(query.length, target.length);
  return matches / total;
}

// Fuzzy matching score calculator (Higher is better, returns 0 if no match)
function calculateMatchScore(query: string, surah: SurahMeta): number {
  const cleanQ = normalizeText(query);
  if (!cleanQ) return 1;

  // 1. Exact ID match (e.g. "36")
  if (surah.id.toString() === cleanQ) return 1000;
  if (surah.id.toString().startsWith(cleanQ)) return 800;

  const cleanName = normalizeText(surah.name);
  const cleanEnglish = normalizeText(surah.englishName || '');

  // 2. Exact match
  if (cleanName === cleanQ || cleanEnglish === cleanQ) return 900;

  // 3. Prefix match
  if (cleanName.startsWith(cleanQ) || cleanEnglish.startsWith(cleanQ)) return 700;

  // 4. Substring match (e.g. "asin" in "yasin")
  if (cleanName.includes(cleanQ) || cleanEnglish.includes(cleanQ)) {
    return 600 - (cleanName.length - cleanQ.length) * 10;
  }

  // 5. Query contains target
  if (cleanQ.includes(cleanName)) return 500;

  // 6. Character overlap / anagram match (e.g. "naisy", "ayin", "asin")
  const overlapName = charOverlapScore(cleanQ, cleanName);
  const overlapEng = charOverlapScore(cleanQ, cleanEnglish);
  const maxOverlap = Math.max(overlapName, overlapEng);

  // If overlap is 60% or higher, or query has length >= 3 and 70% overlap
  if (maxOverlap >= 0.6) {
    // Also compute levenshtein distance
    const dist = Math.min(
      levenshteinDistance(cleanQ, cleanName),
      levenshteinDistance(cleanQ, cleanEnglish)
    );
    // Score based on overlap and inverse distance
    return 400 + Math.floor(maxOverlap * 100) - dist * 20;
  }

  // 7. Small distance threshold for typos (e.g. 1 or 2 character typo)
  const distName = levenshteinDistance(cleanQ, cleanName);
  const distEng = Math.min(distName, levenshteinDistance(cleanQ, cleanEnglish));
  if (distEng <= 2 && cleanQ.length >= 3) {
    return 300 - distEng * 50;
  }

  return 0;
}

export const SurahSearchSelect: React.FC<SurahSearchSelectProps> = ({
  selectedSurahId,
  onSelectSurah,
  className = "",
  buttonLabelPrefix = "Sure Seç:",
  theme = 'light'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentSurah = useMemo(() => {
    return SURAHS.find(s => s.id === selectedSurahId) || SURAHS[0];
  }, [selectedSurahId]);

  // Filter and sort surahs based on fuzzy score
  const filteredSurahs = useMemo(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      return SURAHS;
    }

    const scored = SURAHS.map(surah => ({
      surah,
      score: calculateMatchScore(trimmed, surah)
    })).filter(item => item.score > 0);

    // Sort by highest score, then by id
    scored.sort((a, b) => b.score - a.score || a.surah.id - b.surah.id);
    return scored.map(item => item.surah);
  }, [searchTerm]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto focus search input
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (id: number) => {
    onSelectSurah(id);
    setIsOpen(false);
    setSearchTerm("");
  };

  const popularSurahs = [
    { id: 1, label: "Fâtiha" },
    { id: 36, label: "Yâsîn" },
    { id: 67, label: "Mülk" },
    { id: 78, label: "Nebe" },
    { id: 55, label: "Rahmân" },
    { id: 112, label: "İhlâs" }
  ];

  const isDark = theme === 'dark';

  return (
    <div className={`relative min-w-0 max-w-full ${isOpen ? 'z-[100]' : 'z-10'} ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-w-0 flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 text-left rounded-xl transition-all focus:outline-none cursor-pointer ${
          isDark
            ? "bg-slate-900/80 hover:bg-slate-800/90 border border-emerald-500/30 hover:border-emerald-500/60 text-slate-100 shadow-sm focus:ring-2 focus:ring-emerald-500/40"
            : "bg-slate-50 hover:bg-slate-100/90 border border-slate-300/80 hover:border-emerald-500 text-slate-800 focus:ring-2 focus:ring-emerald-500/20 shadow-none"
        }`}
      >
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <span
            className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border ${
              isDark
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-emerald-100 text-emerald-800 border-emerald-300"
            }`}
          >
            {currentSurah.id}
          </span>
          <div className="min-w-0 truncate">
            <span className={`text-xs block sm:inline mr-1 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {buttonLabelPrefix}
            </span>
            <span className={`font-semibold text-sm ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              {currentSurah.name}
            </span>
            <span className={`text-xs ml-1.5 hidden md:inline font-normal ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              ({currentSurah.totalAyahs} Ayet)
            </span>
          </div>
        </div>
        <Search className={`w-4 h-4 flex-shrink-0 ml-1 ${isDark ? "text-emerald-400/80" : "text-emerald-700"}`} />
      </button>

      {/* Popover / Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-2 w-full min-w-0 sm:w-96 max-w-full rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? "bg-slate-900/98 backdrop-blur-2xl border border-emerald-500/40 text-slate-100 ring-1 ring-emerald-500/20"
              : "bg-white border border-slate-200 text-slate-800 ring-1 ring-slate-900/10"
          }`}
          style={{ zIndex: 99999 }}
        >
          {/* Search Header */}
          <div className={`p-3 border-b ${isDark ? "border-slate-800/80 bg-slate-950/60" : "border-slate-200 bg-slate-50"}`}>
            <div className="relative flex items-center">
              <Search className={`w-4 h-4 absolute left-3 pointer-events-none ${isDark ? "text-emerald-400" : "text-emerald-700"}`} />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Sure adı, no veya yazım (örn: yasin, asin, 36)..."
                className={`w-full text-sm pl-9 pr-8 py-2 rounded-xl border focus:outline-none transition-colors ${
                  isDark
                    ? "bg-slate-800/80 text-slate-100 border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-500"
                    : "bg-white text-slate-900 border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                }`}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className={`absolute right-2.5 p-1 ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5 pt-1">
              <span className={`text-[11px] self-center mr-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Hızlı:</span>
              {popularSurahs.map(pop => {
                const isSelected = selectedSurahId === pop.id;
                return (
                  <button
                    key={pop.id}
                    type="button"
                    onClick={() => handleSelect(pop.id)}
                    className={`text-xs px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? "bg-emerald-600/30 text-emerald-200 border-emerald-500/60 font-medium"
                          : "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold"
                        : isDark
                          ? "bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border-slate-700/50"
                          : "bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-slate-200"
                    }`}
                  >
                    {pop.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Surah List */}
          <div className={`overflow-y-auto max-h-72 p-1.5 divide-y ${isDark ? "divide-slate-800/40" : "divide-slate-100"}`}>
            {filteredSurahs.length > 0 ? (
              filteredSurahs.map(surah => {
                const isSelected = surah.id === selectedSurahId;
                return (
                  <button
                    key={surah.id}
                    type="button"
                    onClick={() => handleSelect(surah.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-xl transition-colors cursor-pointer ${
                      isSelected
                        ? isDark
                          ? "bg-emerald-950/60 text-emerald-200 border border-emerald-500/40"
                          : "bg-emerald-50 text-emerald-950 border border-emerald-300/70 font-semibold"
                        : isDark
                          ? "hover:bg-slate-800/70 text-slate-200"
                          : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold ${
                          isSelected
                            ? isDark
                              ? "bg-emerald-500 text-slate-950 font-bold"
                              : "bg-emerald-600 text-white font-bold"
                            : isDark
                              ? "bg-slate-800 text-slate-400 border border-slate-700/50"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {surah.id}
                      </span>
                      <div>
                        <div className={`font-semibold text-sm leading-tight flex items-center gap-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                          <span>{surah.name}</span>
                          {surah.id === 36 && searchTerm && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded border ${
                                isDark
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : "bg-emerald-100 text-emerald-800 border-emerald-300"
                              }`}
                            >
                              Yâ-Sîn
                            </span>
                          )}
                        </div>
                        <div className={`text-xs leading-tight mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          {surah.englishName} • {surah.totalAyahs} Ayet
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />}
                  </button>
                );
              })
            ) : (
              <div className={`py-8 text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <BookOpen className={`w-6 h-6 mx-auto mb-2 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
                <p className="text-sm font-medium">Eşleşen sure bulunamadı.</p>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Farklı bir kelime veya numara deneyebilirsiniz.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
