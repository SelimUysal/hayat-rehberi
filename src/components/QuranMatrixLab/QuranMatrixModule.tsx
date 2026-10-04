/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArabicLetter,
  TwoLetterCombination,
  ThreeLetterCombination,
  FourLetterCombination,
  FiveLetterCombination,
  AdvancedWordCombination,
} from './types/matrix';
import { StageNavigator } from './components/StageNavigator';
import { MatrixGrid } from './components/MatrixGrid';
import { Stage2Matrix } from './components/Stage2Matrix';
import { Stage3Matrix } from './components/Stage3Matrix';
import { Stage4Matrix } from './components/Stage4Matrix';
import { Stage5Matrix } from './components/Stage5Matrix';
import { LetterDetailModal } from './components/LetterDetailModal';
import { CombinationDetailModal } from './components/CombinationDetailModal';
import { ThreeLetterModal } from './components/ThreeLetterModal';
import { FourLetterModal } from './components/FourLetterModal';
import { FiveLetterModal } from './components/FiveLetterModal';
import { AdvancedWordModal } from './components/AdvancedWordModal';
import { GuideModal } from './components/GuideModal';
import { TajweedGuideModal } from './components/TajweedGuideModal';
import { TajweedLegendBar } from './components/TajweedLegendBar';
import { BookOpen, Sparkles, CheckCircle2, Palette, HelpCircle } from 'lucide-react';

interface QuranMatrixModuleProps {
  isDark?: boolean;
  targetStage?: number;
  targetTimestamp?: number;
}

export function QuranMatrixModule({ targetStage, targetTimestamp }: QuranMatrixModuleProps = {}) {
  const [currentStage, setCurrentStage] = useState<number>(targetStage || 1);

  useEffect(() => {
    if (typeof targetStage === 'number' && targetStage >= 1 && targetStage <= 5) {
      setCurrentStage(targetStage);
    }
  }, [targetStage, targetTimestamp]);
  const [selectedLetter, setSelectedLetter] = useState<ArabicLetter | null>(null);
  const [selectedCombination, setSelectedCombination] = useState<TwoLetterCombination | null>(null);
  const [selectedThreeLetter, setSelectedThreeLetter] = useState<ThreeLetterCombination | null>(null);
  const [selectedFourLetter, setSelectedFourLetter] = useState<FourLetterCombination | null>(null);
  const [selectedFiveLetter, setSelectedFiveLetter] = useState<FiveLetterCombination | null>(null);
  const [selectedAdvancedWord, setSelectedAdvancedWord] = useState<AdvancedWordCombination | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isTajweedGuideOpen, setIsTajweedGuideOpen] = useState<boolean>(false);
  const [isTajweedEnabled, setIsTajweedEnabled] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cellSize, setCellSize] = useState<'compact' | 'normal' | 'large'>('normal');

  const closeAllModals = () => {
    setSelectedLetter(null);
    setSelectedCombination(null);
    setSelectedThreeLetter(null);
    setSelectedFourLetter(null);
    setSelectedFiveLetter(null);
    setSelectedAdvancedWord(null);
    setIsGuideOpen(false);
    setIsTajweedGuideOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dynamic stage hero descriptions
  const heroInfo = {
    1: {
      title: "Kur'an-ı Kerim Harflerinin Birleşim Matrisi",
      description: "Arap alfabesindeki 30 temel harfin yalnız, başta, ortada ve sonda yazılış biçimlerini; 30x30 matris mantığıyla kesişen 900 ikili harf birleşimini ve 8 temel harekeli halini keşfedin.",
      stats: ["30 Satır × 30 Sütun = 900 Kesişim", "8 Harekeli / İşaretli Varyant", "5'er Adet Kur'ani Örnek Kelime"],
    },
    2: {
      title: "2. Aşama: İkili Kombinasyon Matrisi (3'lü Birleşimler)",
      description: "1. sayfada elde edilen temel 2'li harf grupları ile 30 tekil harfin kesişimini; 3 harfli fiil ve kelime yapılarının 8 farklı harekeli halini keşfedin.",
      stats: ["30 Tek Harf × 30 İkili Grup = 900 Üçlü Birleşim", "8 Harekeli Vezin Varyantı", "Kur'an Fiil & Kelime Kökleri Eşleşmesi"],
    },
    3: {
      title: "3. Aşama: Üçlü Kombinasyon Matrisi (4'lü Birleşimler)",
      description: "2. sayfada elde edilen 3 harfli kök kelimelere önek ve sonek harfler ekleyerek 4 harfli Kur'ani kelime gövdelerini, muzari fiilleri ve mekan isimlerini keşfedin.",
      stats: ["30 Tek Harf × 30 Üçlü Kök = 900 Dörtlü Birleşim", "Muzari & İsm-i Mekan Kalıpları", "Kur'an 4 Harfli Kelime Gövdeleri"],
    },
    4: {
      title: "4. Aşama: Dörtlü Kombinasyon Matrisi (5'li Birleşimler)",
      description: "3. sayfadaki 4 harfli kelime gövdelerine eklenen harflerle 5 harfli zengin Kur'an yapılarını, belirlilik takılarını ve müteaddi fiil kalıplarını keşfedin.",
      stats: ["30 Tek Harf × 30 Dörtlü Gövde = 900 Beşli Birleşim", "8 Harekeli Morfolojik Kalıp", "5 Harfli Tam Kur'an Kelimeleri"],
    },
    5: {
      title: "5. Aşama: Beşli Kombinasyon Matrisi ve Kelime Tamamlama",
      description: "Tüm aşamaların sentezi olarak Kur'an-ı Kerim'in en uzun kelime yapılarını, harf-i tarifli ve bağlaçlı tam ayet kelimelerini 30x30 final matrisinde tamamlayın.",
      stats: ["30 Tek Harf × 30 Beşli Gövde = 900 Tam Kelime", "Nihai Tilavet & İrab Dengelemesi", "Kur'an-ı Kerim Ayet Düzeyi Heceleme"],
    },
  }[currentStage as 1 | 2 | 3 | 4 | 5];

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col selection:bg-emerald-200 selection:text-emerald-950">
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hero / Stage Status Banner */}
        <section className="bg-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 text-emerald-900/30 font-quran text-[180px] pointer-events-none select-none">
            قرآن
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <Sparkles className="h-4 w-4" />
                <span>EdTech Kur'an-ı Kerim Harf & Birleşim Laboratuvarı</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {heroInfo.title}
              </h1>

              <p className="text-sm text-stone-200 leading-relaxed max-w-2xl">
                {heroInfo.description}
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-stone-300">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span>{heroInfo.stats[0]}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                  <span>{heroInfo.stats[1]}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-400"></span>
                  <span>{heroInfo.stats[2]}</span>
                </div>
              </div>
            </div>

            {/* Premium, action-oriented glassmorphic buttons inside the Section */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3.5 w-full md:w-auto shrink-0 self-stretch sm:self-start md:self-center">
              <button
                onClick={() => setIsTajweedGuideOpen(true)}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-bold text-emerald-950 bg-white hover:bg-stone-50 active:scale-[0.98] rounded-xl transition-all shadow-md hover:shadow-xl whitespace-nowrap cursor-pointer group"
              >
                <Palette className="h-5 w-5 text-rose-500 transition-transform group-hover:rotate-12" />
                <span>Renkli Tecvid Atlası</span>
              </button>

              <button
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-emerald-900/40 hover:bg-emerald-900/60 active:scale-[0.98] border border-emerald-500/20 hover:border-emerald-400/40 rounded-xl transition-all shadow-sm whitespace-nowrap cursor-pointer group"
              >
                <HelpCircle className="h-5 w-5 text-emerald-300 transition-transform group-hover:scale-110" />
                <span>Matris Rehberi</span>
              </button>
            </div>
          </div>
        </section>

        {/* Renkli Tecvid Gösterimi & Lejant Çubuğu */}
        <TajweedLegendBar
          isTajweedEnabled={isTajweedEnabled}
          onToggleTajweed={setIsTajweedEnabled}
          onOpenTajweedGuide={() => setIsTajweedGuideOpen(true)}
        />

        {/* 5 Aşamalı Müfredat Gezgini */}
        <StageNavigator
          currentStage={currentStage}
          onSelectStage={setCurrentStage}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          cellSize={cellSize}
          onCellSizeChange={setCellSize}
        />

        {/* Aktif Aşama İçeriği (1'den 5'e Tüm Sayfalar Tam ve Aktif) */}
        {currentStage === 1 && (
          <MatrixGrid
            onSelectLetter={(letter) => setSelectedLetter(letter)}
            onSelectCombination={(combo) => setSelectedCombination(combo)}
            onNavigateToStage={setCurrentStage}
            isTajweedEnabled={isTajweedEnabled}
            searchQuery={searchQuery}
            cellSize={cellSize}
            onCellSizeChange={setCellSize}
          />
        )}

        {currentStage === 2 && (
          <Stage2Matrix
            onSelectLetter={(letter) => setSelectedLetter(letter)}
            onSelectThreeLetterCombination={(combo) => setSelectedThreeLetter(combo)}
            onNavigateToStage={setCurrentStage}
            isTajweedEnabled={isTajweedEnabled}
            searchQuery={searchQuery}
            cellSize={cellSize}
            onCellSizeChange={setCellSize}
          />
        )}

        {currentStage === 3 && (
          <Stage3Matrix
            onSelectLetter={(letter) => setSelectedLetter(letter)}
            onSelectFourLetterCombination={(combo) => setSelectedFourLetter(combo)}
            onNavigateToStage={setCurrentStage}
            isTajweedEnabled={isTajweedEnabled}
            searchQuery={searchQuery}
            cellSize={cellSize}
            onCellSizeChange={setCellSize}
          />
        )}

        {currentStage === 4 && (
          <Stage4Matrix
            onSelectLetter={(letter) => setSelectedLetter(letter)}
            onSelectFiveLetterCombination={(combo) => setSelectedFiveLetter(combo)}
            onNavigateToStage={setCurrentStage}
            isTajweedEnabled={isTajweedEnabled}
            searchQuery={searchQuery}
            cellSize={cellSize}
            onCellSizeChange={setCellSize}
          />
        )}

        {currentStage === 5 && (
          <Stage5Matrix
            onSelectLetter={(letter) => setSelectedLetter(letter)}
            onSelectAdvancedWordCombination={(combo) => setSelectedAdvancedWord(combo)}
            onNavigateToStage={setCurrentStage}
            isTajweedEnabled={isTajweedEnabled}
            searchQuery={searchQuery}
            cellSize={cellSize}
            onCellSizeChange={setCellSize}
          />
        )}
      </main>

      {/* Tekil Harf Detay Modalı (Başlıklardaki tekil harfe tıklandığında açılır) */}
      <LetterDetailModal
        letter={selectedLetter}
        onClose={() => setSelectedLetter(null)}
        onOpenTajweedGuide={() => setIsTajweedGuideOpen(true)}
      />

      {/* 1. Aşama İkili Birleşim Modalı */}
      <CombinationDetailModal
        combination={selectedCombination}
        onClose={() => setSelectedCombination(null)}
        onOpenTajweedGuide={() => setIsTajweedGuideOpen(true)}
      />

      {/* 2. Aşama Üç Harfli Birleşim Modalı */}
      <ThreeLetterModal
        combination={selectedThreeLetter}
        onClose={() => setSelectedThreeLetter(null)}
        onOpenTajweedGuide={() => setIsTajweedGuideOpen(true)}
      />

      {/* 3. Aşama Dört Harfli Birleşim Modalı */}
      <FourLetterModal
        combination={selectedFourLetter}
        onClose={() => setSelectedFourLetter(null)}
        onOpenTajweedGuide={() => setIsTajweedGuideOpen(true)}
      />

      {/* 4. Aşama Beş Harfli Birleşim Modalı */}
      <FiveLetterModal
        combination={selectedFiveLetter}
        onClose={() => setSelectedFiveLetter(null)}
        onOpenTajweedGuide={() => setIsTajweedGuideOpen(true)}
      />

      {/* 5. Aşama İleri Düzey Kelime Tamamlama Modalı */}
      <AdvancedWordModal
        combination={selectedAdvancedWord}
        onClose={() => setSelectedAdvancedWord(null)}
        onOpenTajweedGuide={() => setIsTajweedGuideOpen(true)}
      />

      {/* Kılavuz & Kurallar Modalı */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Renkli Tecvid Atlası Modalı */}
      <TajweedGuideModal
        isOpen={isTajweedGuideOpen}
        onClose={() => setIsTajweedGuideOpen(false)}
      />
    </div>
  );
}

export default QuranMatrixModule;
