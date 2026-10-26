(function () {
  if (typeof window === 'undefined' || !window.__ModuleLoader__) return;

  var LINE = '';
  var KEY = 'dlh-settings-v10';
  var VERSION = '1.3.1';
  var REPO = 'sparky000000001/deep-whale';
  var FEEDBACK_URL = 'https://github.com/sparky000000001/deep-whale/issues';
  var DEFAULTS = {
    accent: '', border: '', fill: '', fillOverBg: false,
    light: 0.9, dark: 0.9,
    glow: 0.5, bold: false, stroke: false,
    lightInvert: false, darkInvert: true,
    customLineMode: true,
    bgId: null, customImage: null,
    animMode: 'none', animSpeed: 40,
    regions: null, regionAnim: true,
    zoom: 1
  };

  function load() {
    try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); }
    catch (e) { console.warn('[deep-line] save failed:', e && e.message); }
  }
  function bgUrl(s) {
    if (s.bgId) return '/dlh-bg/' + s.bgId + '/' + (s.customLineMode ? 'line' : 'raw');
    return s.customImage || '';
  }
  function accentCSS(c) {
    var decl = '--dsw-static-deepseek-500: ' + c + '; --dsw-static-deepseek-450: ' + c +
      '; --dsw-alias-state-business-primary: ' + c +
      '; --dsw-alias-brand-primary-new-colorprimary-new-color: ' + c +
      '; --dsw-alias-button-primary-fill: ' + c + '; --dsw-alias-button-primary-hover: ' + c +
      '; --dsw-alias-button-info-fill: ' + c + '; --dsw-alias-button-info-hover: ' + c +
      '; --dsw-alias-link: ' + c + '; --dsw-alias-onboarding-accent: ' + c +
      '; --dsw-focus-ring-color: ' + c + '; --dsh-scrollbar-thumb: ' + c + ';';
    return ':root, body, body[data-ds-dark-theme], html[data-ds-dark-theme] { ' + decl + ' }';
  }
  function borderCSS(c) {
    var decl = '--dsw-alias-border-l2: ' + c + '; --dsw-alias-border-l3: ' + c +
      '; --dsw-alias-border-l4: ' + c + '; --dsw-elevation-stroke-color: ' + c + ';';
    return ':root, body, body[data-ds-dark-theme], html[data-ds-dark-theme] { ' + decl + ' }';
  }
  function fillCSS(c, overBg) {
    var decl = '--dsw-alias-bg-layer-2: ' + c + '; --dsw-alias-bg-layer-3: ' + c +
      '; --dsw-specific-sidebar-fill: ' + c +
      '; --dsw-alias-settings-card-fill: ' + c +
      '; --dsw-specific-input-major: ' + c +
      '; --dsw-specific-bubble: ' + c +
      '; --dsw-alias-markdown-code-block: ' + c + ';';
    if (overBg) {
      decl += ' --dsw-alias-bg-base: ' + c + '; --dsw-alias-bg-layer-1: ' + c +
        '; --dsw-static-neutral-bluish-00: ' + c + '; --dsw-static-neutral-00: ' + c + ';';
    }
    return ':root, body, body[data-ds-dark-theme], html[data-ds-dark-theme] { ' + decl + ' }';
  }
  function regionCSS(s, img) {
    if (!s.regions || !s.regions.length || !s.regionAnim) return [];
    var out = [];
    out.push([
      '@keyframes dlh-sway-soft { from { transform: translate(-0.4%, 0) rotate(-0.3deg); } to { transform: translate(0.4%, 0) rotate(0.3deg); } }',
      '@keyframes dlh-sway-hair { from { transform: translate(-0.5%, 0.1%) rotate(-0.45deg); } to { transform: translate(0.5%, -0.1%) rotate(0.45deg); } }',
      '@keyframes dlh-sway-leaf { from { transform: rotate(-0.7deg) translateX(-0.3%); } to { transform: rotate(0.7deg) translateX(0.3%); } }',
      '@keyframes dlh-flow-water { from { transform: translateY(-0.5%) scaleY(1.015); } to { transform: translateY(0.5%) scaleY(0.985); } }',
      '@keyframes dlh-flap { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(0.9) translateY(-0.15%); } }'
    ].join('\n'));
    var byKind = {
      hair: ['dlh-sway-hair', 4.0],
      cloth: ['dlh-sway-soft', 3.4],
      leaf: ['dlh-sway-leaf', 3.0],
      water: ['dlh-flow-water', 2.4],
      bird: ['dlh-flap', 0.9],
      other: ['dlh-sway-soft', 3.0]
    };
    s.regions.forEach(function (r, i) {
      if (!r || !r.w || !r.h) return;
      var top = (r.y * 100).toFixed(2);
      var left = (r.x * 100).toFixed(2);
      var right = ((1 - r.x - r.w) * 100).toFixed(2);
      var bottom = ((1 - r.y - r.h) * 100).toFixed(2);
      var kind = String(r.kind || 'other').toLowerCase();
      if (kind === 'butterfly') kind = 'bird';
      var cfg = byKind[kind] || byKind.other;
      var dur = (cfg[1] + (i % 3) * 0.35).toFixed(1);
      out.push('.dlh-region-' + i + ' { position:fixed; left:0; top:0; width:100vw; height:100vh;' +
        ' background-image:url("' + img + '"); background-size:cover; background-position:center 30%;' +
        ' background-repeat:no-repeat; pointer-events:none; z-index:2147483001;' +
        ' clip-path: inset(' + top + '% ' + right + '% ' + bottom + '% ' + left + '%);' +
        ' animation: ' + cfg[0] + ' ' + dur + 's ease-in-out infinite alternate;' +
        ' will-change: transform; }');
    });
    return out;
  }
  function buildCSS(s) {
    var out = [];
    if (s.accent) out.push(accentCSS(s.accent));
    if (s.border) out.push(borderCSS(s.border));
    if (s.fill) out.push(fillCSS(s.fill, s.fillOverBg));
    var img = bgUrl(s) || LINE;
    if (img) {
      out.push('body::after { content:""; position:fixed; inset:0; background-image:url("' + img + '"); background-size:cover; background-position:center 30%; background-repeat:no-repeat; opacity:' + s.light + '; pointer-events:none; z-index:2147483000; }');
      if (s.bgId || s.customImage) {
        out.push('body[data-ds-dark-theme]::after { opacity:' + s.dark + '; }');
      } else {
        out.push('body[data-ds-dark-theme]::after { opacity:' + s.dark + '; filter: invert(1); }');
      }
      if (s.lightInvert) out.push('html:not([data-ds-dark-theme]) body::after { filter: invert(1); }');
      var rc = regionCSS(s, img);
      for (var ri = 0; ri < rc.length; ri++) out.push(rc[ri]);
    }
    if (s.animMode && s.animMode !== 'none' && img) {
      var dur = (s.animSpeed || 40) + 's';
      if (s.animMode === 'pan') {
        out.push('@keyframes dlh-pan { from { transform: scale(1.12) translate3d(-1.8%, -1.2%, 0); } to { transform: scale(1.12) translate3d(1.8%, 1.2%, 0); } }');
        out.push('body::after { animation: dlh-pan ' + dur + ' ease-in-out infinite alternate; will-change: transform; }');
      } else if (s.animMode === 'breathe') {
        out.push('@keyframes dlh-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }');
        out.push('body::after { animation: dlh-breathe ' + dur + ' ease-in-out infinite; will-change: transform; }');
      } else if (s.animMode === 'drift') {
        out.push('@keyframes dlh-drift { from { transform: scale(1.15) translate3d(1.5%, 1%, 0) rotate(-.5deg); } to { transform: scale(1.15) translate3d(-1.5%, -1%, 0) rotate(.5deg); } }');
        out.push('body::after { animation: dlh-drift ' + dur + ' linear infinite alternate; will-change: transform; }');
      }
    }
    if (s.zoom && Math.abs(s.zoom - 1) > 0.001) out.push('#root { zoom: ' + s.zoom + ' !important; }');
    if (s.glow && s.glow > 0.001) {
      var r1 = Math.round(1 + s.glow * 3);
      var r2 = Math.round(2 + s.glow * 10);
      var a1 = (0.35 + s.glow * 0.6).toFixed(2);
      var a2 = (0.10 + s.glow * 0.45).toFixed(2);
      out.push('body, body * { text-shadow: 0 0 ' + r1 + 'px rgba(255,255,255,' + a1 + '), 0 0 ' + r2 + 'px rgba(255,255,255,' + a2 + ') !important; }');
      out.push('body[data-ds-dark-theme], body[data-ds-dark-theme] * { text-shadow: 0 0 ' + r1 + 'px rgba(0,0,0,' + a1 + '), 0 0 ' + r2 + 'px rgba(0,0,0,' + a2 + ') !important; }');
    }
    if (s.bold) out.push('body, body * { font-weight: 600 !important; }');
    if (s.stroke) {
      out.push('body, body * { -webkit-text-stroke: 0.45px rgba(255,255,255,0.9) !important; }');
      out.push('body[data-ds-dark-theme], body[data-ds-dark-theme] * { -webkit-text-stroke: 0.45px rgba(0,0,0,0.9) !important; }');
    }
    return out.join('\n');
  }
  function apply(s) {
    var el = document.getElementById('deep-line-theme');
    if (!el) { el = document.createElement('style'); el.id = 'deep-line-theme'; document.head.appendChild(el); }
    el.textContent = buildCSS(s);
  }
  function readBoth(file, cb) {
    var img = new Image();
    var url = URL.createObjectURL(file);
    img.onload = function () {
      try {
        var maxW = 1920;
        var scale = Math.min(1, maxW / img.width);
        var w = Math.max(1, Math.round(img.width * scale));
        var h = Math.max(1, Math.round(img.height * scale));
        var c1 = document.createElement('canvas'); c1.width = w; c1.height = h;
        var x1 = c1.getContext('2d'); x1.drawImage(img, 0, 0, w, h);
        var raw = c1.toDataURL('image/webp', 0.85);
        var c2 = document.createElement('canvas'); c2.width = w; c2.height = h;
        var x2 = c2.getContext('2d'); x2.drawImage(img, 0, 0, w, h);
        var frame = x2.getImageData(0, 0, w, h);
        var d = frame.data;
        for (var i = 0; i < d.length; i += 4) {
          var lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          d[i + 3] = Math.max(0, Math.min(255, Math.round(255 - lum)));
        }
        x2.putImageData(frame, 0, 0);
        cb(raw, c2.toDataURL('image/webp', 0.85));
      } finally { URL.revokeObjectURL(url); }
    };
    img.onerror = function () { URL.revokeObjectURL(url); cb(null, null); };
    img.src = url;
  }
  function apiList() {
    return fetch('/dlh-bg/list', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (d) { return Array.isArray(d.items) ? d.items : []; })
      .catch(function () { return []; });
  }
  function apiSave(raw, line) {
    return fetch('/dlh-bg/save', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ raw: raw, line: line })
    }).then(function (r) { return r.json(); });
  }
  function apiDelete(id) {
    return fetch('/dlh-bg/' + id, { method: 'DELETE' }).then(function (r) { return r.json(); });
  }
  function apiAnalyze(id) {
    return fetch('/dlh-bg/analyze', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: id })
    }).then(function (r) { return r.json(); });
  }
  function checkUpdate(setStatus) {
    setStatus('检查中…');
    fetch('https://api.github.com/repos/' + REPO + '/tags', { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { return r.json(); })
      .then(function (tags) {
        if (!Array.isArray(tags) || !tags.length) { setStatus('仓库暂无版本标签'); return; }
        var latest = String(tags[0].name || '').replace(/^v/i, '');
        if (latest !== VERSION) setStatus('发现新版本 v' + latest + '（当前 v' + VERSION + '）');
        else setStatus('已是最新版本 v' + VERSION);
      })
      .catch(function () { setStatus('检查失败（网络不可达）'); });
  }
  function probeCssVars() {
    var found = {};
    var sheets = document.styleSheets;
    for (var i = 0; i < sheets.length; i++) {
      var rules;
      try { rules = sheets[i].cssRules; } catch (e) { continue; }
      if (!rules) continue;
      for (var j = 0; j < rules.length; j++) {
        var st = rules[j] && rules[j].style;
        if (!st) continue;
        for (var k = 0; k < st.length; k++) {
          var prop = st[k];
          if (prop.slice(0, 2) === '--' && !found[prop]) found[prop] = String(st.getPropertyValue(prop)).trim();
        }
      }
    }
    var keys = Object.keys(found).sort();
    var box = document.createElement('div');
    box.id = 'dlh-vars';
    box.style.cssText = 'position:fixed;left:0;right:0;bottom:0;max-height:55%;overflow:auto;z-index:2147483647;background:#001a99;color:#fff;font:11px/1.5 monospace;padding:10px;white-space:pre-wrap;';
    box.textContent = 'DLH CSS VARS (' + keys.length + ')\n' + keys.map(function (k) { return k + ' = ' + found[k]; }).join('\n');
    var close = document.createElement('span');
    close.textContent = ' ✕ 关闭';
    close.style.cssText = 'position:absolute;right:12px;top:8px;cursor:pointer;font-size:13px;background:rgba(255,255,255,.18);padding:2px 8px;border-radius:6px;';
    close.onclick = function () { box.remove(); };
    box.appendChild(close);
    var old = document.getElementById('dlh-vars'); if (old) old.remove();
    document.body.appendChild(box);
  }

  window.__ModuleLoader__.load({
    id: 'dsh-deep-line-theme',
    factory(require) {
      var React = require('react');
      var h = React.createElement;

      function slider(label, value, min, max, step, fmt, onChange) {
        return h('label', { style: { display:'flex', alignItems:'center', gap:'12px', margin:'12px 0' } },
          h('span', { style: { width:'132px', flex:'0 0 auto' } }, label),
          h('input', { type:'range', min:String(min), max:String(max), step:String(step), value:value, style:{ flex:'1 1 auto' },
            onChange: function (e) { onChange(parseFloat(e.target.value)); } }),
          h('span', { style: { width:'52px', textAlign:'right', fontVariantNumeric:'tabular-nums' } }, fmt(value))
        );
      }
      function toggle(label, checked, onChange) {
        return h('label', { style: { display:'flex', alignItems:'center', gap:'10px', margin:'10px 0' } },
          h('input', { type:'checkbox', checked:checked, onChange: function (e) { onChange(e.target.checked); } }),
          h('span', null, label)
        );
      }
      function box(title, children) {
        return h('div', { style:{ margin:'0 0 16px', padding:'12px', border:'1px solid rgba(128,128,128,.25)', borderRadius:'10px' } },
          title ? h('div', { style:{ marginBottom:'10px', fontWeight:600 } }, title) : null,
          children
        );
      }
      function colorRow(label, value, fallback, onChange, onClear) {
        return h('div', { style:{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' } },
          h('span', { style:{ width:'92px', flex:'0 0 auto' } }, label),
          h('input', { type:'color', value: value || fallback,
            onInput: function (e) { onChange(e.target.value); },
            onChange: function (e) { onChange(e.target.value); } }),
          h('span', { style:{ fontSize:'12px', opacity:0.75, fontVariantNumeric:'tabular-nums' } }, value || '跟随主题'),
          value ? h('button', { onClick: onClear, style:{ padding:'3px 9px', borderRadius:'6px', cursor:'pointer' } }, '还原') : null
        );
      }

      function SettingsPage() {
        var state = React.useState(load());
        var s = state[0], setS = state[1];
        var updState = React.useState('');
        var upd = updState[0], setUpd = updState[1];
        var listState = React.useState([]);
        var bgList = listState[0], setBgList = listState[1];
        var msgState = React.useState('');
        var msg = msgState[0], setMsg = msgState[1];

        React.useEffect(function () {
          apiList().then(setBgList);
        }, []);

        function update(patch) {
          var next = Object.assign({}, s, patch);
          setS(next); save(next); apply(next);
        }
        function upload(f) {
          if (!f) return;
          setMsg('处理中…');
          readBoth(f, function (raw, line) {
            if (!raw) { setMsg('图片读取失败'); return; }
            apiSave(raw, line).then(function (d) {
              if (d && d.item) {
                update({ bgId: d.item.id, customImage: null, regions: null });
                setBgList(d.items || []);
                setMsg('已保存到本地：' + d.item.id);
              } else {
                setMsg('保存失败：' + ((d && d.error) || '未知'));
              }
            }).catch(function () { setMsg('保存失败（宿主路由不可用）'); });
          });
        }
        function analyze() {
          if (!s.bgId) { setMsg('先上传一张背景，再识别区域'); return; }
          setMsg('识别中…（调用当前模型，可能需要几秒）');
          apiAnalyze(s.bgId).then(function (d) {
            if (d && d.error) { setMsg('识别失败：' + d.error); return; }
            var regions = (d && d.regions) || [];
            update({ regions: regions });
            setMsg('识别完成：' + regions.length + ' 个区域' + (d.model ? '（' + d.model + '）' : '') + (d.cached ? '（缓存）' : ''));
          }).catch(function () { setMsg('识别请求失败（宿主路由不可用）'); });
        }
        function removeBg(id) {
          apiDelete(id).then(function (d) {
            setBgList((d && d.items) || []);
            if (s.bgId === id) update({ bgId: null, regions: null });
          });
        }

        var cards = bgList.map(function (it) {
          var active = s.bgId === it.id;
          return h('div', {
            key: it.id,
            style: { position:'relative', width:'104px', borderRadius:'8px', overflow:'hidden', cursor:'pointer',
              outline: active ? '2px solid #4176e6' : '1px solid rgba(128,128,128,.3)' },
            onClick: function () { update({ bgId: it.id, customImage: null, regions: it.regions || null }); },
            title: it.createdAt
          },
            h('img', { src: '/dlh-bg/' + it.id + '/' + (it.lineExt ? 'line' : 'raw'),
              style:{ width:'104px', height:'64px', objectFit:'cover', display:'block', background:'rgba(128,128,128,.15)' } }),
            it.regions && it.regions.length
              ? h('span', { style:{ position:'absolute', left:'3px', bottom:'3px', fontSize:'10px', background:'rgba(0,0,0,.6)', color:'#fff', borderRadius:'4px', padding:'1px 5px' } }, it.regions.length + '区')
              : null,
            h('button', {
              onClick: function (e) { e.stopPropagation(); removeBg(it.id); },
              title: '删除',
              style:{ position:'absolute', top:'2px', right:'2px', width:'20px', height:'20px', border:'none', borderRadius:'4px',
                background:'rgba(0,0,0,.55)', color:'#fff', cursor:'pointer', lineHeight:'18px', padding:0 }
            }, '×')
          );
        });

        return h('div', { style:{ padding:'4px 0' } },
          h('p', { style:{ margin:'0 0 14px', opacity:0.72, fontSize:'13px' } },
            '主题色、边框色、填充色、背景与文字效果；背景图存本机磁盘，区域识别使用你自己的当前模型。'),

          box('主题色（按钮 / 链接 / 高亮 / 焦点圈）',
            colorRow('主题色', s.accent, '#4176e6',
              function (v) { update({ accent: v }); }, function () { update({ accent: '' }); })
          ),
          box('边框色',
            colorRow('边框', s.border, '#0000001a',
              function (v) { update({ border: v }); }, function () { update({ border: '' }); })
          ),
          box('填充色（卡片 / 输入框 / 侧栏 / 气泡 / 代码块）', h('div', null,
            colorRow('填充', s.fill, '#ffffff',
              function (v) { update({ fill: v }); }, function () { update({ fill: '' }); }),
            toggle('同时覆盖页面底与背景图颜色', s.fillOverBg, function (v) { update({ fillOverBg: v }); })
          )),
          box('线稿背景（上传后保存到本机磁盘）', h('div', null,
            h('div', { style:{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' } },
              h('input', { type:'file', accept:'image/*',
                onChange: function (e) { var f = e.target.files && e.target.files[0]; if (f) upload(f); } }),
              s.bgId || s.customImage
                ? h('button', { onClick: function () { update({ bgId: null, customImage: null, regions: null }); },
                    style:{ padding:'4px 10px', borderRadius:'6px', cursor:'pointer' } }, '恢复内置线稿')
                : h('span', { style:{ opacity:0.6, fontSize:'12px' } }, '当前：内置线稿')
            ),
            msg ? h('div', { style:{ fontSize:'12px', opacity:0.7, marginTop:'6px' } }, msg) : null,
            h('div', { style:{ display:'flex', gap:'18px', flexWrap:'wrap', margin:'10px 0' } },
              h('label', { style:{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer' } },
                h('input', { type:'radio', name:'dlh-line-mode', checked: s.customLineMode, onChange: function () { update({ customLineMode: true }); } }),
                h('span', null, '按线条处理（白底透明）')
              ),
              h('label', { style:{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer' } },
                h('input', { type:'radio', name:'dlh-line-mode', checked: !s.customLineMode, onChange: function () { update({ customLineMode: false }); } }),
                h('span', null, '使用原图')
              )
            ),
            h('div', { style:{ display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center', margin:'10px 0' } },
              h('button', { onClick: analyze, style:{ padding:'5px 12px', borderRadius:'6px', cursor:'pointer' } }, '识别可飘动区域（当前模型）'),
              s.regions && s.regions.length
                ? h('span', { style:{ fontSize:'12px', opacity:0.75 } }, s.regions.map(function (r) { return r.label; }).join(' / '))
                : null
            ),
            s.regions && s.regions.length
              ? h('div', null,
                  toggle('区域飘动', s.regionAnim, function (v) { update({ regionAnim: v }); }),
                  h('div', { style:{ fontSize:'11px', opacity:0.6 } },
                    '区域来自模型识别（矩形框），飘动为本地动画；识别结果已缓存，同一背景不会重复调用模型。')
                )
              : null,
            h('div', { style:{ display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center', margin:'10px 0' } },
              h('span', { style:{ width:'92px', flex:'0 0 auto' } }, '动态效果'),
              ['none','pan','breathe','drift'].map(function (m) {
                var label = m === 'none' ? '关闭' : m === 'pan' ? '平移' : m === 'breathe' ? '呼吸' : '漂移';
                return h('label', { key: m, style:{ display:'flex', alignItems:'center', gap:'4px', cursor:'pointer', fontSize:'13px' } },
                  h('input', { type:'radio', name:'dlh-anim-mode', checked: s.animMode === m, onChange: function () { update({ animMode: m }); } }),
                  h('span', null, label)
                );
              })
            ),
            s.animMode !== 'none'
              ? slider('动画周期（秒，越小越快）', s.animSpeed, 10, 120, 5, function (v) { return Math.round(v) + 's'; }, function (v) { update({ animSpeed: v }); })
              : null,
            bgList.length
              ? h('div', null,
                  h('div', { style:{ fontSize:'12px', opacity:0.65, margin:'8px 0 6px' } }, '往期背景（' + bgList.length + '）'),
                  h('div', { style:{ display:'flex', gap:'8px', flexWrap:'wrap' } }, cards)
                )
              : h('div', { style:{ fontSize:'12px', opacity:0.6, margin:'8px 0' } }, '还没有保存过背景图'),
            slider('亮色线条浓度', s.light, 0, 1, 0.01, function (v) { return v.toFixed(2); }, function (v) { update({ light: v }); }),
            slider('深色线条浓度', s.dark, 0, 1, 0.01, function (v) { return v.toFixed(2); }, function (v) { update({ dark: v }); }),
            toggle('深色主题下反相线条颜色（黑→白）', s.darkInvert, function (v) { update({ darkInvert: v }); }),
            toggle('浅色主题下反相线条颜色', s.lightInvert, function (v) { update({ lightInvert: v }); })
          )),
          box('文字与缩放', h('div', null,
            slider('界面缩放', s.zoom, 0.85, 1.25, 0.01, function (v) { return v.toFixed(2) + 'x'; }, function (v) { update({ zoom: v }); }),
            slider('文字柔光强度', s.glow, 0, 1, 0.01, function (v) { return v.toFixed(2); }, function (v) { update({ glow: v }); }),
            toggle('文字加粗', s.bold, function (v) { update({ bold: v }); }),
            toggle('文字描边（亮白 / 暗黑）', s.stroke, function (v) { update({ stroke: v }); })
          )),
          h('div', { style:{ marginTop:'14px', display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' } },
            h('button', { onClick: function () { checkUpdate(setUpd); },
              style:{ padding:'5px 12px', borderRadius:'6px', cursor:'pointer' } }, '检查更新'),
            upd ? h('span', { style:{ fontSize:'12px', opacity:0.8 } }, upd) : null
          ),
          h('div', { style:{ marginTop:'8px', fontSize:'12px', opacity:0.72 } },
            h('a', { href: FEEDBACK_URL, target:'_blank', rel:'noreferrer',
              style:{ color:'inherit', textDecoration:'underline' } }, '意见反馈 / GitHub Issues')
          )
        );
      }

      return {
        inject: ['slots'],
        apply(ctx) {
          ctx.effect(function () {
            apply(load());
            return function () {
              var el = document.getElementById('deep-line-theme'); if (el) el.remove();
              var vb = document.getElementById('dlh-vars'); if (vb) vb.remove();
            };
          });
          ctx.slots.inject('settings.section', function () {
            return ctx.slots.register({
              name: 'settings.section',
              id: 'deep-line-theme',
              order: 45,
              label: '深鲸线稿',
            }, SettingsPage);
          });
        },
      };
    },
  });
})();
