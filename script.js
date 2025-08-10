document.addEventListener("DOMContentLoaded", () => {
  // ===== 画面要素 =====
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

  // 発祥
  const storyText   = document.getElementById("story-text");
  const winChant    = document.getElementById("win-chant");
  const chantWrap   = document.getElementById("chant-scroll");
  const chantText   = document.getElementById("chant-text");
  const btnWarning  = document.getElementById("btn-to-warning");
  const btnAgree    = document.getElementById("btn-agree");
  const btnBack     = document.getElementById("btn-back-story");

  // カルテ
  const recordsList = document.getElementById("records-list");

  // モーダル
  const modal       = document.getElementById("modal");
  const modalTitle  = document.getElementById("modal-title");
  const modalBody   = document.getElementById("modal-body");
  const modalClose  = document.getElementById("modal-close");

  // FX
  const FX = {
    roll: document.querySelector('#fx .fx-rollbar'),
    bgStory: document.getElementById('bg-story'),
    bgRecs: document.getElementById('bg-records'),
  };

  // ===== 画面切替（背景動画も切替） =====
  function showScreen(screen){
    document.querySelectorAll(".screen").forEach(s=>{
      s.classList.remove("active");
      s.classList.add("hidden");
      s.classList.remove("global-break","rgb-split","screen-tear","vsync-drift","jolt");
    });
    screen.classList.remove("hidden");
    screen.classList.add("active");

    // 背景動画切替
    if (screen === scrStory || screen === scrEntry || screen === scrLoading || screen === scrName) {
      FX.bgStory.style.display = "block";
      FX.bgRecs.style.display  = "none";
    } else if (screen === scrRecords || screen === scrRecLoad || screen === scrWarn) {
      FX.bgStory.style.display = (screen===scrWarn ? "block":"none"); // 注意はストーリー側の色味に
      FX.bgRecs.style.display  = (screen===scrWarn ? "none":"block");
    } else {
      FX.bgStory.style.display = "none";
      FX.bgRecs.style.display  = "none";
    }
  }

  // ===== ロールバー/グリッチ =====
  function rollBarOnce(){
    if(!FX.roll) return;
    FX.roll.classList.remove('run'); void FX.roll.offsetWidth;
    FX.roll.classList.add('run');
  }
  function rgbSplitPulse(){
    const active = document.querySelector('.screen.active'); if(!active) return;
    active.classList.add('rgb-split'); setTimeout(()=> active.classList.remove('rgb-split'), 300);
  }
  function screenTearOnce(){
    const active = document.querySelector('.screen.active'); if(!active) return;
    active.classList.add('screen-tear'); setTimeout(()=> active.classList.remove('screen-tear'), 300);
  }
  function globalBreak(){
    const active = document.querySelector('.screen.active'); if(!active) return;
    active.classList.add('global-break'); rollBarOnce(); rgbSplitPulse(); screenTearOnce();
    setTimeout(()=> active.classList.remove('global-break'), 360);
  }

  // ランダム“ガガガ” & FXループ（ロールバー多め）
  (function jitterLoop(){
    const next = 1500 + Math.random()*3000;
    setTimeout(()=>{
      const active = document.querySelector(".screen.active");
      if (active){ active.classList.add("jolt"); setTimeout(()=>active.classList.remove("jolt"), 220); }
      if (Math.random()<0.45) rollBarOnce();
      if (Math.random()<0.25) rgbSplitPulse();
      jitterLoop();
    }, next);
  })();

  (function randomFxLoop(){
    const c=Math.random();
    if (c < 0.45) rollBarOnce();
    else if (c < 0.70) rgbSplitPulse();
    else if (c < 0.85) screenTearOnce();
    // たまにドリフト
    if (Math.random() < 0.25){
      const a=document.querySelector('.screen.active');
      a?.classList.add('vsync-drift');
      setTimeout(()=> a?.classList.remove('vsync-drift'), 5000 + Math.random()*4000);
    }
    setTimeout(randomFxLoop, 1600 + Math.random()*3200);
  })();

  // ===== 受付 → ロード → 見出し → 発祥 =====
  btnStart.addEventListener("click", ()=>{
    const val = (nickInput.value||"").trim();
    if (!val){ nickInput.classList.add("entry-error"); setTimeout(()=>nickInput.classList.remove("entry-error"),220); return; }
    visitorName = val.slice(0,20);
    whoNameEl.textContent = visitorName;

    showScreen(scrLoading);
    startInitialLoading(()=>{
      globalBreak();
      showScreen(scrName);
      // 見出しの表示時間を少し確保
      setTimeout(()=>{
        globalBreak();
        showScreen(scrStory);
        startStorySequence(); // フェードイン構成に変更
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
        scrLoading.style.transition="opacity .6s ease";
        scrLoading.style.opacity="0";
        setTimeout(()=>{ scrLoading.style.opacity=""; done&&done(); }, 620);
      }
    })();
  }

  // ===== 発祥テキスト（タイプライター→停止／フェードインへ） =====
  const storyParagraphs = [
    "昔、とある少女が惨殺され、その少女は赤い日記帳に日々の出来事を綴っていた。",
    "少女の死後、その赤い日記帳は忽然と姿を消し、どこを探しても見つからなかった。",
    "やがて、噂を聞いた者の家に見たことのない赤い日記帳が届くようになったが、決して開いてはならないと言われている。",
    "その日記帳が届いた夜、バーバラさんと呼ばれる存在が現れる。",
    "バーバラさんの顔を見ず、扉を開けて背中に乗せ、部屋の窓を開けて外に送り出さなければならない。",
    "日記帳を開いたり、バーバラさんの顔を見てしまった者の運命や、バーバラさんの正体は謎に包まれている。",
    "彼女は惨殺された少女の成れの果てなのか、犯人なのか、誰にもわからない。"
  ];

  function startStorySequence(){
    // 本文差し込み→少し遅れてフェードイン
    storyText.innerHTML = storyParagraphs.map(t=>`<p>${t}</p>`).join("");
    setTimeout(()=> storyText.classList.add("show"), 380);

    // “たすけて”ウィンドウは遅れて出現＋タイプライター
    winChant.classList.remove("hidden");
    globalBreak();
    setTimeout(()=> startChant(), 600);
  }

  // たすけてタイプライター
  function typeText(el, text, speed=16){
    return new Promise(resolve=>{
      let i=0;
      (function step(){
        if(i>=text.length){ resolve(); return; }
        el.textContent += text.charAt(i++);
        const delay = Math.max(6, speed + (Math.random()*10-5));
        const box = el.closest('.scrollbox'); if (box) box.scrollTop = box.scrollHeight;
        setTimeout(step, delay);
      })();
    });
  }
  function startChant(){
    chantText.classList.add("show");
    let running = true;
    btnWarning.addEventListener("click", ()=> running=false, {once:true});
    (async function loop(){
      while(running){
        const burst = 1 + Math.floor(Math.random()*3);
        for(let i=0;i<burst;i++){ await typeText(chantText, "たすけて", 12); }
        chantWrap.scrollTop = chantWrap.scrollHeight;
        await new Promise(r=>setTimeout(r, 220 + Math.random()*360));
      }
    })();
  }

  // ===== 注意 → カルテロード =====
  btnWarning.addEventListener("click", ()=>{
    globalBreak();
    showScreen(scrWarn);
  });

  btnAgree.addEventListener("click", ()=>{
    globalBreak();
    startRecordLoading();
  });

  function startRecordLoading(){
    showScreen(scrRecLoad);
    let p=0;
    const t = setInterval(()=>{
      p += (p<60?4:8);
      if (p>100) p=100;
      recPer.textContent = p+"%";
      if (p>=100){
        clearInterval(t);
        setTimeout(()=>{
          globalBreak();
          showScreen(scrRecords);
          buildRecords();
          setTimeout(triggerAutoUpdate, 1000 + Math.random()*1200);
          setTimeout(slowCorruptRecords, 1500);
        }, 200);
      }
    }, 90);
  }

  btnBack.addEventListener("click", ()=>{
    globalBreak();
    showScreen(scrStory);
  });

  // ===== カルテ：ダミーデータ =====
  const recordsData = [
    { no:"102", name:"<span class='mosaic'>██</span>", diag:"B-33型《バーバラさん》接触症", sym:"頭痛、悪夢、窓の外の気配", prog:"赤い日記帳が届いた夜から症状出現。夜間、窓から赤い日記が持ち去られるのを確認。", mosaic:true },
    { no:"217", name:"██", diag:"窓辺幻視症", sym:"吐き気、視線恐怖", prog:"窓辺で赤い日記を確認。以後、睡眠障害が悪化。", mosaic:false },
    { no:"341", name:"<span class='mosaic'>██</span>", diag:"接近過敏", sym:"首筋の寒気、肩圧迫感", prog:"夜半、背部に重量感。窓を開けると軽減。", mosaic:true },
    { no:"666", name:"<span class='mosaic'>███</span>", diag:"呼称追跡性障害", sym:"耳鳴り、名を呼ばれる幻聴", prog:"呼ばれた翌日、窓に赤い日記が置かれていた。", mosaic:true },
    { no:"809", name:"█", diag:"夜間接触症候群", sym:"過度の不安、失神", prog:"窓を開けた際、背中に何かを感じ赤い日記が消失。体調急変。", mosaic:false },
    { no:"913", name:"<span class='mosaic'>████</span>", diag:"視覚残像症", sym:"視覚異常、残像", prog:"赤い日記帳の残像を複数回確認。頭痛増悪。", mosaic:true },
    { no:"1042", name:"██", diag:"急性幻視性不安", sym:"視覚異常、記憶欠落", prog:"証言と記録の齟齬が多発。最後に赤い日記帳を所持。", mosaic:false }
  ];

  function buildRecords(){
    recordsList.innerHTML = "";
    recordsData
      .sort((a,b)=> Number(a.no)-Number(b.no)) // 若い番号順に表示
      .forEach(rec=>{
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

  // ===== 詳細モーダル + 文字化け（弱めに調整） =====
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
      if(Math.random()<rate){ out += (Math.random()<0.35 && HOMO[ch])? HOMO[ch] : GLITCH_SET[Math.floor(Math.random()*GLITCH_SET.length)]; }
      else out += ch;
    } return out;
  }
  function applyCorruption(session, rate){ session.forEach(it=> it.node.nodeValue = corruptString(it.original, rate)); }
  function restoreCorruption(session){ session.forEach(it=> it.node.nodeValue = it.original); }
  function startModalCorruption(root,{startRate=.04,step=.035,maxRate=.28,periodMs=1200}={}){
    stopModalCorruption();
    corruptSession = collectTextNodes(root).map(n=>({node:n,original:n.nodeValue}));
    applyCorruption(corruptSession,startRate);
    corruptTimer = setInterval(()=>{
      const c = Math.min(maxRate, startRate += step);
      applyCorruption(corruptSession,c);
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

  // ===== 自動更新 & 緩慢腐食 =====
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
    globalBreak();
  }

  function slowCorruptRecords(){
    const fields = document.querySelectorAll('#records-list .karte tr:last-child td');
    fields.forEach((td,i)=>{
      const nodes = collectTextNodes(td).map(n=>({node:n,original:n.nodeValue}));
      let t=0; setInterval(()=>{
        t++; const r = Math.min(0.18, 0.02 + 0.018*t); // 文字化け弱め
        nodes.forEach(it=> it.node.nodeValue = corruptString(it.original, r));
      }, 4200 + i*1200);
    });
  }
});

