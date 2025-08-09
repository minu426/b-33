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
  let visitorName  = "来訪者";

  // ロード％
  const perEl  = document.getElementById("load-per");
  const recPer = document.getElementById("rec-per");

  // ストーリー＆“たすけて”
  const winMain   = document.querySelector(".win-main");
  const winChant  = document.getElementById("win-chant");
  const chantWrap = document.getElementById("chant-scroll");
  const chantText = document.getElementById("chant-text");
  const btnWarning= document.getElementById("btn-to-warning");
  const btnAgree  = document.getElementById("btn-agree");
  const btnBack   = document.getElementById("btn-back-story");

  // カルテ
  const recordsList = document.getElementById("records-list");

  // モーダル
  const modal      = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody  = document.getElementById("modal-body");
  const modalClose = document.getElementById("modal-close");

  // FX (ノイズ・ロールバー)
  const FX = {
    roll: document.querySelector('#fx .fx-rollbar'),
    noise: document.getElementById('noise')
  };
  const flashNoise = (ms=260)=>{FX.noise.classList.add('strong');setTimeout(()=>FX.noise.classList.remove('strong'),ms)};
  const rollBarOnce= ()=>{
    if(!FX.roll)return;FX.roll.classList.remove('run');void FX.roll.offsetWidth;FX.roll.classList.add('run');
  };
  const rgbSplitPulse=()=>{
    const a=document.querySelector('.screen.active'); if(!a)return;
    a.classList.add('rgb-split'); setTimeout(()=>a.classList.remove('rgb-split'),300);
  };
  const globalBreak=()=>{
    const a=document.querySelector('.screen.active'); if(!a)return;
    a.classList.add('global-break'); rollBarOnce(); rgbSplitPulse(); flashNoise(320);
    setTimeout(()=>a.classList.remove('global-break'),360);
  };

  /* ========== 受付 → ロード → 見出し → 発祥 ========== */
  btnStart.addEventListener("click", ()=>{
    const val = (nickInput.value||"").trim();
    if (!val){ nickInput.classList.add("entry-error"); setTimeout(()=>nickInput.classList.remove("entry-error"),220); return; }
    visitorName = val.slice(0,20); whoNameEl.textContent = visitorName;

    showScreen(scrLoading);
    startInitialLoading(()=>{
      globalBreak();
      showScreen(scrName);
      setTimeout(()=>{
        globalBreak();
        showScreen(scrStory);
        // フェードアップ表示
        requestAnimationFrame(()=>{
          winMain.classList.add('show');
          setTimeout(()=>{ winChant.classList.remove('hidden'); winChant.classList.add('show'); startChant(); }, 1200);
        });
      }, 1500);
    });
  });

  function startInitialLoading(done){
    let p=0;
    (function step(){
      p += (p<40?1:(p<80?2:5)); if (p>100) p=100;
      perEl.textContent = p+"%";
      if (p<100){
        setTimeout(step, Math.max(18, 120*Math.pow(0.85,p/10)));
      }else{
        scrLoading.style.transition="opacity .6s ease"; scrLoading.style.opacity="0";
        setTimeout(()=>{ scrLoading.style.opacity=""; done&&done(); }, 620);
      }
    })();
  }

  function showScreen(screen){
    document.querySelectorAll(".screen").forEach(s=>{
      s.classList.remove("active"); s.classList.add("hidden");
      s.querySelectorAll('.fade-up').forEach(n=>n.classList.remove('show'));
    });
    screen.classList.remove("hidden"); screen.classList.add("active");
  }

  /* ========== “たすけて” ========== */
  function typeText(el, text, speed=16){
    return new Promise(resolve=>{
      let i=0;(function step(){
        if(i>=text.length){resolve();return;}
        el.textContent += text.charAt(i++);
        const box = el.closest('.scrollbox'); if (box) box.scrollTop = box.scrollHeight;
        setTimeout(step, Math.max(6, speed + (Math.random()*8-4)));
      })();
    });
  }
  function startChant(){
    chantText.classList.add("show");
    let running = true;
    btnWarning.addEventListener("click", ()=> running=false, {once:true});
    (async function loop(){
      await new Promise(r=>setTimeout(r,600)); // 少し間を置く
      while(running){
        const burst = 1 + Math.floor(Math.random()*3);
        for(let i=0;i<burst;i++){ await typeText(chantText, "たすけて", 12); }
        chantWrap.scrollTop = chantWrap.scrollHeight;
        await new Promise(r=>setTimeout(r, 220 + Math.random()*380));
      }
    })();
  }

  /* ========== 注意 → カルテロード ========== */
  btnWarning.addEventListener("click", ()=>{ globalBreak(); showScreen(scrWarn); });
  btnAgree.addEventListener("click", ()=>{ globalBreak(); startRecordLoading(); });

  function startRecordLoading(){
    showScreen(scrRecLoad);
    let p=0; const t=setInterval(()=>{
      p+=(p<60?4:8); if(p>100)p=100; recPer.textContent=p+"%";
      if(p>=100){ clearInterval(t); setTimeout(()=>{ globalBreak(); showScreen(scrRecords); buildRecords(); setTimeout(triggerAutoUpdate,1200); },200); }
    },90);
  }
  btnBack.addEventListener("click", ()=>{ globalBreak(); showScreen(scrStory); });

  /* ========== カルテ：データ / 生成 ========== */
  const recordsData = [
    { no:"058", name:"<span class='mosaic'>██</span>", diag:"接触後不安反応", sym:"頭痛・悪夢", prog:"日記帳到着当夜より症状出現。窓外の気配が継続。", mosaic:true },
    { no:"102", name:"匿名", diag:"窓辺幻視症", sym:"吐き気・視線恐怖", prog:"窓辺で赤い日記を確認後、睡眠障害が悪化。", mosaic:false },
    { no:"237", name:"<span class='mosaic'>███</span>", diag:"背部圧迫感", sym:"肩の重量感", prog:"夜半、背中に重量。窓を開放すると軽減。", mosaic:true },
    { no:"341", name:"<span class='mosaic'>██</span>", diag:"呼称追跡性障害", sym:"名を呼ばれる幻聴", prog:"翌日、窓辺に赤い日記が置かれていた。", mosaic:true },
    { no:"509", name:"来訪者A", diag:"視覚残像症", sym:"残像・頭痛", prog:"赤い日記帳の残像を複数回確認。", mosaic:false },
    { no:"666", name:"<span class='mosaic'>██</span>", diag:"B-33型《バーバラさん》接触症", sym:"視線恐怖・悪夢", prog:"夜間、窓から赤い日記が持ち去られるのを確認。", mosaic:true }, /* ←据え置き */
    { no:"712", name:"<span class='mosaic'>██</span>", diag:"急性幻視性不安", sym:"記憶欠落", prog:"証言と記録の齟齬が多発。最後に日記を所持。", mosaic:true },
    { no:"835", name:"匿名", diag:"夜間接触症候群", sym:"失神・不安", prog:"窓を開けた際、背中の圧迫感と共に日記が消失。", mosaic:false }
  ];
  // 昇順で描画（既に昇順だが保険で）
  recordsData.sort((a,b)=> Number(a.no)-Number(b.no));

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

  /* ========== 詳細モーダル（控えめ文字化け） ========== */
  let corruptTimer=null, corruptSession=[];
  const GLITCH_SET="◆※#＠▓░╳■□△◎◢◣";
  const HOMO = { "ー":"—","-":"－","・":"･","。":"｡","、":"､","口":"□","日":"■","〇":"○","○":"◯","人":"入","田":"亩","カ":"力","へ":"∧","ン":"ソ","テ":"ﾃ","タ":"ﾀ" };
  function collectTextNodes(root){
    const out=[]; const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:(n)=>{
      if(!n.nodeValue||!n.nodeValue.trim())return NodeFilter.FILTER_REJECT;
      let p=n.parentElement; while(p){ if(p.classList&&(p.classList.contains('mosaic')||p.dataset.noCorrupt!==undefined)) return NodeFilter.FILTER_REJECT; p=p.parentElement; }
      return NodeFilter.FILTER_ACCEPT;
    }});
    let n; while((n=w.nextNode())) out.push(n); return out;
  }
  const corruptString=(src,rate)=>{
    let out=""; for(let i=0;i<src.length;i++){ const ch=src[i]; if(/\s/.test(ch)){out+=ch;continue;}
      if(Math.random()<rate){ out += (Math.random()<0.45 && HOMO[ch])? HOMO[ch] : GLITCH_SET[Math.floor(Math.random()*GLITCH_SET.length)]; }
      else out += ch;
    } return out;
  };
  const applyCorruption=(sess,rate)=> sess.forEach(it=> it.node.nodeValue = corruptString(it.original,rate));
  const restoreCorruption=(sess)=> sess.forEach(it=> it.node.nodeValue = it.original);
  function startModalCorruption(root,{startRate=.03,step=.03,maxRate=.28,periodMs=1200}={}){
    stopModalCorruption();
    corruptSession = collectTextNodes(root).map(n=>({node:n,original:n.nodeValue}));
    applyCorruption(corruptSession,startRate);
    corruptTimer = setInterval(()=>{
      startRate = Math.min(maxRate, startRate + step);
      applyCorruption(corruptSession,startRate);
      root.closest('.modal-inner')?.classList.add('corrupt-flash');
      setTimeout(()=> root.closest('.modal-inner')?.classList.remove('corrupt-flash'), 180);
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
      ${data.mosaic ? `<p class="garbled">※ 記録の一部が読み取り不能です。</p>` : ``}
    `;
    modal.classList.add("open"); modal.setAttribute("aria-hidden","false");
    globalBreak(); startModalCorruption(modalBody);
  }
  modalClose.addEventListener("click", ()=>{
    stopModalCorruption(); modal.classList.remove("open"); modal.setAttribute("aria-hidden","true");
  });

  /* ========== 自動更新（一覧の1件） ========== */
  let autoUpdatedOnce=false;
  function triggerAutoUpdate(){
    if(autoUpdatedOnce) return; autoUpdatedOnce=true;
    const cards = Array.from(document.querySelectorAll("#records-list .card"));
    if(cards.length<=2) return;
    const target = cards[1 + Math.floor(Math.random()*(cards.length-2))];
    const lastTd = target.querySelector(".karte tr:last-child td");
    if(!lastTd) return;
    lastTd.innerHTML = `状態悪化を確認。<span class="mosaic">赤い日記帳</span>の所在不明。<span class="badge-update">更新</span>`;
    target.classList.add("updated"); globalBreak();
  }

  /* ========== ランダム小グリッチ ========== */
  (function randomFxLoop(){
    const choice=Math.random();
    if (choice < 0.35) rollBarOnce();
    else if (choice < 0.6) rgbSplitPulse();
    else flashNoise(200);
    setTimeout(randomFxLoop, 1600 + Math.random()*3200);
  })();

});
