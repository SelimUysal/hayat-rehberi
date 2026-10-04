import React, { useState } from 'react';
import { Landmark, Compass, ScrollText, Calendar, BookOpen, ChevronDown, Sparkles } from 'lucide-react';

export const OttomanHistoryGuide: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>('ezani-saat');

  const toggleSection = (id: string) => {
    setOpenSection(prev => prev === id ? null : id);
  };

  const sections = [
    {
      id: 'ezani-saat',
      title: 'Alaturka (Ezânî / Gurûbî) Saat Nedir? Neden Akşam 12:00\'dir?',
      icon: Compass,
      summary: 'Osmanlı\'da gün başlangıcı gece yarısı değil, güneşin battığı andır.',
      content: (
        <div className="space-y-2.5 text-xs text-[#52411c] leading-relaxed">
          <p>
            Osmanlı Devleti’nde asırlar boyunca kullanılan <strong>Saat-i Ezânîye</strong> (Alaturka veya Gurûbî saat), 
            güneşin batış anını (Gurûb / Akşam ezanını) günün başı ve saatin tam <strong>12:00</strong> noktası kabul eden astronomik bir zaman sistemidir.
          </p>
          <p>
            İslâm fıkhında yeni bir gün güneşin batmasıyla başladığından (örneğin Perşembe akşamı Cuma gecesi sayılır), 
            halkın ve ibadet ehlinin saati doğrudan akşam ezanına göre ayarlanmıştır. Her gün güneşin batış dakikası mevsimlere göre 
            değiştiğinden, muvakkitler her gün kulelerdeki ve camilerdeki saatleri gurûba göre tekrar hassas biçimde kurarlardı.
          </p>
        </div>
      )
    },
    {
      id: 'muvakkithaneler',
      title: 'Muvakkithâneler ve Muvakkitler: Zamanın Âlim Bekçileri',
      icon: Landmark,
      summary: 'Camilerin avlularında vakitleri ve yönleri hesaplayan gökbilim merkezleri.',
      content: (
        <div className="space-y-2.5 text-xs text-[#52411c] leading-relaxed">
          <p>
            <strong>Muvakkithâne</strong>, Osmanlı şehirlerinde başta selâtin (padişah) camileri olmak üzere büyük camilerin avlularına inşa edilmiş 
            küçük rasathâne ve zaman merkezleridir. Burada görev yapan <em>muvakkitler</em>, hem fıkıh hem de riyâziye (matematik) ve hey’et (astronomi) 
            tahsili görmüş yüksek ilim sahipleriydi.
          </p>
          <p>
            Muvakkitler sadece namaz vakitlerini değil; Ramazan hilâlinin tespiti, güneş ve ay tutulmalarının hesabı, kıble açısının tayini 
            ve halkın cep saatlerinin ayarlanması gibi hayati görevleri îfâ ederlerdi. Ali Kuşçu, Takiyüddin ve Hüseyin Hilmi gibi büyük âlimler 
            bu ilim silsilesinin öncüleridir.
          </p>
        </div>
      )
    },
    {
      id: 'rubu-tahtasi',
      title: 'Rubu Tahtası (Sinüs Kadranı) ve Usturlap Nasıl Çalışırdı?',
      icon: ScrollText,
      summary: 'Taşınabilir ahşap ve pirinç astronomi aletleriyle gökyüzü ölçümü.',
      content: (
        <div className="space-y-2.5 text-xs text-[#52411c] leading-relaxed">
          <p>
            Osmanlı muvakkitlerinin en temel iki aleti <strong>Rubu Tahtası</strong> (Dairenin çeyreği / Quadrant) ve <strong>Usturlap</strong> idi. 
            Rubu tahtasının bir yüzünde küresel trigonometri formüllerinin grafik karşılığı olan <em>Rubu’l-Müceyyeb</em> (Sinüs kadranı), 
            diğer yüzünde ise belirli enlemler için güneş irtifa çizgilerini gösteren <em>Rubu’l-Mukantarât</em> bulunurdu.
          </p>
          <p>
            Üzerindeki şakul (çekül) ve deliklerden güneşe bakılarak güneşin ufuktan yüksekliği saniyeler içinde ölçülür, 
            ip üzerindeki inci tanesi kaydırılarak öğle zevali, ikindi gölgesi ve imsak vakti bir hesap makinesi gibi anında tespit edilirdi.
          </p>
        </div>
      )
    },
    {
      id: 'uc-takvim',
      title: 'Osmanlı\'da 3 Takvim Birlikteliği: Hicrî, Rûmî ve Mîlâdî',
      icon: Calendar,
      summary: 'Dini hayat, devlet maliyesi ve beynelmilel ticaret için üç ayrı takvim.',
      content: (
        <div className="space-y-2.5 text-xs text-[#52411c] leading-relaxed">
          <p>
            Osmanlı Devleti asırlarca çok yönlü bir takvim nizamı sürdürmüştür:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <strong>Hicrî-Kamerî Takvim:</strong> Ayın hilal evrelerine dayanır (354 gün). İbadetler, kandiller, bayramlar ve Ramazan bu takvime göredir.
            </li>
            <li>
              <strong>Rûmî-Mâlî Takvim:</strong> Güneş yılına dayanır (365 gün). 1840 Tanzimat sonrası bütçe, vergi ve memur maaşlarında hasat mevsimiyle örtüşmesi için kullanılmıştır. Yılbaşı 1 Mart’tır ve Miladi takvimden 13 gün geridedir.
            </li>
            <li>
              <strong>Mîlâdî (Güneş) Takvimi:</strong> Hariciye ve beynelmilel ticarette Garp dünyasıyla münasebetlerde paralel takip edilirdi.
            </li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="rounded-3xl bg-[#fdfbf7] border-2 border-[#d4af37]/60 shadow-lg p-5 sm:p-7 space-y-5 text-stone-900">
      
      <div className="flex items-center gap-3 pb-3 border-b border-[#e5d8be]">
        <div className="w-10 h-10 rounded-2xl bg-[#8c6b1c] text-amber-100 flex items-center justify-center shadow-xs shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#4a3b19] tracking-tight">
            Osmanlı Medeniyetinde Zaman ve Astronomi Rehberi
          </h3>
          <p className="text-xs text-[#7d6537]">
            Tarihi muvakkithânelerin işleyişi, Alaturka saat felsefesi ve ilmi aletler
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {sections.map((section) => {
          const isOpen = openSection === section.id;
          const Icon = section.icon;

          return (
            <div
              key={section.id}
              className="rounded-2xl border border-[#e5d8be] bg-white overflow-hidden transition-all shadow-2xs"
            >
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left transition hover:bg-[#faf6ec] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#f4ecd8] text-[#8c6b1c] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#3d2f10]">
                      {section.title}
                    </h4>
                    <p className="text-[11px] text-[#7d6537] line-clamp-1">
                      {section.summary}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#8c6b1c] transition-transform shrink-0 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="p-4 pt-1 bg-[#fdfbf7] border-t border-[#eee4cf]">
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
