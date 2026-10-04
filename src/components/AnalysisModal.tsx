import React, { useState } from 'react';
import { X, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { WordData, AIAnalysisResult } from '../types';
import { analyzeWithGemini } from '../services/geminiService';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWords: WordData[];
  selectedText: string;
  verseNumber: number;
  verseTranslation: string;
  surahName: string;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  onClose,
  selectedWords,
  selectedText,
  verseNumber,
  verseTranslation,
  surahName
}) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiData, setAiData] = useState<AIAnalysisResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFetchAi = async () => {
    setLoadingAi(true);
    setAiError(null);
    try {
      const res = await analyzeWithGemini({
        arabicText: selectedText,
        translation: verseTranslation,
        surahName: surahName,
        verseNumber: verseNumber,
        selectedWords: selectedWords
      });
      setAiData(res);
    } catch (err: any) {
      setAiError(err.message || 'Yapay zeka tahlili alınırken bir hata oluştu.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col my-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Başlık */}
        <div className="p-5 md:px-8 md:py-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-md z-20">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800">
              {surahName} Suresi {verseNumber}. Ayet Tahlili
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Anında Kelime Anlamı & Yapay Zekâ Tefsir Tahlili
            </p>
          </div>
          <button
            id="btn-close-analysis-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal İçeriği */}
        <div className="p-5 md:p-8 space-y-6">
          
          {/* 1. Seçilen Arapça Metin */}
          <div className="bg-emerald-50/80 rounded-2xl p-6 md:p-8 border border-emerald-100 flex flex-col items-center justify-center shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 bg-emerald-100/90 px-3 py-1 rounded-full">
              Seçilen Kelime / Ayet Metni
            </span>
            <div className="w-full py-2 flex justify-center">
              <p className="font-amiri text-2xl md:text-4xl text-emerald-950 dir-rtl leading-[2.2] text-center font-bold break-words max-w-full px-2">
                {selectedText || "Arapça metin"}
              </p>
            </div>
          </div>

          {/* 2. Kelime Kelime Anlamları */}
          {selectedWords.length > 0 && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 md:p-6">
              <div className="flex justify-between items-center mb-3 border-b border-slate-200/60 pb-2.5">
                <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Kelime Kelime Anlamı
                </h4>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  {selectedWords.length} Kelime Seçildi
                </span>
              </div>

              <div className="flex flex-wrap dir-rtl justify-start items-stretch gap-2.5 max-h-[300px] overflow-y-auto pr-1 pl-1 py-1 custom-scrollbar">
                {selectedWords.map((w, i) => (
                  <div 
                    key={i} 
                    className="flex flex-col items-center justify-between bg-white border border-slate-200 hover:border-emerald-500 rounded-xl p-2.5 min-w-[110px] max-w-[140px] flex-grow shadow-sm transition-all text-center"
                  >
                    <div className="flex justify-between w-full items-center mb-1">
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                        {i + 1}
                      </span>
                      <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        {w.verseNumber || verseNumber}. Ayet
                      </span>
                    </div>
                    <span className="font-amiri text-xl md:text-2xl text-emerald-950 dir-rtl font-bold my-1 leading-snug">
                      {w.text_uthmani || w.text}
                    </span>
                    <span className="text-xs font-bold text-emerald-800 leading-tight line-clamp-2">
                      {w.translation?.text || '-'}
                    </span>
                    {w.transliteration?.text && (
                      <span className="text-[10px] text-slate-400 italic mt-1">
                        {w.transliteration.text}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Bütüncül Ayet Meali */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 md:p-6">
            <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">
              Ayet Meali (Diyanet İşleri)
            </h4>
            <p className="text-base md:text-lg text-slate-800 leading-relaxed font-medium">
              {verseTranslation || "Meal yüklenemedi."}
            </p>
          </div>

          {/* 4. Yapay Zekâ Butonu */}
          {!aiData && !loadingAi && (
            <div>
              <button
                id="btn-fetch-ai-analysis"
                onClick={handleFetchAi}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base md:text-lg rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Yapay Zekâ ile Derin Gramer ve Tefsir Analizi Yap</span>
              </button>
            </div>
          )}

          {/* Yükleniyor */}
          {loadingAi && (
            <div className="py-8 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
              <p className="text-base font-semibold text-slate-600">
                Gemini AI detaylı Arapça gramer ve tefsir analizini hazırlıyor...
              </p>
            </div>
          )}

          {/* Hata */}
          {aiError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
              <p className="font-semibold">Analiz Hatası:</p>
              <p>{aiError}</p>
              <button 
                onClick={handleFetchAi}
                className="mt-2 text-xs font-bold text-rose-800 underline cursor-pointer"
              >
                Tekrar Dene
              </button>
            </div>
          )}

          {/* 5. AI Analiz Sonuçları */}
          {aiData && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Terkip Anlamı */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 md:p-6">
                <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-wide mb-2">
                  İfade / Terkip Detaylı Anlamı
                </h4>
                <p className="text-base md:text-lg font-medium text-slate-800 leading-relaxed">
                  {aiData.terkip_anlami}
                </p>
              </div>

              {/* Kelime Gramer Analiz Listesi */}
              {aiData.kelime_analizi?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3">
                    Gramer, Vezin ve Kök Tahlili
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aiData.kelime_analizi.map((item, idx) => (
                      <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="font-bold text-emerald-900 text-base mb-1">
                          {item.kelime} &bull; <span className="text-slate-800 font-semibold">{item.anlam}</span>
                        </div>
                        <div className="text-slate-600 text-xs md:text-sm leading-relaxed">
                          {item.kok_ve_gramer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tefsir Bağlamı */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 md:p-6">
                <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">
                  Tefsir Bağlamı ve Hikmeti
                </h4>
                <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                  {aiData.tafsir_baglami}
                </p>
              </div>

              {/* Nüzul ve Teknik */}
              {aiData.nuzul_ve_teknik && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 md:p-6">
                  <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-2">
                    Nüzul Sebebi ve Arkaplan
                  </h4>
                  <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                    {aiData.nuzul_ve_teknik}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
