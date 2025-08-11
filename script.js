document.addEventListener("DOMContentLoaded", () => {
  /* 画面参照 */
  const scrPref   = document.getElementById("screen-preface");
  const scrEntry  = document.getElementById("screen-entry");
  const scrLoad   = document.getElementById("screen-loading");
  const scrName   = document.getElementById("screen-name");
  const scrStory  = document.getElementById("screen-story");
  const scrWarn   = document.getElementById("screen-warning");
  const scrRLoad  = document.getElementById("screen-records-loading");
  const scrRecs   = document.getElementById("screen-records");

  /* 中身 */
  const btnStart  = document.getElementById("btn-start");
  const nickInput = document.getElementById("nick-input");
  const whoNameEl = document.getElementById("who-name");
  const loadPer   = document.getElementById("load-per");
  const recPer    = document.getElementById("rec-per");

  const storyWindow = document.getElementById("story-window");
  const storyFade   = document.getElementById("story-fade");
  const winChant    = document.getElementById("win-chant");
  const chantWrap   = document.getElementById("chant-scroll");
  const chantText   = document.getElementById("chant-text");
  const btnToWarn   = document.getElementById("btn-to-warning");
  const btnAgree    = document.getElementById("btn-agree");
  const btnBack     = document.getElementById("btn-back-story");
  const recordsList = document.getElementById("records-list");

  /* FX */
  const FX = {
    roll: document.querySelector('#fx .fx-rollbar'),
    noise: document.getElementById('noise'),
  };
  function rollBarOnce(){ if(!FX.roll) return; FX.roll.classList.remove('run'); void FX.roll.offsetWidth; FX.roll.classList.add('run'); }
  function globalBreak(){
    const act = document.querySelector('.screen.active'); if(!act) return;
    act.classList.add('global-break'); rollBarOnce();
    setTimeout(()=> act.classList.remove('global-break'), 360);
  }
  (function randomFxLoop(){
    const c=Math.random();
    if (c < 0.45) rollBarOnce();
    setTimeout(randomFxLoop, 1600 + Math.random()*3200);
  })();

  function showScreen(target){
    document.querySelectorAll(".screen").forEach(s=>{
      s.classList.remove("active"); s.style.display="none";
    });
    target.style.display="flex";
    target.classList.add("active");
  }

  /* 0) 前置き → 受付に遷移 */
  // 1.5sほど見せてから受付を“ボワッ”
  setTimeout(()=>{
    showScreen(scrEntry);
    const pop = scrEntry.querySelector('[data-pop]');
    pop && pop.classList.add('pop-show');
  }, 1500);

  /* 1) 受付 → ロード → 見出し → ストーリー */
  let visitorName = "来訪者";
  btnStart.addEventListener("click", ()=>{
    const val = (nickInput.value||"").trim();
    if (!val){
      nickInput.classList.add("entry-error");
      setTimeout(()=>nickInput.classList.remove("entry-error"), 220);
      return;
    }
    visitorName = val.slice(0,20);
    whoNameEl.textContent = visitorName;

    showScreen(scrLoad);
    startLoading(()=>{
      showScreen(scrName);
      setTimeout(()=>{
        showScreen(scrStory);
        // ストーリー本文を遅れてフェードイン
        setTimeout(()=> storyFade.classList.add('preface-show'), 300);
        // “受信ログ”出現 & タイプ開始
        setTimeout(()=>{
          winChant.classList.remove("hidden");
          startChant();
        }, 1200);
      }, 1200);
    });
  });

  function startLoading(done){
    let p=0;
    (function step(){
      p += (p<40?1:(p<80?2:5));
      if (p>100) p=100;
      loadPer.textContent = p+"%";
      if (p<100){ setTimeout(step, Math.max(18, 120*Math.pow(0.85,p/10))); }
      else { setTimeout(done, 420); }
    })();
  }

  /* ストーリー：“たすけて”タイプ */
  function typeText(el, text, speed=18){
    return new Promise(resolve=>{
      let i=0; (function step(){
        if(i>=text.length){ resolve(); return; }
        el.textContent += text.charAt(i++);
        const box = el.closest('.scrollbox'); if (box) box.scrollTop = box.scrollHeight;
        setTimeout(step, Math.max(8, speed + (Math.random()*8-4)));
      })();
    });
  }
  function startChant(){
    chantText.classList.add("show");
    let running = true;
    btnToWarn.addEventListener("click", ()=> running=false, {once:true});
    (async function loop(){
      while(running){
        const burst = 1 + Math.floor(Math.random()*3);
        for(let i=0;i<burst;i++){ await typeText(chantText, "たすけて", 12); }
        chantWrap.scrollTop = chantWrap.scrollHeight;
        await new Promise(r=>setTimeout(r, 260 + Math.random()*420));
      }
    })();
  }

  /* ストーリー → 注意 → カルテロード → 一覧 */
  btnToWarn.addEventListener("click", ()=>{ globalBreak(); showScreen(scrWarn); });
  btnAgree.addEventListener("click", ()=>{ globalBreak(); startRecordLoading(); });
  btnBack .addEventListener("click", ()=>{ globalBreak(); showScreen(scrStory); });

  function startRecordLoading(){
    showScreen(scrRLoad);
    let p=0; const t = setInterval(()=>{
      p += (p<60?4:8); if (p>100) p=100;
      recPer.textContent = p+"%";
      if (p>=100){ clearInterval(t); setTimeout(()=>{ showScreen(scrRecs); buildRecords(); }, 280); }
    }, 90);
  }

  /* カルテ */
  const recordsData = [
    { no:"143", name:"<span class='mosaic'>████</span>", diag:"B-33型《バーバラさん》接触症", sym:"頭痛、悪夢、窓の外の気配", prog:"赤い日記帳が届いた夜から症状出現。夜間、窓から赤い日記が持ち去られるのを確認。", mosaic:true },
    { no:"208", name:"██", diag:"窓辺幻視症", sym:"吐き気、視線恐怖", prog:"窓辺で赤い日記を確認。以後、睡眠障害が悪化。", mosaic:false },
    { no:"555", name:"<span class='mosaic'>██</span>", diag:"接近過敏", sym:"首筋の寒気、肩圧迫感", prog:"夜半、背部に重量感。窓を開けると軽減。", mosaic:true },
    { no:"666", name:"<span class='mosaic'>███</span>", diag:"呼称追跡性障害", sym:"耳鳴り、名を呼ばれる幻聴", prog:"呼ばれた翌日、窓に赤い日記が置かれていた。", mosaic:true },
    { no:"719", name:"█", diag:"夜間接触症候群", sym:"過度の不安、失神", prog:"窓を開けた際、背中に何かを感じ赤い日記が消失。体調急変。", mosaic:false },
    { no:"882", name:"<span class='mosaic'>████</span>", diag:"視覚残像症", sym:"視覚異常、残像", prog:"赤い日記帳の残像を複数回確認。頭痛増悪。", mosaic:true },
    { no:"903", name:"██", diag:"急性幻視性不安", sym:"視覚異常、記憶欠落", prog:"証言と記録の齟齬が多発。最後に赤い日記帳を所持。", mosaic:false }
  ];

  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody  = document.getElementById("modal-body");
  const modalClose = document.getElementById("modal-close");

  function buildRecords(){
    recordsList.innerHTML = "";
    recordsData.forEach(rec=>{
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <table class="karte">
          <tr><th>患者番号</th><td>No.${rec.no}</td></tr>
          <tr><th>患者名</th><td>${rec.name}</td></tr>
          <tr><th>診断名</th><td>${rec.diag}</td></tr>
          <tr><th>症状</th><td>${rec.sym}</td></tr>
          <tr><th>経過</th><td>${rec.prog}</td></tr>
        </table>
        <button class="btn open-detail" data-id="${rec.no}">詳細を見る</button>
      `;
      card.querySelector(".open-detail").addEventListener("click", ()=>{
        openDetailModal(rec);
      });
      recordsList.appendChild(card);
    });
  }

  /* 詳細モーダル（軽めの文字化け） */
  let corruptTimer=null, session=[];
  function collectTextNodes(root){
    const out=[]; const w=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode:(n)=> (n.nodeValue && n.nodeValue.trim())? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });
    let n; while((n=w.nextNode())) out.push(n); return out;
  }
  const GLITCH_SET = "◆※#＠■□△◎◢◣";
  const HOMO = { "ー":"—","-":"－","・":"･","。":"｡","、":"､","口":"□","日":"■","〇":"○","○":"◯","人":"入","カ":"力","へ":"∧","ン":"ソ" };
  function corruptString(src, rate){
    let out=""; for(let i=0;i<src.length;i++){
      const ch=src[i]; if(/\s/.test(ch)){out+=ch;continue;}
      out += (Math.random()<rate) ? ((Math.random()<0.45&&HOMO[ch])?HOMO[ch]:GLITCH_SET[Math.floor(Math.random()*GLITCH_SET.length)]) : ch;
    } return out;
  }
  function startModalCorruption(root,{start=.04,step=.03,max=.28,period=1100}={}){
    stopModalCorruption();
    session = collectTextNodes(root).map(n=>({node:n,orig:n.nodeValue}));
    apply(start);
    corruptTimer = setInterval(()=>{ start=Math.min(max,start+step); apply(start); }, period);
    function apply(r){ session.forEach(it=> it.node.nodeValue = corruptString(it.orig, r)); }
  }
  function stopModalCorruption(){
    if(corruptTimer){ clearInterval(corruptTimer); corruptTimer=null; }
    if(session.length){ session.forEach(it=> it.node.nodeValue = it.orig); session=[]; }
  }

  function openDetailModal(data){
    modalTitle.textContent = `患者記録 No.${data.no}`;
    modalBody.innerHTML = `
      <p><strong>患者名：</strong>${data.name}</p>
      <p><strong>診断名：</strong>${data.diag}</p>
      <p><strong>症状：</strong>${data.sym}</p>
      <p><strong>経過：</strong>${data.prog}</p>
      ${data.mosaic ? `<p class="garbled">※ 記録の一部が読み取り不能です。</p>` : ``}
    `;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
    globalBreak();
    startModalCorruption(modalBody);
  }
  modalClose.addEventListener("click", ()=>{
    stopModalCorruption();
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
  });
});
