import React, { useState } from 'react';
import { TemkinSettings, AsrMethod, CalculatedDay } from '../types/prayer';
import { DEFAULT_TEMKIN, OSMANLI_FAZILET_TEMKIN, DIYANET_TEMKIN, floatToTime } from '../utils/astronomy';
import { X, Sliders, RotateCcw, Copy, Check, Info, ShieldAlert } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  temkin: TemkinSettings;
  onChangeTemkin: (newTemkin: TemkinSettings) => void;
  asrMethod: AsrMethod;
  onChangeAsrMethod: (method: AsrMethod) => void;
  todayData: CalculatedDay;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  temkin,
  onChangeTemkin,
  asrMethod,
  onChangeAsrMethod,
  todayData
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    onChangeTemkin(DEFAULT_TEMKIN);
    onChangeAsrMethod(1);
  };

  // Kullanıcının sağladığı formüldeki test çıktısı formatı:
  const feedbackOutput = `Tarih: ${todayData.dateString} | Enlem: ${todayData.rawTimes ? 'Hesaplandı' : ''}\n` +
    `İkindi Esası: ${asrMethod === 1 ? 'Asr-ı Evvel (1 Kat Gölge)' : 'Asr-ı Sânî (2 Kat Gölge)'}\n` +
    `--- ASTRONOMİK & TEMKİNLİ SONUÇLAR ---\n` +
    `İmsak: ${todayData.times.imsak} (Ham: ${floatToTime(todayData.rawTimes.fajr)}, Temkin: ${temkin.fajr} dk)\n` +
    `Güneş: ${todayData.times.gunes} (Ham: ${floatToTime(todayData.rawTimes.sunrise)}, Temkin: ${temkin.sunrise} dk)\n` +
    `Öğle: ${todayData.times.ogle} (Ham: ${floatToTime(todayData.rawTimes.dhuhr)}, Temkin: ${temkin.dhuhr} dk)\n` +
    `İkindi: ${todayData.times.ikindi} (Ham: ${floatToTime(todayData.rawTimes.asr)}, Temkin: ${temkin.asr} dk)\n` +
    `Akşam: ${todayData.times.aksam} (Ham: ${floatToTime(todayData.rawTimes.maghrib)}, Temkin: ${temkin.maghrib} dk)\n` +
    `Yatsı: ${todayData.times.yatsi} (Ham: ${floatToTime(todayData.rawTimes.isha)}, Temkin: ${temkin.isha} dk)\n` +
    `Kıble Saati: ${todayData.times.kibleSaati} | Kıble Açısı: ${todayData.qiblaAngle}°`;

  const handleCopyFeedback = () => {
    navigator.clipboard.writeText(feedbackOutput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 pt-5 sm:pt-12 bg-slate-950/60 backdrop-blur-xs animate-fadeIn overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[84vh]" onClick={e => e.stopPropagation()}>
        
        {/* Modal Başlık */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Hesaplama ve Temkin Ayarları</h3>
              <p className="text-xs text-slate-500">Astronomik formül ve fıkhi güvenlik temkin katsayılarını özelleştirin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* İkindi Hesaplama Esası */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              İkindi Hesaplama Esası (Gölge Katsayısı):
            </label>
            <select
              value={asrMethod}
              onChange={(e) => onChangeAsrMethod(Number(e.target.value) as AsrMethod)}
              className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:ring-1 focus:ring-emerald-600"
            >
              <option value={1}>
                Asr-ı Evvel / Takvim Standardı (1 Kat Gölge - Cumhurun Görüşü)
              </option>
              <option value={2}>
                Asr-ı Sânî / İmam-ı Âzam Özel (2 Kat Gölge - İhtiyatlı Görüş)
              </option>
            </select>
            <p className="text-[11px] text-slate-500 mt-2">
              Asr-ı Evvel'de bir cismin gölgesi zeval anındaki gölgesi hariç kendi boyuna ulaştığında ikindi girer. Asr-ı Sânî'de ise iki katına ulaştığında girer.
            </p>
          </div>

          {/* Temkin Vakitleri (Dakika) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800">
                Temkin Vakitleri (Dakika Cinsinden Ekleme / Çıkarma):
              </label>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                                <span>Önerilen Temkine Sıfırla</span>
              </button>
            </div>

            {/* Hızlı Şablon Butonları */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <button
                type="button"
                onClick={() => onChangeTemkin(OSMANLI_FAZILET_TEMKIN)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  temkin.fajr === OSMANLI_FAZILET_TEMKIN.fajr && temkin.dhuhr === OSMANLI_FAZILET_TEMKIN.dhuhr
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                ★ Temkinli Klasik Usûl (Fazilet / Osmanlı - Önerilen)
              </button>
              <button
                type="button"
                onClick={() => onChangeTemkin(DIYANET_TEMKIN)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  temkin.fajr === DIYANET_TEMKIN.fajr && temkin.dhuhr === DIYANET_TEMKIN.dhuhr
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                Diyanet Usulü
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-1">İmsak Temkini:</label>
                <input
                  type="number"
                  value={temkin.fajr}
                  onChange={(e) => onChangeTemkin({ ...temkin, fajr: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Önerilen: -17 dk</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-1">Güneş Temkini:</label>
                <input
                  type="number"
                  value={temkin.sunrise}
                  onChange={(e) => onChangeTemkin({ ...temkin, sunrise: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Önerilen: -7 dk</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-1">Öğle Temkini:</label>
                <input
                  type="number"
                  value={temkin.dhuhr}
                  onChange={(e) => onChangeTemkin({ ...temkin, dhuhr: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Standart: +5 dk</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-1">İkindi Temkini:</label>
                <input
                  type="number"
                  value={temkin.asr}
                  onChange={(e) => onChangeTemkin({ ...temkin, asr: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Önerilen: +11 dk</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-1">Akşam Temkini:</label>
                <input
                  type="number"
                  value={temkin.maghrib}
                  onChange={(e) => onChangeTemkin({ ...temkin, maghrib: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Önerilen: +9 dk</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block mb-1">Yatsı Temkini:</label>
                <input
                  type="number"
                  value={temkin.isha}
                  onChange={(e) => onChangeTemkin({ ...temkin, isha: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 text-xs font-mono rounded-lg border border-slate-200 bg-white"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Önerilen: +11 dk</span>
              </div>
            </div>
          </div>

          {/* Astronomik Ham vs Temkinli Karşılaştırma Tablosu */}
          <div>
            <span className="text-xs font-bold text-slate-800 block mb-2">
              Ham Astronomik Vakitler vs. Temkinli Sonuç Tablosu:
            </span>
            <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Vakit</th>
                    <th className="py-2 px-3">Ham Astronomik</th>
                    <th className="py-2 px-3">Temkin</th>
                    <th className="py-2 px-3 text-emerald-900">Nihai Sonuç</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-2 px-3 font-sans font-semibold">İmsak</td>
                    <td className="py-2 px-3 text-slate-500">{floatToTime(todayData.rawTimes.fajr)}</td>
                    <td className="py-2 px-3 text-slate-600">{temkin.fajr} dk</td>
                    <td className="py-2 px-3 font-bold text-emerald-900">{todayData.times.imsak}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-semibold">Güneş</td>
                    <td className="py-2 px-3 text-slate-500">{floatToTime(todayData.rawTimes.sunrise)}</td>
                    <td className="py-2 px-3 text-slate-600">{temkin.sunrise} dk</td>
                    <td className="py-2 px-3 font-bold text-emerald-900">{todayData.times.gunes}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-semibold">Öğle</td>
                    <td className="py-2 px-3 text-slate-500">{floatToTime(todayData.rawTimes.dhuhr)}</td>
                    <td className="py-2 px-3 text-slate-600">+{temkin.dhuhr} dk</td>
                    <td className="py-2 px-3 font-bold text-emerald-900">{todayData.times.ogle}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-semibold">İkindi</td>
                    <td className="py-2 px-3 text-slate-500">{floatToTime(todayData.rawTimes.asr)}</td>
                    <td className="py-2 px-3 text-slate-600">+{temkin.asr} dk</td>
                    <td className="py-2 px-3 font-bold text-emerald-900">{todayData.times.ikindi}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-semibold">Akşam</td>
                    <td className="py-2 px-3 text-slate-500">{floatToTime(todayData.rawTimes.maghrib)}</td>
                    <td className="py-2 px-3 text-slate-600">+{temkin.maghrib} dk</td>
                    <td className="py-2 px-3 font-bold text-emerald-900">{todayData.times.aksam}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-semibold">Yatsı</td>
                    <td className="py-2 px-3 text-slate-500">{floatToTime(todayData.rawTimes.isha)}</td>
                    <td className="py-2 px-3 text-slate-600">+{temkin.isha} dk</td>
                    <td className="py-2 px-3 font-bold text-emerald-900">{todayData.times.yatsi}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Test Çıktısı (Kullanıcının formülündeki test feedback çıktısı) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-800">
                Formül Doğrulama Metni (Bana Göndereceğiniz Metin):
              </span>
              <button
                onClick={handleCopyFeedback}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-900 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopyalandı' : 'Metni Kopyala'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={feedbackOutput}
              rows={5}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-900 text-emerald-400 font-mono text-[11px] focus:outline-hidden"
            />
          </div>

        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Kaydet ve Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
