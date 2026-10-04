import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Upload, 
  X, 
  Check, 
  MessageSquare, 
  FileText, 
  AlertCircle, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Trash2, 
  RefreshCw, 
  Search, 
  Eye, 
  Download, 
  Clock, 
  User, 
  Mail, 
  Tag, 
  KeyRound, 
  ArrowLeft 
} from 'lucide-react';
import { HayatRehberiLogo } from './HayatRehberiLogo';
import { isValidAdminPasskeyClient, getEncodedMailEndpoint } from '../utils/security';

const LOCAL_FEEDBACKS_KEY = 'hayat_rehberi_local_feedbacks';

function readLocalFeedbacks(): FeedbackItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_FEEDBACKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalFeedbacks(items: FeedbackItem[]) {
  try {
    localStorage.setItem(LOCAL_FEEDBACKS_KEY, JSON.stringify(items.slice(0, 200)));
  } catch {
    // ignore
  }
}

interface FeedbackItem {
  id: string;
  date: string;
  formattedDate: string;
  name: string;
  email: string;
  category: string;
  message: string;
  attachmentName?: string | null;
  attachmentBase64?: string | null;
  hasAttachment?: boolean;
}

export interface SupportAndFeedbackProps {
  autoOpenAdmin?: boolean;
  initialPasskey?: string;
}

export const SupportAndFeedback: React.FC<SupportAndFeedbackProps> = ({ 
  autoOpenAdmin = false, 
  initialPasskey = '' 
}) => {
  // Form Alanları
  const [category, setCategory] = useState<string>('Öneri');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gizli Yönetici (Admin) Durumları
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(autoOpenAdmin);
  const [adminPasskey, setAdminPasskey] = useState<string>(initialPasskey || '');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('Tümü');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Otomatik Geliştirici Girişi (Arama veya direkt yönlendirmeden gelindiğinde)
  useEffect(() => {
    if (autoOpenAdmin && initialPasskey) {
      setIsAdminModalOpen(true);
      const keyToUse = initialPasskey;
      setAdminPasskey(keyToUse);
      
      // Otomatik giriş ve mesajları yükleme
      const autoLogin = async () => {
        setIsLoadingFeedbacks(true);
        setAdminError(null);
        try {
          const res = await fetch('./api/admin/feedbacks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ passkey: keyToUse.trim() })
          });
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            if (res.ok && data.success) {
              setIsAuthenticated(true);
              setFeedbacks(data.feedbacks || []);
            } else {
              setAdminError(data.error || 'Otomatik giriş başarısız.');
            }
          } else {
            // Statik ortam (GitHub Pages vb.) - SHA-256 doğrulaması ile yerel mesajları aç
            if (isValidAdminPasskeyClient(keyToUse)) {
              setIsAuthenticated(true);
              setFeedbacks(readLocalFeedbacks());
            } else {
              setAdminError('Şifre hatalı. Giriş yetkiniz bulunmuyor.');
            }
          }
        } catch {
          if (isValidAdminPasskeyClient(keyToUse)) {
            setIsAuthenticated(true);
            setFeedbacks(readLocalFeedbacks());
          } else {
            setAdminError('Şifre hatalı. Giriş yetkiniz bulunmuyor.');
          }
        } finally {
          setIsLoadingFeedbacks(false);
        }
      };

      autoLogin();
    } else if (autoOpenAdmin) {
      setIsAdminModalOpen(true);
    }
  }, [autoOpenAdmin, initialPasskey]);

  // Dosya Yükleme & İşleme
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('Dosya boyutu en fazla 10MB olabilir.');
      return;
    }
    setAttachedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFilePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Mesaj Gönderme (Ziyaretçi Kullanıcı)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let attachmentBase64: string | undefined = undefined;

      if (attachedFile) {
        attachmentBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.readAsDataURL(attachedFile);
        });
      }

      const senderName = name.trim() || 'Ziyaretçi';
      const senderEmail = email.trim() || 'Belirtilmedi';
      const cleanMessage = message.trim();

      const localEntry: FeedbackItem = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        formattedDate: new Date().toLocaleString('tr-TR'),
        name: senderName,
        email: senderEmail,
        category,
        message: cleanMessage,
        attachmentName: attachedFile?.name || null,
        attachmentBase64: attachmentBase64 || null,
        hasAttachment: !!attachmentBase64,
      };

      // Yerel tarayıcı yedeğine kaydet (Statik GitHub Pages ortamı için)
      const currentLocal = readLocalFeedbacks();
      saveLocalFeedbacks([localEntry, ...currentLocal]);

      let handledByServer = false;
      try {
        const response = await fetch('./api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: senderName,
            email: email.trim(),
            category,
            message: cleanMessage,
            attachmentName: attachedFile?.name,
            attachmentBase64,
          }),
        });

        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          handledByServer = true;
        } else if (response.status === 429 || response.status === 400) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Mesaj iletilirken bir sorun oluştu.');
        }
      } catch (serverErr: any) {
        if (serverErr?.message && (serverErr.message.includes('Çok fazla') || serverErr.message.includes('boş'))) {
          throw serverErr;
        }
      }

      // Eğer statik ortamda (GitHub Pages) çalışıyorsa doğrudan şifreli uç noktadan e-posta gönder
      if (!handledByServer) {
        const emailPayload: Record<string, any> = {
          _subject: `[Hayat Rehberi - ${category}] ${senderName} Mesaj Gönderdi`,
          _captcha: 'false',
          'Gönderen Adı': senderName,
          'Gönderen E-Posta': senderEmail,
          'Kategori / Konu': category,
          'Mesaj İçeriği': cleanMessage,
          'Ekli Dosya': attachedFile?.name || 'Yok',
          'Gönderim Zamanı': localEntry.formattedDate,
          _template: 'table'
        };

        await fetch(getEncodedMailEndpoint(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify(emailPayload)
        }).catch(() => {});
      }

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setMessage('');
      setAttachedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 7000);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err?.message || 'Mesaj gönderilemedi. Lütfen tekrar deneyiniz.');
    }
  };

  // Yönetici Girişi ve Mesajları Çekme
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasskey.trim()) return;

    setIsLoadingFeedbacks(true);
    setAdminError(null);

    try {
      const res = await fetch('./api/admin/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: adminPasskey.trim() })
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Şifre hatalı. Giriş yetkiniz bulunmuyor.');
        }
        setIsAuthenticated(true);
        setFeedbacks(data.feedbacks || []);
      } else {
        // Statik GitHub Pages ortamı: SHA-256 hash doğrulaması
        if (!isValidAdminPasskeyClient(adminPasskey)) {
          throw new Error('Şifre hatalı. Giriş yetkiniz bulunmuyor.');
        }
        setIsAuthenticated(true);
        setFeedbacks(readLocalFeedbacks());
      }
    } catch (err: any) {
      if (isValidAdminPasskeyClient(adminPasskey) && !err?.message?.includes('Şifre hatalı') && !err?.message?.includes('Geçersiz')) {
        setIsAuthenticated(true);
        setFeedbacks(readLocalFeedbacks());
      } else {
        setAdminError(err.message || 'Yetkilendirme hatası oluştu.');
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  const refreshFeedbacks = async () => {
    if (!adminPasskey) return;
    setIsLoadingFeedbacks(true);
    try {
      const res = await fetch('./api/admin/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: adminPasskey.trim() })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setFeedbacks(data.feedbacks || []);
        }
      } else if (isValidAdminPasskeyClient(adminPasskey)) {
        setFeedbacks(readLocalFeedbacks());
      }
    } catch {
      if (isValidAdminPasskeyClient(adminPasskey)) {
        setFeedbacks(readLocalFeedbacks());
      }
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm('Bu mesaj kaydını kalıcı olarak silmek istediğinize emin misiniz?')) {
      return;
    }
    setDeletingId(id);
    try {
      const updatedLocal = readLocalFeedbacks().filter((f) => f.id !== id);
      saveLocalFeedbacks(updatedLocal);

      const res = await fetch('./api/admin/delete-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: adminPasskey.trim(), id })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          setFeedbacks(data.feedbacks || []);
          return;
        }
      }
      setFeedbacks(updatedLocal);
    } catch {
      const updatedLocal = readLocalFeedbacks().filter((f) => f.id !== id);
      setFeedbacks(updatedLocal);
    } finally {
      setDeletingId(null);
    }
  };

  // Filtrelenmiş Mesajlar
  const filteredFeedbacks = feedbacks.filter((item) => {
    const matchesCat = selectedCategoryFilter === 'Tümü' || item.category === selectedCategoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      item.name.toLowerCase().includes(q) || 
      item.email.toLowerCase().includes(q) || 
      item.message.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-8 font-sans relative">
      
      {/* Üst Kısım: Logo ve Sade Başlık */}
      <div className="text-center mb-6 space-y-2">
        <div className="flex justify-center mb-2">
          <HayatRehberiLogo size="lg" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          İletişim & Geri Bildirim
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Görüş, öneri veya hata bildirimlerinizi doğrudan geliştiriciye iletebilirsiniz.
        </p>
      </div>

      {/* Mesaj Gönderme Formu Kartı */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-5 relative">
        
        {submitSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start gap-3 animate-in fade-in duration-300">
            <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-0.5">
              <strong className="block font-bold">Mesajınız başarıyla iletildi!</strong>
              <p className="text-emerald-800 leading-relaxed">
                Geri bildiriminiz için teşekkür ederiz. İlettiğiniz mesaj doğrudan geliştiriciye ulaştırılmıştır.
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Kategori Seçimi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Konu / Mesaj Türü:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Öneri', label: '💡 Yeni Öneri' },
                { id: 'Hata Bildirimi', label: '🐛 Hata Bildirimi' },
                { id: 'Meal/Ayet', label: '📖 Sure / Meal' },
                { id: 'Diğer', label: '💬 Diğer' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    category === cat.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ad ve E-Posta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="feedback-name" className="block text-xs font-bold text-slate-700 mb-1">
                Adınız (İsteğe bağlı):
              </label>
              <input
                id="feedback-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Ahmet"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-shadow"
              />
            </div>
            <div>
              <label htmlFor="feedback-email" className="block text-xs font-bold text-slate-700 mb-1">
                E-posta Adresiniz (Cevap için isteğe bağlı):
              </label>
              <input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@eposta.com"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-shadow"
              />
            </div>
          </div>

          {/* Mesaj Alanı */}
          <div>
            <label htmlFor="feedback-message" className="block text-xs font-bold text-slate-700 mb-1">
              Mesajınız: *
            </label>
            <textarea
              id="feedback-message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Görüşlerinizi, eksik gördüğünüz yerleri veya hata detaylarını buraya yazabilirsiniz..."
              className="w-full border border-slate-300 rounded-xl p-3.5 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-y transition-shadow leading-relaxed"
            />
          </div>

          {/* Dosya / Ekran Görüntüsü Ekleme */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Ekran Görüntüsü / Resim Ekle (İsteğe bağlı):</span>
              <span className="text-[10px] text-slate-400 font-normal">Maks. 10MB</span>
            </label>

            {!attachedFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1"
              >
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-xs font-medium text-slate-700">
                  Resim veya ekran görüntüsü seçin ya da <span className="text-emerald-700 underline font-semibold">buraya bırakın</span>
                </span>
                <span className="text-[10px] text-slate-400">PNG, JPG, JPEG, PDF</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Önizleme"
                      className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {attachedFile.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {(attachedFile.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  title="Dosyayı kaldır"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Gizlilik ve Güvenlik Bilgisi */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Mesajınız doğrudan geliştiriciye iletilir ve gizlilikle muhafaza edilir.</span>
          </div>

          {/* Gönder Butonu */}
          <button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>İletiliyor...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Mesajı Gönder</span>
              </>
            )}
          </button>

        </form>

      </div>

      {/* Alt Bilgi & Geliştirici Gizli Girişi */}
      <div className="mt-8 pt-4 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 px-2">
        <span>© Hayat Rehberi Projesi</span>
        <button
          onClick={() => {
            setIsAdminModalOpen(true);
            setAdminError(null);
          }}
          className="flex items-center gap-1 hover:text-slate-700 transition-colors p-1 rounded cursor-pointer opacity-75 hover:opacity-100"
          title="Geliştirici Yönetim Paneli"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Geliştirici Erişimi</span>
        </button>
      </div>

      {/* ================= GİZLİ GELİŞTİRİCİ YÖNETİM MODAL / PANELİ ================= */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Başlığı */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Geliştirici Yönetim Paneli</h3>
                  <p className="text-[10px] text-slate-400">Gelen Bildirimleri & Mesajları İnceleme</p>
                </div>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Gövdesi */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4 bg-slate-50/50">
              
              {!isAuthenticated ? (
                /* Şifre Giriş Formu */
                <div className="max-w-sm mx-auto py-8 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">Güvenli Geliştirici Girişi</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Gelen mesajları görüntülemek için geliştirici erişim şifrenizi giriniz.
                    </p>
                  </div>

                  {adminError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-left">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{adminError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAdminLogin} className="space-y-3">
                    <input
                      type="password"
                      autoFocus
                      required
                      value={adminPasskey}
                      onChange={(e) => setAdminPasskey(e.target.value)}
                      placeholder="Geliştirici Şifresi..."
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-center tracking-widest font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isLoadingFeedbacks || !adminPasskey.trim()}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoadingFeedbacks ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" />
                          <span>Giriş Yap ve Mesajları Getir</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                /* Yönetici Mesajlar Listesi & Kontroller */
                <div className="space-y-4">
                  
                  {/* Üst Filtreleme & Arama Araç Çubuğu */}
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Mesajlarda, isimde veya e-postada ara..."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none cursor-pointer"
                      >
                        <option value="Tümü">Tüm Konular ({feedbacks.length})</option>
                        <option value="Öneri">Öneri</option>
                        <option value="Hata Bildirimi">Hata Bildirimi</option>
                        <option value="Meal/Ayet">Sure/Meal</option>
                        <option value="Diğer">Diğer</option>
                      </select>

                      <button
                        onClick={refreshFeedbacks}
                        disabled={isLoadingFeedbacks}
                        className="p-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl transition-colors cursor-pointer shrink-0"
                        title="Yenile"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoadingFeedbacks ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Mesaj Sayısı Özeti */}
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>Toplam <strong>{feedbacks.length}</strong> mesaj bulundu (Görüntülenen: {filteredFeedbacks.length})</span>
                    <span className="text-emerald-700 font-medium">● Sunucu Bağlantısı Aktif</span>
                  </div>

                  {/* Mesaj Kartları */}
                  {filteredFeedbacks.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 text-slate-400 space-y-2">
                      <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-xs font-semibold text-slate-600">Henüz kayıtlı bir geri bildirim mesajı yok.</p>
                      <p className="text-[11px]">Kullanıcılar formu doldurduğunda burada listelenecektir.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredFeedbacks.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
                        >
                          {/* Mesaj Üst Bilgisi */}
                          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                  {item.name}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  item.category === 'Hata Bildirimi'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : item.category === 'Öneri'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                  {item.category}
                                </span>
                              </div>
                              {item.email && item.email !== 'Belirtilmedi' && (
                                <a
                                  href={`mailto:${item.email}`}
                                  className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
                                >
                                  <Mail className="w-3 h-3" />
                                  {item.email}
                                </a>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 whitespace-nowrap">
                                <Clock className="w-3 h-3" />
                                {item.formattedDate || item.date}
                              </span>
                              <button
                                onClick={() => handleDeleteFeedback(item.id)}
                                disabled={deletingId === item.id}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Mesajı Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Mesaj Metni */}
                          <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                            {item.message}
                          </div>

                          {/* Ekli Dosya / Resim */}
                          {item.attachmentBase64 && (
                            <div className="pt-1 flex items-center gap-3">
                              {item.attachmentBase64.startsWith('data:image/') ? (
                                <div className="flex items-center gap-2">
                                  <img
                                    src={item.attachmentBase64}
                                    alt="Ekli Görsel"
                                    onClick={() => setPreviewImage(item.attachmentBase64!)}
                                    className="w-14 h-14 object-cover rounded-xl border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                                  />
                                  <button
                                    onClick={() => setPreviewImage(item.attachmentBase64!)}
                                    className="text-[11px] text-emerald-700 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Görseli Büyüt ({item.attachmentName || 'Görsel'})</span>
                                  </button>
                                </div>
                              ) : (
                                <a
                                  href={item.attachmentBase64}
                                  download={item.attachmentName || 'dosya'}
                                  className="text-xs text-emerald-700 hover:underline flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>{item.attachmentName || 'Ekli Dosyayı İndir'}</span>
                                  <Download className="w-3 h-3 ml-1" />
                                </a>
                              )}
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Modal Alt Çubuğu */}
            <div className="px-5 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500 font-mono">
                {isAuthenticated ? 'Yönetici Oturumu Açık' : 'Kilitli'}
              </span>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Büyük Resim Önizleme Modalı */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-transparent">
            <img
              src={previewImage}
              alt="Büyük Görsel Önizleme"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 bg-white text-slate-800 p-1.5 rounded-full shadow-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
