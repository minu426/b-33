document.addEventListener("DOMContentLoaded", () => {
  // 各セクション
  const S = (id)=>document.getElementById(id);
  const scrIntro   = S("screen-intro");
  const scrEntry   = S("screen-entry");
  const scrLoading = S("screen-loading");
  const scrName    = S("screen-name");
  const scrStory   = S("screen-story");
  const scrWarn    = S("screen-warning");
  const scrRecLoad = S("screen-records-loading");
  const scrRecords = S("screen-records");

  // 受付
  const nickInput  = S("nick-input");
  const btnStart   = S("btn-start");
  const whoNameEl  = S("who-name");
  let visitorName  = "来訪者";

  // ロード％
  const perEl  = S("load-per");
  const recPer = S("rec-per");

  // 発祥
  const storyBox   = S("story-text");
  const winChant   = S("win-chant");
  const chantWrap  = S("chant-scroll");
  const chantText  = S("chant-text");
  const btnWarning = S("btn-to-warning");
  const btnAgree   = S("btn-agree");
  const btnBack    = S("btn-back-story");

  // カルテ
  const recordsList = S("records-list");

  // モーダル
  const modal      = S("modal");
  const modalTitle = S("modal-title");
  const modalBody  = S("modal-body");
  const modalClose = S("modal-close");

  // FX
  const FX = {
    roll: document.querySelector('#fx .fx-rollbar'),
  };
  function rollBarOnce(){
    if(!FX.roll) return;
    FX.roll.classList.remove('run'); void FX.roll.offsetWidth;
    FX.roll.classList.add('run');
  }
  function flashTransition(next){
    const active = document.querySelector('.screen.active');
    if(active){ active.classList.add('fade-out'); }
    rollBarOnce();
    setTimeout(()=>{
      showScreen(next);
    }, 220);
  }

  // 画面切替
  function showScreen(screen){
    document.querySelectorAll(".screen").forEach(s=>{
      s.classList.remove("active","fade-out");
      s.style.display = "none";
    });
    screen.style.display = "flex";
    screen.classList.add("active");
    // iOS の video 再生促し
    const v = screen.querySelector(".bg-noise");
    if(v){ v.play().catch(()=>{}); }
  }

  /* ====== 起動：前置き → 受付 ====== */
  showScreen(scrIntro);
  // 読める長さ（約5.2s）+ わずかに余韻
  setTimeout(()=>{
    flashTransition(scrEntry);
    // 受付ウィンドウを「下からボワッ」
    const win = scrEntry.querySelector(".window");
    win.classList.remove("win-pop"); void win.offsetWidth; win.classList.add("win-pop");
  }, 5600);

  /* ====== 受付 → ローディング → 見出し → 発祥 ====== */
  btnStart.addEventListener("click", ()=>{
    const val = (nickInput.value||"").trim();
    if (!val){
      nickInput.classList.add("shake"); setTimeout(()=>nickInput.classList.remove("shake"),220);
      return;
    }
    visitorName = val.slice(0,20);
    whoNameEl.textContent = visitorName;

    // ページが勝手にズーム/スクロールしないように戻す
    window.scrollTo({top:0, behavior:"instant"});

    flashTransition(scrLoading);
    startInitialLoading(()=>{
      // 名前画面
      flashTransition(scrName);
      // 名前（先に表示）
      const line1 = scrName.querySelector(".kaiki .line-1");
      const line2 = scrName.querySelector(".kaiki .line-2");
      // 順にフェードイン
      setTimeout(()=>{ line1.style.transition="opacity .5s"; line1.style.opacity=1; }, 350);
      setTimeout(()=>{ line2.style.transition="opacity .7s"; line2.style.opacity=1; }, 900);

      // 発祥へ
      setTimeout(()=>{
        flashTransition(scrStory);
        startStoryReveal();
      }, 1800);
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
      }else{ setTimeout(done, 420); }
    })();
  }

  /* ====== 発祥：本文は完成文 → フェード、受信ログは遅れてタイプ打ち ====== */
  function startStoryReveal(){
    // 本文ボックスをふわっと
    const mainWin = scrStory.querySelector(".win-main");
    mainWin.classList.remove("win-pop"); void mainWin.offsetWidth; mainWin.classList.add("win-pop");

    // 受信ログは遅らせて出現
    setTimeout(()=>{
      winChant.classList.remove("hidden");
      winChant.classList.remove("win-pop"); void winChant.offsetWidth; winChant.classList.add("win-pop");
      startChant();
    }, 2200);
  }

  // “絶対に見るな” をタイプ打ち（間隔は短め、ブロックは詰め）
  const wait = (ms)=>new Promise(r=>setTimeout(r,ms));
  function typeText(el, text, speed=16){
    return new Promise(resolve=>{
      let i=0;
      (function step(){
        if(i>=text.length){ resolve(); return; }
        el.textContent += text.charAt(i++);
        const box = el.closest('.scrollbox'); if (box) box.scrollTop = box.scrollHeight;
        setTimeout(step, speed);
      })();
    });
  }
  function startChant(){
    (async function loop(){
      // 少し溜めてから
      await wait(400);
      // 以降ひたすら短いブロック連打
      for(let n=0;n<999;n++){
        await typeText(chantText, "絶対に見るな", 14);
        chantWrap.scrollTop = chantWrap.scrollHeight;
        await wait(240 + Math.random()*420);
      }
    })();
  }

  /* ====== 注意 → カルテロード → 一覧 ====== */
  btnWarning.addEventListener("click", ()=>{
    flashTransition(scrWarn);
  });

  btnAgree.addEventListener("click", ()=>{
    flashTransition(scrRecLoad);
    startRecordLoading();
  });

  function startRecordLoading(){
    let p=0;
    const t = setInterval(()=>{
      p += (p<60?4:8);
      if (p>100) p=100;
      recPer.textContent = p+"%";
      if (p>=100){
        clearInterval(t);
        setTimeout(()=>{
          flashTransition(scrRecords);
          buildRecords();
          // 自動更新＆ふわっと壊れる軽い演出
          setTimeout(triggerAutoUpdate, 1000 + Math.random()*1200);
          setInterval(randomMinorCorrupt, 5000);
        }, 200);
      }
    }, 90);
  }

  btnBack.addEventListener("click", ()=>{
    flashTransition(scrStory);
    window.scrollTo({top:0, behavior:"instant"});
  });

  /* ====== カルテ生成 ====== */
  const recordsData = [
    { no:"123", name:"<span class='mosaic'>██</span>", diag:"B-33型《バーバラさん》接触症", sym:"頭痛、悪夢、窓の外の気配", prog:"赤い日記帳が届いた夜から症状出現。夜間、窓から赤い日記が持ち去られるのを確認。", mosaic:true },
    { no:"187", name:"██", diag:"窓辺幻視症", sym:"吐き気、視線恐怖", prog:"窓辺で赤い日記を確認。以後、睡眠障害が悪化。", mosaic:false },
    { no:"241", name:"<span class='mosaic'>██</span>", diag:"接近過敏", sym:"首筋の寒気、肩圧迫感", prog:"夜半、背部に重量感。窓を開けると軽減。", mosaic:true },
    { no:"666", name:"<span class='mosaic'>███</span>", diag:"呼称追跡性障害", sym:"耳鳴り、名を呼ばれる幻聴", prog:"呼ばれた翌日、窓に赤い日記が置かれていた。", mosaic:true },
    { no:"702", name:"█", diag:"夜間接触症候群", sym:"過度の不安、失神", prog:"窓を開けた際、背中に何かを感じ赤い日記が消失。体調急変。", mosaic:false },
    { no:"845", name:"<span class='mosaic'>██</span>", diag:"視覚残像症", sym:"視覚異常、残像", prog:"赤い日記帳の残像を複数回確認。頭痛増悪。", mosaic:true },
    { no:"930", name:"██", diag:"急性幻視性不安", sym:"視覚異常、記憶欠落", prog:"証言と記録の齟齬が多発。最後に赤い日記帳を所持。", mosaic:false }
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

  /* ====== 詳細モーダル + 断続的文字化け ====== */
  let corruptTimer = null;
  let corruptSession = [];
  function collectTextNodes(root){
    const out = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if(!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        // mosaic 内や data-noCorrupt は除外
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
      if(Math.random()<rate){ out += (Math.random()<0.4 && HOMO[ch])? HOMO[ch] : GLITCH_SET[Math.floor(Math.random()*GLITCH_SET.length)]; }
      else out += ch;
    } return out;
  }
  function applyCorruption(session, rate){ session.forEach(it=> it.node.nodeValue = corruptString(it.original, rate)); }
  function restoreCorruption(session){ session.forEach(it=> it.node.nodeValue = it.original); }

  function startModalCorruption(root,{startRate=.05,step=.04,maxRate=.35,periodMs=1200}={}){
    stopModalCorruption();
    corruptSession = collectTextNodes(root).map(n=>({node:n,original:n.nodeValue}));
    applyCorruption(corruptSession,startRate);
    corruptTimer = setInterval(()=>{
      const c = Math.min(maxRate, startRate += step);
      applyCorruption(corruptSession,c);
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
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
    startModalCorruption(modalBody);
  }
  modalClose.addEventListener("click", ()=>{
    stopModalCorruption();
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
  });

  /* ====== カルテ：自動更新／断続腐食 ====== */
  let autoUpdatedOnce=false;
  function triggerAutoUpdate(){
    if(autoUpdatedOnce) return; autoUpdatedOnce=true;
    const cards = Array.from(document.querySelectorAll("#records-list .card"));
    if(cards.length<=1) return;
    const target = cards[1 + Math.floor(Math.random()*(cards.length-1))];
    const tdList = target.querySelectorAll("td"); if(!tdList.length) return;
    const field = tdList[tdList.length-1];
    field.innerHTML = `状態悪化を確認。<span class="mosaic">赤い日記帳</span>の所在不明。<span class="badge-update">更新</span>`;
  }
  function randomMinorCorrupt(){
    const fields = document.querySelectorAll('#records-list .karte tr:last-child td');
    const pick = fields[Math.floor(Math.random()*fields.length)];
    if(!pick) return;
    const nodes = collectTextNodes(pick).map(n=>({node:n,original:n.nodeValue}));
    applyCorruption(nodes, 0.12);
    setTimeout(()=> restoreCorruption(nodes), 1600 + Math.random()*1200);
  }

  /* ====== ノイズトランジション（一定間隔で） ====== */
  (function randomFxLoop(){
    const c=Math.random();
    if (c < 0.50) rollBarOnce();         // ロールバー多め
    setTimeout(randomFxLoop, 1500 + Math.random()*3000);
  })();

});
