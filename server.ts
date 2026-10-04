import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Sunucu imzasını gizle ve temel HTTP güvenlik başlıklarını uygula
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Permissions-Policy", "accelerometer=*, gyroscope=*, magnetometer=*, geolocation=*");

  // Hassas yerel veri klasörüne doğrudan HTTP erişimini engelle
  if (req.path.startsWith("/data/feedbacks") || req.path.includes("..")) {
    return res.status(403).json({ error: "Yetkisiz erişim engellendi." });
  }
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ==================== GÜVENLİK: IP TABANLI HIZ SINIRLAYICI (RATE LIMITER) ====================
interface RateRecord {
  count: number;
  resetAt: number;
}

const rateBuckets = new Map<string, Map<string, RateRecord>>();

function getClientIp(req: express.Request): string {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.trim()) {
    return xff.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

function checkRateLimit(bucketName: string, key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  let bucket = rateBuckets.get(bucketName);
  if (!bucket) {
    bucket = new Map<string, RateRecord>();
    rateBuckets.set(bucketName, bucket);
  }

  // Bellek temizliği (1000 kaydı aşarsa süresi dolanları sil)
  if (bucket.size > 1000) {
    for (const [k, v] of bucket.entries()) {
      if (now > v.resetAt) bucket.delete(k);
    }
  }

  const record = bucket.get(key);
  if (!record || now > record.resetAt) {
    bucket.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (record.count >= maxRequests) {
    const retryAfterSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return { allowed: false, retryAfterSec };
  }

  record.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

// Çapraz kaynak (Cross-Origin) bot isteklerini engelleme kontrolü
function isSameOriginRequest(req: express.Request): boolean {
  const origin = req.headers.origin;
  if (!origin) return true; // Aynı origin GET veya sunucu içi istekler
  const host = req.headers.host || "";
  const appUrl = process.env.APP_URL || "";
  try {
    const originHost = new URL(origin).host;
    if (host && originHost === host) return true;
    if (appUrl && origin.startsWith(appUrl)) return true;
    if (originHost.endsWith(".run.app") || originHost.startsWith("localhost") || originHost.startsWith("127.0.0.1")) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

// ==================== GİZLİ E-POSTA ÇÖZÜMLEYİCİ (GitHub Bot & Scraper Korumalı) ====================
// Kaynak kodda düz metin e-posta adresi bulunmaz; ortam değişkeninden veya kodlanmış diziden okunur.
function getDeveloperEmail(): string {
  if (process.env.DEVELOPER_EMAIL && process.env.DEVELOPER_EMAIL.trim()) {
    return process.env.DEVELOPER_EMAIL.trim();
  }
  const encodedChars = [
    98, 105, 108, 103, 105, 115, 97, 121, 97, 114, 46,
    105, 99, 105, 110, 46, 110, 101, 116, 64,
    103, 109, 97, 105, 108, 46, 99, 111, 109
  ];
  return String.fromCharCode(...encodedChars);
}

app.post("/api/feedback", async (req, res) => {
  try {
    if (!isSameOriginRequest(req)) {
      return res.status(403).json({ error: "Dış kaynaklı isteklere izin verilmiyor." });
    }

    const clientIp = getClientIp(req);
    const rate = checkRateLimit("feedback_ip", clientIp, 5, 15 * 60 * 1000); // 15 dakikada en fazla 5 mesaj
    if (!rate.allowed) {
      return res.status(429).json({
        error: `Çok fazla mesaj gönderildi. Lütfen ${rate.retryAfterSec} saniye sonra tekrar deneyiniz.`
      });
    }

    const { name, email, category, message, attachmentName, attachmentBase64 } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Mesaj alanı boş bırakılamaz." });
    }

    if (message.length > 4000) {
      return res.status(400).json({ error: "Mesaj metni en fazla 4000 karakter olabilir." });
    }

    const feedbackEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      formattedDate: new Date().toLocaleString("tr-TR"),
      name: String(name || "").trim().slice(0, 100) || "Ziyaretçi",
      email: String(email || "").trim().slice(0, 150) || "Belirtilmedi",
      category: String(category || "Genel").trim().slice(0, 60),
      message: message.trim(),
      attachmentName: attachmentName ? String(attachmentName).slice(0, 150) : null,
      attachmentBase64: attachmentBase64 ? String(attachmentBase64) : null,
      hasAttachment: !!attachmentBase64,
    };

    // 1. E-posta Yönlendirme (Sunucu üzerinden gizli olarak iletilir)
    try {
      const targetEmail = getDeveloperEmail();
      const emailPayload: Record<string, any> = {
        _subject: `[Hayat Rehberi - ${feedbackEntry.category}] ${feedbackEntry.name} Mesaj Gönderdi`,
        _captcha: "false",
        "Gönderen Adı": feedbackEntry.name,
        "Gönderen E-Posta": feedbackEntry.email,
        "Kategori / Konu": feedbackEntry.category,
        "Mesaj İçeriği": feedbackEntry.message,
        "Ekli Dosya": feedbackEntry.attachmentName || "Yok",
        "Gönderim Zamanı": feedbackEntry.formattedDate,
        _template: "table"
      };

      const mailRes = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(emailPayload)
      });
      
      await mailRes.json().catch(() => ({}));
    } catch (mailDispatchErr) {
      console.warn("[Mail Dispatch Hatası]:", mailDispatchErr);
    }

    // 2. Sunucu tarafında feedbacks.json dosyasına güvenli yerel yedek kaydı
    const feedbackDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(feedbackDir)) {
      fs.mkdirSync(feedbackDir, { recursive: true });
    }

    const feedbackFile = path.join(feedbackDir, "feedbacks.json");
    let feedbacksList: any[] = [];
    if (fs.existsSync(feedbackFile)) {
      try {
        const raw = fs.readFileSync(feedbackFile, "utf8");
        feedbacksList = JSON.parse(raw);
      } catch {
        feedbacksList = [];
      }
    }

    feedbacksList.unshift(feedbackEntry);
    // Disk taşmasını önlemek için en son 500 mesajı tut
    if (feedbacksList.length > 500) {
      feedbacksList = feedbacksList.slice(0, 500);
    }
    fs.writeFileSync(feedbackFile, JSON.stringify(feedbacksList, null, 2), "utf8");

    return res.json({ 
      success: true, 
      message: "Geri bildiriminiz geliştiriciye başarıyla iletildi." 
    });
  } catch (error: any) {
    console.error("Geri bildirim kaydetme hatası:", error?.message);
    return res.status(500).json({ error: "Mesaj iletilirken bir sunucu hatası oluştu." });
  }
});

// ==================== GİZLİ YÖNETİCİ (ADMİN) UÇ NOKTALARI (SHA-256 HASH KORUMALI) ====================
// Şifreler kaynak kodda düz metin olarak yer almaz; yalnızca kriptografik SHA-256 özetleri karşılaştırılır.
const VALID_ADMIN_PASSKEY_HASHES = new Set([
  "e50c73cd374d21ff36d95af72186b8d293801fe61ea5c8df6cc0137944cf70c5",
  "48a5bd8d91ce345ea605b14e50bc4fe22337bbe089112e1616e6128cc0a6de12",
  "e3829f24b3aee6969a8397765f7f4e6a089febfd5a27e28947fa50e22c72ce24",
  "c041bca82342d6b4d955b87bb3ef0acc170597521d3b9b2fec381cd30939ee0a",
  "cd923e112d2394144364e5bdbfa23f70a2b355ef242330bbcc3f90b3a05ec69d",
  "aef0d1f4a1477556f1becf6783724802d83326aece8475b4671c7cf060a6743d"
]);

function isValidAdminPasskey(rawPasskey: unknown): boolean {
  if (!rawPasskey || typeof rawPasskey !== "string") return false;
  const trimmed = rawPasskey.trim();
  if (!trimmed || trimmed.length > 100) return false;

  // Eğer ortam değişkeninde özel bir ADMIN_PASSKEY tanımlanmışsa onu da kabul et
  if (process.env.ADMIN_PASSKEY && process.env.ADMIN_PASSKEY.trim() === trimmed) {
    return true;
  }

  const hashExact = crypto.createHash("sha256").update(trimmed).digest("hex");
  const hashLower = crypto.createHash("sha256").update(trimmed.toLowerCase()).digest("hex");

  return VALID_ADMIN_PASSKEY_HASHES.has(hashExact) || VALID_ADMIN_PASSKEY_HASHES.has(hashLower);
}

app.post("/api/admin/feedbacks", async (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const bruteCheck = checkRateLimit("admin_auth_ip", clientIp, 10, 15 * 60 * 1000);
    if (!bruteCheck.allowed) {
      return res.status(429).json({ error: "Çok fazla başarısız giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin." });
    }

    const { passkey } = req.body;

    if (!isValidAdminPasskey(passkey)) {
      return res.status(401).json({ error: "Geçersiz yönetici şifresi. Erişim reddedildi." });
    }

    const feedbackFile = path.join(process.cwd(), "data", "feedbacks.json");
    let feedbacksList: any[] = [];
    if (fs.existsSync(feedbackFile)) {
      try {
        const raw = fs.readFileSync(feedbackFile, "utf8");
        feedbacksList = JSON.parse(raw);
      } catch {
        feedbacksList = [];
      }
    }

    return res.json({
      success: true,
      count: feedbacksList.length,
      feedbacks: feedbacksList
    });
  } catch (err: any) {
    console.error("Admin geri bildirim okuma hatası:", err?.message);
    return res.status(500).json({ error: "Geri bildirimler okunurken hata oluştu." });
  }
});

app.post("/api/admin/delete-feedback", async (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const bruteCheck = checkRateLimit("admin_auth_ip", clientIp, 10, 15 * 60 * 1000);
    if (!bruteCheck.allowed) {
      return res.status(429).json({ error: "Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin." });
    }

    const { passkey, id } = req.body;

    if (!isValidAdminPasskey(passkey)) {
      return res.status(401).json({ error: "Geçersiz yönetici şifresi." });
    }

    const feedbackFile = path.join(process.cwd(), "data", "feedbacks.json");
    if (!fs.existsSync(feedbackFile)) {
      return res.json({ success: true, feedbacks: [] });
    }

    const raw = fs.readFileSync(feedbackFile, "utf8");
    let feedbacksList = JSON.parse(raw);
    feedbacksList = feedbacksList.filter((f: any) => f.id !== id);
    fs.writeFileSync(feedbackFile, JSON.stringify(feedbacksList, null, 2), "utf8");

    return res.json({ success: true, count: feedbacksList.length, feedbacks: feedbacksList });
  } catch (err: any) {
    console.error("Admin silme hatası:", err?.message);
    return res.status(500).json({ error: "Silme işlemi sırasında hata oluştu." });
  }
});

// ==================== GEMINI AI TEFSİR & GRAMER ANALİZİ (KOTA & LİMİT KORUMALI) ====================
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key === "YOUR_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY ortam değişkeni tanımlı değil.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// Aynı ayet/kelime analizlerinin tekrar tekrar API kotası harcamasını önleyen akıllı önbellek
const geminiAnalysisCache = new Map<string, any>();
const MAX_GEMINI_CACHE_SIZE = 1000;

app.post("/api/gemini-analyze", async (req, res) => {
  try {
    if (!isSameOriginRequest(req)) {
      return res.status(403).json({ error: "Dış kaynaklı API kullanımına izin verilmemektedir." });
    }

    const { arabicText, translation, surahName } = req.body;

    if (!arabicText || typeof arabicText !== "string" || !arabicText.trim()) {
      return res.status(400).json({ error: "Arapça metin gereklidir." });
    }

    const cleanArabic = arabicText.trim();
    const cleanTranslation = typeof translation === "string" ? translation.trim() : "";
    const cleanSurah = typeof surahName === "string" ? surahName.trim() : "Kur'an-ı Kerim";

    // Kötüye kullanım (uzun metin / prompt injection) koruması
    if (cleanArabic.length > 600 || cleanTranslation.length > 1500 || cleanSurah.length > 100) {
      return res.status(400).json({
        error: "Seçilen metin analiz sınırını aşıyor. Lütfen daha kısa bir ayet veya kelime grubu seçiniz."
      });
    }

    // 1. Önbellek Kontrolü (Kotadan 0 harcama ile anında yanıt)
    const cacheKey = `${cleanSurah}::${cleanArabic}`;
    if (geminiAnalysisCache.has(cacheKey)) {
      return res.json(geminiAnalysisCache.get(cacheKey));
    }

    // 2. IP Başına Dakikalık ve Saatlik Kota Koruması
    const clientIp = getClientIp(req);
    const maxPerMin = parseInt(process.env.GEMINI_RATE_LIMIT_PER_MIN || "10", 10);
    const maxPerHour = parseInt(process.env.GEMINI_RATE_LIMIT_PER_HOUR || "60", 10);
    const maxDailyGlobal = parseInt(process.env.GEMINI_DAILY_MAX_REQUESTS || "500", 10);

    const minLimit = checkRateLimit("gemini_min", clientIp, maxPerMin, 60 * 1000);
    if (!minLimit.allowed) {
      return res.status(429).json({
        error: `Dakikalık analiz sınırına ulaştınız. Lütfen ${minLimit.retryAfterSec} saniye bekleyip tekrar deneyiniz.`
      });
    }

    const hourLimit = checkRateLimit("gemini_hour", clientIp, maxPerHour, 60 * 60 * 1000);
    if (!hourLimit.allowed) {
      return res.status(429).json({
        error: "Saatlik yapay zekâ analiz sınırına ulaştınız. Lütfen daha sonra tekrar deneyiniz."
      });
    }

    const dailyGlobalLimit = checkRateLimit("gemini_global_day", "global", maxDailyGlobal, 24 * 60 * 60 * 1000);
    if (!dailyGlobalLimit.allowed) {
      return res.status(429).json({
        error: "Günlük toplam yapay zekâ analiz kotası dolmuştur. Lütfen yarın tekrar deneyiniz."
      });
    }

    const ai = getAi();

    const prompt = `
Sen uzman bir Kur'an Arapçası, Filoloji ve Tefsir akademisyenisin.
${cleanSurah} Suresi'nde geçen şu seçim için analiz yap:
Seçilen Arapça İfade / Terkip: "${cleanArabic}"
Bağlam Meali: "${cleanTranslation}"

SADECE aşağıdaki JSON formatında geçerli bir yanıt dön, başka hiçbir açıklama yazma:
{
  "terkip_anlami": "Bütüncül terkip/cümle detaylı anlamı ve edebi inceliği",
  "kelime_analizi": [
    {
      "kelime": "Arapça Kelime (Okunuş)",
      "anlam": "Tekil kelime anlamı",
      "kok_ve_gramer": "Kökü, vezni/babı, gramer yapısı ve i'rabı"
    }
  ],
  "tafsir_baglami": "Ayet içindeki tefsir, hikmet ve mana bağlamı",
  "nuzul_ve_teknik": "Ayetin nüzul sebebi/arkaplanı veya belagat inceliği"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text;
    if (!responseText) {
      return res.status(500).json({ error: "Yapay zekadan boş yanıt döndü." });
    }

    let parsedResult: any = null;
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      }
    }

    if (!parsedResult) {
      return res.status(500).json({ error: "Analiz yanıtı çözümlenemedi." });
    }

    // Önbelleğe kaydet
    if (geminiAnalysisCache.size >= MAX_GEMINI_CACHE_SIZE) {
      const firstKey = geminiAnalysisCache.keys().next().value;
      if (firstKey) geminiAnalysisCache.delete(firstKey);
    }
    geminiAnalysisCache.set(cacheKey, parsedResult);

    return res.json(parsedResult);
  } catch (error: any) {
    console.error("Gemini analiz hatası:", error?.message || "Bilinmeyen hata");
    return res.status(500).json({ 
      error: "Yapay zekâ tahlili şu anda gerçekleştirilemiyor. Lütfen daha sonra tekrar deneyiniz." 
    });
  }
});

// Kur'an-ı Kerim Sure ve Ayet Proxy Uç Noktası (Önbellekli & Yerel & Çift Kaynaklı)
const surahCache = new Map<number, any>();

app.get("/api/quran/surah/:id", async (req, res) => {
  const surahId = parseInt(req.params.id, 10);
  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    return res.status(400).json({ error: "Geçersiz sure numarası (1-114 olmalıdır)." });
  }

  if (surahCache.has(surahId)) {
    return res.json(surahCache.get(surahId));
  }

  // 0. Kaynak: Yerel Depolanan Kur'an-ı Kerim Dosyaları (Anında, 0 ms gecikme)
  try {
    const localPath = path.join(process.cwd(), "public", "data", "surah", `${surahId}.json`);
    if (fs.existsSync(localPath)) {
      const content = fs.readFileSync(localPath, "utf8");
      const data = JSON.parse(content);
      surahCache.set(surahId, data);
      return res.json(data);
    }
  } catch (localErr) {
    console.warn(`[Proxy] Yerel dosya okunamadı (${surahId}):`, localErr);
  }

  // 1. Kaynak: Quran.com API (Hızlı Uthmani metni ve Diyanet meali)
  try {
    const quranComUrl = `https://api.quran.com/api/v4/verses/by_chapter/${surahId}?language=tr&words=false&translations=77&fields=text_uthmani&per_page=300`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const resp = await fetch(quranComUrl, { signal: controller.signal });
    clearTimeout(timer);

    if (resp.ok) {
      const data: any = await resp.json();
      if (data && data.verses && data.verses.length > 0) {
        const ayahs = data.verses.map((v: any) => {
          const trText = v.translations && v.translations[0] ? v.translations[0].text.replace(/<[^>]*>/g, '') : null;
          const numInSurah = parseInt(v.verse_key ? v.verse_key.split(':')[1] : v.verse_number, 10);
          return {
            numberInSurah: numInSurah,
            ar: v.text_uthmani || v.text || '',
            tr: trText
          };
        });

        const result = {
          number: surahId,
          ayahs
        };
        surahCache.set(surahId, result);
        return res.json(result);
      }
    }
  } catch (err) {
    console.warn(`[Proxy] Quran.com API (Sure ${surahId}) başarısız, AlQuran Cloud deneniyor...`, err);
  }

  // 2. Kaynak: AlQuran Cloud API
  try {
    const alquranUrl = `https://api.alquran.cloud/v1/surah/${surahId}/editions/quran-uthmani,tr.diyanet`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const resp = await fetch(alquranUrl, { signal: controller.signal });
    clearTimeout(timer);

    if (resp.ok) {
      const json: any = await resp.json();
      if (json && json.data && json.data.length >= 1) {
        const arEd = json.data[0];
        const trEd = json.data[1];
        const ayahs = arEd.ayahs.map((a: any, idx: number) => ({
          numberInSurah: a.numberInSurah,
          ar: a.text,
          tr: trEd && trEd.ayahs[idx] ? trEd.ayahs[idx].text : null
        }));

        const result = {
          number: surahId,
          name: arEd.name,
          englishName: arEd.englishName,
          ayahs
        };
        surahCache.set(surahId, result);
        return res.json(result);
      }
    }
  } catch (err2) {
    console.error(`[Proxy] AlQuran Cloud API (Sure ${surahId}) de başarısız oldu:`, err2);
  }

  return res.status(502).json({ error: "Sure verisi sunucu kaynaklarından alınamadı." });
});

// ==================== YEREL MUSHAF GÖRSELLERİ YÖNETİMİ (MUSHAF-1, MUSHAF-2 & MUSHAF-3) ====================
const MUSHAF_BASE_DIR = path.join(process.cwd(), "public", "mushaflar");
const VALID_MUSHAF_SOURCES = new Set(["mushaf-1", "mushaf-2", "mushaf-3"]);

function ensureMushafDirs() {
  try {
    for (const src of VALID_MUSHAF_SOURCES) {
      const dir = path.join(MUSHAF_BASE_DIR, src);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    // Windows ters eğik çizgi (\) ile oluşturulmuş olabilecek dosyaları tarayıp doğru klasöre taşı
    const scanDirs = [process.cwd(), path.join(process.cwd(), "public")];
    for (const sDir of scanDirs) {
      if (!fs.existsSync(sDir)) continue;
      const entries = fs.readdirSync(sDir);
      for (const entry of entries) {
        if (entry.includes("\\") && entry.toLowerCase().includes("mushaf")) {
          const fullWrongPath = path.join(sDir, entry);
          try {
            const stat = fs.statSync(fullWrongPath);
            const normalized = entry.replace(/\\+/g, "/").replace(/^\/+/, "");
            const match = normalized.match(/mushaflar\/(mushaf-[123])\/([^/]+)$/i);
            if (stat.isFile() && stat.size > 100 && match) {
              const targetPath = path.join(MUSHAF_BASE_DIR, match[1].toLowerCase(), match[2]);
              fs.renameSync(fullWrongPath, targetPath);
            } else if (stat.isFile() && stat.size <= 100 && (Date.now() - stat.mtimeMs > 60000)) {
              fs.unlinkSync(fullWrongPath);
            }
          } catch {}
        }
      }
    }
  } catch (err) {
    console.warn("[Mushaf Dizin Hazırlama Uyarısı]:", err);
  }
}

setImmediate(() => {
  ensureMushafDirs();
});

function getValidMushafPageCount(source: string): { count: number; pages: number[] } {
  const dir = path.join(MUSHAF_BASE_DIR, source);
  if (!fs.existsSync(dir)) return { count: 0, pages: [] };
  const pageSet = new Set<number>();
  try {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (!/\.(jpg|jpeg|png|webp)$/i.test(f)) continue;
      const fullPath = path.join(dir, f);
      try {
        const st = fs.statSync(fullPath);
        if (st.isFile() && st.size > 100) {
          const m = f.match(/(\d+)/);
          if (m) {
            const pNum = parseInt(m[1], 10);
            if (pNum >= 1 && pNum <= 610) pageSet.add(pNum);
          }
        }
      } catch {}
    }
  } catch {}
  const pages = Array.from(pageSet).sort((a, b) => a - b);
  return { count: pages.length, pages };
}

app.get("/api/mushaf/status", (_req, res) => {
  ensureMushafDirs();
  const m1 = getValidMushafPageCount("mushaf-1");
  const m2 = getValidMushafPageCount("mushaf-2");
  const m3 = getValidMushafPageCount("mushaf-3");
  return res.json({
    "mushaf-1": { count: m1.count, pages: m1.pages },
    "mushaf-2": { count: m2.count, pages: m2.pages },
    "mushaf-3": { count: m3.count, pages: m3.pages }
  });
});

app.post("/api/mushaf/upload-batch", (req, res) => {
  try {
    if (!isSameOriginRequest(req)) {
      return res.status(403).json({ error: "Yetkisiz istek." });
    }
    ensureMushafDirs();
    const items = Array.isArray(req.body?.files) ? req.body.files : [];
    if (items.length === 0) {
      return res.status(400).json({ error: "Yüklenecek dosya bulunamadı." });
    }

    let savedCount = 0;
    for (const item of items) {
      const source = String(item?.source || "").trim().toLowerCase();
      if (!VALID_MUSHAF_SOURCES.has(source)) continue;

      const pageNum = parseInt(String(item?.page || ""), 10);
      if (isNaN(pageNum) || pageNum < 0 || pageNum > 610) continue;

      const rawBase64 = String(item?.base64 || "");
      const cleanBase64 = rawBase64.includes(",") ? rawBase64.split(",")[1] : rawBase64;
      if (!cleanBase64) continue;

      const buf = Buffer.from(cleanBase64, "base64");
      if (buf.length <= 100) continue; // Boş (0 byte) dosyaları kaydetme

      const targetDir = path.join(MUSHAF_BASE_DIR, source);
      const targetFile = path.join(targetDir, `${pageNum}.jpg`);
      fs.writeFileSync(targetFile, buf);

      // Eğer dist klasörü mevcutsa oraya da senkronize et
      const distDir = path.join(process.cwd(), "dist", "mushaflar", source);
      if (fs.existsSync(path.join(process.cwd(), "dist"))) {
        if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
        fs.writeFileSync(path.join(distDir, `${pageNum}.jpg`), buf);
      }

      savedCount++;
    }

    const m1 = getValidMushafPageCount("mushaf-1");
    const m2 = getValidMushafPageCount("mushaf-2");
    const m3 = getValidMushafPageCount("mushaf-3");

    return res.json({
      success: true,
      saved: savedCount,
      status: {
        "mushaf-1": { count: m1.count, pages: m1.pages },
        "mushaf-2": { count: m2.count, pages: m2.pages },
        "mushaf-3": { count: m3.count, pages: m3.pages }
      }
    });
  } catch (err: any) {
    console.error("[Mushaf Upload Hatası]:", err?.message);
    return res.status(500).json({ error: "Dosyalar kaydedilirken sunucu hatası oluştu." });
  }
});

// 0 baytlık boş Mushaf görsellerinin bozuk resim olarak dönmesini önleyen ara katman
app.get("/mushaflar/:source/:filename", (req, res) => {
  const source = req.params.source;
  const filename = req.params.filename;
  if (!VALID_MUSHAF_SOURCES.has(source) || filename.includes("..")) {
    return res.status(404).end();
  }

  const candidatePaths = [
    path.join(MUSHAF_BASE_DIR, source, filename),
    path.join(process.cwd(), "dist", "mushaflar", source, filename)
  ];

  // Eğer 001.jpg gibi dolgulu bir ad istendiyse 1.jpg karşılığını da kontrol et
  const numMatch = filename.match(/(\d+)/);
  if (numMatch) {
    const cleanNum = parseInt(numMatch[1], 10);
    if (!isNaN(cleanNum)) {
      candidatePaths.push(path.join(MUSHAF_BASE_DIR, source, `${cleanNum}.jpg`));
      candidatePaths.push(path.join(process.cwd(), "dist", "mushaflar", source, `${cleanNum}.jpg`));
    }
  }

  for (const filePath of candidatePaths) {
    if (fs.existsSync(filePath)) {
      try {
        const st = fs.statSync(filePath);
        if (st.isFile() && st.size > 100) {
          res.setHeader("Cache-Control", "public, max-age=31536000");
          return res.sendFile(filePath);
        }
      } catch {}
    }
  }
  return res.status(404).end();
});

// Vite Middleware Entegrasyonu
process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));

async function initServer() {
  // Statik genel varlıkları (mushaf.html, /data/surah/*.json, ikonlar vb.) doğrudan servis et
  app.use(express.static(path.join(process.cwd(), "public")));

  // Port 3000'i anında dinlemeye başla (büyük statik klasörlerde zaman aşımını önler)
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sunucu http://0.0.0.0:${PORT} üzerinde çalışıyor`);
  });

  if (process.env.NODE_ENV !== "production") {
    const vitePromise = createViteServer({
      server: { 
        middlewareMode: true,
        host: "0.0.0.0",
        port: PORT,
        hmr: false,
        watch: null
      },
      appType: "spa",
    });

    app.use(async (req, res, next) => {
      try {
        const vite = await vitePromise;
        if (req.url && (req.url.startsWith("/src/") || req.url === "/" || req.url.startsWith("/index.html"))) {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
          vite.moduleGraph.invalidateAll();
        }
        return vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

initServer();
