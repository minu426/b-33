document.addEventListener("DOMContentLoaded", () => {
  /* ---------- 画面参照 ---------- */
  const scrPref   = document.getElementById("screen-preface");
  const scrEntry  = document.getElementById("screen-entry");
  const scrLoad   = document.getElementById("screen-loading");
  const scrName   = document.getElementById("screen-name");
  const scrStory  = document.getElementById("screen-story");
  const scrWarn   = document.getElementById("screen-warning");
  const scrRecLd  = document.getElementById("screen-records-loading");
  const scrRecs   = document.getElementById("screen-records");

  /* ---------- 要素 ---------- */
  const nickInput = document.getElementById("nick-input");
  const btnStart  = document.getElementById("btn-start");
  const whoNameEl = document.getElementById("who-name");
  const perEl     = document.getElementById("load-per");
  const recPer    = document.getElementById("rec-per");
  const btnWarn   = document.getElementById("btn-to-warning");
  const btnAgree  = document.getElementById("btn-agree");
  const btnBack   = document.getElementById("btn-back-story");

  const winChant  = document.getElementById("win-chant");
  const chantWrap = document.getElementById("chant-scroll");
  const chantText = document.getElementById("chant-text");

  const pre1 = document.getElementById("preface-line1");
  const pre2 = document.getElementById("preface-line2");

  /* ---------- FX ---------- */
  const FX = {
    roll: document.querySelector('#fx .fx-rollbar'),
    noise: document.getElementById('noise')
  };
  function rollBarOnce(){
    if(!FX.roll) return;
    FX.roll.classList.remove('run'); void FX.roll.offsetWidth;
    FX.roll.classList.add('run');
  }
  function joltActive(){
    const a=document.querySelector('.screen.active');
    if(a){ a.classList.add('jolt'); setTimeout(()=>a.classList.remove('jolt'), 220); }
  }
  (function randomFxLoop(){
    const c=Math.random();
    if (c < 0.45) rollBarOnce();
    setTimeout(randomFxLoop, 1600 + Math.random()*3200);
  })();

  /* ---------- 画面切替 ---------- */
  function showScreen(el){
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    el.classList.add("active");
  }

  /* ---------- 前置き：グリッチ解読→受付へ ---------- */
  glitchReveal(pre1, 1400);
  setTimeout(()=>glitchReveal(pre2, 1600), 250);

  // 前置きは十分に読めるように 5.2s 表示してから受付へ
  setTimeout(()=>{
    showScreen(scrEntry);
    // 受付ウィンドウ “ボワッ”
    setTimeout(()=> {
      document.querySelectorAll('.will-pop').forEach(n=>n.classList.remove('show'));
      scrEntry.querySelector('.will-pop')?.classList.add('show');
    }, 60);
  }, 5200);

  /* ---------- 受付 → ロード → 見出し → 発祥 ---------- */
  let visitorName = "来訪者";
  btnStart.addEventListener("click", ()=>{
    const v=(nickInput.value||"").trim();
    if(!v){ nickInput.classList.add("jolt"); setTimeout(()=>nickInput.classList.remove("jolt"),220); return; }
    visitorName = v.slice(0,20);
    whoNameEl.textContent = visitorName;

    showScreen(scrLoad);
    startInitialLoading(()=>{
      showScreen(scrName);
      // 見出しは中央に収まる
      setTimeout(()=>{
        showScreen(scrStory);

        // 発祥：本文ウィンドウを“ボワッ”表示（先に）
        const mainWin = scrStory.querySelector('.win-main');
        mainWin.classList.add('show');

        // 少し遅れて受信ログウィンドウを“ボワッ”表示
        setTimeout(()=>{
          winChant.classList.remove("hidden");
          winChant.classList.add('show');
          startChant(); // タイプライター開始
        }, 1100);

      }, 1500);
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
        done&&done();
      }
    })();
  }

  /* ---------- “たすけて” タイプライター ---------- */
  function typeText(el, text, speed=16){
    return new Promise(resolve=>{
      let i=0; (function step(){
        if(i>=text.length){ resolve(); return; }
        el.textContent += text.charAt(i++);
        const box = el.closest('.scrollbox'); if (box) box.scrollTop = box.scrollHeight;
        setTimeout(step, Math.max(6, speed + (Math.random()*8-4)));
      })();
    });
  }
  function startChant(){
    chantText.style.opacity=1;
    (async function loop(){
      while(document.getElementById('screen-story').classList.contains('active')){
        const burst = 1 + Math.floor(Math.random()*3);
        for(let i=0;i<burst;i++){ await typeText(chantText, "たすけて", 12); }
        chantWrap.scrollTop = chantWrap.scrollHeight;
        await wait(260 + Math.random()*420);
      }
    })();
  }
  const wait = ms => new Promise(r=>setTimeout(r,ms));

  /* ---------- 注意 → カルテ ---------- */
  btnWarn.addEventListener("click", ()=> showScreen(scrWarn));
  btnAgree.addEventListener("click", ()=>{
    showScreen(scrRecLd);
    let p=0;
    const t=setInterval(()=>{
      p+=(p<60?4:8); if(p>100)p=100;
      recPer.textContent=p+"%";
      if(p>=100){ clearInterval(t); showScreen(scrRecs); buildRecords(); }
    }, 90);
  });
  btnBack.addEventListener("click", ()=> showScreen(scrStory));

  /* ---------- カルテ：ダミーデータ ---------- */
  const recordsList = document.getElementById("records-list");
  const recordsData = [
    { no:"132", name:"<span class='mosaic'>██</span>", diag:"B-33型《バーバラさん》接触症", sym:"頭痛、悪夢、窓の外の気配", prog:"赤い日記帳が届いた夜から症状出現。夜間、窓から赤い日記が持ち去られるのを確認。", mosaic:true },
    { no:"247", name:"██", diag:"窓辺幻視症", sym:"吐き気、視線恐怖", prog:"窓辺で赤い日記を確認。以後、睡眠障害が悪化。", mosaic:false },
    { no:"318", name:"<span class='mosaic'>██</span>", diag:"接近過敏", sym:"首筋の寒気、肩圧迫感", prog:"夜半、背部に重量感。窓を開けると軽減。", mosaic:true },
    { no:"666", name:"<span class='mosaic'>███</span>", diag:"呼称追跡性障害", sym:"耳鳴り、名を呼ばれる幻聴", prog:"呼ばれた翌日、窓に赤い日記が置かれていた。", mosaic:true },
    { no:"702", name:"█", diag:"夜間接触症候群", sym:"過度の不安、失神", prog:"窓を開けた際、背中に何かを感じ赤い日記が消失。体調急変。", mosaic:false },
    { no:"845", name:"<span class='mosaic'>████</span>", diag:"視覚残像症", sym:"視覚異常、残像", prog:"赤い日記帳の残像を複数回確認。頭痛増悪。", mosaic:true },
    { no:"921", name:"██", diag:"急性幻視性不安", sym:"視覚異常、記憶欠落", prog:"証言と記録の齟齬が多発。最後に赤い日記帳を所持。", mosaic:false }
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
        openDetailModal(rec);
      });
      recordsList.appendChild(card);
    });
  }

  /* ---------- 詳細モーダル（軽め文字化け） ---------- */
  const modal  = document.getElementById("modal");
  const mTitle = document.getElementById("modal-title");
  const mBody  = document.getElementById("modal-body");
  const mClose = document.getElementById("modal-close");

  const GLITCH_SET = "◆※#＠▓░╳■□△◎◢◣";
  function corruptOnce(str, rate=0.09){
    let out=""; for(let i=0;i<str.length;i++){
      const ch=str[i]; if(/\s/.test(ch)){out+=ch;continue;}
      out += Math.random()<rate ? GLITCH_SET[Math.floor(Math.random()*GLITCH_SET.length)] : ch;
    } return out;
  }

  function openDetailModal(data){
    mTitle.textContent = `患者記録 No.${data.no}`;
    mBody.innerHTML = `
      <p><strong>患者名：</strong>${data.name}</p>
      <p><strong>診断名：</strong>${data.diag}</p>
      <p><strong>症状：</strong>${data.sym}</p>
      <p><strong>経過：</strong>${data.prog}</p>
      ${data.mosaic ? `<p>※ 記録の一部が読み取り不能です。</p>` : ``}
    `;
    // 軽い文字化け発生→修復
    const texts = Array.from(mBody.querySelectorAll('p'));
    texts.forEach(p=>{
      const org = p.textContent;
      p.textContent = corruptOnce(org, .08);
      setTimeout(()=> p.textContent = org, 900);
    });

    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
  }
  mClose.addEventListener("click", ()=>{
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
  });

  /* ---------- 小道具 ---------- */
  function glitchReveal(el, dur=1200){
    const target = el.textContent;
    const pool = "█▓▒░◎◇◆#*+%€@$";
    let t=0;
    (function loop(){
      const prog = Math.min(1, t/dur);
      const keep = Math.floor(target.length * prog);
      let s = target.slice(0, keep);
      for(let i=keep;i<target.length;i++){
        s += pool[Math.floor(Math.random()*pool.length)];
      }
      el.textContent = s;
      el.style.opacity = 1;
      t += 30;
      if (prog<1) setTimeout(loop, 30);
      else el.textContent = target;
    })();
  }

});
