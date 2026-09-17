// ================================================================
// YeahEdu-TDA v12.5 - Module 23: Shared Export Helper
// Cung cap 1 template PDF/HTML DUY NHAT dep cho:
//   Study Guide, FAQ, Timeline, Mindmap 3D, Reader
// Sync voi _libCSS() cua module 06 - giu tinh nhat quan
// ================================================================
(function(){
  'use strict';

  // Base CSS ĐẸP - dùng chung cho mọi export
  window.yeExportCSS = function(){
    return ''
      + '*,*::before,*::after{box-sizing:border-box}'
      + 'body{font-family:Georgia,"Cambria","Times New Roman",serif;margin:0;background:#f5f5f7;color:#1a1a2e;line-height:1.75}'
      + '.doc-page{max-width:820px;margin:0 auto;background:#fff;padding:36px 44px;box-shadow:0 4px 24px rgba(0,0,0,.08);min-height:100vh}'
      // Cover
      + '.doc-cover{text-align:center;padding:80px 40px 60px;background:linear-gradient(135deg,#00c896 0%,#007cf0 100%);color:#fff;border-radius:0 0 24px 24px;margin:-36px -44px 40px;position:relative;overflow:hidden}'
      + '.doc-cover::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 30% 20%,rgba(255,255,255,.15) 0,transparent 40%),radial-gradient(circle at 70% 80%,rgba(255,255,255,.1) 0,transparent 40%);pointer-events:none}'
      + '.doc-cover .cv-badge{display:inline-block;background:rgba(255,255,255,.2);padding:6px 14px;border-radius:20px;font-size:.85rem;font-weight:700;letter-spacing:1px;margin-bottom:20px;position:relative}'
      + '.doc-cover h1{font-size:2.4rem;margin:0 0 12px;font-weight:800;text-shadow:0 2px 8px rgba(0,0,0,.15);position:relative}'
      + '.doc-cover .cv-sub{font-size:1.05rem;opacity:.95;position:relative}'
      + '.doc-cover .cv-meta{margin-top:24px;font-size:.85rem;opacity:.85;position:relative}'
      // Headings
      + 'h1{color:#0d6efd;font-size:1.8rem;margin:0 0 16px;font-weight:800;border-bottom:3px solid #00c896;padding-bottom:8px}'
      + 'h2{color:#1a3a5c;font-size:1.35rem;margin:32px 0 12px;font-weight:800;border-left:5px solid #00c896;padding:6px 0 6px 14px;background:linear-gradient(90deg,rgba(0,200,150,.08),transparent)}'
      + 'h3{color:#2c3e50;font-size:1.1rem;margin:20px 0 8px;font-weight:700}'
      + 'h4{color:#333;font-size:1rem;margin:16px 0 6px}'
      + 'p{margin:0 0 12px;text-align:justify;text-justify:inter-word}'
      + 'ul,ol{margin:8px 0 16px 24px;padding-left:8px}'
      + 'li{margin-bottom:6px;line-height:1.75}'
      + 'strong,b{color:#0d1b35}'
      + 'em,i{color:#5a4a7a}'
      // Callouts
      + '.doc-callout{background:#f0fff4;border-left:5px solid #00c896;padding:14px 18px;border-radius:8px;margin:14px 0}'
      + '.doc-callout-info{background:#eff6ff;border-left-color:#3b82f6}'
      + '.doc-callout-warn{background:#fffbeb;border-left-color:#f59e0b}'
      + '.doc-callout-danger{background:#fef2f2;border-left-color:#ef4444}'
      + '.doc-callout-tip{background:#faf5ff;border-left-color:#a855f7}'
      // Tables
      + '.doc-table{width:100%;border-collapse:collapse;margin:14px 0;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)}'
      + '.doc-table th{background:linear-gradient(135deg,#00c896,#007cf0);color:#fff;padding:10px 14px;text-align:left;font-weight:700;font-size:.9rem}'
      + '.doc-table td{padding:10px 14px;border-bottom:1px solid #eee;font-size:.92rem}'
      + '.doc-table tr:last-child td{border-bottom:none}'
      + '.doc-table tr:nth-child(even){background:#fafafa}'
      // Code
      + 'code{background:#f3f4f6;padding:2px 8px;border-radius:5px;font-family:"SF Mono","Monaco","Consolas",monospace;font-size:.88em;color:#c92a2a}'
      + 'pre{background:#0d1117;color:#f0f6fc;padding:16px 20px;border-radius:10px;overflow-x:auto;font-family:"SF Mono",Monaco,Consolas,monospace;font-size:.85rem;line-height:1.6;margin:14px 0}'
      + 'pre code{background:transparent;color:inherit;padding:0}'
      // Key idea / Highlight
      + '.doc-key{background:linear-gradient(135deg,rgba(0,200,150,.1),rgba(0,124,240,.05));border:2px solid #00c896;border-radius:12px;padding:14px 18px;margin:16px 0;position:relative}'
      + '.doc-key::before{content:"\u{1F4A1}";position:absolute;top:-14px;left:14px;background:#fff;padding:2px 8px;font-size:1.2rem}'
      // TOC
      + '.doc-toc{background:#fafbfd;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin:0 0 32px}'
      + '.doc-toc h3{color:#0d6efd;margin:0 0 12px;border:none;padding:0;font-size:1.05rem}'
      + '.doc-toc ol{margin:0;padding-left:20px;list-style:decimal}'
      + '.doc-toc li{padding:4px 0;font-size:.92rem;color:#334155}'
      + '.doc-toc a{color:#334155;text-decoration:none;display:flex;justify-content:space-between;align-items:baseline;gap:10px}'
      + '.doc-toc a:hover{color:#0d6efd}'
      + '.doc-toc a::after{content:"";flex:1;border-bottom:1px dotted #cbd5e1;height:1em;margin:0 6px}'
      // Timeline
      + '.tl-wrap{position:relative;padding-left:36px;margin:20px 0}'
      + '.tl-wrap::before{content:"";position:absolute;left:14px;top:0;bottom:0;width:3px;background:linear-gradient(180deg,#00c896,#007cf0,#7928ca);border-radius:2px}'
      + '.tl-event{position:relative;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:14px 18px;margin-bottom:16px;box-shadow:0 2px 6px rgba(0,0,0,.04)}'
      + '.tl-event::before{content:"";position:absolute;left:-28px;top:20px;width:14px;height:14px;border-radius:50%;background:#00c896;border:3px solid #fff;box-shadow:0 0 0 3px #00c896}'
      + '.tl-event .tl-date{display:inline-block;background:linear-gradient(135deg,#00c896,#007cf0);color:#fff;padding:3px 10px;border-radius:12px;font-size:.78rem;font-weight:700;margin-bottom:6px}'
      + '.tl-event .tl-title{font-size:1.02rem;font-weight:700;margin-bottom:4px;color:#1a3a5c}'
      + '.tl-event .tl-desc{color:#666;font-size:.9rem;line-height:1.6}'
      // FAQ
      + '.faq-q{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:14px 18px;margin-bottom:10px;box-shadow:0 2px 6px rgba(0,0,0,.04)}'
      + '.faq-q h3{color:#0d6efd;margin:0 0 8px;font-size:1rem;font-weight:700}'
      + '.faq-q p{margin:0;color:#444;font-size:.95rem}'
      // Footer
      + '.doc-footer{text-align:center;margin-top:60px;padding-top:20px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:.8rem}'
      // Print button
      + '.doc-print-btn{position:fixed;top:16px;right:16px;z-index:9;padding:12px 20px;background:linear-gradient(135deg,#00c896,#007cf0);color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:700;box-shadow:0 6px 20px rgba(0,200,150,.4);font-family:system-ui,sans-serif;font-size:.92rem}'
      + '.doc-print-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,200,150,.5)}'
      // Print media
      + '@media print{'
      + 'body{background:#fff}'
      + '.doc-page{max-width:100%;padding:0;box-shadow:none;min-height:auto}'
      + '.doc-cover{margin:0 0 30px;border-radius:0;padding:60px 40px;page-break-after:always}'
      + '.doc-print-btn{display:none!important}'
      + '.doc-toc,.doc-callout,.doc-key,.tl-event,.faq-q,pre,.doc-table{page-break-inside:avoid}'
      + 'h1,h2,h3{page-break-after:avoid}'
      + '@page{margin:15mm;size:A4}'
      + '}';
  };

  // Wrapper để tạo full HTML doc chuẩn - có cover + toc optional
  window.yeExportDoc = function(opts){
    opts = opts || {};
    var title = opts.title || 'Tài liệu';
    var subtitle = opts.subtitle || '';
    var badge = opts.badge || 'YEAHEDU-TDA';
    var body = opts.body || '';
    var toc = opts.toc || '';   // Optional TOC HTML
    var showCover = opts.showCover !== false;
    var showPrint = opts.showPrint !== false;
    var footer = opts.footer || ('YeahEdu-TDA · Trợ lý học tập thông minh · ' + new Date().toLocaleDateString('vi'));

    var meta = new Date().toLocaleString('vi');
    var coverHtml = '';
    if(showCover){
      coverHtml = '<div class="doc-cover">'
        + '<div class="cv-badge">' + _esc(badge) + '</div>'
        + '<h1>' + _esc(title) + '</h1>'
        + (subtitle ? '<div class="cv-sub">' + _esc(subtitle) + '</div>' : '')
        + '<div class="cv-meta">Tạo lúc: ' + meta + '</div>'
        + '</div>';
    }
    var printBtn = showPrint ? '<button class="doc-print-btn" onclick="window.print()">🖨️ In / Lưu PDF</button>' : '';
    var footerHtml = '<div class="doc-footer">' + _esc(footer) + '</div>';

    var html = '<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8">'
      + '<meta name="viewport" content="width=device-width,initial-scale=1">'
      + '<title>' + _esc(title) + '</title>'
      + '<style>' + window.yeExportCSS() + '</style>'
      + '</head><body>' + printBtn
      + '<div class="doc-page">'
      + coverHtml
      + (toc || '')
      + body
      + footerHtml
      + '</div></body></html>';
    return html;
  };

  // Convenient: download HTML file
  window.yeDownloadDoc = function(html, filename){
    var blob = new Blob([html], {type:'text/html;charset=utf-8'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    if(window.toast) toast('✅ Đã tải', filename, 'success');
  };

  // Convenient: open in new tab for print
  window.yePrintDoc = function(html){
    var w = window.open('', '_blank');
    if(!w){
      if(window.toast) toast('⚠️ Popup blocked', 'Cho phép popup để in', 'warn');
      return;
    }
    w.document.write(html);
    w.document.close();
    // Auto trigger print after render
    setTimeout(function(){
      try{ w.print(); }catch(e){}
    }, 600);
  };

  function _esc(s){
    return String(s || '').replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  console.log('[v12.5 Module 23] Export helper loaded');
})();
