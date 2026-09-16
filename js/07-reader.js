// ================================================================
// YeahEdu-TDA v11 "PhoenixEdu" - Module: 07-reader.js
// Auto-split from monolithic v10, ASCII-only, Live-Server safe
// ================================================================

// BLOCK 6A \u2014 AI READER: State + Constants
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// \u2550\u2550\u2550 NEW v2: Reader state t\u00e1ch bi\u1ec7t, l\u01b0u trong ST
if(!ST.reader||typeof ST.reader!=='object')ST.reader={};if(!Array.isArray(ST.reader.history))ST.reader.history=[];if(typeof ST.reader.selectedMode!=='string')ST.reader.selectedMode='summary';if(typeof ST.reader.inputText!=='string')ST.reader.inputText='';if(typeof ST.reader.inputSource!=='string')ST.reader.inputSource='paste';if(typeof ST.reader.lastResult!=='string')ST.reader.lastResult='';
ST.reader = ST.reader || {
  inputText: '',           // raw text t\u1eeb m\u1ecdi ngu\u1ed3n
  inputSource: 'paste',    // 'paste' | 'url' | 'file' | 'web'
  inputUrls: [],
  inputFiles: [],
  history: [],             // [{ts, title, mode, wordCount}]
  lastResult: '',          // HTML k\u1ebft qu\u1ea3 cu\u1ed1i
  selectedMode: 'summary', // mode m\u1eb7c \u0111\u1ecbnh
};

// \u2550\u2550\u2550 NEW v2: C\u00e1c ch\u1ebf \u0111\u1ed9 Reader h\u1ed7 tr\u1ee3
const READER_MODES = {
  mindmap_kids: {
    icon: '\ud83c\udf92',
    name: 'Mindmap Ti\u1ec3u h\u1ecdc (d\u1ec5 hi\u1ec3u)',
    prompt: 'B\u1ea1n l\u00e0 m\u1ed9t GI\u00c1O VI\u00caN TI\u1ec2U H\u1eccC B\u1eacC TH\u1ea6Y, 30 n\u0103m kinh nghi\u1ec7m, chuy\u00ean bi\u1ebfn ki\u1ebfn th\u1ee9c kh\u00f4 khan th\u00e0nh \u0111i\u1ec1u d\u1ec5 nh\u1edb, d\u1ec5 \u00e1p d\u1ee5ng cho tr\u1ebb 6-11 tu\u1ed5i. H\u00e3y t\u1ea1o output g\u1ed3m 2 ph\u1ea7n, tu\u00e2n th\u1ee7 NGHI\u00caM NG\u1eb6T:.\n\nPH\u1ea6N A - S\u01a0 \u0110\u1ed2 T\u01af DUY (Markdown, \u0111\u1ec3 h\u1ec7 th\u1ed1ng v\u1ebd c\u00e2y):\n- D\u00f9ng # cho \u00fd trung t\u00e2m, ## cho nh\u00e1nh ch\u00ednh, - cho \u00fd nh\u1ecf. T\u1ed0I \u0110A 3 c\u1ea5p.\n- M\u1ed7i m\u1ee5c b\u1eaft \u0111\u1ea7u b\u1eb1ng 1 EMOJI g\u1ee3i h\u00ecnh ph\u00f9 h\u1ee3p. T\u1eeb ng\u1eafn 2-5 ch\u1eef, \u0111\u01a1n gi\u1ea3n, g\u1ea7n g\u0169i (\u0111\u1ed3 \u0103n, con v\u1eadt, \u0111\u1ed3 ch\u01a1i). TUY\u1ec6T \u0110\u1ed0I tr\u00e1nh t\u1eeb H\u00e1n-Vi\u1ec7t kh\u00f3.\n- T\u1ed1i \u0111a 5 nh\u00e1nh ch\u00ednh, m\u1ed7i nh\u00e1nh t\u1ed1i \u0111a 4 \u00fd nh\u1ecf.\n\nSau s\u01a1 \u0111\u1ed3, xu\u1ed1ng d\u00f2ng v\u00e0 vi\u1ebft d\u1ea5u --- r\u1ed3i t\u1edbi:\n\nPH\u1ea6N B - GI\u1ea2I TH\u00cdCH CHO B\u00c9 (d\u00f9ng markdown **in \u0111\u1eadm** cho T\u1eea KH\u00d3A quan tr\u1ecdng nh\u1ea5t m\u1ed7i c\u00e2u, gi\u1ecdng \u1ea5m \u00e1p, x\u01b0ng \\"con\\"):\n### \ud83c\udf08 Hi\u1ec3u th\u1eadt d\u1ec5 n\u00e0o!\n- V\u1edbi M\u1ed6I nh\u00e1nh ch\u00ednh: 1 c\u00e2u gi\u1ea3i th\u00edch c\u1ef1c ng\u1eafn + 1 V\u00cd D\u1ee4 \u0110\u1edcI TH\u01af\u1edcNG b\u1eaft \u0111\u1ea7u b\u1eb1ng \\"gi\u1ed1ng nh\u01b0 khi con...\\". In \u0111\u1eadm t\u1eeb kh\u00f3a c\u1ea7n nh\u1edb.\n### \ud83c\udfa8 M\u1eb9o h\u00ecnh \u1ea3nh & m\u00e0u s\u1eafc\n- G\u1ee3i \u00fd c\u00e1ch nh\u1edb b\u1eb1ng m\u1ed9t H\u00ccNH \u1ea2NH t\u01b0\u1edfng t\u01b0\u1ee3ng ng\u1ed9 ngh\u0129nh v\u00e0 m\u1ed9t M\u00c0U S\u1eaeC g\u1eafn v\u1edbi m\u1ed7i nh\u00e1nh (VD: nh\u00e1nh n\u00e0y m\u00e0u \u0111\u1ecf nh\u01b0 qu\u1ea3 t\u00e1o).\n### \ud83c\udfb5 M\u1eb9o nh\u1edb nhanh\n- 1 c\u00e2u v\u1ea7n v\u00e8/b\u00e0i h\u00e1t ng\u1eafn ho\u1eb7c ch\u1eef c\u00e1i \u0111\u1ea7u gh\u00e9p l\u1ea1i cho b\u00e9 d\u1ec5 thu\u1ed9c.\n### \u2753 \u0110\u1ed1 vui ki\u1ec3m tra\n- 2 c\u00e2u h\u1ecfi vui \u0111\u1ec3 b\u00e9 t\u1ef1 tr\u1ea3 l\u1eddi.\n### \ud83d\ude80 \u00c1p d\u1ee5ng ngay\n- 1 g\u1ee3i \u00fd b\u00e9 c\u00f3 th\u1ec3 d\u00f9ng ki\u1ebfn th\u1ee9c n\u00e0y trong cu\u1ed9c s\u1ed1ng h\u00f4m nay.\nTo\u00e0n b\u1ed9 b\u1eb1ng ti\u1ebfng Vi\u1ec7t, c\u00e2u ng\u1eafn, nhi\u1ec1u kh\u00edch l\u1ec7.'
  },
  summary:    { icon: '\ud83d\udcdd', name: 'T\u00f3m t\u1eaft',         prompt: 'T\u00f3m t\u1eaft n\u1ed9i dung sau ng\u1eafn g\u1ecdn, r\u00f5 r\u00e0ng, gi\u1eef c\u00e1c \u00fd ch\u00ednh. D\u00f9ng bullet points.' },
  explain:    { icon: '\ud83e\uddd1\u200d\ud83c\udfeb', name: 'Gi\u1ea3i th\u00edch d\u1ec5 hi\u1ec3u', prompt: 'Gi\u1ea3i th\u00edch n\u1ed9i dung sau cho h\u1ecdc sinh ti\u1ec3u h\u1ecdc hi\u1ec3u \u0111\u01b0\u1ee3c. D\u00f9ng v\u00ed d\u1ee5 \u0111\u01a1n gi\u1ea3n, ng\u00f4n ng\u1eef th\u00e2n thi\u1ec7n.' },
  quiz:       { icon: '\u2753', name: 'T\u1ea1o c\u00e2u h\u1ecfi \u00f4n t\u1eadp', prompt: 'T\u1eeb n\u1ed9i dung, t\u1ea1o 5 c\u00e2u h\u1ecfi tr\u1eafc nghi\u1ec7m (4 \u0111\u00e1p \u00e1n, ch\u1ec9 ra \u0111\u00e1p \u00e1n \u0111\u00fang) + 3 c\u00e2u t\u1ef1 lu\u1eadn ng\u1eafn. Tr\u1ea3 l\u1eddi b\u1eb1ng ti\u1ebfng Vi\u1ec7t.' },
  flashcard:  { icon: '\ud83c\udfb4', name: 'T\u1ea1o flashcard',     prompt: 'T\u1ea1o 10 flashcard t\u1eeb n\u1ed9i dung: m\u1ed7i th\u1ebb c\u00f3 m\u1eb7t tr\u01b0\u1edbc (c\u00e2u h\u1ecfi/t\u1eeb kh\u00f3a ng\u1eafn) v\u00e0 m\u1eb7t sau (c\u00e2u tr\u1ea3 l\u1eddi/gi\u1ea3i th\u00edch). Format markdown table.' },
  keywords:   { icon: '\ud83d\udd11', name: 'T\u1eeb kh\u00f3a ch\u00ednh',     prompt: 'Li\u1ec7t k\u00ea 10-15 t\u1eeb kh\u00f3a/kh\u00e1i ni\u1ec7m quan tr\u1ecdng nh\u1ea5t trong n\u1ed9i dung, m\u1ed7i t\u1eeb k\u00e8m gi\u1ea3i th\u00edch 1 d\u00f2ng.' },
  translate:  { icon: '\ud83c\udf10', name: 'D\u1ecbch thu\u1eadt',        prompt: 'D\u1ecbch n\u1ed9i dung sau sang ti\u1ebfng Vi\u1ec7t (n\u1ebfu ti\u1ebfng Anh) ho\u1eb7c ti\u1ebfng Anh (n\u1ebfu ti\u1ebfng Vi\u1ec7t). Gi\u1eef format g\u1ed1c.' },
  outline:    { icon: '\ud83d\udccb', name: 'D\u00e0n \u00fd chi ti\u1ebft',    prompt: 'L\u1eadp d\u00e0n \u00fd chi ti\u1ebft (outline) cho n\u1ed9i dung sau, ph\u00e2n c\u1ea5p r\u00f5 r\u00e0ng I > A > 1 > a.' },
  mindmap:    { icon: '\ud83e\udde0', name: 'B\u1ea3n \u0111\u1ed3 t\u01b0 duy',     prompt: 'B\u1ea1n l\u00e0 chuy\u00ean gia thi\u1ebft k\u1ebf s\u01a1 \u0111\u1ed3 t\u01b0 duy (mind map) h\u1ecdc thu\u1eadt. H\u00e3y ph\u00e2n t\u00edch n\u1ed9i dung v\u00e0 t\u1ea1o B\u1ea2N \u0110\u1ed2 T\u01af DUY d\u01b0\u1edbi d\u1ea1ng MARKDOWN PH\u00c2N C\u1ea4P chu\u1ea9n Markmap.\nQUY T\u1eaeC B\u1eaeT BU\u1ed8C:\n- D\u00f2ng \u0111\u1ea7u ti\u00ean: "# " + t\u00ean ch\u1ee7 \u0111\u1ec1 trung t\u00e2m (k\u00e8m 1 emoji).\n- C\u1ea5p 2 d\u00f9ng "## ", c\u1ea5p 3 d\u00f9ng "### ", c\u1ea5p 4 d\u00f9ng "#### ".\n- C\u00e1c \u00fd li\u1ec7t k\u00ea chi ti\u1ebft d\u00f9ng "- " (g\u1ea1ch \u0111\u1ea7u d\u00f2ng), c\u00f3 th\u1ec3 l\u1ed3ng b\u1eb1ng 2 d\u1ea5u c\u00e1ch.\n- M\u1ed7i nh\u00e1nh ch\u00ednh/ph\u1ee5 m\u1edf \u0111\u1ea7u b\u1eb1ng 1 emoji ph\u00f9 h\u1ee3p ng\u1eef c\u1ea3nh (\ud83c\udf0d\ud83d\udd2c\ud83d\udcca\u2699\ufe0f\ud83d\udca1\ud83c\udfaf\ud83d\udcda\ud83e\udde9\ud83d\udd11\u23f3\ud83c\udf31 v.v.), KH\u00d4NG l\u1eb7p l\u1ea1i 1 emoji qu\u00e1 nhi\u1ec1u.\n- T\u1eeb kh\u00f3a NG\u1eaeN G\u1eccN (3-8 t\u1eeb m\u1ed7i node), s\u00fac t\u00edch, kh\u00f4ng vi\u1ebft c\u00e2u d\u00e0i.\n- Bao qu\u00e1t \u0111\u1ee7 \u00fd ch\u00ednh, ph\u00e2n c\u1ea5p logic 3-4 t\u1ea7ng, c\u00e2n \u0111\u1ed1i s\u1ed1 nh\u00e1nh.\n- CH\u1ec8 tr\u1ea3 v\u1ec1 Markdown thu\u1ea7n, TUY\u1ec6T \u0110\u1ed0I KH\u00d4NG c\u00f3 v\u0103n b\u1ea3n gi\u1ea3i th\u00edch ngo\u00e0i s\u01a1 \u0111\u1ed3, KH\u00d4NG b\u1ecdc trong ```.\nV\u00ed d\u1ee5:\n# \ud83c\udfaf Ch\u1ee7 \u0111\u1ec1 ch\u00ednh\n## \ud83c\udf31 Nh\u00e1nh l\u1edbn 1\n### \ud83d\udca1 \u00dd con 1.1\n- chi ti\u1ebft a\n- chi ti\u1ebft b\n## \ud83d\udd11 Nh\u00e1nh l\u1edbn 2\n### \ud83d\udcca \u00dd con 2.1' },
  mindmap_study:  { icon: '\ud83d\udcda', name: 'MindMap \u00d4n thi',    prompt: 'T\u1ea1o s\u01a1 \u0111\u1ed3 t\u01b0 duy \u00d4N THI d\u1ea1ng Markdown ph\u00e2n c\u1ea5p chu\u1ea9n Markmap (# ## ### ####, bullet "-"). Ch\u1ee7 \u0111\u1ec1 trung t\u00e2m \u1edf "# ". T\u1ed5 ch\u1ee9c theo: Kh\u00e1i ni\u1ec7m c\u1ed1t l\u00f5i \u2192 C\u00f4ng th\u1ee9c/\u0110\u1ecbnh ngh\u0129a \u2192 V\u00ed d\u1ee5 \u2192 L\u1ed7i th\u01b0\u1eddng g\u1eb7p \u2192 M\u1eb9o nh\u1edb. M\u1ed7i nh\u00e1nh 1 emoji. Node ng\u1eafn g\u1ecdn. CH\u1ec8 tr\u1ea3 Markdown thu\u1ea7n, kh\u00f4ng gi\u1ea3i th\u00edch.' },
  mindmap_compare:{ icon: '\u2696\ufe0f', name: 'MindMap So s\u00e1nh',   prompt: 'T\u1ea1o s\u01a1 \u0111\u1ed3 t\u01b0 duy SO S\u00c1NH d\u1ea1ng Markdown ph\u00e2n c\u1ea5p chu\u1ea9n Markmap. "# " l\u00e0 ch\u1ee7 \u0111\u1ec1. C\u00e1c nh\u00e1nh c\u1ea5p 2 l\u00e0 c\u00e1c \u0111\u1ed1i t\u01b0\u1ee3ng/kh\u00e1i ni\u1ec7m \u0111\u01b0\u1ee3c so s\u00e1nh; c\u1ea5p 3 l\u00e0 ti\u00eau ch\u00ed (Gi\u1ed1ng, Kh\u00e1c, \u01afu, Nh\u01b0\u1ee3c). M\u1ed7i nh\u00e1nh 1 emoji. CH\u1ec8 tr\u1ea3 Markdown thu\u1ea7n.' },
  mindmap_process:{ icon: '\ud83d\udd04', name: 'MindMap Quy tr\u00ecnh',  prompt: 'T\u1ea1o s\u01a1 \u0111\u1ed3 t\u01b0 duy QUY TR\u00ccNH/TI\u1ebeN TR\u00ccNH d\u1ea1ng Markdown ph\u00e2n c\u1ea5p chu\u1ea9n Markmap. "# " l\u00e0 t\u00ean quy tr\u00ecnh. C\u00e1c nh\u00e1nh c\u1ea5p 2 l\u00e0 c\u00e1c B\u01b0\u1edbc theo th\u1ee9 t\u1ef1 (B\u01b0\u1edbc 1, B\u01b0\u1edbc 2...); c\u1ea5p 3 l\u00e0 chi ti\u1ebft/l\u01b0u \u00fd m\u1ed7i b\u01b0\u1edbc. M\u1ed7i b\u01b0\u1edbc 1 emoji s\u1ed1 ho\u1eb7c m\u0169i t\u00ean. CH\u1ec8 tr\u1ea3 Markdown thu\u1ea7n.' },
  custom:     { icon: '\u270f\ufe0f', name: 'T\u00f9y ch\u1ec9nh',         prompt: '' },
};

// \u2550\u2550\u2550 NEW v2: Gi\u1edbi h\u1ea1n Reader
const READER_MAX_INPUT = 12000;   // k\u00fd t\u1ef1 max g\u1eedi AI
const READER_HISTORY_MAX = 15;    // l\u01b0u t\u1ed1i \u0111a 15 l\u1ea7n d\u00f9ng
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// BLOCK 6B \u2014 AI READER: Render UI (g\u1ecdi 1 l\u1ea7n trong init)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

// \u2550\u2550\u2550 NEW v2: Render to\u00e0n b\u1ed9 tab Reader
function renderReaderTab() {
  const panel = document.getElementById('tabReader');
  if (!panel) return; // tab ch\u01b0a c\u00f3 trong HTML \u2192 skip

  panel.innerHTML = `
  <!-- INPUT SECTION -->
  <div class="card" id="readerInputCard">
    <div class="card-header">
      <div class="card-title">\ud83d\udcd6 AI Reader \u2014 \u0110\u1ecdc & Ph\u00e2n t\u00edch t\u00e0i li\u1ec7u</div>
    </div>
    <!-- TH\u00caM M\u1edaI: Toggle Ch\u1ebf \u0111\u1ed9 m\u1edf -->
        <div style="margin-bottom:16px;padding:12px 14px;background:rgba(0,200,150,.06);border:1px solid rgba(0,200,150,.25);border-radius:10px">
          <label class="toggle-wrap" onclick="toggleToggle('tReaderOpen');toggleReaderOpenMode()">
            <div class="toggle" id="tReaderOpen"></div>
            <span class="toggle-label">\ud83d\udcd6 Ch\u1ebf \u0111\u1ed9 m\u1edf \u2014 AI t\u1ef1 sinh n\u1ed9i dung (kh\u00f4ng c\u1ea7n ngu\u1ed3n ngo\u00e0i)</span>
          </label>
          <div style="font-size:.78rem;color:var(--text2);margin-top:6px;margin-left:52px">Khi b\u1eadt: ch\u1ec9 c\u1ea7n nh\u1eadp Ch\u1ee7 \u0111\u1ec1/L\u0129nh v\u1ef1c \u2192 N\u1ed9i dung y\u00eau c\u1ea7u \u2192 Tr\u00ecnh \u0111\u1ed9, AI s\u1ebd t\u1ef1 t\u1ea1o t\u00e0i li\u1ec7u h\u1ecdc t\u1eadp.</div>
        </div>
        <!-- TH\u00caM M\u1edaI: Khu nh\u1eadp Ch\u1ebf \u0111\u1ed9 m\u1edf (\u1ea9n m\u1eb7c \u0111\u1ecbnh) -->
        <div id="readerOpenFields" class="hidden" style="margin-bottom:16px">
          <div class="form-row cols-2">
            <div class="fgroup"><label>L\u0129nh v\u1ef1c / M\u00f4n h\u1ecdc</label>
              <input type="text" id="rOpenSubject" placeholder="VD: AI, L\u1ecbch s\u1eed, Sinh h\u1ecdc, T\u00e0i ch\u00ednh...">
            </div>
            <div class="fgroup"><label>Tr\u00ecnh \u0111\u1ed9</label>
              <select id="rOpenLevel">
                <option value="beginner">C\u01a1 b\u1ea3n (ng\u01b0\u1eddi m\u1edbi)</option>
                <option value="intermediate" selected>Trung b\u00ecnh</option>
                <option value="advanced">N\u00e2ng cao</option>
                <option value="expert">Chuy\u00ean gia</option>
              </select>
            </div>
          </div>
          <div class="fgroup" style="margin-top:8px"><label>Ch\u1ee7 \u0111\u1ec1 c\u1ee5 th\u1ec3</label>
            <input type="text" id="rOpenTopic" placeholder="VD: \u1ee8ng d\u1ee5ng AI v\u00e0o t\u0103ng thu nh\u1eadp, Cu\u1ed9c kh\u1edfi ngh\u0129a Lam S\u01a1n...">
          </div>
          <div class="fgroup" style="margin-top:8px"><label>N\u1ed9i dung y\u00eau c\u1ea7u (m\u00f4 t\u1ea3 chi ti\u1ebft b\u1ea1n mu\u1ed1n AI vi\u1ebft g\u00ec)</label>
            <textarea id="rOpenRequire" style="min-height:90px" placeholder="VD: Vi\u1ebft t\u00e0i li\u1ec7u t\u00ecm hi\u1ec3u v\u1ec1 AI v\u00e0 c\u00e1c l\u0129nh v\u1ef1c \u00e1p d\u1ee5ng AI v\u00e0o th\u1ef1c ti\u1ec5n mang t\u00ednh s\u00e1ng t\u1ea1o, gi\u1ea3i ph\u00e1p th\u00f4ng minh d\u1ec5 \u00e1p d\u1ee5ng \u0111\u1ec3 ki\u1ebfm ti\u1ec1n..."></textarea>
          </div>
        </div>

    <!-- Source picker -->
    <div style="margin-bottom:16px">
      <label style="font-size:.82rem;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:10px">Ngu\u1ed3n t\u00e0i li\u1ec7u</label>
      <div class="source-tabs" id="readerSourceTabs">
        <div class="source-tab active" data-rsrc="paste" onclick="switchReaderSource(this,'paste')">\ud83d\udccb D\u00e1n text</div>
        <div class="source-tab" data-rsrc="url" onclick="switchReaderSource(this,'url')">\ud83d\udd17 URL</div>
        <div class="source-tab" data-rsrc="file" onclick="switchReaderSource(this,'file')">\ud83d\udcc2 File</div>
        <div class="source-tab" data-rsrc="web" onclick="switchReaderSource(this,'web')">\ud83c\udf10 T\u00ecm Web</div>
      </div>
    </div>

    <!-- Paste panel -->
    <div class="source-panel active" id="rsrc-paste">
      <div class="fgroup">
        <label>D\u00e1n n\u1ed9i dung t\u00e0i li\u1ec7u</label>
        <textarea id="readerPasteArea" style="min-height:180px" placeholder="D\u00e1n n\u1ed9i dung s\u00e1ch, b\u00e0i b\u00e1o, t\u00e0i li\u1ec7u, ghi ch\u00fa\u2026 AI s\u1ebd ph\u00e2n t\u00edch n\u1ed9i dung n\u00e0y."></textarea>
      </div>
      <div style="text-align:right;margin-top:6px">
        <span class="text-muted" style="font-size:.78rem" id="readerCharCount">0 / ${READER_MAX_INPUT} k\u00fd t\u1ef1</span>
      </div>
    </div>

    <!-- URL panel -->
    <div class="source-panel" id="rsrc-url">
      <div class="url-list" id="readerUrlList">
        <div class="url-item">
          <input type="url" style="background:var(--bg3);border:1.5px solid var(--border);border-radius:8px;padding:10px 14px;color:var(--text);width:100%;font-family:var(--font)" placeholder="https://...">
          <button class="btn btn-secondary btn-sm" onclick="addReaderUrlField()">+</button>
        </div>
      </div>
      <button class="btn btn-secondary btn-sm mt-8" id="btnReaderFetchUrls" onclick="readerFetchUrls()">\u2b07\ufe0f T\u1ea3i n\u1ed9i dung URL</button>
      <div id="readerUrlPreview" style="margin-top:8px"></div>
    </div>

    <!-- File panel -->
    <div class="source-panel" id="rsrc-file">
      <div class="file-drop-zone" id="readerDropZone" onclick="document.getElementById('readerFileInput').click()">
        <div class="drop-icon">\ud83d\udcc2</div>
        <p>K\u00e9o th\u1ea3 ho\u1eb7c click \u0111\u1ec3 ch\u1ecdn file</p>
        <p style="font-size:.78rem;margin-top:6px;opacity:.6">TXT \u00b7 MD \u00b7 CSV\u00b7 DOC\u00b7 PDF\u00b7 JPG</p>
        <input type="file" id="readerFileInput" accept=".txt,.md,.csv,.pdf,.docx,.jpg,.jpeg,.png,.webp" multiple style="display:none" onchange="readerHandleFiles(event)">
      </div>
      <div class="file-items" id="readerFileItems"></div>
    </div>

    <!-- Web search panel -->
    <div class="source-panel" id="rsrc-web">
      <div class="fgroup" style="margin-bottom:10px">
        <label>T\u1eeb kh\u00f3a t\u00ecm ki\u1ebfm</label>
        <input type="text" id="readerWebQuery" placeholder="VD: L\u1ecbch s\u1eed Vi\u1ec7t Nam th\u1eddi L\u00fd Tr\u1ea7n, photosynthesis, \u2026">
      </div>
      <button class="btn btn-primary btn-sm" id="btnReaderWebSearch" onclick="readerWebSearch()">\ud83d\udd0d T\u00ecm ki\u1ebfm</button>
      <div id="readerWebPreview" style="margin-top:8px"></div>
    </div>

    <!-- Loaded text preview -->
    <div id="readerLoadedPreview" style="display:none;margin-top:12px">
      <div class="alert alert-success" id="readerLoadedInfo"></div>
      <div class="source-result-preview" id="readerLoadedText"></div>
    </div>

    <!-- Divider -->
    <div class="divider"></div>

    <!-- Mode picker -->
    <label style="font-size:.82rem;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:10px">Ch\u1ebf \u0111\u1ed9 ph\u00e2n t\u00edch</label>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px" id="readerModeGrid">
      ${Object.entries(READER_MODES).map(([key, m]) => `
        <div class="chip ${key === 'summary' ? 'active' : ''}" data-rmode="${key}" onclick="pickReaderMode('${key}')">
          ${m.icon} ${m.name}
        </div>`).join('')}
    </div>

    <!-- Custom prompt (shown only for 'custom' mode) -->
    <div class="fgroup hidden" id="readerCustomPromptWrap" style="margin-bottom:14px">
      <label>Y\u00eau c\u1ea7u t\u00f9y ch\u1ec9nh</label>
      <textarea id="readerCustomPrompt" placeholder="Nh\u1eadp y\u00eau c\u1ea7u c\u1ee5 th\u1ec3, VD: T\u00ecm l\u1ed7i sai ch\u00ednh t\u1ea3, Vi\u1ebft l\u1ea1i cho hay h\u01a1n, Tr\u00edch d\u1eabn s\u1ed1 li\u1ec7u\u2026" style="min-height:80px"></textarea>
    </div>

    <!-- Action buttons -->
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-primary" id="btnReaderRun" onclick="runReaderRouter()">\ud83d\ude80 Ph\u00e2n t\u00edch</button>
      <button class="btn btn-secondary" onclick="clearReader()">\ud83d\uddd1\ufe0f X\u00f3a</button>
    </div>

    <!-- Loading area -->
    <div id="readerLoadingArea" style="margin-top:12px"></div>
  </div>

  <!-- RESULT SECTION -->
  <div class="card hidden" id="readerResultCard">
    <div class="card-header">
      <div class="card-title">\ud83d\udcc4 K\u1ebft qu\u1ea3</div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary btn-sm" onclick="exportReaderPro('pdf')" title="Xu\u1ea5t PDF trang b\u00eca + m\u1ee5c l\u1ee5c">\ud83d\udcd5 PDF \u0111\u1eb9p</button>
        <button class="btn btn-primary btn-sm" onclick="exportReaderPro('word')" title="Xu\u1ea5t Word \u0111\u1ecbnh d\u1ea1ng chuy\u00ean nghi\u1ec7p">\ud83d\udcd8 Word \u0111\u1eb9p</button>
        <button class="btn btn-secondary btn-sm" onclick="exportReaderPro('html')" title="Xu\u1ea5t HTML \u0111\u1ecbnh d\u1ea1ng \u0111\u1eb9p">\ud83c\udf10 HTML \u0111\u1eb9p</button>
        <button class="btn btn-icon btn-sm" title="Copy" onclick="copyReaderResult()">\ud83d\udccb</button>
        <button class="btn btn-icon btn-sm" title="Xu\u1ea5t MD" onclick="exportReaderResult('md')">\ud83d\udcc4</button>
        <button class="btn btn-icon btn-sm" title="Xu\u1ea5t HTML" onclick="exportReaderResult('html')">\ud83c\udf10</button>
        <button class="btn btn-icon btn-sm" title="Xu\u1ea5t Word" onclick="exportReaderResult('word')">\ud83d\udcd8</button>
        <button class="btn btn-icon btn-sm" title="In / L\u01b0u PDF" onclick="exportReaderResult('pdf')">\ud83d\udda8\ufe0f</button>
      </div>
    </div>
    <div id="readerResultBody" style="line-height:1.8;font-size:.93rem;color:var(--text3)"></div>
    <div class="divider"></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-secondary btn-sm" onclick="rerunReaderDifferentMode()">\ud83d\udd04 Ch\u1ebf \u0111\u1ed9 kh\u00e1c</button>
      <button class="btn btn-secondary btn-sm" onclick="readerFollowUp()">\ud83d\udcac H\u1ecfi th\u00eam</button>
    </div>
    <!-- Follow-up area -->
    <div class="hidden" id="readerFollowUpWrap" style="margin-top:12px">
      <div class="fgroup">
        <label>C\u00e2u h\u1ecfi ti\u1ebfp theo</label>
        <div style="display:flex;gap:8px">
          <input type="text" id="readerFollowUpInput" placeholder="H\u1ecfi th\u00eam v\u1ec1 n\u1ed9i dung, VD: Gi\u1ea3i th\u00edch ph\u1ea7n 2 chi ti\u1ebft h\u01a1n\u2026" style="flex:1">
          <button class="btn btn-primary btn-sm" onclick="sendReaderFollowUp()">G\u1eedi</button>
        </div>
      </div>
      <div id="readerFollowUpResult" style="margin-top:8px"></div>
    </div>
  </div>

  <!-- HISTORY SECTION -->
  <div class="card" id="readerHistoryCard">
    <div class="card-header">
      <div class="card-title">\ud83d\udcda L\u1ecbch s\u1eed \u0111\u1ecdc</div>
      <button class="btn btn-secondary btn-sm" onclick="clearReaderHistory()">\ud83d\uddd1\ufe0f X\u00f3a</button>
    </div>
    <div id="readerHistoryList">
      <div class="text-muted" style="padding:10px">Ch\u01b0a c\u00f3 l\u1ecbch s\u1eed.</div>
    </div>
  </div>`;

  // \u2550\u2550\u2550 NEW v2: Character counter for paste area
  const pasteArea = document.getElementById('readerPasteArea');
  if (pasteArea) {
    pasteArea.addEventListener('input', function () {
      const len = this.value.length;
      document.getElementById('readerCharCount').textContent =
        `${len} / ${READER_MAX_INPUT} k\u00fd t\u1ef1`;
      if (len > READER_MAX_INPUT) {
        document.getElementById('readerCharCount').style.color = 'var(--c4)';
      } else {
        document.getElementById('readerCharCount').style.color = 'var(--text2)';
      }
    });
  }

  // \u2550\u2550\u2550 NEW v2: Drag-drop for Reader file zone
  const rdz = document.getElementById('readerDropZone');
  if (rdz) {
    rdz.addEventListener('dragover', e => { e.preventDefault(); rdz.classList.add('drag'); });
    rdz.addEventListener('dragleave', () => rdz.classList.remove('drag'));
    rdz.addEventListener('drop', e => { e.preventDefault(); rdz.classList.remove('drag'); readerHandleFiles({ target: { files: e.dataTransfer.files } }); });
  }

  // Render history on load
  renderReaderHistory();
}
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// BLOCK 6C \u2014 AI READER: Source switching & input helpers
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

// \u2550\u2550\u2550 NEW v2: Switch Reader source tab
function switchReaderSource(el, src) {
  document.querySelectorAll('#readerSourceTabs .source-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('#tabReader .source-panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('rsrc-' + src).classList.add('active');
  ST.reader.inputSource = src;
  SFX.click();
}

// \u2550\u2550\u2550 NEW v2: Add URL field for Reader
function addReaderUrlField() {
  const list = document.getElementById('readerUrlList');
  const div = document.createElement('div');
  div.className = 'url-item';
  div.innerHTML = `<input type="url" style="background:var(--bg3);border:1.5px solid var(--border);border-radius:8px;padding:10px 14px;color:var(--text);width:100%;font-family:var(--font)" placeholder="https://...">
    <button class="btn btn-secondary btn-sm" onclick="this.parentElement.remove()">\u2715</button>`;
  list.appendChild(div);
  SFX.click();
}

// \u2550\u2550\u2550 NEW v2: Fetch URLs for Reader via Jina
async function readerFetchUrls() {
  const inputs = document.querySelectorAll('#readerUrlList input[type="url"]');
  const urls = Array.from(inputs).map(i => i.value.trim()).filter(Boolean);
  if (!urls.length) { toast('L\u1ed7i', 'Nh\u1eadp \u00edt nh\u1ea5t 1 URL', 'error'); return; }

  const btn = document.getElementById('btnReaderFetchUrls');
  btn.disabled = true; btn.textContent = '\u23f3 \u0110ang t\u1ea3i...';
  const preview = document.getElementById('readerUrlPreview');
  preview.innerHTML = '';
  let allText = '';

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const r = await fetch(`https://r.jina.ai/${url}`, {
        headers: { 'Accept': 'text/plain' },
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (r.ok) {
        const t = await r.text();
        allText += `\n\n=== ${url} ===\n` + t.slice(0, 5000);
        preview.innerHTML += `<div class="alert alert-success" style="margin-top:6px">\u2705 ${url.slice(0, 60)}\u2026 (${t.length} k\u00fd t\u1ef1)</div>`;
      } else {
        preview.innerHTML += `<div class="alert alert-error" style="margin-top:6px">\u274c ${url.slice(0, 60)} \u2014 HTTP ${r.status}</div>`;
      }
    } catch (e) {
      preview.innerHTML += `<div class="alert alert-error" style="margin-top:6px">\u274c ${url.slice(0, 60)}: ${e.name === 'AbortError' ? 'Timeout' : e.message}</div>`;
    }
  }

  if (allText) {
    ST.reader.inputText = allText.slice(0, READER_MAX_INPUT);
    _showReaderLoaded(`\u0110\u00e3 t\u1ea3i ${urls.length} URL \u00b7 ${ST.reader.inputText.length} k\u00fd t\u1ef1`);
    toast('\u2705 T\u1ea3i URL', 'N\u1ed9i dung s\u1eb5n s\u00e0ng', 'success');
  }
  btn.disabled = false; btn.textContent = '\u2b07\ufe0f T\u1ea3i n\u1ed9i dung URL';
}

// \u2550\u2550\u2550 NEW v2: Handle files for Reader
function readerHandleFiles(e) {
  const files = Array.from(e.target.files);
  const items = document.getElementById('readerFileItems');
  files.forEach(f => {
    extractFileText(f).then(text => {
      try{ libAdd({type:'file',title:f.name,content:text}); }catch(e){}
      ST.reader.inputText = (ST.reader.inputText || '') + '\n\n=== ' + f.name + ' ===\n' + text.slice(0, 10000);
      if (ST.reader.inputText.length > READER_MAX_INPUT)
        ST.reader.inputText = ST.reader.inputText.slice(0, READER_MAX_INPUT);
      _showReaderLoaded(`\u0110\u00e3 \u0111\u1ecdc ${f.name} \u00b7 ${ST.reader.inputText.length} k\u00fd t\u1ef1`);
      toast('\u2705 \u0110\u1ecdc file', f.name, 'success');
    }).catch(err => {
      toast('C\u1ea3nh b\u00e1o', `${f.name}: ${err.message}`, 'warn', 4000);
    });

    const div = document.createElement('div');
    div.className = 'file-item';
    div.innerHTML = `<span>\ud83d\udcc4 ${f.name} <span class="text-muted">(${(f.size / 1024).toFixed(1)}KB)</span></span><button class="btn btn-icon btn-sm" onclick="this.parentElement.remove()">\u2715</button>`;
    items.appendChild(div);
  });
}
// \u2550\u2550\u2550 NEW v2: Web search for Reader (d\u00f9ng doReaderWebSearch t\u1eeb Part 5, ho\u1eb7c fallback)
async function readerWebSearch() {
  const query = document.getElementById('readerWebQuery').value.trim();
  if (!query) { toast('Nh\u1eadp t\u1eeb kh\u00f3a', 'Nh\u1eadp n\u1ed9i dung c\u1ea7n t\u00ecm', 'warn'); return; }

  const preview = document.getElementById('readerWebPreview');
  const btn = document.getElementById('btnReaderWebSearch');
  btn.disabled = true;
  preview.innerHTML = '<div class="spin-wrap" style="padding:16px"><div class="spinner" style="width:28px;height:28px;border-width:3px"></div><div class="spin-text">\u0110ang t\u00ecm ki\u1ebfm<span class="spin-dots"></span></div></div>';

  try {
    // \u2550\u2550\u2550 NEW v2: S\u1eed d\u1ee5ng doReaderWebSearch n\u1ebfu c\u00f3 (Part 5), n\u1ebfu kh\u00f4ng th\u00ec g\u1ecdi doWebSearch logic t\u01b0\u01a1ng t\u1ef1
    let context = '';
    let source = '';

    // B\u01b0\u1edbc 1: Jina AI search (mi\u1ec5n ph\u00ed)
    try {
      const r = await fetch(`https://s.jina.ai/${encodeURIComponent(query)}`, {
        headers: { 'Accept': 'application/json', 'X-Return-Format': 'markdown' },
        signal: AbortSignal.timeout(15000)
      });
      if (r.ok) { const t = await r.text(); if (t.length > 100) { context = t.slice(0, 6000); source = 'Jina AI'; } }
    } catch (e) { console.log('Reader Jina:', e.message); }

    // B\u01b0\u1edbc 2: Wikipedia VI
    if (!context || context.length < 100) {
      try {
        const wUrl = `https://vi.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=3&utf8=1`;
        const r = await fetch(wUrl);
        if (r.ok) {
          const d = await r.json();
          const topTitle = d.query?.search?.[0]?.title;
          if (topTitle) {
            const pageUrl = `https://vi.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(topTitle)}&prop=extracts&exintro=0&explaintext=1&format=json&origin=*&exchars=4000`;
            const r2 = await fetch(pageUrl);
            if (r2.ok) {
              const d2 = await r2.json();
              const pageText = Object.values(d2.query?.pages || {})[0]?.extract || '';
              if (pageText.length > 100) { context = pageText.slice(0, 6000); source = 'Wikipedia VI'; }
            }
          }
        }
      } catch (e) { console.log('Reader Wiki:', e.message); }
    }

    // B\u01b0\u1edbc 3: DuckDuckGo
    if (!context || context.length < 100) {
      try {
        const r = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
        if (r.ok) {
          const d = await r.json();
          let txt = '';
          if (d.Abstract) txt += d.Abstract + '\n';
          if (d.Answer) txt += d.Answer + '\n';
          if (d.RelatedTopics?.length) txt += d.RelatedTopics.slice(0, 8).map(t => t.Text || '').filter(Boolean).join('\n');
          if (txt.length > 80) { context = txt.slice(0, 5000); source = 'DuckDuckGo'; }
        }
      } catch (e) { console.log('Reader DDG:', e.message); }
    }

    // B\u01b0\u1edbc 4: Gemini Grounding fallback
    if ((!context || context.length < 100) && typeof searchViaGeminiGrounding === 'function') {
      try {
        context = await searchViaGeminiGrounding('', '', '', query);
        if (context && context.length > 100) source = 'Gemini Grounding';
      } catch (e) { console.log('Reader Gemini:', e.message); }
    }

    if (context && context.length > 80) {
      ST.reader.inputText = context.slice(0, READER_MAX_INPUT);
      _showReaderLoaded(`T\u00ecm th\u1ea5y ${context.length} k\u00fd t\u1ef1 t\u1eeb ${source}`);
      preview.innerHTML = `<div class="alert alert-success">\u2705 ${context.length} k\u00fd t\u1ef1 t\u1eeb <strong>${source}</strong></div>`;
      toast('T\u00ecm ki\u1ebfm xong', `${source}`, 'success');
    } else {
      preview.innerHTML = `<div class="alert alert-warn">\u26a0\ufe0f Kh\u00f4ng t\u00ecm \u0111\u01b0\u1ee3c n\u1ed9i dung. Th\u1eed t\u1eeb kh\u00f3a kh\u00e1c ho\u1eb7c d\u00e1n text tr\u1ef1c ti\u1ebfp.</div>`;
      toast('Kh\u00f4ng t\u00ecm th\u1ea5y', 'Th\u1eed t\u1eeb kh\u00f3a kh\u00e1c', 'warn');
    }
  } catch (e) {
    preview.innerHTML = `<div class="alert alert-error">\u274c ${e.message}</div>`;
  }
  btn.disabled = false;
}

// \u2550\u2550\u2550 NEW v2: Helper hi\u1ec3n th\u1ecb text \u0111\u00e3 load
function _showReaderLoaded(infoText) {
  document.getElementById('readerLoadedPreview').style.display = 'block';
  document.getElementById('readerLoadedInfo').textContent = '\u2705 ' + infoText;
  document.getElementById('readerLoadedText').textContent = (ST.reader.inputText || '').slice(0, 600) + '\u2026';
}
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// BLOCK 6D \u2014 AI READER: Mode Picker, Run Analysis, Follow\u2011Up
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

// \u2550\u2550\u2550 NEW v2: Pick Reader analysis mode
function pickReaderMode(mode) {
  document.querySelectorAll('#readerModeGrid .chip').forEach(c => c.classList.remove('active'));
  const el = document.querySelector(`#readerModeGrid .chip[data-rmode="${mode}"]`);
  if (el) el.classList.add('active');
  ST.reader.selectedMode = mode;

  const customWrap = document.getElementById('readerCustomPromptWrap');
  if (mode === 'custom') customWrap.classList.remove('hidden');
  else customWrap.classList.add('hidden');

  SFX.click();
}

// TH\u00caM M\u1edaI: B\u1eadt/t\u1eaft Ch\u1ebf \u0111\u1ed9 m\u1edf cho AI Reader
function toggleReaderOpenMode(){
  var isOpen = isOn('tReaderOpen');
  var openBox = document.getElementById('readerOpenFields');
  var inputCard = document.getElementById('readerInputCard');
  // \u1ea8n/hi\u1ec7n c\u00e1c khu nh\u1eadp ngu\u1ed3n ngo\u00e0i (paste/url/file/web) khi b\u1eadt ch\u1ebf \u0111\u1ed9 m\u1edf
  var srcTabs = document.getElementById('readerSourceTabs');
  var srcPanels = inputCard ? inputCard.querySelectorAll('.source-panel') : [];
  var loadedPrev = document.getElementById('readerLoadedPreview');
  if(isOpen){
    if(openBox) openBox.classList.remove('hidden');
    if(srcTabs) srcTabs.style.display='none';
    srcPanels.forEach(function(p){p.style.display='none'});
    if(loadedPrev) loadedPrev.style.display='none';
  } else {
    if(openBox) openBox.classList.add('hidden');
    if(srcTabs) srcTabs.style.display='';
    srcPanels.forEach(function(p){p.style.display=''});
    // tr\u1ea3 l\u1ea1i panel \u0111ang active
    var active=inputCard?inputCard.querySelector('.source-panel.active'):null;
    if(active) active.style.display='block';
  }
  SFX.click();
}

// TH\u00caM M\u1edaI: Ch\u1ea1y Ch\u1ebf \u0111\u1ed9 m\u1edf \u2014 AI t\u1ef1 sinh n\u1ed9i dung t\u1eeb ch\u1ee7 \u0111\u1ec1 (kh\u00f4ng c\u1ea7n ngu\u1ed3n ngo\u00e0i)
async function runReaderOpenMode(){
  SFX.start();
  var subject = (document.getElementById('rOpenSubject')?.value||'').trim() || 'T\u1ed5ng h\u1ee3p';
  var topic   = (document.getElementById('rOpenTopic')?.value||'').trim();
  var require_ = (document.getElementById('rOpenRequire')?.value||'').trim();
  var lvEl = document.getElementById('rOpenLevel');
  var lvMap = {beginner:'C\u01a1 b\u1ea3n (ng\u01b0\u1eddi m\u1edbi b\u1eaft \u0111\u1ea7u)',intermediate:'Trung b\u00ecnh',advanced:'N\u00e2ng cao',expert:'Chuy\u00ean gia'};
  var level = lvMap[lvEl?lvEl.value:'intermediate'] || 'Trung b\u00ecnh';
  if(!topic && !require_){
    toast('Thi\u1ebfu th\u00f4ng tin','Nh\u1eadp \u00edt nh\u1ea5t "Ch\u1ee7 \u0111\u1ec1" ho\u1eb7c "N\u1ed9i dung y\u00eau c\u1ea7u"','warn');
    return;
  }
  if(!ST.apiKeys.filter(function(k){return k.key.trim()}).length){
    toast('Ch\u01b0a c\u00f3 API key','V\u00e0o C\u00e0i \u0111\u1eb7t \u0111\u1ec3 th\u00eam','error'); openSettings(); return;
  }
  var mode = ST.reader.selectedMode;
  var modeInfo = READER_MODES[mode] || READER_MODES.summary;
  // Gh\u00e9p prompt: y\u00eau c\u1ea7u AI T\u1ef0 SINH n\u1ed9i dung r\u1ed3i \u00e1p d\u1ee5ng ch\u1ebf \u0111\u1ed9 ph\u00e2n t\u00edch \u0111\u00e3 ch\u1ecdn
  var userPrompt =
    'CH\u1ebe \u0110\u1ed8 M\u1ede \u2014 B\u1ea1n h\u00e3y T\u1ef0 T\u1ea0O n\u1ed9i dung h\u1ecdc t\u1eadp (kh\u00f4ng c\u00f3 ngu\u1ed3n ngo\u00e0i).\n'
    + '- L\u0129nh v\u1ef1c/M\u00f4n h\u1ecdc: ' + subject + '\n'
    + (topic ? '- Ch\u1ee7 \u0111\u1ec1: ' + topic + '\n' : '')
    + '- Tr\u00ecnh \u0111\u1ed9 ng\u01b0\u1eddi \u0111\u1ecdc: ' + level + '\n'
    + (require_ ? '- N\u1ed9i dung y\u00eau c\u1ea7u chi ti\u1ebft: ' + require_ + '\n' : '')
    + '\nSau khi t\u1ea1o n\u1ed9i dung ph\u00f9 h\u1ee3p, h\u00e3y tr\u00ecnh b\u00e0y k\u1ebft qu\u1ea3 theo y\u00eau c\u1ea7u sau:\n'
    + (mode==='custom'
        ? ((document.getElementById('readerCustomPrompt')?.value||'').trim() || 'Tr\u00ecnh b\u00e0y \u0111\u1ea7y \u0111\u1ee7, r\u00f5 r\u00e0ng, c\u00f3 c\u1ea5u tr\u00fac.')
        : modeInfo.prompt);
  var loadArea = document.getElementById('readerLoadingArea');
  loadArea.innerHTML = '<div class="spin-wrap" style="padding:20px"><div class="spinner"></div><div class="spin-text">\ud83d\udcd6 AI \u0111ang t\u1ef1 sinh & '+modeInfo.name.toLowerCase()+'<span class="spin-dots"></span></div><div class="text-muted" style="font-size:.8rem;margin-top:6px">Provider: '+PROVIDERS[ST.provider].name+' \u00b7 '+ST.model+'</div></div>';
  document.getElementById('btnReaderRun').disabled = true;
  try{
    var sysMsg = {role:'system',content:'B\u1ea1n l\u00e0 AI Reader th\u00f4ng minh, chuy\u00ean t\u1ea1o v\u00e0 tr\u00ecnh b\u00e0y t\u00e0i li\u1ec7u h\u1ecdc t\u1eadp ch\u1ea5t l\u01b0\u1ee3ng cao b\u1eb1ng ti\u1ebfng Vi\u1ec7t, c\u00f3 c\u1ea5u tr\u00fac r\u00f5 r\u00e0ng, d\u00f9ng markdown khi c\u1ea7n.'};
    var result='';
    for(var attempt=0;attempt<2;attempt++){
      try{
        result = await callAI([sysMsg,{role:'user',content:userPrompt}]);
        if(result && result.trim().length>20) break;
      }catch(retryErr){ if(attempt===0) toast('\u23f3 Th\u1eed l\u1ea1i','','warn',1500); else throw retryErr; }
    }
    if(!result || result.trim().length<20) throw new Error('AI kh\u00f4ng tr\u1ea3 v\u1ec1 k\u1ebft qu\u1ea3 h\u1ee3p l\u1ec7.');
    var htmlResult = (mode.indexOf('mindmap')===0) ? _renderMindmap(result) : _markdownToBasicHtml(result);
    loadArea.innerHTML='';
    document.getElementById('btnReaderRun').disabled=false;
    document.getElementById('readerResultCard').classList.remove('hidden');
    document.getElementById('readerResultBody').innerHTML=htmlResult;
    ST.reader.lastResult=result;
    try{ libAdd({type:'reader',title:('[Ch\u1ebf \u0111\u1ed9 m\u1edf] '+modeInfo.name+' \u00b7 '+(topic||subject).slice(0,30)),content:result}); }catch(e){}
    document.getElementById('readerResultCard').scrollIntoView({behavior:'smooth',block:'start'});
    ST.reader.history.unshift({ts:Date.now(),title:'[M\u1edf] '+(topic||subject).slice(0,40),mode:modeInfo.name,wordCount:result.split(/\s+/).length,resultPreview:result.slice(0,200)});
    if(ST.reader.history.length>READER_HISTORY_MAX) ST.reader.history=ST.reader.history.slice(0,READER_HISTORY_MAX);
    saveAll(); renderReaderHistory(); SFX.complete();
    toast('\u2705 Ho\u00e0n th\u00e0nh','\ud83d\udcd6 Ch\u1ebf \u0111\u1ed9 m\u1edf \u00b7 '+modeInfo.name,'success');
  }catch(e){
    loadArea.innerHTML='<div class="alert alert-error">\u274c '+e.message+'</div>';
    document.getElementById('btnReaderRun').disabled=false;
    toast('L\u1ed7i','Ki\u1ec3m tra API key v\u00e0 m\u1ea1ng','error');
  }
}

// TH\u00caM M\u1edaI: \u0110i\u1ec1u h\u01b0\u1edbng \u2014 n\u1ebfu \u0111ang b\u1eadt Ch\u1ebf \u0111\u1ed9 m\u1edf th\u00ec ch\u1ea1y t\u1ef1 sinh, ng\u01b0\u1ee3c l\u1ea1i ch\u1ea1y b\u1ea3n g\u1ed1c
function runReaderRouter(){
  if(isOn('tReaderOpen')) return runReaderOpenMode();
  return runReader();
}

// \u2550\u2550\u2550 NEW v2: Main Reader run
async function runReader() {
  SFX.start();

  // Thu th\u1eadp input text
  let inputText = '';
  const src = ST.reader.inputSource;

  if (src === 'paste') {
    inputText = (document.getElementById('readerPasteArea')?.value || '').trim();
  } else {
    inputText = (ST.reader.inputText || '').trim();
  }

  if (!inputText || inputText.length < 20) {
    toast('Thi\u1ebfu n\u1ed9i dung', 'Nh\u1eadp ho\u1eb7c t\u1ea3i t\u00e0i li\u1ec7u tr\u01b0\u1edbc khi ph\u00e2n t\u00edch', 'warn');
    return;
  }

  // Ki\u1ec3m tra API key
  if (!ST.apiKeys.filter(k => k.key.trim()).length) {
    toast('Ch\u01b0a c\u00f3 API key', 'V\u00e0o C\u00e0i \u0111\u1eb7t \u0111\u1ec3 th\u00eam', 'error');
    openSettings();
    return;
  }

  // Truncate
  if (inputText.length > READER_MAX_INPUT) {
    inputText = inputText.slice(0, READER_MAX_INPUT);
    toast('\u0110\u00e3 c\u1eaft n\u1ed9i dung', `Gi\u1edbi h\u1ea1n ${READER_MAX_INPUT} k\u00fd t\u1ef1`, 'info', 2000);
  }

  const mode = ST.reader.selectedMode;
  const modeInfo = READER_MODES[mode] || READER_MODES.summary;

  // Build prompt
  let userPrompt = '';
  if (mode === 'custom') {
    const customP = (document.getElementById('readerCustomPrompt')?.value || '').trim();
    if (!customP) { toast('Nh\u1eadp y\u00eau c\u1ea7u', '\u0110i\u1ec1n y\u00eau c\u1ea7u t\u00f9y ch\u1ec9nh', 'warn'); return; }
    userPrompt = customP + '\n\nN\u1ed8I DUNG:\n---\n' + inputText + '\n---';
  } else {
    userPrompt = modeInfo.prompt + '\n\nN\u1ed8I DUNG:\n---\n' + inputText + '\n---';
  }

  // Show loading
  const loadArea = document.getElementById('readerLoadingArea');
  loadArea.innerHTML = `<div class="spin-wrap" style="padding:20px"><div class="spinner"></div><div class="spin-text">${modeInfo.icon} \u0110ang ${modeInfo.name.toLowerCase()}<span class="spin-dots"></span></div><div class="text-muted" style="font-size:.8rem;margin-top:6px">Provider: ${PROVIDERS[ST.provider].name} \u00b7 ${ST.model}</div></div>`;
  document.getElementById('btnReaderRun').disabled = true;

  try {
    const sysMsg = {
      role: 'system',
      content: `B\u1ea1n l\u00e0 AI Reader th\u00f4ng minh, chuy\u00ean ph\u00e2n t\u00edch t\u00e0i li\u1ec7u gi\u00e1o d\u1ee5c. Tr\u1ea3 l\u1eddi r\u00f5 r\u00e0ng, c\u00f3 c\u1ea5u tr\u00fac, d\u00f9ng ti\u1ebfng Vi\u1ec7t. Format markdown khi c\u1ea7n.`
    };

    let result = '';
    // \u2550\u2550\u2550 NEW v2: Retry t\u1ed1i \u0111a 2 l\u1ea7n
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        result = await callAI([sysMsg, { role: 'user', content: userPrompt }]);
        if (result && result.trim().length > 20) break;
      } catch (retryErr) {
        if (attempt === 0) toast('\u23f3 Th\u1eed l\u1ea1i\u2026', '', 'warn', 1500);
        else throw retryErr;
      }
    }

    if (!result || result.trim().length < 20) {
      throw new Error('AI kh\u00f4ng tr\u1ea3 v\u1ec1 k\u1ebft qu\u1ea3 h\u1ee3p l\u1ec7.');
    }

    // \u2550\u2550\u2550 G\u00d3I 7: N\u1ebfu l\u00e0 mindmap \u2192 v\u1ebd s\u01a1 \u0111\u1ed3 c\u00e2y, ng\u01b0\u1ee3c l\u1ea1i markdown th\u01b0\u1eddng
    const htmlResult = (mode.indexOf('mindmap')===0) ? _renderMindmap(result) : _markdownToBasicHtml(result);

    // Display result
    loadArea.innerHTML = '';
    document.getElementById('btnReaderRun').disabled = false;
    document.getElementById('readerResultCard').classList.remove('hidden');
    document.getElementById('readerResultBody').innerHTML = htmlResult;
    ST.reader.lastResult = result;
    try{ libAdd({type:'reader',title:(modeInfo.name+' \u2014 '+inputText.slice(0,30).replace(/\n/g,' ')),content:result}); }catch(e){}

    // Scroll to result
    document.getElementById('readerResultCard').scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Save to history
    const title = inputText.slice(0, 40).replace(/\n/g, ' ') + '\u2026';
    ST.reader.history.unshift({
      ts: Date.now(),
      title: title,
      mode: modeInfo.name,
      wordCount: inputText.split(/\s+/).length,
      resultPreview: result.slice(0, 200)
    });
    if (ST.reader.history.length > READER_HISTORY_MAX) {
      ST.reader.history = ST.reader.history.slice(0, READER_HISTORY_MAX);
    }
    saveAll();
    renderReaderHistory();

    SFX.complete();
    toast('\u2705 Ho\u00e0n th\u00e0nh', `${modeInfo.icon} ${modeInfo.name}`, 'success');

  } catch (e) {
    loadArea.innerHTML = `<div class="alert alert-error">\u274c ${e.message}</div>`;
    document.getElementById('btnReaderRun').disabled = false;

    let hint = 'Ki\u1ec3m tra API key v\u00e0 k\u1ebft n\u1ed1i m\u1ea1ng';
    if (String(e.message).indexOf('429') !== -1) hint = 'API h\u1ebft l\u01b0\u1ee3t. \u0110\u1ee3i 1-2 ph\u00fat.';
    toast('L\u1ed7i ph\u00e2n t\u00edch', hint, 'error');
  }
}

// \u2550\u2550\u2550 G\u00d3I 8: Chu\u1ea9n h\u00f3a Markdown mindmap + l\u01b0u \u0111\u1ec3 xu\u1ea5t file \u2550\u2550\u2550
var _lastMindmapMD = '';
function _normalizeMindmapMD(raw){
  var t=(raw||'').replace(/```[a-z]*|```/g,'').trim();
  // N\u1ebfu AI l\u1ee1 tr\u1ea3 d\u1ea1ng th\u1ee5t l\u1ec1 "-" thu\u1ea7n, v\u1eabn d\u00f9ng \u0111\u01b0\u1ee3c v\u1edbi markmap
  if(!/^#{1,}\s/m.test(t) && !/^-\s/m.test(t)){
    // fallback: m\u1ed7i d\u00f2ng th\u00e0nh bullet
    t=t.split('\n').map(function(l){return l.trim()?('- '+l.trim()):''}).join('\n');
  }
  return t;
}
// V\u1ebd mindmap t\u01b0\u01a1ng t\u00e1c b\u1eb1ng Markmap
(function(){ if(document.getElementById('mmBrightCSS'))return; var s=document.createElement('style'); s.id='mmBrightCSS'; s.textContent='.mm-canvas{background:#0d1424!important;border-radius:12px} .mm-canvas svg text,.markmap text,.markmap-node text{fill:#f1f5ff!important;stroke:#0d1424;stroke-width:.4px;paint-order:stroke fill;font-size:18px!important;font-weight:700!important} .mm-canvas svg .markmap-link,.markmap-link{stroke-opacity:.85!important;stroke-width:2px!important} @media(max-width:640px){.mm-canvas svg text,.markmap text,.markmap-node text{font-size:21px!important}}'; document.head.appendChild(s); })();
function _renderMindmap(raw){
  _lastMindmapMD=_normalizeMindmapMD(raw);window.__mmLastMD=_lastMindmapMD;
  var wrapId='mmSvgWrap_'+Date.now();
  // Tr\u1ea3 v\u1ec1 khung ch\u1ee9a + n\u00fat c\u00f4ng c\u1ee5; v\u1ebd sau khi DOM g\u1eafn
  setTimeout(function(){ _drawMarkmap(wrapId, _lastMindmapMD); }, 60);
  return '<div class="mm-toolbar">'
    +'<span class="mm-tool-label">\ud83e\udde0 B\u1ea3n \u0111\u1ed3 t\u01b0 duy t\u01b0\u01a1ng t\u00e1c</span>'
    +'<div class="mm-tool-btns">'
    +'<button class="btn btn-secondary btn-sm" onclick="mmZoom(0.8)">\u2796</button>'
    +'<button class="btn btn-secondary btn-sm" onclick="mmZoom(1.25)">\u2795</button>'
    +'<button class="btn btn-secondary btn-sm" onclick="mmFit()">\ud83c\udfaf V\u1eeba m\u00e0n h\u00ecnh</button>'
    +'<select id="mmExportSel" class="mm-export-sel" onchange="mmExport(this.value);this.selectedIndex=0">'
    +'<option value="">\ud83d\udce4 Xu\u1ea5t MindMap\u2026</option>'
    +'<option value="md">Markdown (.md) \u2014 Markmap/Obsidian</option>'
    +'<option value="opml">OPML (.opml) \u2014 XMind/MindNode</option>'
    +'<option value="mm">FreeMind (.mm) \u2014 Freeplane/XMind</option>'
    +'<option value="html">HTML t\u01b0\u01a1ng t\u00e1c (.html)</option>'
    +'<option value="copy">\ud83d\udccb Copy d\u1ea1ng text (markmap)</option>'
    +'</select>'
    +'</div></div>'
    +'<div class="mm-canvas"><svg id="'+wrapId+'" style="width:100%;height:520px"></svg></div>';
}
var _mmInstance=null;
function _drawMarkmap(svgId, md){
  var svg=document.getElementById(svgId);
  if(!svg) return;
  if(!window.markmap || !window.markmap.Markmap){
    svg.outerHTML='<div class="alert alert-warn">Kh\u00f4ng t\u1ea3i \u0111\u01b0\u1ee3c th\u01b0 vi\u1ec7n Markmap (ki\u1ec3m tra m\u1ea1ng). Hi\u1ec3n th\u1ecb d\u1ea1ng v\u0103n b\u1ea3n:</div><pre style="white-space:pre-wrap;background:var(--bg3);padding:14px;border-radius:8px">'+md.replace(/</g,'&lt;')+'</pre>';
    return;
  }
  try{
    var transformer=new window.markmap.Transformer();
    var res=transformer.transform(md);
    if(_mmInstance){ try{_mmInstance.destroy&&_mmInstance.destroy()}catch(e){} }
    _mmInstance=window.markmap.Markmap.create(svg, {duration:400,spacingVertical:8,spacingHorizontal:80,paddingX:16}, res.root);
    setTimeout(function(){ try{_mmInstance.fit()}catch(e){} }, 200);
  }catch(err){
    svg.outerHTML='<div class="alert alert-error">L\u1ed7i v\u1ebd mindmap: '+err.message+'</div><pre style="white-space:pre-wrap;background:var(--bg3);padding:14px;border-radius:8px">'+md.replace(/</g,'&lt;')+'</pre>';
  }
}
function mmZoom(factor){ if(_mmInstance&&_mmInstance.rescale){ _mmInstance.rescale(factor); } }
function mmFit(){ if(_mmInstance&&_mmInstance.fit){ _mmInstance.fit(); } }

// \u2550\u2550\u2550 G\u00d3I 8: Chuy\u1ec3n Markdown mindmap \u2192 c\u00e2y node (cho OPML/FreeMind) \u2550\u2550\u2550
function _mdToTree(md){
  var lines=md.split('\n'), root={title:'Mindmap',children:[]}, stack=[{node:root,level:0}];
  lines.forEach(function(l){
    if(!l.trim()) return;
    var h=l.match(/^(#{1,6})\s+(.*)$/);
    var b=l.match(/^(\s*)-\s+(.*)$/);
    var level, title;
    if(h){ level=h[1].length; title=h[2].trim(); }
    else if(b){ level=6+Math.floor(b[1].replace(/\t/g,'  ').length/2)+1; title=b[2].trim(); }
    else return;
    var node={title:title,children:[]};
    while(stack.length>1 && stack[stack.length-1].level>=level){ stack.pop(); }
    stack[stack.length-1].node.children.push(node);
    stack.push({node:node,level:level});
  });
  // N\u1ebfu ch\u1ec9 c\u00f3 1 con \u1edf g\u1ed1c \u2192 d\u00f9ng con \u0111\u00f3 l\u00e0m g\u1ed1c th\u1eadt
  if(root.children.length===1) return root.children[0];
  return root;
}
function _esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function _treeToOPML(node){
  function walk(n){ var kids=(n.children||[]).map(walk).join(''); return '<outline text="'+_esc(n.title)+'">'+kids+'</outline>'; }
  return '<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0"><head><title>'+_esc(node.title)+'</title></head><body>'+walk(node)+'</body></opml>';
}
function _treeToFreeMind(node){
  function walk(n){ var kids=(n.children||[]).map(walk).join(''); return '<node TEXT="'+_esc(n.title)+'">'+kids+'</node>'; }
  return '<map version="1.0.1">'+walk(node)+'</map>';
}
function mmExport(kind){
  if(!kind) return;
  var md=_lastMindmapMD||'';
  if(!md){ toast('Ch\u01b0a c\u00f3 s\u01a1 \u0111\u1ed3','',"warn"); return; }
  if(kind==='copy'){
    navigator.clipboard.writeText(md).then(function(){toast('\ud83d\udccb \u0110\u00e3 copy','D\u00e1n v\u00e0o markmap.js.org/repl','success')});
    return;
  }
  if(kind==='md'){ download(md,'mindmap.md','text/markdown'); return; }
  var tree=_mdToTree(md);
  if(kind==='opml'){ download(_treeToOPML(tree),'mindmap.opml','text/xml'); return; }
  if(kind==='mm'){ download(_treeToFreeMind(tree),'mindmap.mm','application/x-freemind'); return; }
  if(kind==='html'){
    var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Mindmap</title>'
      +'<script src="https://cdn.jsdelivr.net/npm/d3@7"><\/script>'
      +'<script src="https://cdn.jsdelivr.net/npm/markmap-view@0.17.0/dist/browser/index.js"><\/script>'
      +'<script src="https://cdn.jsdelivr.net/npm/markmap-lib@0.17.0/dist/browser/index.js"><\/script>'
      +'</head><body style="margin:0"><svg id="mm" style="width:100vw;height:100vh"></svg>'
      +'<script>var t=new markmap.Transformer();var r=t.transform('+JSON.stringify(md)+');markmap.Markmap.create(document.getElementById("mm"),null,r.root);<\/script>'
      +'</body></html>';
    download(html,'mindmap.html','text/html');
    return;
  }
}

// \u2550\u2550\u2550 NEW v2: Basic markdown \u2192 HTML converter
function _markdownToBasicHtml(md) {
  if (!md) return '';
  let html = md
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:var(--bg4);border:1px solid var(--border);border-radius:8px;padding:14px;overflow-x:auto;font-size:.85rem;line-height:1.6"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Headers
    .replace(/^### (.+)$/gm, '<h4 style="margin:16px 0 8px;color:var(--c2)">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="margin:18px 0 10px;color:var(--c1)">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 style="margin:20px 0 12px;background:linear-gradient(90deg,var(--c1),var(--c2));-webkit-background-clip:text;-webkit-text-fill-color:transparent">$1</h2>')
    // Unordered list
    .replace(/^[-*] (.+)$/gm, '<li style="margin-left:20px;margin-bottom:4px">$1</li>')
    // Ordered list
    .replace(/^\d+\. (.+)$/gm, '<li style="margin-left:20px;margin-bottom:4px;list-style:decimal">$1</li>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border);margin:16px 0">')
    // Paragraphs
    .replace(/\n\n/g, '</p><p style="margin-bottom:10px">')
    .replace(/\n/g, '<br>');

  return '<div style="line-height:1.8"><p style="margin-bottom:10px">' + html + '</p></div>';
}

// \u2550\u2550\u2550 NEW v2: Re-run with different mode
function rerunReaderDifferentMode() {
  document.getElementById('readerResultCard').classList.add('hidden');
  document.getElementById('readerInputCard').scrollIntoView({ behavior: 'smooth' });
  toast('Ch\u1ecdn ch\u1ebf \u0111\u1ed9 m\u1edbi', 'Ch\u1ecdn ch\u1ebf \u0111\u1ed9 ph\u00e2n t\u00edch kh\u00e1c r\u1ed3i nh\u1ea5n Ph\u00e2n t\u00edch', 'info');
  SFX.click();
}

// \u2550\u2550\u2550 NEW v2: Show follow-up input
function readerFollowUp() {
  document.getElementById('readerFollowUpWrap').classList.toggle('hidden');
  SFX.click();
}

// \u2550\u2550\u2550 NEW v2: Send follow-up question
async function sendReaderFollowUp() {
  const q = (document.getElementById('readerFollowUpInput')?.value || '').trim();
  if (!q) { toast('Nh\u1eadp c\u00e2u h\u1ecfi', '', 'warn'); return; }

  const resultArea = document.getElementById('readerFollowUpResult');
  resultArea.innerHTML = '<div class="spin-wrap" style="padding:12px"><div class="spinner" style="width:24px;height:24px;border-width:3px"></div><div class="spin-text">\u0110ang x\u1eed l\u00fd<span class="spin-dots"></span></div></div>';

  try {
    const msgs = [
      { role: 'system', content: 'B\u1ea1n l\u00e0 AI Reader. Tr\u1ea3 l\u1eddi d\u1ef1a tr\u00ean n\u1ed9i dung t\u00e0i li\u1ec7u \u0111\u00e3 ph\u00e2n t\u00edch tr\u01b0\u1edbc \u0111\u00f3. D\u00f9ng ti\u1ebfng Vi\u1ec7t.' },
      { role: 'user', content: `N\u1ed9i dung g\u1ed1c (t\u00f3m t\u1eaft):\n${(ST.reader.inputText || '').slice(0, 3000)}\n\nK\u1ebft qu\u1ea3 ph\u00e2n t\u00edch tr\u01b0\u1edbc:\n${(ST.reader.lastResult || '').slice(0, 2000)}\n\nC\u00e2u h\u1ecfi ti\u1ebfp theo: ${q}` }
    ];
    const result = await callAI(msgs);
    resultArea.innerHTML = `<div style="background:var(--bg4);border:1px solid var(--border);border-radius:8px;padding:14px;margin-top:8px;line-height:1.7;font-size:.9rem">${_markdownToBasicHtml(result)}</div>`;
    SFX.complete();
  } catch (e) {
    resultArea.innerHTML = `<div class="alert alert-error">\u274c ${e.message}</div>`;
    toast('L\u1ed7i', e.message, 'error');
  }
}

// \u2550\u2550\u2550 NEW v2: Clear Reader
function clearReader() {
  ST.reader.inputText = '';
  const paste = document.getElementById('readerPasteArea');
  if (paste) paste.value = '';
  document.getElementById('readerLoadedPreview').style.display = 'none';
  document.getElementById('readerResultCard').classList.add('hidden');
  document.getElementById('readerFollowUpWrap').classList.add('hidden');
  document.getElementById('readerLoadingArea').innerHTML = '';
  document.getElementById('readerCharCount').textContent = `0 / ${READER_MAX_INPUT} k\u00fd t\u1ef1`;
  SFX.click();
  toast('\u0110\u00e3 x\u00f3a', '', 'info');
}
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// BLOCK 6E \u2014 AI READER: Copy, Export, History
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

// \u2550\u2550\u2550 NEW v2: Copy Reader result to clipboard
function copyReaderResult() {
  const text = ST.reader.lastResult || '';
  if (!text) { toast('Kh\u00f4ng c\u00f3 k\u1ebft qu\u1ea3', '', 'warn'); return; }
  navigator.clipboard.writeText(text).then(() => {
    toast('\ud83d\udccb \u0110\u00e3 copy', 'K\u1ebft qu\u1ea3 \u0111\u00e3 sao ch\u00e9p', 'success');
    SFX.save();
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    toast('\ud83d\udccb \u0110\u00e3 copy', '', 'success');
  });
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// TH\u00caM M\u1edaI: XU\u1ea4T T\u00c0I LI\u1ec6U CHUY\u00caN NGHI\u1ec6P (chu\u1ea9n NotebookLM / \u0111\u1eb9p h\u01a1n)
// T\u1ef1 t\u1ea1o: trang b\u00eca \u00b7 m\u1ee5c l\u1ee5c \u00b7 \u0111\u00e1nh s\u1ed1 m\u1ee5c \u00b7 callout \u00b7 b\u1ea3ng \u0111\u1eb9p \u00b7 header/footer \u00b7 s\u1ed1 trang
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

// B\u1ed9 chuy\u1ec3n Markdown \u2192 HTML "gi\u00e0u" (heading c\u00f3 id \u0111\u1ec3 l\u00e0m m\u1ee5c l\u1ee5c, b\u1ea3ng, callout)
function _mdToRichHtml(md){
  if(!md) return {html:'', toc:[]};
  var esc=function(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')};
  var lines=md.replace(/\r/g,'').split('\n');
  var out=[], toc=[], i=0, hIndex=0;
  var inUL=false, inOL=false;
  var closeLists=function(){ if(inUL){out.push('</ul>');inUL=false;} if(inOL){out.push('</ol>');inOL=false;} };
  while(i<lines.length){
    var line=lines[i];
    // Code block
    if(/^```/.test(line)){
      closeLists(); i++; var code=[];
      while(i<lines.length && !/^```/.test(lines[i])){ code.push(esc(lines[i])); i++; }
      i++; out.push('<pre class="doc-code">'+code.join('\n')+'</pre>'); continue;
    }
    // B\u1ea3ng markdown
    if(/^\s*\|.*\|\s*$/.test(line) && i+1<lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i+1])){
      closeLists();
      var header=line.split('|').slice(1,-1).map(function(c){return c.trim()});
      i+=2; var rows=[];
      while(i<lines.length && /^\s*\|.*\|\s*$/.test(lines[i])){
        rows.push(lines[i].split('|').slice(1,-1).map(function(c){return c.trim()})); i++;
      }
      var th='<tr>'+header.map(function(h){return '<th>'+_inline(esc(h))+'</th>'}).join('')+'</tr>';
      var tb=rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+_inline(esc(c))+'</td>'}).join('')+'</tr>'}).join('');
      out.push('<table class="doc-table"><thead>'+th+'</thead><tbody>'+tb+'</tbody></table>');
      continue;
    }
    // Heading
    var hm=line.match(/^(#{1,4})\s+(.*)$/);
    if(hm){
      closeLists();
      var lvl=hm[1].length; var txt=hm[2].trim();
      hIndex++; var id='sec-'+hIndex;
      toc.push({level:lvl, text:txt.replace(/[*`_]/g,''), id:id});
      out.push('<h'+lvl+' id="'+id+'" class="doc-h doc-h'+lvl+'">'+_inline(esc(txt))+'</h'+lvl+'>');
      i++; continue;
    }
    // Blockquote \u2192 callout
    if(/^>\s?/.test(line)){
      closeLists(); var q=[];
      while(i<lines.length && /^>\s?/.test(lines[i])){ q.push(lines[i].replace(/^>\s?/,'')); i++; }
      out.push('<div class="doc-callout">'+_inline(esc(q.join(' ')))+'</div>'); continue;
    }
    // HR
    if(/^\s*---+\s*$/.test(line)){ closeLists(); out.push('<hr class="doc-hr">'); i++; continue; }
    // List kh\u00f4ng th\u1ee9 t\u1ef1
    if(/^\s*[-*]\s+/.test(line)){
      if(inOL){out.push('</ol>');inOL=false;}
      if(!inUL){out.push('<ul class="doc-ul">');inUL=true;}
      out.push('<li>'+_inline(esc(line.replace(/^\s*[-*]\s+/,'')))+'</li>'); i++; continue;
    }
    // List c\u00f3 th\u1ee9 t\u1ef1
    if(/^\s*\d+\.\s+/.test(line)){
      if(inUL){out.push('</ul>');inUL=false;}
      if(!inOL){out.push('<ol class="doc-ol">');inOL=true;}
      out.push('<li>'+_inline(esc(line.replace(/^\s*\d+\.\s+/,'')))+'</li>'); i++; continue;
    }
    // D\u00f2ng tr\u1ed1ng
    if(!line.trim()){ closeLists(); i++; continue; }
    // \u0110o\u1ea1n v\u0103n
    closeLists(); out.push('<p class="doc-p">'+_inline(esc(line))+'</p>'); i++;
  }
  closeLists();
  function _inline(s){
    return s
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+?)\*/g,'$1<em>$2</em>')
      .replace(/`([^`]+?)`/g,'<code>$1</code>');
  }
  return {html:out.join('\n'), toc:toc};
}

// CSS d\u00f9ng chung cho t\u00e0i li\u1ec7u xu\u1ea5t (\u0111\u1eb9p, in PDF s\u1eafc n\u00e9t)
function _docCSS(){
  return ''
  +'*{box-sizing:border-box}'
  +'body{font-family:"Segoe UI",Calibri,Arial,sans-serif;color:#1f2733;line-height:1.75;font-size:11.5pt;margin:0;background:#f4f6fb}'
  +'.doc-page{max-width:820px;margin:0 auto;background:#fff;padding:0}'
  +'.doc-cover{background:linear-gradient(135deg,#00c896 0%,#007cf0 60%,#7928ca 100%);color:#fff;padding:70px 56px;position:relative}'
  +'.doc-cover .badge{display:inline-block;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);padding:6px 14px;border-radius:30px;font-size:10.5pt;font-weight:600;letter-spacing:.5px}'
  +'.doc-cover h1{font-size:30pt;font-weight:800;margin:24px 0 10px;line-height:1.2}'
  +'.doc-cover .subtitle{font-size:13pt;opacity:.92;font-weight:500}'
  +'.doc-cover .meta{margin-top:34px;font-size:10.5pt;opacity:.9;border-top:1px solid rgba(255,255,255,.3);padding-top:16px}'
  +'.doc-cover .brand{position:absolute;bottom:26px;right:56px;font-weight:800;font-size:12pt;letter-spacing:.5px}'
  +'.doc-inner{padding:44px 56px}'
  +'.doc-toc{background:#f0f9f6;border:1px solid #cdeee4;border-left:5px solid #00c896;border-radius:10px;padding:22px 26px;margin-bottom:34px}'
  +'.doc-toc h2{margin:0 0 12px;font-size:15pt;color:#008a68}'
  +'.doc-toc ul{list-style:none;padding:0;margin:0}'
  +'.doc-toc li{padding:4px 0;font-size:11pt}'
  +'.doc-toc a{color:#1f2733;text-decoration:none;border-bottom:1px dotted #b7d8cd}'
  +'.doc-toc .l1{font-weight:700}.doc-toc .l2{padding-left:20px}.doc-toc .l3{padding-left:40px;font-size:10.5pt;color:#4a5568}.doc-toc .l4{padding-left:56px;font-size:10pt;color:#6b7280}'
  +'.doc-h{font-weight:800;scroll-margin-top:20px;page-break-after:avoid}'
  +'.doc-h1{font-size:22pt;color:#0a2540;margin:34px 0 14px;padding-bottom:8px;border-bottom:3px solid #00c896}'
  +'.doc-h2{font-size:16pt;color:#005fbf;margin:28px 0 10px}'
  +'.doc-h3{font-size:13pt;color:#7928ca;margin:22px 0 8px}'
  +'.doc-h4{font-size:11.5pt;color:#334155;margin:16px 0 6px}'
  +'.doc-p{margin:0 0 12px;text-align:justify}'
  +'.doc-ul,.doc-ol{margin:0 0 14px;padding-left:26px}'
  +'.doc-ul li,.doc-ol li{margin-bottom:6px}'
  +'.doc-ul li::marker{color:#00c896}'
  +'.doc-callout{background:#fff8e6;border-left:5px solid #f7971e;border-radius:8px;padding:14px 18px;margin:16px 0;color:#6b4f13;font-size:11pt}'
  +'.doc-code{background:#0f1729;color:#d6e2f0;border-radius:8px;padding:16px;overflow-x:auto;font-family:"Consolas",monospace;font-size:10pt;line-height:1.6;margin:14px 0}'
  +'code{background:#eef2f9;color:#b5179e;padding:2px 6px;border-radius:5px;font-family:"Consolas",monospace;font-size:.9em}'
  +'.doc-table{width:100%;border-collapse:collapse;margin:16px 0;font-size:10.5pt;box-shadow:0 2px 10px rgba(0,0,0,.06)}'
  +'.doc-table th{background:linear-gradient(135deg,#00c896,#007cf0);color:#fff;padding:11px 14px;text-align:left;font-weight:700}'
  +'.doc-table td{padding:10px 14px;border-bottom:1px solid #e3e8f0}'
  +'.doc-table tbody tr:nth-child(even){background:#f7fafc}'
  +'.doc-hr{border:none;border-top:1px solid #e2e8f0;margin:22px 0}'
  +'.doc-footer{text-align:center;color:#94a3b8;font-size:9.5pt;border-top:1px solid #e2e8f0;padding:18px 56px;margin-top:20px}'
  +'@media print{body{background:#fff}.doc-page{max-width:100%}.doc-print-btn{display:none!important}'
  +'.doc-cover{page-break-after:always}.doc-toc{page-break-after:always}'
  +'.doc-h1,.doc-h2{page-break-after:avoid}.doc-table,.doc-callout,.doc-code{page-break-inside:avoid}'
  +'@page{margin:16mm}}';
}

// D\u1ef1ng kh\u1ed1i HTML ho\u00e0n ch\u1ec9nh (b\u00eca + m\u1ee5c l\u1ee5c + n\u1ed9i dung)
function _buildProDoc(opts){
  var r=_mdToRichHtml(opts.markdown||'');
  var tocItems=r.toc.filter(function(t){return t.level<=3});
  var tocHtml='';
  if(tocItems.length>=2){
    tocHtml='<div class="doc-toc"><h2>\ud83d\udcd1 M\u1ee5c l\u1ee5c</h2><ul>'
      +tocItems.map(function(t){return '<li class="l'+t.level+'"><a href="#'+t.id+'">'+t.text+'</a></li>'}).join('')
      +'</ul></div>';
  }
  var today=new Date().toLocaleDateString('vi-VN',{year:'numeric',month:'long',day:'numeric'});
  var cover='<div class="doc-cover">'
    +'<span class="badge">'+(opts.badge||'\ud83d\udcd6 AI Reader')+'</span>'
    +'<h1>'+(opts.title||'T\u00e0i li\u1ec7u h\u1ecdc t\u1eadp')+'</h1>'
    +'<div class="subtitle">'+(opts.subtitle||'')+'</div>'
    +'<div class="meta">Ch\u1ebf \u0111\u1ed9 ph\u00e2n t\u00edch: <strong>'+(opts.mode||'\u2014')+'</strong><br>Ng\u00e0y t\u1ea1o: '+today+' &nbsp;\u00b7&nbsp; Provider: '+(opts.provider||'AI')+'</div>'
    +'<div class="brand">YeahEdu-TDA</div></div>';
  var footer='<div class="doc-footer">T\u00e0i li\u1ec7u \u0111\u01b0\u1ee3c t\u1ea1o b\u1edfi YeahEdu-TDA \u00b7 Tr\u1ee3 l\u00fd h\u1ecdc t\u1eadp th\u00f4ng minh \u00b7 '+today+'</div>';
  return {css:_docCSS(), body:cover+tocHtml+'<div class="doc-inner">'+r.html+'</div>'+footer};
}

// L\u1ea5y ti\u00eau \u0111\u1ec1 g\u1ee3i \u00fd t\u1eeb n\u1ed9i dung (d\u00f2ng heading \u0111\u1ea7u ti\u00ean ho\u1eb7c c\u00e2u \u0111\u1ea7u)
function _guessDocTitle(md){
  var m=(md||'').match(/^#\s+(.+)$/m);
  if(m) return m[1].replace(/[*`#]/g,'').trim().slice(0,80);
  var first=(md||'').split('\n').find(function(l){return l.trim().length>4});
  return first ? first.replace(/[*`#>-]/g,'').trim().slice(0,80) : 'T\u00e0i li\u1ec7u h\u1ecdc t\u1eadp';
}

// XU\u1ea4T PDF chuy\u00ean nghi\u1ec7p (m\u1edf tab in, n\u00fat In/L\u01b0u PDF)
function exportReaderPro(fmt){
  var text=ST.reader.lastResult||'';
  if(!text){ toast('Kh\u00f4ng c\u00f3 k\u1ebft qu\u1ea3','H\u00e3y ph\u00e2n t\u00edch tr\u01b0\u1edbc khi xu\u1ea5t','warn'); return; }
  SFX.click();
  var modeName=(READER_MODES[ST.reader.selectedMode]&&READER_MODES[ST.reader.selectedMode].name)||'T\u00f9y ch\u1ec9nh';
  var doc=_buildProDoc({
    title:_guessDocTitle(text),
    subtitle:modeName,
    badge:'\ud83d\udcd6 AI Reader',
    mode:modeName,
    provider:(PROVIDERS[ST.provider]&&PROVIDERS[ST.provider].name)||'AI',
    markdown:text
  });
  if(fmt==='pdf'){
    var w=window.open('','_blank');
    if(!w){ toast('B\u1ecb ch\u1eb7n popup','Cho ph\u00e9p popup \u0111\u1ec3 xu\u1ea5t PDF','warn'); return; }
    w.document.write('<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>'
      +_guessDocTitle(text)+'</title><style>'+doc.css
      +'.doc-print-btn{position:fixed;top:16px;right:16px;z-index:9;padding:11px 20px;background:#00c896;color:#fff;border:none;border-radius:10px;cursor:pointer;font-weight:700;font-size:11pt;box-shadow:0 6px 20px rgba(0,200,150,.4)}'
      +'</style></head><body><button class="doc-print-btn" onclick="window.print()">\ud83d\udda8\ufe0f In / L\u01b0u PDF</button>'
      +'<div class="doc-page">'+doc.body+'</div>'
      +'<script>setTimeout(function(){window.focus()},300)<\/script></body></html>');
    w.document.close();
    toast('\u2705 S\u1eb5n s\u00e0ng in','Nh\u1ea5n n\u00fat In / L\u01b0u PDF trong tab m\u1edbi','success',4000);
    return;
  }
  if(fmt==='word'){
    var wHtml='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">'
      +'<head><meta charset="utf-8"><title>'+_guessDocTitle(text)+'</title>'
      +'<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->'
      +'<style>'+doc.css+'</style></head><body><div class="doc-page">'+doc.body+'</div></body></html>';
    download('\ufeff'+wHtml, (_guessDocTitle(text).slice(0,40)||'ai-reader')+'.doc','application/msword');
    toast('\u2705 \u0110\u00e3 t\u1ea3i Word','M\u1edf b\u1eb1ng Microsoft Word','success');
    return;
  }
  if(fmt==='html'){
    var html='<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'
      +_guessDocTitle(text)+'</title><style>'+doc.css+'</style></head><body><div class="doc-page">'+doc.body+'</div></body></html>';
    download(html,(_guessDocTitle(text).slice(0,40)||'ai-reader')+'.html','text/html');
    toast('\u2705 \u0110\u00e3 t\u1ea3i HTML','','success');
    return;
  }
}

// \u2550\u2550\u2550 NEW v2: Export Reader result
function exportReaderResult(fmt) {
  const text = ST.reader.lastResult || '';
  if (!text) { toast('Kh\u00f4ng c\u00f3 k\u1ebft qu\u1ea3', '', 'warn'); return; }
  SFX.click();
  var _rTitle='AI Reader - '+new Date().toLocaleDateString('vi');
  var _rBody=(typeof _markdownToBasicHtml==='function')?_markdownToBasicHtml(text):('<pre>'+text.replace(/</g,'&lt;')+'</pre>');
  if(fmt==='word'||fmt==='doc'){
    var wHtml='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>'+_rTitle+'</title><style>body{font-family:Calibri,Arial;font-size:12pt;line-height:1.6}h1,h2,h3{color:#1a5276}table{border-collapse:collapse}td,th{border:1px solid #999;padding:6px}</style></head><body><h1>'+_rTitle+'</h1>'+_rBody+'</body></html>';
    download('\ufeff'+wHtml,'ai-reader.doc','application/msword');
    return;
  }
  if(fmt==='pdf'){
    var w=window.open('','_blank');
    w.document.write('<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>'+_rTitle+'</title><style>body{font-family:Arial;max-width:800px;margin:30px auto;padding:20px;line-height:1.7;color:#222}h1,h2,h3{color:#00845f}@media print{button{display:none}}</style></head><body><button onclick="window.print()" style="padding:10px 20px;background:#00c896;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:700;margin-bottom:20px">\ud83d\udda8\ufe0f In / L\u01b0u PDF</button><h1>'+_rTitle+'</h1>'+_rBody+'</body></html>');
    w.document.close();
    return;
  }

  const title = 'AI Reader - ' + new Date().toLocaleDateString('vi');

  if (fmt === 'md') {
    const md = `# ${title}\n\n**Ch\u1ebf \u0111\u1ed9:** ${READER_MODES[ST.reader.selectedMode]?.name || 'T\u00f9y ch\u1ec9nh'}\n**Ng\u00e0y:** ${new Date().toLocaleDateString('vi')}\n\n---\n\n${text}`;
    download(md, 'ai-reader.md', 'text/markdown');
  } else if (fmt === 'html') {
    const htmlBody = _markdownToBasicHtml(text);
    const html = `<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>${title}</title><style>body{font-family:system-ui;max-width:800px;margin:40px auto;padding:20px;color:#1a1a2e;line-height:1.7}h1{color:#00c896}h2,h3{color:#2c3e50}code{background:#f0f0f0;padding:2px 6px;border-radius:4px}pre{background:#f8f8f8;padding:16px;border-radius:8px;overflow-x:auto}</style></head><body><h1>\ud83d\udcd6 ${title}</h1><p style="color:#666">Ch\u1ebf \u0111\u1ed9: ${READER_MODES[ST.reader.selectedMode]?.name || 'T\u00f9y ch\u1ec9nh'}</p><hr>${htmlBody}<footer style="margin-top:30px;color:#999;font-size:.8rem;border-top:1px solid #eee;padding-top:16px">YeahEdu-TDA Reader \u00b7 ${new Date().toLocaleDateString('vi')}</footer></body></html>`;
    download(html, 'ai-reader.html', 'text/html');
  }
}

// \u2550\u2550\u2550 NEW v2: Render Reader history
function renderReaderHistory() {
  const list = document.getElementById('readerHistoryList');
  if (!list) return;

  const hist = ST.reader.history || [];
  if (!hist.length) {
    list.innerHTML = '<div class="text-muted" style="padding:10px">Ch\u01b0a c\u00f3 l\u1ecbch s\u1eed.</div>';
    return;
  }

  list.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:.85rem">
    <thead><tr style="border-bottom:2px solid var(--border)">
      <th style="padding:8px;text-align:left;color:var(--text2)">Th\u1eddi gian</th>
      <th style="text-align:left;color:var(--text2)">N\u1ed9i dung</th>
      <th style="text-align:center;color:var(--text2)">Ch\u1ebf \u0111\u1ed9</th>
      <th style="text-align:center;color:var(--text2)">T\u1eeb</th>
    </tr></thead>
    <tbody>${hist.map(h => `<tr style="border-bottom:1px solid var(--border)">
      <td style="padding:8px;color:var(--text2)">${new Date(h.ts).toLocaleDateString('vi')}</td>
      <td style="padding:8px" title="${(h.resultPreview || '').replace(/"/g, '&quot;')}">${h.title}</td>
      <td style="padding:8px;text-align:center"><span class="badge badge-blue">${h.mode}</span></td>
      <td style="padding:8px;text-align:center">${h.wordCount || '\u2014'}</td>
    </tr>`).join('')}</tbody></table>`;
}

// \u2550\u2550\u2550 NEW v2: Clear Reader history
function clearReaderHistory() {
  if (!confirm('X\u00f3a to\u00e0n b\u1ed9 l\u1ecbch s\u1eed Reader?')) return;
  ST.reader.history = [];
  saveAll();
  renderReaderHistory();
  toast('\u0110\u00e3 x\u00f3a', 'L\u1ecbch s\u1eed Reader \u0111\u00e3 \u0111\u01b0\u1ee3c x\u00f3a', 'info');
}

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550