import React from 'react';
import { createPortal } from 'react-dom';
import { X, Moon, Flame, MapPin, Compass, ShieldCheck, Sparkles, HeartHandshake } from 'lucide-react';

interface RamadanNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RamadanNoticeModal: React.FC<RamadanNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-gradient-to-b from-stone-900 via-stone-950 to-black text-stone-100 rounded-2xl sm:rounded-3xl border border-amber-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Üst Vurgu Çizgisi */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-500 z-10" />

        {/* Modal Başlık Çubuğu (Kompakt & Mobil Uyumlu) */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-stone-800/80 bg-stone-900/90 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center shadow-xs shrink-0">
              <Moon className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-400">Ramazan-ı Şerîf Risalesi</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8px] font-bold border border-amber-500/30">Fıkhî Hatırlatma</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate">Oruç ve Vakit Hassasiyeti</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* İçerik Alanı (Mobil optimize, rahat okunabilir) */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3.5 text-stone-200 text-xs sm:text-sm leading-relaxed scrollbar-thin">
          
          {/* Çarpıcı Soru / Giriş Kutusu */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-amber-950/50 via-stone-900 to-stone-950 border border-amber-500/40">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-amber-300 leading-snug">
                  "Oruçlarınızın hakikaten kabul olduğuna emin misiniz, yoksa sadece &quot;vakti geldi&quot; zannıyla hareket mi ediyorsunuz?"
                </h3>
              </div>
            </div>
          </div>

          {/* Giriş Hitabı */}
          <div className="space-y-1.5 text-stone-300 text-xs leading-normal">
            <p className="font-semibold text-amber-200 text-xs">
              Kıymetli kardeşlerim,
            </p>
            <p>
              İbadetlerimizin kabule şayan olması sadece niyetimizle değil, özellikle <strong className="text-white">vakitlerine gösterdiğimiz hassasiyetle</strong> doğrudan ilişkilidir. Fıkıhta vakit, namazın ve orucun şartıdır. Vakit girmeden yapılan ibadet batıl olduğu gibi, temkinsiz davranılarak vaktin şüpheli anlarında yapılan ibadetler de sıhhatini tehlikeye atabilir.
            </p>
          </div>

          {/* Temkinin Önemi ve Çarpıcı Örnekler */}
          <div className="space-y-2.5 bg-stone-900/70 p-3 sm:p-3.5 rounded-xl border border-stone-800">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Temkinin Önemi ve İl İçi Dakika Farkları</span>
            </div>
            <p className="text-stone-300 text-[11px] sm:text-xs">
              Aynı il sınırları içinde dahi coğrafi konum ve enlem/boylam farkından ötürü vakitler ciddi oranda değişir:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Konya Örneği */}
              <div className="p-2.5 rounded-lg bg-stone-950/80 border border-stone-800">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    Konya (10 Dk Fark)
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 leading-snug">
                  Kulu (Köşker) ile Beyşehir (Dumanlı) arasında aynı ilde <strong className="text-amber-300 font-bold">imsakta 10 dk</strong>, <strong className="text-amber-300 font-bold">akşamda 7 dk</strong> fark oluşmaktadır.
                </p>
              </div>

              {/* İstanbul Örneği */}
              <div className="p-2.5 rounded-lg bg-stone-950/80 border border-stone-800">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    İstanbul (2 Dk Fark)
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 leading-snug">
                  Sabiha Gökçen ile İstanbul Havalimanı arasında imsak ve yatsıda <strong className="text-amber-300 font-bold">2 dakikalık</strong> net bir zaman farkı bulunmaktadır.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-amber-200/90 italic pt-1 border-t border-stone-800/80">
              Bu ufak görünen dakikalar oruç ve namaz için hayatîdir. İbadetlerimizde temkini elden bırakmamalıyız.
            </p>
          </div>

          {/* Hassasiyet Özellikleri */}
          <div className="space-y-2 bg-gradient-to-br from-emerald-950/30 to-stone-900/80 p-3 sm:p-3.5 rounded-xl border border-emerald-500/30">
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Uygulamamızdaki Nokta Atışı Çözümler</span>
            </div>

            <ul className="space-y-1.5 text-[11px] sm:text-xs text-stone-300">
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                <span><strong className="text-white">Gerçek GPS ile Konum:</strong> Telefonunuzun GPS çipiyle 6 haneli koordinat tespit edilir ve vakitler saniyesine kadar hesaplanır.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                <span><strong className="text-white">Otomatik Adres Tespiti:</strong> Mahalle ve ilçe adınız otomatik belirlenerek tam bulunduğunuz noktaya göre güncellenir.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
                <span><strong className="text-white">Haritalardan Özel Koordinat:</strong> Google Haritalar'dan kopyalayacağınız koordinatı yapıştırarak da tam noktanıza özel hesaplama yapabilirsiniz.</span>
              </li>
            </ul>
          </div>

          {/* Dua ve Kapanış */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-stone-900/80 border border-stone-800 text-center space-y-1">
            <HeartHandshake className="w-4 h-4 text-amber-400 mx-auto" />
            <p className="text-[11px] sm:text-xs text-amber-100/90 italic">
              "İbadette temkin ve ihtiyat, kulun Rabbine olan hürmetinin en güzel nişanesidir. Oruç ve dualarınızın kabul olması dileğiyle..."
            </p>
          </div>

        </div>

        {/* Alt Kapatma Çubuğu */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-t border-stone-800 bg-stone-950 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-stone-400">Ramazan-ı Şerif'iniz Mübarek Olsun</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
