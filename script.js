document.addEventListener("DOMContentLoaded", () => {
  // 画面
  const scrEntry   = document.getElementById("screen-entry");
  const scrLoading = document.getElementById("screen-loading");
  const scrName    = document.getElementById("screen-name");
  const scrStory   = document.getElementById("screen-story");
  const scrWarn    = document.getElementById("screen-warning");
  const scrRecLoad = document.getElementById("screen-records-loading");
  const scrRecords = document.getElementById("screen-records");

  // 受付
  const nickInput  = document.getElementById("nick-input");
  const btnStart   = document.getElementById("btn-start");
  const whoNameEl  = document.getElementById("who-name");

  // ロード％
  const perEl  = document.getElementById("load-per");
  const recPer = document.getElementById("rec-per");

  // 発祥
  const winMain  = document.querySelector("#screen-story .win-main");
  const winChant = document.getElementById("win-chant");
  const chantWrap= document.getElementById("chant-scroll");
  const chantText= document.getElementById("chant-text");
  const storyText= document.getElementById("story-text");
  const btnWarning= document.getElementById("btn-to-warning");

  // 注意/戻る
  const btnAgree = document.getElementById("btn-agree");
  const btnBack  = document.getElementById("btn-back-story");

  // カルテ
  const recordsList = document.getElementById("records-list");

  // モーダル
  const modal      = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody  = document.getElementById("modal-body");
  const modalClose = document.getElementById("modal-close");

  // FX
  const FX = {
    roll: document.querySelector('#fx .fx-rollbar')
  };

  function showScreen(screen){
    document.querySelectorAll(".screen").forEach(s=>{
      s.classList.remove("active");
      s.classList.add("hidden");
      s.classList.remove("rgb-split","screen-tear","vsync-drift","jolt");
    });
    screen.classList.remove("hidden");
    screen.classList.add("active");
  }

  /* ==== エフェクト ==== */
  function rollBarOnce(){
    if(!FX.roll) return;
    FX.roll.classList.remove('run'); void FX.roll.offsetWidth;
    FX.roll.classList.add('run');
  }
  function rgbSplitPulse(){
    const a=document.querySelector('.screen.active'); if(!a) return;
    a.classList.add('rgb-split'); setTimeout(()=>a.classList.remove('rgb-split'),300);
  }
  function screenTearOnce(){
    const a=document.querySelector('.screen.active'); if(!a) return;
    a.classList.add('screen-tear'); setTimeout(()=>a.classList.remove('screen-tear'),300);
  }
  (function randomFxLoop(){
    const c=Math.random();
    if (c < 0.45) rollBarOnce();
    else if (c < 0.70) rgbSplitPulse();
    else if (c < 0.85) screenTearOnce();
    // たまに小刻み
    const a=document.querySelector('.screen.active');
    if (a && Math.random()<.25){
      a.classList.add('vsync-drift');
      setTimeout(()=>a.classList.remove('vsync-drift'), 4000+Math.random()*3000);
    }
    setTimeout(randomFxLoop, 1600 + Math.random()*3200);
  })();
  (function jitterLoop(){
    const next = 1500 + Math.random()*3000;
    setTimeout(()=>{
      const active=document.querySelector(".screen.active");
      if (active){ active.classList.add("jolt"); setTimeout(()=>active.classList.remove("jolt"), 220); }
      if (Math.random()<0.25) rollBarOnce();
      if (Math.random()<0.20) rgbSplitPulse();
      jitterLoop();
    }, next);
  })();

  /* ==== フロー ==== */
  let visitorName = "来訪者";
  btnStart.addEventListener("click", ()=>{
    const val=(nickInput.value||"").trim();
    if(!val){ nickInput.classList.add("entry-error"); setTimeout(()=>nickInput.classList.remove("entry-error"),200); return; }
    visitorName = val.slice(0,20);
    whoNameEl.textContent = visitorName;

    showScreen(scrLoading);
    startInitialLoading(()=>{
      showScreen(scrName);
      // 名前表示少し待ってから発祥へ
      setTimeout(()=>{
        showScreen(scrStory);
        // ボックスのフェードイン
        requestAnimationFrame(()=>{
          winMain.classList.add('ready');
          setTimeout(()=>{ winChant.classList.remove('hidden'); winChant.classList.add('ready'); }, 250);
          // 発祥本文を遅れてフェードイン
          setTimeout(()=> storyText.classList.add('show'), 240);
          // “たすけて” タイプライター開始
          setTimeout(startChant, 800);
        });
      }, 1600);
    });
  });

  function startInitialLoading(done){
    let p=0;
    (function step(){
      p += (p<40?1:(p<80?2:5));
      if (p>100) p=100;
      perEl.textContent = p+"%";
      if (p<100){
        setTimeout(step, Math.max(18, 120*Math.pow(0.85,p/10)));
      }else{
        done && done();
      }
    })();
  }

  // “たすけて”タイプライター
  const wait = ms => new Promise(r=>setTimeout(r,ms));
  function typeText(el, text, speed=20){
    return new Promise(resolve=>{
      let i=0;
      (function step(){
        if(i>=text.length){ resolve(); return; }
        el.textContent += text.charAt(i++);
        const delay = Math.max(8, speed + (Math.random()*10-5));
        const box = el.closest('.scrollbox'); if (box) box.scrollTop = box.scrollHeight;
        setTimeout(step, delay);
      })();
    });
  }
  function startChant(){
    const el=chantText; el.classList.add("show");
    let running=true;
    btnWarning.addEventListener("click", ()=>running=false, {once:true});
    (async function loop(){
      while(running){
        const burst = 1 + Math.floor(Math.random()*3);
        for(let i=0;i<burst;i++){ await typeText(el,"たすけて",12); }
        chantWrap.scrollTop = chantWrap.scrollHeight;
        await wait(260 + Math.random()*420);
      }
    })();
  }

  // 注意 → カルテロード
  btnWarning.addEventListener("click", ()=>{ showScreen(scrWarn); });
  btnAgree.addEventListener("click", ()=>{ startRecordLoading(); });

  function startRecordLoading(){
    showScreen(scrRecLoad);
    let p=0;
    const t = setInterval(()=>{
      p += (p<60?4:8); if(p>100) p=100;
      recPer.textContent = p+"%";
      if(p>=100){
        clearInterval(t);
        setTimeout(()=>{ showScreen(scrRecords); buildRecords(); setTimeout(triggerAutoUpdate, 1000+Math.random()*1200); setTimeout(slowCorruptRecords, 1500); }, 200);
      }
    }, 90);
  }

  btnBack.addEventListener("click", ()=>{ showScreen(scrStory); });

  /* ==== カルテ ==== */
  const recordsData = [
    { no:"102", name:"<span class='mosaic'>██</span>",    diag:"B-33型《バーバラさん》接触症", sym:"頭痛、悪夢、窓の外の気配", prog:"赤い日記帳が届いた夜から症状出現。夜間、窓から赤い日記が持ち去られるのを確認。", mosaic:true },
    { no:"145", name:"██",                                diag:"窓辺幻視症",              sym:"吐き気、視線恐怖",       prog:"窓辺で赤い日記を確認。以後、睡眠障害が悪化。", mosaic:false },
    { no:"233", name:"<span class='mosaic'>██</span>",    diag:"接近過敏",                sym:"首筋の寒気、肩圧迫感",   prog:"夜半、背部に重量感。窓を開けると軽減。", mosaic:true },
    { no:"666", name:"<span class='mosaic'>███</span>",   diag:"呼称追跡性障害",          sym:"耳鳴り、名を呼ばれる幻聴", prog:"呼ばれた翌日、窓に赤い日記が置かれていた。", mosaic:true },
    { no:"718", name:"█",                                diag:"夜間接触症候群",          sym:"過度の不安、失神",       prog:"窓を開けた際、背中に何かを感じ赤い日記が消失。体調急変。", mosaic:false },
    { no:"842", name:"<span class='mosaic'>████</span>",  diag:"視覚残像症",              sym:"視覚異常、残像",         prog:"赤い日記帳の残像を複数回確認。頭痛増悪。", mosaic:true },
    { no:"901", name:"██",                               diag:"急性幻視性不安",          sym:"視覚異常、記憶欠落",     prog:"証言と記録の齟齬が多発。最後に赤い日記帳を所持。", mosaic:false }
  ];

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
        const data = recordsData.find(r=>r.no===rec.no);
        openDetailModal(data);
      });
      recordsList.appendChild(card);
    });
  }

  /* 詳細モーダル + 段階的文字化け（弱め） */
  let corruptTimer = null;
  let corruptSession = [];
  function collectTextNodes(root){
    const out = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if(!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        let p = node.parentElement;
        while(p){
          if(p.classList && (p.classList.contains('mosaic') || p.dataset.noCorrupt!==undefined)) return NodeFilter.FILTER_REJECT;
          p = p.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n; while((n=walker.nextNode())) out.push(n);
    return out;
  }
  const GLITCH_SET = "◆※#＠▓░╳■□△◎◢◣";
  const HOMO = { "ー":"—","-":"－","・":"･","。":"｡","、":"､","口":"□","日":"■","〇":"○","○":"◯","人":"入","田":"亩","カ":"力","へ":"∧","ン":"ソ","テ":"ﾃ","タ":"ﾀ" };
  function corruptString(src, rate){
    let out=""; for(let i=0;i<src.length;i++){
      const ch=src[i]; if(/\s/.test(ch)){out+=ch;continue;}
      if(Math.random()<rate){ out += (Math.random()<0.45 && HOMO[ch])? HOMO[ch] : GLITCH_SET[Math.floor(Math.random()*GLITCH_SET.length)]; }
      else out += ch;
    } return out;
  }
  function applyCorruption(session, rate){ session.forEach(it=> it.node.nodeValue = corruptString(it.original, rate)); }
  function restoreCorruption(session){ session.forEach(it=> it.node.nodeValue = it.original); }
  function startModalCorruption(root,{startRate=.04,step=.03,maxRate=.28,periodMs=1200}={}){
    stopModalCorruption();
    corruptSession = collectTextNodes(root).map(n=>({node:n,original:n.nodeValue}));
    applyCorruption(corruptSession,startRate);
    corruptTimer = setInterval(()=>{
      const c = Math.min(maxRate, startRate += step);
      applyCorruption(corruptSession,c);
      root.closest('.modal-inner')?.classList.add('corrupt-flash');
      setTimeout(()=> root.closest('.modal-inner')?.classList.remove('corrupt-flash'), 160);
    }, periodMs);
  }
  function stopModalCorruption(){
    if(corruptTimer){ clearInterval(corruptTimer); corruptTimer=null; }
    if(corruptSession.length){ restoreCorruption(corruptSession); corruptSession=[]; }
  }

  function openDetailModal(data){
    modalTitle.textContent = `患者記録 No.${data.no}`;
    modalBody.innerHTML = `
      <p><strong>患者名：</strong>${data.name}</p>
      <p><strong>診断名：</strong>${data.diag}</p>
      <p><strong>症状：</strong>${data.sym}</p>
      <p><strong>経過：</strong>${data.prog}</p>
      ${data.mosaic ? `<p class="garbled" style="color:#8b0000">※ 記録の一部が読み取り不能です。</p>` : ``}
    `;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
    startModalCorruption(modalBody);
  }
  modalClose.addEventListener("click", ()=>{
    stopModalCorruption();
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
  });

  /* 自動更新（一覧の1件を勝手に更新） */
  let autoUpdatedOnce=false;
  function triggerAutoUpdate(){
    if(autoUpdatedOnce) return; autoUpdatedOnce=true;
    const cards = Array.from(document.querySelectorAll("#records-list .card"));
    if(cards.length<=1) return;
    const target = cards[1 + Math.floor(Math.random()*(cards.length-1))];
    const tdList = target.querySelectorAll("td"); if(!tdList.length) return;
    const field = tdList[tdList.length-1];
    field.innerHTML = `状態悪化を確認。<span class="mosaic">赤い日記帳</span>の所在不明。<span class="badge-update">更新</span>`;
    target.classList.add("updated");
  }

  /* 放置腐食（経過欄がじわじわ読みにくく） */
  function slowCorruptRecords(){
    const fields = document.querySelectorAll('#records-list .karte tr:last-child td');
    fields.forEach((td,i)=>{
      const nodes = collectTextNodes(td).map(n=>({node:n,original:n.nodeValue}));
      let t=0; setInterval(()=>{
        t++; const r = Math.min(0.2, 0.02 + 0.02*t);
        nodes.forEach(it=> it.node.nodeValue = corruptString(it.original, r));
      }, 4000 + i*1200);
    });
  }

});


