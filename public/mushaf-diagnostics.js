/* Mushaf reader diagnostics: bounded, local-only, no religious text or personal data. */
(function () {
  'use strict';
  var KEY = 'mushaf_diagnostics_v1';
  var READER_BUILD = 'mushaf-20261030-r2';
  var LIMIT = 80;
  var RETAIN_MS = 7 * 86400000;
  var storeFallback = [];
  var CODES = [
    'READER_OPEN', 'READER_RUNTIME_ERROR', 'READER_PROMISE_ERROR',
    'RESOURCE_ERROR', 'SAVED_DATA_INVALID', 'STORAGE_READ_FAILED',
    'STORAGE_WRITE_FAILED', 'SURAH_LOAD_FAILED', 'SURAH_FALLBACK',
    'SURAH_LOAD_RECOVERED', 'MUSHAF_IMAGE_FAILED', 'MUSHAF_IMAGE_RETRY',
    'IMAGE_IDB_FAILED', 'IMAGE_UPLOAD_FAILED', 'IMAGE_UPLOAD_SAVED',
    'IMAGE_UPLOAD_IGNORED', 'PAGE_NAVIGATION', 'SOURCE_CHANGED',
    'BOOKMARK_SAVED', 'BOOKMARK_FAILED', 'MODE_CHANGED',
  ];
  var ALLOWED = {
    page: true, surah: true, source: true, mode: true, stage: true,
    status: true, count: true, attempt: true, name: true, online: true,
    line: true, column: true,
  };
  var listeners = [];
  function valid(row) {
    return !!row && typeof row === 'object' &&
      typeof row.at === 'string' && Number.isFinite(Date.parse(row.at)) &&
      CODES.indexOf(row.code) !== -1 &&
      ['info', 'warning', 'error'].indexOf(row.level) !== -1;
  }
  function trim(rows) {
    var earliest = Date.now() - RETAIN_MS;
    return rows.filter(function (row) {
      return valid(row) && Date.parse(row.at) >= earliest;
    }).slice(-LIMIT);
  }
  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return storeFallback.slice();
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return storeFallback.slice();
      return trim(parsed);
    } catch (_) {
      return storeFallback.slice();
    }
  }
  function notify() {
    listeners.forEach(function (fn) {
      try { fn(); } catch (_) {}
    });
  }
  function log(code, level, details) {
    if (CODES.indexOf(code) === -1) return;
    var clean = {};
    Object.keys(details || {}).forEach(function (key) {
      if (!ALLOWED[key]) return;
      var value = details[key];
      if (typeof value === 'boolean') clean[key] = value;
      else if (typeof value === 'number' && Number.isFinite(value)) {
        clean[key] = Math.round(value * 100) / 100;
      } else if (typeof value === 'string' && /^[A-Za-z0-9_-]{1,36}$/.test(value)) {
        clean[key] = value;
      }
    });
    var row = { at: new Date().toISOString(),
      level: ['info','warning','error'].indexOf(level) !== -1 ? level : 'info',
      code: code, details: clean };
    storeFallback = trim(read().concat([row]));
    try { localStorage.setItem(KEY, JSON.stringify(storeFallback)); } catch (_) {}
    notify();
  }
  function clear() {
    storeFallback = [];
    try { localStorage.removeItem(KEY); } catch (_) {}
    notify();
  }
  function safeName(error) {
    var name = error && typeof error.name === 'string' ? error.name : 'UnknownError';
    return name === 'Error' || /^[A-Za-z]{2,30}Error$/.test(name) ? name : 'UnknownError';
  }
  function report() {
    var rows = read();
    var header = [
      'HAYAT REHBERI - MUSHAF-I SERIF TEKNIK RAPORU',
      'Surum: ' + READER_BUILD,
      'Olusturulma: ' + new Date().toISOString(),
      'Kayit sayisi: ' + rows.length,
      'Son 80 olay / 7 gun. Kayitlar bu cihazda saklanir.',
      'Ayet metinleri, URL, dosya adlari, kullanici kimligi ve hata mesajlari bulunmaz.',
      '---',
    ];
    return header.concat(rows.map(function (row) {
      return row.at + ' | ' + row.level.toUpperCase() + ' | ' +
        row.code + ' | ' + Object.keys(row.details || {}).map(function (key) {
          return key + '=' + row.details[key];
        }).join(' ');
    })).join('\n');
  }
  var api = Object.freeze({ log: log, read: read, clear: clear, report: report, safeName: safeName });
  window.MushafDiagnostics = api;

  window.addEventListener('error', function (event) {
    if (event.target && event.target !== window) {
      var tag = event.target.tagName;
      if (tag === 'SCRIPT' || tag === 'LINK') {
        log('RESOURCE_ERROR', 'error', { stage: tag.toLowerCase(), online: navigator.onLine });
      }
      return;
    }
    log('READER_RUNTIME_ERROR', 'error', {
      name: safeName(event.error), stage: 'script',
      line: Number.isInteger(event.lineno) && event.lineno > 0 ? event.lineno : 0,
      column: Number.isInteger(event.colno) && event.colno > 0 ? event.colno : 0,
    });
  }, true);
  window.addEventListener('unhandledrejection', function (event) {
    log('READER_PROMISE_ERROR', 'error', { name: safeName(event.reason) });
  });

  function mountPanel() {
    if (!document.body || document.getElementById('mushafDiagnosticToggle')) return;
    var style = document.createElement('style');
    style.textContent =
      '#mushafDiagnosticToggle{position:fixed;right:10px;bottom:82px;z-index:2000;background:#163c31;color:#fff;border:1px solid #45ad8c;padding:7px 11px;border-radius:10px;font:600 12px Inter,system-ui;cursor:pointer;box-shadow:0 2px 12px #0004}' +
      '#mushafDiagnosticPanel{position:fixed;right:10px;bottom:122px;z-index:2001;width:min(370px,calc(100vw - 20px));max-height:min(480px,70dvh);overflow:auto;background:#132821;color:#fff;border:1px solid #45ad8c;border-radius:14px;padding:12px;box-shadow:0 15px 30px #0007;font:12px Inter,system-ui}' +
      '#mushafDiagnosticPanel[hidden]{display:none}' +
      '#mushafDiagnosticPanel button{border:1px solid #4cb295;color:white;background:#16503d;border-radius:8px;padding:7px 9px;margin:5px 4px 0 0;cursor:pointer}' +
      '#mushafDiagnosticEvents{max-height:215px;overflow:auto;padding:6px;background:#0b1d17;border-radius:7px;font:11px monospace;white-space:pre-wrap;overflow-wrap:anywhere}' +
      '#mushafDiagnosticReport{width:100%;height:55px;background:#0b1d17;color:#d8eee4;border:1px solid #365b4c;border-radius:6px;margin-top:7px;font:10px monospace}';
    document.head.appendChild(style);
    var toggle = document.createElement('button');
    toggle.id = 'mushafDiagnosticToggle';
    toggle.type = 'button';
    toggle.textContent = 'Hata kayıtları';
    toggle.setAttribute('aria-label', 'Mushaf hata kayıtlarını aç');
    toggle.setAttribute('aria-expanded', 'false');
    var panel = document.createElement('section');
    panel.id = 'mushafDiagnosticPanel';
    panel.setAttribute('aria-label', 'Mushaf teknik hata raporu');
    panel.setAttribute('role', 'region');
    panel.hidden = true;
    var title = document.createElement('strong');
    title.textContent = 'Mushaf-ı Şerif hata kayıtları';
    var help = document.createElement('p');
    help.textContent = 'En fazla 80 teknik olay, 7 gün. Veriler yalnızca bu cihazda tutulur ve otomatik gönderilmez.';
    var events = document.createElement('div');
    events.id = 'mushafDiagnosticEvents';
    var copy = document.createElement('button');
    copy.type = 'button';
    copy.textContent = 'Raporu kopyala';
    var erase = document.createElement('button');
    erase.type = 'button';
    erase.textContent = 'Kayıtları temizle';
    var close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Kapat';
    var textarea = document.createElement('textarea');
    textarea.id = 'mushafDiagnosticReport';
    textarea.readOnly = true;
    textarea.setAttribute('aria-label', 'Kopyalanabilir teknik rapor');
    function refresh() {
      var rows = read();
      events.textContent = rows.length ? rows.slice().reverse().map(function (row) {
        return row.at + ' ' + row.level.toUpperCase() + ' ' + row.code +
          ' ' + Object.keys(row.details || {}).map(function (key) {
            return key + ':' + row.details[key];
          }).join(' ');
      }).join('\n') : 'Henüz hata kaydı bulunmuyor.';
      textarea.value = report();
    }
    toggle.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
      toggle.setAttribute('aria-expanded', String(!panel.hidden));
      if (!panel.hidden) refresh();
    });
    close.addEventListener('click', function () {
      panel.hidden = true; toggle.setAttribute('aria-expanded', 'false');
    });
    copy.addEventListener('click', function () {
      var data = report();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(data).then(function () {
          copy.textContent = 'Kopyalandı';
        }).catch(function () { textarea.focus(); textarea.select(); });
      } else { textarea.focus(); textarea.select(); }
    });
    erase.addEventListener('click', clear);
    panel.appendChild(title);
    panel.appendChild(help);
    panel.appendChild(events);
    panel.appendChild(copy);
    panel.appendChild(erase);
    panel.appendChild(close);
    panel.appendChild(textarea);
    document.body.appendChild(toggle);
    document.body.appendChild(panel);
    listeners.push(function () { if (!panel.hidden) refresh(); });
    refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountPanel);
  else mountPanel();
  log('READER_OPEN', 'info', { online: navigator.onLine });
})();
