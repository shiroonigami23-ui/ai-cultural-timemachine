// shared helpers for Wikipedia-sourced HTML
window.wkUnwrap=function(a){if(a.querySelector('img')){var f=document.createDocumentFragment();while(a.firstChild)f.appendChild(a.firstChild);a.replaceWith(f)}else a.replaceWith(document.createTextNode(a.textContent))};
window.wkImgs=function(root){root.querySelectorAll('img').forEach(function(i){['src','srcset','data-src'].forEach(function(k){var v=i.getAttribute(k);if(v)i.setAttribute(k,v.replace(/(^|\s|,)\/\//g,'$1https://'))});if(!i.getAttribute('src')&&i.getAttribute('data-src'))i.setAttribute('src',i.getAttribute('data-src'));i.loading='lazy';i.decoding='async';i.referrerPolicy='no-referrer';i.removeAttribute('width');i.removeAttribute('height');var w=+(i.getAttribute('data-file-width')||0);if(w&&w<40)i.classList.add('icon')});
 root.querySelectorAll('.lazy-image-placeholder').forEach(function(p){var src=p.getAttribute('data-src');if(!src)return;var im=document.createElement('img');im.src=src.replace(/^\/\//,'https://');if(p.getAttribute('data-srcset'))im.srcset=p.getAttribute('data-srcset').replace(/(^|\s|,)\/\//g,'$1https://');im.alt=p.getAttribute('data-alt')||'';im.loading='lazy';p.replaceWith(im)})};
// TOC scroll-spy
(function(){const links=[...document.querySelectorAll('.toc a')];if(!links.length)return;
const map=new Map(links.map(a=>[decodeURIComponent(a.hash.slice(1)),a]));
const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){links.forEach(l=>l.classList.remove('active'));const a=map.get(e.target.id);if(a)a.classList.add('active')}})},{rootMargin:'-80px 0px -70% 0px'});
document.querySelectorAll('.prose h2[id],.prose h3[id]').forEach(h=>obs.observe(h))})();
// Search page
(function(){const box=document.getElementById('q'),out=document.getElementById('results');if(!box)return;
const base=document.querySelector('link[rel=stylesheet]').getAttribute('href').split('?')[0].replace('assets/site/site.css','');
let idx=[];fetch(base+'assets/site/search-index.json').then(r=>r.json()).then(d=>{idx=d;const q=new URLSearchParams(location.search).get('q');if(q){box.value=q;run()}});
const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function run(){const q=box.value.trim().toLowerCase();if(!q){out.innerHTML='';return}const terms=q.split(/\s+/).filter(Boolean);
const res=idx.map(p=>{const t=p.t.toLowerCase(),x=p.x.toLowerCase(),d=p.d.toLowerCase();let s=0;for(const w of terms){if(t.includes(w))s+=10;if(d.includes(w))s+=4;let i=x.indexOf(w),n=0;while(i>-1&&n<20){n++;i=x.indexOf(w,i+1)}if(!n&&!t.includes(w)&&!d.includes(w))return null;s+=n}return{p,s}}).filter(Boolean).sort((a,b)=>b.s-a.s).slice(0,40);
const raw=box.value.trim();out.innerHTML=`<p class="muted">${res.length} result(s) · <a href="${base}wiki/read.html?t=${encodeURIComponent(raw.replace(/ /g,'_'))}">📖 Read the full encyclopedia article on “${esc(raw)}”</a></p>`+res.map(({p})=>{const x=p.x.toLowerCase(),i=Math.max(0,x.indexOf(terms[0])-90);let snip=esc(p.x.slice(i,i+260));terms.forEach(w=>{snip=snip.replace(new RegExp('('+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig'),'<mark>$1</mark>')});
return `<div class="r"><a href="${base}${p.u}"><b>${esc(p.t)}</b></a><small>${esc(p.s)}</small><p>${esc(p.d)}</p><p class="muted">…${snip}…</p></div>`}).join('')}
box.addEventListener('input',run)})();
// Catalog index: filter, group chips, view toggle, sortable table
(function(){const f=document.querySelector('.catfilter');if(!f)return;let g='*';
const cards=[...document.querySelectorAll('.catgrid .card')],rows=[...document.querySelectorAll('.cattable tbody tr')];
function apply(){const q=f.value.toLowerCase();[...cards,...rows].forEach(el=>{const ok=(g==='*'||el.dataset.g===g)&&el.textContent.toLowerCase().includes(q);el.style.display=ok?'':'none'})}
f.addEventListener('input',apply);
document.querySelectorAll('.chips .chip').forEach(b=>b.onclick=()=>{document.querySelectorAll('.chips .chip').forEach(x=>x.classList.remove('on'));b.classList.add('on');g=b.dataset.g;apply()});
document.querySelectorAll('.viewtoggle .chip').forEach(b=>b.onclick=()=>{document.querySelectorAll('.viewtoggle .chip').forEach(x=>x.classList.remove('on'));b.classList.add('on');
 const t=b.dataset.v==='table';document.querySelector('.catgrid').hidden=t;document.querySelector('.cattable').hidden=!t});
document.querySelectorAll('.cattable th').forEach((th,i)=>th.onclick=()=>{const tb=th.closest('table').tBodies[0],dir=th.dataset.d=th.dataset.d==='1'?'-1':'1';
 [...tb.rows].sort((a,b)=>{const x=a.cells[i].textContent.trim(),y=b.cells[i].textContent.trim(),nx=parseFloat(x.replace(/[,\s]/g,'')),ny=parseFloat(y.replace(/[,\s]/g,''));
 return (isNaN(nx)||isNaN(ny)?x.localeCompare(y):nx-ny)*dir}).forEach(r=>tb.appendChild(r))})})();
// open a collapsible section when linked by #id
(function(){function openHash(){var id=decodeURIComponent(location.hash.slice(1));if(!id)return;var el=document.getElementById(id);if(el&&el.tagName==='DETAILS'){el.open=true;el.scrollIntoView({block:'start'});}}
window.addEventListener('hashchange',openHash);document.addEventListener('DOMContentLoaded',openHash);})();
// ---- live photos from Wikimedia Commons (openly licensed), with credit links ----
(function(){
  var API='https://en.wikipedia.org/api/rest_v1/page/summary/';
  var mem={};
  function get(title){
    if(mem[title])return mem[title];
    var key='wp2:'+title, c=null;
    try{c=JSON.parse(localStorage.getItem(key)||'null')}catch(e){}
    if(c&&Date.now()-c.t<7*864e5)return mem[title]=Promise.resolve(c.v);
    return mem[title]=fetch(API+encodeURIComponent(title.replace(/ /g,'_'))+'?redirect=true').then(function(r){return r.ok?r.json():null}).then(function(j){
      var v=null;
      if(j&&j.thumbnail&&j.originalimage&&j.thumbnail.source.indexOf('/wikipedia/commons/')>-1){
        var src=j.originalimage.source, f=decodeURIComponent(src.split('/').pop());
        v={thumb:j.thumbnail.source, orig:src, file:'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(f), title:j.title};
      }
      if(j&&j.extract){v=v||{};v.extract=j.extract;v.page=(j.content_urls&&j.content_urls.desktop&&j.content_urls.desktop.page)||'';v.title=v.title||j.title}
      try{localStorage.setItem(key,JSON.stringify({t:Date.now(),v:v}))}catch(e){}
      return v;
    }).catch(function(){return null});
  }
  function sized(u,w){return /\/\d+px-/.test(u)?u.replace(/\/\d+px-/,'/'+w+'px-'):u}
  function fill(el){
    var t=el.getAttribute('data-wiki'); if(!t||el.dataset.done)return; el.dataset.done=1;
    get(t).then(function(v){
      if(!v||!v.thumb){el.classList.add('nophoto');var tx=el.querySelector('svg text:last-of-type');if(tx)tx.textContent='No open photo yet · prompt in prompts.md';return;}
      var big=el.classList.contains('big');
      var img=new Image(); img.alt=v.title; img.loading='lazy'; img.decoding='async';
      img.src=sized(v.thumb,big?960:480);
      img.onerror=function(){img.onerror=null;img.src=v.thumb};
      img.onload=function(){var s=el.querySelector('svg.ph');if(s)s.remove();el.classList.add('hasphoto');};
      el.appendChild(img);
      if(big){var cap=document.createElement('div');cap.className='credit';cap.innerHTML='Photo: <a href="'+v.file+'" target="_blank" rel="noopener">Wikimedia Commons</a> · author &amp; license on file page';el.appendChild(cap);}
    });
  }
  function run(){
    var els=[].slice.call(document.querySelectorAll('.livepic[data-wiki]'));
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);fill(e.target)}})},{rootMargin:'400px'});
      els.forEach(function(e){io.observe(e)});
    } else els.forEach(fill);
    var ps=document.getElementById('photostatus'); if(ps)status(ps);
    [].forEach.call(document.querySelectorAll('.wikibox[data-wiki]'),function(b){get(b.getAttribute('data-wiki')).then(function(v){
      if(v&&v.extract){b.innerHTML='<h3>📘 Overview from Wikipedia</h3><p>'+v.extract.replace(/</g,'&lt;')+'</p><div class="wsrc">Text: <a href="'+v.page+'" target="_blank" rel="noopener">Wikipedia — '+(v.title||'')+'</a> (CC BY-SA 4.0)</div>';b.hidden=false}
      else b.remove();})});
    window.__wpget=get;
  }
  function status(box){
    var base=(document.querySelector('link[href*="site.css"]').getAttribute('href')||'').split('?')[0].replace('site.css','');
    Promise.all([fetch(base+'prompts.json').then(function(r){return r.json()}),fetch(base+'photo-index.json').then(function(r){return r.json()})]).then(function(a){
      var prompts={};a[0].forEach(function(p){prompts[p.save]=p});
      var idx=a[1], missing=[], ok=0, n=0;
      return Promise.all(idx.map(function(e){return get(e.wiki).then(function(v){n++;if(v&&v.thumb)ok++;else missing.push(e)})})).then(function(){
        var h='<p><b>'+ok+'</b> of <b>'+idx.length+'</b> entries have a real photo. <b>'+missing.length+'</b> need an image:</p>';
        if(!missing.length)h+='<p>Nothing to generate. 🎉</p>';
        missing.forEach(function(e){var p=prompts[e.save]||{prompt:'Photorealistic image of '+e.name};
          h+='<h3>'+e.name+' <span class="muted small">('+e.coll+')</span></h3><p>Save as: <code>'+e.save+'</code></p><pre class="prompt">'+p.prompt.replace(/</g,'&lt;')+'</pre><button class="btn copy">Copy prompt</button>';});
        box.innerHTML=h;
        [].forEach.call(box.querySelectorAll('button.copy'),function(b){b.onclick=function(){navigator.clipboard.writeText(b.previousElementSibling.textContent);b.textContent='Copied ✓'}});
      });
    }).catch(function(){box.innerHTML='<p>Could not reach Wikipedia from this browser. Every prompt is also in <code>prompts.md</code> in the repository.</p>'});
  }
  document.addEventListener('DOMContentLoaded',run);
})();
// ---- animate charts when scrolled into view ----
(function(){function go(){var cs=document.querySelectorAll('figure.chart.anim');if(!('IntersectionObserver' in window)){cs.forEach(function(c){c.classList.add('inview')});return}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('inview');io.unobserve(e.target)}})},{threshold:.15});cs.forEach(function(c){io.observe(c)})}
document.addEventListener('DOMContentLoaded',go);})();
// ---- animated hero backgrounds: bubbles (ocean) or starfield (space) ----
(function(){function run(){var h=document.querySelector('.hero');var kind=document.body.getAttribute('data-anim');if(!h||(kind!=='bubbles'&&kind!=='stars'))return;
if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var c=document.createElement('canvas');c.className='heroanim';h.insertBefore(c,h.firstChild);var x=c.getContext('2d'),W,H,P=[];
function size(){W=c.width=h.offsetWidth*devicePixelRatio;H=c.height=h.offsetHeight*devicePixelRatio}size();addEventListener('resize',size);
var N=kind==='stars'?220:70;for(var i=0;i<N;i++)P.push({x:Math.random(),y:Math.random(),r:Math.random(),s:Math.random()});
function tick(t){x.clearRect(0,0,W,H);for(var i=0;i<P.length;i++){var p=P[i];
 if(kind==='stars'){var a=.35+.65*Math.abs(Math.sin(t/900*(.3+p.s)+i));x.fillStyle='rgba(255,255,255,'+a+')';x.beginPath();x.arc(p.x*W,p.y*H,(p.r*1.6+.3)*devicePixelRatio,0,6.3);x.fill();p.x+=.00004*(p.s+.2);if(p.x>1)p.x=0}
 else{p.y-=.0006*(p.s+.3);if(p.y<-.05){p.y=1.05;p.x=Math.random()}var px=p.x*W+Math.sin(t/700+i)*6*devicePixelRatio;x.strokeStyle='rgba(160,220,255,'+(.15+.35*p.r)+')';x.lineWidth=1.2*devicePixelRatio;x.beginPath();x.arc(px,p.y*H,(p.r*5+1.5)*devicePixelRatio,0,6.3);x.stroke()}}
requestAnimationFrame(tick)}requestAnimationFrame(tick)}document.addEventListener('DOMContentLoaded',run);})();

// ---- UX: live search dropdown, keyboard shortcuts, scroll state ----
(function(){
 var idx=null,base=(document.querySelector('link[href*="site.css"]')||{}).getAttribute?document.querySelector('link[href*="site.css"]').getAttribute('href').split('?')[0].replace('assets/site/site.css',''):'';
 function load(){return idx?Promise.resolve(idx):fetch(base+'assets/site/search-index.json').then(function(r){return r.json()}).then(function(j){idx=j;return j})}
 function score(e,q){var t=e.t.toLowerCase(),i=t.indexOf(q);if(i===0)return 100;if(i>0)return 80;if((e.d||'').toLowerCase().indexOf(q)>-1)return 40;if((e.x||'').toLowerCase().indexOf(q)>-1)return 10;return 0}
 document.addEventListener('DOMContentLoaded',function(){
  var inp=document.getElementById('qs'),box=document.getElementById('qsres'),sel=-1;
  if(inp){
   inp.addEventListener('focus',load);
   inp.addEventListener('input',function(){var q=inp.value.trim().toLowerCase();if(q.length<2){box.hidden=true;return}
    load().then(function(ix){var r=ix.map(function(e){return [score(e,q),e]}).filter(function(a){return a[0]>0}).sort(function(a,b){return b[0]-a[0]}).slice(0,10);
     box.innerHTML=r.map(function(a){return '<a href="'+base+a[1].u+'">'+a[1].t.replace(/</g,'&lt;')+'<small>'+a[1].s+'</small></a>'}).join('')+'<a class="qsall" href="'+base+'wiki/search.html?q='+encodeURIComponent(inp.value)+'">See all results →</a>';
     box.hidden=false;sel=-1;})});
   inp.addEventListener('keydown',function(ev){var as=box.querySelectorAll('a');if(ev.key==='ArrowDown'||ev.key==='ArrowUp'){ev.preventDefault();sel=(sel+(ev.key==='ArrowDown'?1:-1)+as.length)%as.length;as.forEach(function(a,i){a.classList.toggle('sel',i===sel)})}
     else if(ev.key==='Enter'){ev.preventDefault();location.href=(sel>=0&&as[sel])?as[sel].href:base+'wiki/search.html?q='+encodeURIComponent(inp.value)}
     else if(ev.key==='Escape'){box.hidden=true;inp.blur()}});
   document.addEventListener('click',function(ev){if(!ev.target.closest('.search.live'))box.hidden=true;if(!ev.target.closest('.megamenu,.browsebtn,.tabbar'))document.body.classList.remove('megaopen')});
  }
  document.addEventListener('keydown',function(ev){if(ev.key==='/'&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){ev.preventDefault();inp&&inp.focus()}if(ev.key==='Escape')document.body.classList.remove('megaopen')});
  addEventListener('scroll',function(){document.body.classList.toggle('scrolled',scrollY>600)},{passive:true});
  // prefill search page from ?q=
  var bq=document.querySelector('.bigsearch'),m=location.search.match(/[?&]q=([^&]+)/);if(bq&&m){bq.value=decodeURIComponent(m[1].replace(/\+/g,' '));bq.dispatchEvent(new Event('input'))}
 });
})();
// ---- Sounds: local file, curated Wikimedia Commons recording, or search on demand ----
(function(){
 var API='https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url&gsrsearch=';
 var BAD=/pronunc|^File:(En|De|Fr|Nl|Es|It|Ru|Ja|Zh|Pl|Sv|LL)-|LL-Q|Wikipedia|spoken|\.mid$/i;
 function find(q){return fetch(API+encodeURIComponent('filetype:audio '+q)).then(function(r){return r.json()}).then(function(j){
   var ps=j&&j.query?Object.values(j.query.pages):[];ps.sort(function(a,b){return (a.index||0)-(b.index||0)});
   return ps.filter(function(p){return p.imageinfo&&!BAD.test(p.title)}).map(function(p){return {url:p.imageinfo[0].url,page:p.imageinfo[0].descriptionurl,title:p.title.replace(/^File:/,'')}})}).catch(function(){return []})}
 function player(box,items,auto){
   var it=items[0];
   box.innerHTML='<button class="sbtn">⏳ Loading…</button><span class="eq" hidden><i></i><i></i><i></i><i></i></span><div class="sinfo">'+it.title.replace(/</g,'&lt;')+' · <a href="'+it.page+'" target="_blank" rel="noopener">source &amp; licence</a>'+(items.length>1?' · <a href="#" class="snext">try another recording ('+(items.length-1)+')</a>':'')+'</div><audio preload="auto" src="'+it.url+'"></audio>';
   var a=box.querySelector('audio'),b=box.querySelector('.sbtn'),eq=box.querySelector('.eq');
   b.onclick=function(){if(a.paused){a.play()}else{a.pause()}};
   a.preload='auto';a.onplay=function(){b.textContent='⏸ Pause';b.classList.remove('pulse');eq.hidden=false};a.oncanplay=function(){if(a.paused&&b.textContent.indexOf('Loading')>-1)b.textContent='▶ Play sound'};a.onpause=a.onended=function(){b.textContent='▶ Play sound';eq.hidden=true};
   var nx=box.querySelector('.snext');if(nx)nx.onclick=function(ev){ev.preventDefault();player(box,items.slice(1).concat([items[0]]),true)};
   if(auto){var pr=a.play();if(pr&&pr.catch)pr.catch(function(){b.textContent='🔊 Tap to hear it';b.classList.add('pulse')})}
 }
 function none(box,q){var space=(box.dataset.kind||'')!=='species';box.innerHTML='<span class="sinfo">🔇 No open recording found for this '+(box.dataset.kind||'species')+' yet. '+(space?'Space is a vacuum, so \'sounds\' of space are radio, plasma or data converted to audio (sonifications), and many objects have none yet. ':'Many fish and invertebrates are quiet or have never been recorded. ')+'<a href="#" class="sfind">Search more widely</a> · '+(space?'<a href="https://chandra.harvard.edu/sound/" target="_blank" rel="noopener">NASA Chandra sonifications</a>':'<a href="https://dosits.org/galleries/audio-gallery/" target="_blank" rel="noopener">Ocean sound gallery (DOSITS)</a>')+'</span>';
   box.querySelector('.sfind').onclick=function(ev){ev.preventDefault();box.innerHTML='<span class="sinfo">Searching…</span>';find(q.split(' ').slice(0,2).join(' ')).then(function(r){r.length?player(box,r,true):(box.innerHTML='<span class="sinfo">Still nothing found.</span>')})}}
 function relevant(items,box){
   var words=((box.dataset.common||'')+' '+(box.dataset.name||'')).toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(function(w){return w.length>3&&!/^(common|great|giant|lesser|greater|northern|southern|eastern|western|atlantic|pacific|indian|deep|ocean|planet|star|galaxy|nebula|comet|asteroid)$/.test(w)});
   if(box.dataset.sound)return items;
   return items.filter(function(it){var t=it.title.toLowerCase();return words.some(function(w){return t.indexOf(w)>-1})});
 }
 function init(box,auto){
   var local=box.dataset.local,q=box.dataset.sound||'',name=box.dataset.name,common=box.dataset.common||name,desc=box.querySelector('.sounddesc');
   function keepDesc(){if(desc&&!box.contains(desc))box.appendChild(desc)}
   if(box.dataset.silent){box.innerHTML='<span class="sinfo">🔇 No sound to play</span>';keepDesc();return}
   var tryLocal=local?fetch(local,{method:'HEAD'}).then(function(r){return r.ok&&(r.headers.get('content-type')||'').indexOf('audio')>-1?[{url:local,page:local,title:'Recording'}]:[]}).catch(function(){return []}):Promise.resolve([]);
   box.innerHTML='<span class="sinfo">🔊 Finding a recording…</span>';keepDesc();
   tryLocal.then(function(l){if(l.length){player(box,l,auto);keepDesc();return}
     var qs=q?[q]:[name,common];
     (function next(i){if(i>=qs.length){none(box,name);keepDesc();return}
       find(qs[i]).then(function(r){r=relevant(r,box);if(r.length){player(box,r,auto);keepDesc()}else next(i+1)})})(0);
   });
 }
 document.addEventListener('DOMContentLoaded',function(){
   var b=document.querySelector('.soundbox[data-name]');if(b)init(b,true);
   [].forEach.call(document.querySelectorAll('button.cardsnd'),function(btn){btn.onclick=function(ev){ev.preventDefault();ev.stopPropagation();
     btn.textContent='…';find(btn.dataset.sound).then(function(r){if(!r.length){btn.textContent='🔇';return}var a=new Audio(r[0].url);a.play();btn.textContent='⏸';a.onended=function(){btn.textContent='🔊'};btn.onclick=function(e){e.preventDefault();e.stopPropagation();if(a.paused){a.play();btn.textContent='⏸'}else{a.pause();btn.textContent='🔊'}}})}});
 });
})();
// open the tracker by default on wide screens only (home page)
document.addEventListener('DOMContentLoaded',function(){var t=document.querySelector('details.trackbar[data-openwide]');});
// ---- Paper PDFs: use the copy hosted on this site when available, else the publisher/arXiv PDF ----
document.addEventListener('DOMContentLoaded',function(){
 var b=document.querySelector('.paperbox');if(!b)return;
 var local=b.dataset.local,src=b.dataset.src,note=b.querySelector('.pbnote'),fr=b.querySelector('.pbframe'),view=b.querySelector('.pbview');
 fetch(local,{method:'HEAD'}).then(function(r){
  if(r.ok&&(r.headers.get('content-type')||'').indexOf('pdf')>-1){
   var op=b.querySelector('.pbopen');op.href=local;op.hidden=false;op.target='_blank';op.textContent='↗ Open PDF in new tab';var dl=b.querySelector('.pbdl');dl.href=local;dl.hidden=false;dl.setAttribute('download','');dl.textContent='⬇ Download PDF';dl.removeAttribute('target');
   view.hidden=false;note.innerHTML='✅ An openly licensed copy is hosted on this site, so you can read it below or download it.';
   view.onclick=function(){fr.hidden=!fr.hidden;if(!fr.src)fr.src=local+'#view=FitH';view.textContent=fr.hidden?'📖 Read here':'✖ Close reader'};
   if(innerWidth>900){fr.src=local+'#view=FitH';fr.hidden=false;view.textContent='✖ Close reader'}
  } else note.innerHTML=src?'The PDF opens from the publisher or arXiv. Openly licensed papers are mirrored here automatically by the repository\'s <i>Fetch open-access papers</i> workflow.':'No free PDF is available; use the publisher page (your library may have access).';
 }).catch(function(){note.textContent=''});
});
// ---- In-depth: full Wikipedia article sections, cross-linked to this encyclopedia ----
(function(){
 var SKIP=/^(see also|references|notes|external links|further reading|bibliography|sources|citations|footnotes|gallery|explanatory notes|works cited|general references|literature cited)$/i;
 var ICON=[[/descr|anatom|morpholog|appear|character|physical|structure|size|composition/i,'🔎'],[/habitat|distribut|range|ecolog|location|geograph/i,'🗺'],[/diet|feed|predat|hunt|forag|prey/i,'🍽'],[/reprod|breed|mating|life cycle|spawn|lifespan|growth|develop/i,'🥚'],[/behavio|social|communicat|vocal|song|intelligen/i,'🧠'],[/migrat|movement|navigat/i,'🧭'],[/conserv|threat|status|human|fisher|pollut|climate|protect/i,'🛡'],[/taxonom|evolut|phylogen|classif|etymolog|name/i,'🧬'],[/research|study|scien|discover|observ|explor|mission|history/i,'🔬'],[/atmosph|surface|geolog|interior|orbit|rotation|magnet|formation|moon|ring/i,'🪐'],[/cultur|myth|religion|popular/i,'🎭']];
 function icon(t){for(var i=0;i<ICON.length;i++)if(ICON[i][0].test(t))return ICON[i][1];return '📄'}
 var base=(document.querySelector('link[href*="site.css"]')||{getAttribute:function(){return ''}}).getAttribute('href').split('?')[0].replace('assets/site/site.css','');

 function clean(node,map){
  node.querySelectorAll('sup.reference,.mw-editsection,style,link,.hatnote,.navbox,.metadata,.reflist,.mw-empty-elt,table,.gallery,.noprint,.shortdescription,.ambox,.sidebar,.infobox').forEach(function(n){n.remove()});
  node.querySelectorAll('a').forEach(function(a){var h=a.getAttribute('href')||'';
   if(h.indexOf('./')===0||h.indexOf('/wiki/')===0){var t=decodeURIComponent(h.replace(/^\.\/|^\/wiki\//,'').split('#')[0]).replace(/_/g,' ').toLowerCase();
    var orig=decodeURIComponent(h.replace(/^\.\/|^\/wiki\//,'').split('#')[0]);if(/^(File|Special|Help|Wikipedia|Template|Category|Portal|Talk|Template talk|Module|Draft):/i.test(orig)){wkUnwrap(a);return}
    if(map[t]){a.href=base+map[t];a.className='intl';a.title='Open in this encyclopedia'}else{a.href=base+'wiki/read.html?t='+encodeURIComponent(orig);a.className='rdl';a.title='Read here'}}
   else if(h.charAt(0)==='#'){a.replaceWith(document.createTextNode(a.textContent))}});
  wkImgs(node);node.querySelectorAll('figure,.thumb').forEach(function(f){f.classList.add('dfig')});
  return node;
 }
 function run(box){
  var t=box.getAttribute('data-wiki');if(!t)return box.remove();
  var url='https://en.wikipedia.org/w/api.php?action=parse&format=json&formatversion=2&origin=*&redirects=1&prop=text|sections&disableeditsection=1&disablelimitreport=1&page='+encodeURIComponent(t.replace(/ /g,'_'));
  Promise.all([fetch(url).then(function(r){return r.json()}),fetch(base+'assets/site/wikimap.json').then(function(r){return r.json()}).catch(function(){return {}})]).then(function(a){
   var j=a[0],map=a[1];if(!j||!j.parse)throw 0;
   var doc=new DOMParser().parseFromString(j.parse.text,'text/html');var root=doc.querySelector('.mw-parser-output')||doc.body;
   var secs=[],cur=null;
   [].slice.call(root.children).forEach(function(el){
    var h2=el.tagName==='H2'?el:(el.classList&&el.classList.contains('mw-heading2')?el.querySelector('h2'):null);
    if(h2){cur={title:h2.textContent.trim(),nodes:[]};secs.push(cur);return}
    if(!cur){cur={title:'Introduction',nodes:[]};secs.push(cur)}
    if(el.classList&&(el.classList.contains('mw-heading3')||el.classList.contains('mw-heading4'))){var hh=el.querySelector('h3,h4');if(hh){var x=document.createElement('h3');x.textContent=hh.textContent.trim();cur.nodes.push(x)}return}
    if(/^(P|UL|OL|DL|BLOCKQUOTE|H3|H4)$/.test(el.tagName))cur.nodes.push(el);
   });
   secs=secs.filter(function(s){return !SKIP.test(s.title)&&s.nodes.some(function(n){return n.textContent.trim().length>40})});
   if(!secs.length)throw 0;
   var html='',n=0;
   secs.forEach(function(s,i){if(s.title==='Introduction')return;
    var div=document.createElement('div');s.nodes.forEach(function(nd){div.appendChild(document.importNode(nd,true))});clean(div,map);
    if(div.textContent.trim().length<40)return;
    var id='w-'+s.title.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    html+='<details class="dsec" id="'+id+'"'+(n<3?' open':'')+'><summary>'+icon(s.title)+' '+s.title.replace(/</g,'&lt;')+'</summary><div class="dbody">'+div.innerHTML+'</div></details>';n++;});
   box.innerHTML='<h2 id="in-depth">📚 In depth: '+n+' sections</h2>'+html+'<div class="wsrc">Text from the Wikipedia article <a href="https://en.wikipedia.org/wiki/'+encodeURIComponent(j.parse.title.replace(/ /g,'_'))+'" target="_blank" rel="noopener">'+j.parse.title+'</a>, CC BY-SA 4.0, loaded live and kept up to date. Links with a dashed underline open pages in this encyclopedia.</div>';
   var toc=document.querySelector('.toc ul');if(toc){var li=document.createElement('li');li.innerHTML='<a href="#in-depth">📚 In depth ('+n+')</a>';toc.appendChild(li);var li2=document.createElement('li');li2.innerHTML='<a href="#research">🔬 Research & studies</a>';if(document.getElementById('research'))toc.appendChild(li2)}
  }).catch(function(){box.innerHTML='<h2 id="in-depth">📚 In depth</h2><p class="small muted">The full article could not be loaded right now. <a href="https://en.wikipedia.org/wiki/'+encodeURIComponent(t.replace(/ /g,'_'))+'" target="_blank" rel="noopener">Read it on Wikipedia</a>.</p>'});
 }
 document.addEventListener('DOMContentLoaded',function(){var b=document.querySelector('section.deepwiki');if(b)run(b)});
})();
// ---- Research & studies from OpenAlex ----
(function(){
 function load(box,sort){
  var q=box.getAttribute('data-q'),ul=box.querySelector('.stlist'),lb=box.querySelector('.loadingbar');lb.hidden=false;ul.innerHTML='';
  var url='https://api.openalex.org/works?search='+encodeURIComponent('"'+q+'"')+'&sort='+sort+'&per_page=8&select=title,publication_year,primary_location,best_oa_location,open_access,cited_by_count,doi,authorships,id';
  fetch(url).then(function(r){return r.json()}).then(function(j){lb.hidden=true;var rs=(j&&j.results)||[];
   if(!rs.length){ul.innerHTML='<li class="sm">No indexed studies found under this name yet. That itself shows how little-studied many species and objects are.</li>';return}
   ul.innerHTML=rs.map(function(w){var src=(w.primary_location&&w.primary_location.source&&w.primary_location.source.display_name)||'';
    var au=(w.authorships||[]).slice(0,3).map(function(a){return a.author&&a.author.display_name}).filter(Boolean).join(', ')+((w.authorships||[]).length>3?' et al.':'');
    var link=w.doi||w.id;var pdf=(w.best_oa_location&&(w.best_oa_location.pdf_url||w.best_oa_location.landing_page_url))||(w.open_access&&w.open_access.oa_url);
    return '<li><a href="'+link+'" target="_blank" rel="noopener"><b>'+(w.title||'Untitled').replace(/<[^>]+>/g,'')+'</b></a>'+(pdf?'<a class="oa" href="'+pdf+'" target="_blank" rel="noopener">PDF</a>':'')+'<div class="sm">'+au+(au?' · ':'')+(w.publication_year||'')+(src?' · '+src:'')+' · cited '+(w.cited_by_count||0)+'×</div></li>'}).join('')+'<li class="sm">Total indexed works: '+(j.meta&&j.meta.count||0).toLocaleString()+' · <a href="https://openalex.org/works?search='+encodeURIComponent(q)+'" target="_blank" rel="noopener">see all on OpenAlex</a> · <a href="https://scholar.google.com/scholar?q='+encodeURIComponent('"'+q+'"')+'" target="_blank" rel="noopener">Google Scholar</a></li>';
  }).catch(function(){lb.hidden=true;ul.innerHTML='<li class="sm">Could not reach OpenAlex right now. <a href="https://scholar.google.com/scholar?q='+encodeURIComponent('"'+q+'"')+'" target="_blank" rel="noopener">Search Google Scholar</a>.</li>'});
 }
 document.addEventListener('DOMContentLoaded',function(){var b=document.querySelector('section.studies');if(!b)return;load(b,'cited_by_count:desc');
  b.querySelectorAll('.sttabs button').forEach(function(btn){btn.onclick=function(){b.querySelectorAll('.sttabs button').forEach(function(x){x.classList.remove('on')});btn.classList.add('on');load(b,btn.dataset.sort)}})});
})();
// ===== v6 animations: scroll reveal, count-up stats, card tilt, extra hero scenes =====
(function(){
 var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 document.addEventListener('DOMContentLoaded',function(){
  if(reduce||!('IntersectionObserver' in window))return;
  // reveal
  var els=document.querySelectorAll('.card,.megatile,.stat,.rel,.dsec,.glance,.soundbox,figure.chart,.timeline .ev,.prose h2,.prose table,.callout,.studies,.paperbox,.viz,.trk');
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('rv-in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -40px 0px'});
  els.forEach(function(el,i){el.classList.add('rv');el.style.transitionDelay=Math.min((i%6)*60,300)+'ms';io.observe(el)});
  setTimeout(function(){els.forEach(function(el){var r=el.getBoundingClientRect();if(r.top<innerHeight*1.5)el.classList.add('rv-in')})},1200);setTimeout(function(){els.forEach(function(el){el.classList.add('rv-in')})},4000);
  // count-up for hero stats
  document.querySelectorAll('.stat b, .stats b').forEach(function(b){var t=b.textContent,m=t.match(/^([^0-9]*)([0-9][0-9,\.]*)(.*)$/);if(!m)return;var n=parseFloat(m[2].replace(/,/g,''));if(!isFinite(n)||n===0)return;var dec=(m[2].split('.')[1]||'').length,comma=m[2].indexOf(',')>-1;
   var io2=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return;io2.disconnect();var t0=performance.now();(function step(now){var p=Math.min(1,(now-t0)/1400),v=n*(1-Math.pow(1-p,3));var s=dec?v.toFixed(dec):Math.round(v).toString();if(comma)s=Number(s).toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});b.textContent=m[1]+s+m[3];if(p<1)requestAnimationFrame(step);else b.textContent=t})(t0)});io2.observe(b)});
  // tilt
  if(matchMedia('(hover:hover)').matches)document.querySelectorAll('.card,.megatile').forEach(function(c){c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform='perspective(800px) rotateX('+(-y*4)+'deg) rotateY('+(x*5)+'deg) translateY(-2px)'});c.addEventListener('mouseleave',function(){c.style.transform=''})});
 });
 // extra hero scenes: terrain (land) and embers (history)
 document.addEventListener('DOMContentLoaded',function(){var h=document.querySelector('.hero'),k=document.body.getAttribute('data-anim');if(!h||reduce||(k!=='terrain'&&k!=='embers'))return;
  var c=document.createElement('canvas');c.className='heroanim';h.insertBefore(c,h.firstChild);var x=c.getContext('2d'),W,H,D=devicePixelRatio||1;function sz(){W=c.width=h.offsetWidth*D;H=c.height=h.offsetHeight*D}sz();addEventListener('resize',sz);
  var P=[];for(var i=0;i<(k==='embers'?90:5);i++)P.push({x:Math.random(),y:Math.random(),s:Math.random(),p:Math.random()*6.3});
  function tick(t){x.clearRect(0,0,W,H);
   if(k==='terrain'){for(var l=0;l<5;l++){x.beginPath();x.moveTo(0,H);for(var X=0;X<=W;X+=8*D){var y=H*(0.55+l*0.09)-Math.sin(X/(180*D)+l*1.7+t/(9000-l*900))*H*0.05-Math.sin(X/(63*D)+l)*H*0.018-Math.sin(X/(27*D)+l*3)*H*0.006;x.lineTo(X,y)}x.lineTo(W,H);x.closePath();x.fillStyle='rgba('+[[70,140,90],[90,150,80],[150,140,80],[120,100,70],[80,70,60]][l].join(',')+','+(0.10+l*0.05)+')';x.fill()}
     for(var j=0;j<P.length;j++){var q=P[j];q.x+=0.00008*(q.s+.3);if(q.x>1.2)q.x=-.2;x.fillStyle='rgba(255,255,255,.18)';x.beginPath();x.ellipse(q.x*W,H*(0.12+q.y*0.25),90*D*(q.s+.5),18*D,0,0,6.3);x.fill()}}
   else{for(var j=0;j<P.length;j++){var q=P[j];q.y-=0.0009*(q.s+.3);q.p+=0.02;if(q.y<-.05){q.y=1.05;q.x=Math.random()}var a=.25+.5*Math.abs(Math.sin(q.p));x.fillStyle='rgba(255,'+(140+Math.round(80*q.s))+',60,'+a+')';x.beginPath();x.arc((q.x+Math.sin(q.p)*.01)*W,q.y*H,(1+q.s*2.4)*D,0,6.3);x.fill()}}
   requestAnimationFrame(tick)}requestAnimationFrame(tick)});
})();

// ===== In-site reader: every Wikipedia link opens inside this site =====
(function(){
 var base=(document.querySelector('link[href*="site.css"]')||{getAttribute:function(){return ''}}).getAttribute('href').split('?')[0].replace('assets/site/site.css','');
 var MAP=null;function getMap(){if(!MAP)MAP=fetch(base+'assets/site/wikimap.json').then(function(r){return r.json()}).catch(function(){return {}});return MAP}
 function titleOf(href){var m=href.match(/^(?:https?:)?\/\/en\.(?:m\.)?wikipedia\.org\/wiki\/([^?#]+)(#.*)?/);if(!m)return null;try{return {t:decodeURIComponent(m[1]).replace(/_/g,' '),h:m[2]||''}}catch(e){return {t:m[1].replace(/_/g,' '),h:''}}}
 function readURL(t,h){return base+'wiki/read.html?t='+encodeURIComponent(t.replace(/ /g,'_'))+(h||'')}
 // 1. rewrite every Wikipedia link on normal pages
 document.addEventListener('DOMContentLoaded',function(){
  var links=[].slice.call(document.querySelectorAll('a[href*="wikipedia.org/wiki/"]')).filter(function(a){return !a.hasAttribute('data-keep')});
  if(!links.length)return;
  getMap().then(function(map){links.forEach(function(a){var o=titleOf(a.getAttribute('href'));if(!o)return;var k=o.t.toLowerCase();
   if(map[k]&&!document.getElementById('reader')){a.href=base+map[k];a.className=(a.className+' intl').trim();a.title='Open in this encyclopedia'}
   else{a.href=readURL(o.t,o.h);a.title='Read here, without leaving the site'}
   a.removeAttribute('target');a.removeAttribute('rel')})});
 });
 // 2. the reader page itself
 function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 function render(box,map,t){
  box.innerHTML='<div class="loadingbar"></div><p class="muted">Loading “'+esc(t)+'”…</p>';
  var api='https://en.wikipedia.org/w/api.php?action=parse&format=json&formatversion=2&origin=*&redirects=1&prop=text|displaytitle|sections&disableeditsection=1&disablelimitreport=1&page='+encodeURIComponent(t.replace(/ /g,'_'));
  fetch(api).then(function(r){return r.json()}).then(function(j){
   if(!j||!j.parse){
    return fetch('https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srlimit=10&srsearch='+encodeURIComponent(t)).then(function(r){return r.json()}).then(function(s){
     var hits=(s.query&&s.query.search)||[];box.innerHTML='<h1>'+esc(t)+'</h1>'+(hits.length?'<p>No article with exactly this title. Did you mean:</p>':'<p class="muted">No article found for this title. Try the search at the top of the page.</p>')+'<ul class="rdhits">'+hits.map(function(h){return '<li><a href="'+readURL(h.title)+'"><b>'+esc(h.title)+'</b></a><div class="sm">'+h.snippet+'…</div></li>'}).join('')+'</ul>'})}
   var title=j.parse.title,doc=new DOMParser().parseFromString(j.parse.text,'text/html'),root=doc.querySelector('.mw-parser-output')||doc.body;
   root.querySelectorAll('sup.reference,.mw-editsection,style,link,.navbox,.navbox-styles,.metadata,.mw-empty-elt,.noprint,.shortdescription,.ambox,.sidebar,.reflist,.references,.mw-references-wrap,.hatnote,.portalbox,.authority-control,.sistersitebox,.side-box').forEach(function(n){n.remove()});
   // drop tail sections
   var kill=false;[].slice.call(root.children).forEach(function(el){var h=el.querySelector&&el.querySelector('h2');var ht=(el.tagName==='H2'?el:h);if(ht&&/^(see also|references|notes|external links|further reading|bibliography|sources|citations|footnotes|works cited)$/i.test(ht.textContent.trim()))kill=true;else if(ht&&el.classList.contains('mw-heading2'))kill=false;if(kill)el.remove()});
   wkImgs(root);
   root.querySelectorAll('table').forEach(function(tb){var w=document.createElement('div');w.className=tb.classList.contains('infobox')?'rdinfo':'rdtable';tb.parentNode.insertBefore(w,tb);w.appendChild(tb)});
   root.querySelectorAll('a').forEach(function(a){var h=a.getAttribute('href')||'';
    if(/^\.\/|^\/wiki\//.test(h)){var raw=h.replace(/^\.\/|^\/wiki\//,''),parts=raw.split('#'),tt;try{tt=decodeURIComponent(parts[0]).replace(/_/g,' ')}catch(e){tt=parts[0]}
     if(/^(File|Image|Media|Special|Help|Wikipedia|Template|Category|Portal|Talk|Template talk|Module|Draft):/i.test(tt)){wkUnwrap(a);return}
     var k=tt.toLowerCase();if(map[k]){a.href=base+map[k];a.className='intl';a.title='Open in this encyclopedia'}else{a.href=readURL(tt,parts[1]?'#'+parts[1]:'')}}
    else if(h.charAt(0)!=='#'){a.target='_blank';a.rel='noopener'}});
   // TOC
   var heads=[].slice.call(root.querySelectorAll('h2,h3'));heads.forEach(function(h,i){if(!h.id)h.id='s'+i});
   var toc=heads.filter(function(h){return h.tagName==='H2'}).map(function(h){return '<li><a href="#'+h.id+'">'+esc(h.textContent.trim())+'</a></li>'}).join('');
   var here=map[title.toLowerCase()]||map[t.toLowerCase()];
   document.title=title+' · '+(document.title.split('·').pop()||'').trim();
   box.innerHTML='<div class="rdhead"><h1>'+j.parse.displaytitle+'</h1>'+(here?'<a class="btn" href="'+base+here+'">📘 Open our article on '+esc(title)+'</a>':'')+'</div>'+
    (toc?'<details class="rdtoc" open><summary>Contents</summary><ol>'+toc+'</ol></details>':'')+
    '<article class="prose rdbody">'+root.innerHTML+'</article>'+
    '<div class="wsrc">Article “'+esc(title)+'” from <a data-keep href="https://en.wikipedia.org/wiki/'+encodeURIComponent(title.replace(/ /g,'_'))+'" target="_blank" rel="noopener">Wikipedia</a> by its contributors, licensed CC BY-SA 4.0, loaded live. Dashed links open our own pages; other links stay inside this reader.</div>';
   if(location.hash){var el=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(el)el.scrollIntoView()}else scrollTo(0,0);
  }).catch(function(e){if(window.console)console.error('reader',e);box.innerHTML='<h1>'+esc(t)+'</h1><p class="muted">Could not load this article right now. <a data-keep href="https://en.wikipedia.org/wiki/'+encodeURIComponent(t.replace(/ /g,'_'))+'" target="_blank" rel="noopener">Open the original</a>.</p>'});
 }
 document.addEventListener('DOMContentLoaded',function(){var box=document.getElementById('reader');if(!box)return;var ph=[].slice.call(document.querySelectorAll('h1')).filter(function(h){return !box.contains(h)})[0];if(ph)ph.style.display='none';
  var f=document.getElementById('rdform');if(f)f.onsubmit=function(e){e.preventDefault();var v=f.querySelector('input').value.trim();if(v)location.href=readURL(v)};
  var t=new URLSearchParams(location.search).get('t');if(!t){box.innerHTML='<p class="muted">Open any link in an article to read it here, or use the search at the top of the page.</p>';return}
  t=t.replace(/_/g,' ');if(f)f.querySelector('input').value=t;getMap().then(function(map){render(box,map,t)})});
})();
// mark portrait-shaped photos so CSS keeps heads in frame
(function(){function mark(i){if(i.naturalHeight&&i.naturalHeight>i.naturalWidth*1.05)i.classList.add('tall')}
 function scan(r){(r||document).querySelectorAll('.card img,.entry-pic img,.livepic img').forEach(function(i){if(i.complete)mark(i);else i.addEventListener('load',function(){mark(i)},{once:true})})}
 document.addEventListener('DOMContentLoaded',function(){scan();if('MutationObserver' in window)new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType!==1)return;if(n.tagName==='IMG'&&n.closest&&n.closest('.card,.entry-pic,.livepic')){if(n.complete)mark(n);else n.addEventListener('load',function(){mark(n)},{once:true})}else if(n.querySelectorAll)scan(n)})})}).observe(document.body,{childList:true,subtree:true})});
})();
