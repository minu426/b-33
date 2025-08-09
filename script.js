document.addEventListener("DOMContentLoaded", () => {
  // 画面要素
  const scrLoading = document.getElementById("screen-loading");
  const scrName    = document.getElementById("screen-name");
  const scrStory   = document.getElementById("screen-story");
  const scrWarn    = document.getElementById("screen-warning");
  const scrRecLoad = document.getElementById("screen-records-loading");
  const scrRecords = document.getElementById("screen-records");
  const noise      = document.getElementById("noise");

  // 表示補助
  const perEl  = document.getElementById("load-per");
  const recPer = document.getElementById("rec-per");
  const storyTextRoot = document.getElementById("story-text");

  // ストーリー本文
  const storyParagraphs = [
    "昔、とある少女が惨殺され、その少女は赤い日記帳に日々の出来事を綴っていた。",
    "少女の死後、その赤い日記帳は忽然と姿を消し、どこを探しても見つからなかった。",
    "やがて、噂を聞いた者の家に見たことのない赤い日記帳が届くようになったが、決して開いてはならないと言われている。",
    "その日記帳が届いた夜、バーバラさんと呼ばれる存在が現れる。",
    "バーバラさんの顔を見ず、扉を開けて背中に乗せ、部屋の窓を開けて外に送り出さなければならない。",
    "日記帳を開いたり、バーバラさんの顔を見てしまった者の運命や、バーバラさんの正体は謎に包まれている。",
    "彼女は惨殺された少女の成れの果てなのか、犯人なのか、誰にもわからない。"
  ];

  // util
  const show = el => { el.classList.remove("hidden"); el.classList.add("active"); };
  const hide = el => { el.classList.add("hidden"); el.classList.remove("active"); };
  const flashNoise = (ms=260) => { noise.classList.add("strong"); setTimeout(()=>noise.classList.remove("strong"), ms); };
  const joltOnce   = (target=document.querySelector(".browser.retro")||document.body)=>{ target.classList.add("jolt"); setTimeout(()=>target.classList.remove("jolt"), 240); };

  // ランダム“ガガガ”（画面の歪み + 文字の局所揺れ + 一時文字化け）
  (function scheduleJolt(){
    const next = 1000 + Math.random()*2500; // 1〜3.5秒
    setTimeout(()=>{
      joltOnce();
      jitterRandomParagraph();
      randomTextGlitch();
      scheduleJolt();
    }, next);
  })();

  // ロード（遅→速）
  let p = 0, base = 120;
  (function tick(){
    p += (p < 40 ? 1 : (p < 80 ? 2 : 5));
    if (p > 100) p = 100;
    perEl && (perEl.textContent = p + "%");
    if (p < 100){
      const d = Math.max(18, base * Math.pow(0.85, p/10));
      setTimeout(tick, d);
    } else {
      scrLoading.style.transition = "opacity .7s ease";
      scrLoading.style.opacity = "0";
      flashNoise(260);
      setTimeout(()=>{
        hide(scrLoading);
        show(scrName);
        setTimeout(()=>{
          hide(scrName);
          show(scrStory);
          flashNoise(220);
          startTypewriterParagraphs(storyTextRoot, storyParagraphs, 20)
            .then(()=> startHelpChant("story-text")); // “たすけて”もタイプライター
        }, 2000);
      }, 720);
    }
  })();

  // ボタン遷移
  document.getElementById("btn-to-warning").addEventListener("click", ()=>{
    flashNoise(220); hide(scrStory); show(scrWarn);
  });

  document.getElementById("btn-agree").addEventListener("click", ()=>{
    hide(scrWarn); show(scrRecLoad);
    let rp = 0;
    const t = setInterval(()=>{
      rp += (rp < 60 ? 4 : 8);
      if (rp > 100) rp = 100;
      recPer.textContent = rp + "%";
      if (rp >= 100){
        clearInterval(t);
        setTimeout(()=>{
          hide(scrRecLoad); show(scrRecords);
          flashNoise(220);
          buildRecords();               // カルテ生成
          setTimeout(triggerAutoUpdate, 800 + Math.random()*1200);
        }, 180);
      }
    }, 90);
  });

  document.getElementById("btn-back-story").addEventListener("click", ()=>{
    flashNoise(220); hide(scrRecords); show(scrStory);
  });

  /* ===== タイプライター（本文 + “たすけて”） ===== */

  function typeText(el, text, speed=20){
    return new Promise(resolve=>{
      let i=0;
      (function step(){
        if(i>=text.length){ resolve(); return; }
        el.textContent += text.charAt(i);
        i++;
        const delay = Math.max(5, speed + (Math.random()*10-5));
        const box = document.getElementById("story-scroll");
        if (box) box.scrollTop = box.scrollHeight;
        setTimeout(step, delay);
      })();
    });
  }

  async function startTypewriterParagraphs(root, paragraphs, speed=20){
    root.innerHTML = "";
    for (let t of paragraphs){
      const p = document.createElement("p");
      root.appendChild(p);
      await typeText(p, t, speed);
      if(p.textContent.length>2){
        // 末尾一文字改行を抑制（不可視結合子）
        p.textContent = p.textContent.slice(0,-2) + "\u2060" + p.textContent.slice(-2);
      }
    }
  }

  function startHelpChant(containerId="story-text"){
    const root = document.getElementById(containerId);
    const line = document.createElement("p");
    line.className = "help-chant";
    root.appendChild(line);
    setTimeout(()=> line.classList.add("show"), 10);

    let running = true;
    document.getElementById("btn-to-warning").addEventListener("click", ()=> running = false, { once:true });

    (async function loop(){
      while(running){
        const burst = 1 + Math.floor(Math.random()*3); // 1〜3個
        for(let i=0;i<burst;i++){
          await typeText(line, (line.textContent? "　":"") + "たすけて", 14);
        }
        const box = document.getElementById("story-scroll");
        if (box) box.scrollTop = box.scrollHeight;
        await wait(240 + Math.random()*320);
      }
    })();
  }
  const wait = ms => new Promise(r=>setTimeout(r,ms));

  /* ===== 文字の“局所ゆがみ”＆一時文字化け ===== */
  function jitterRandomParagraph(){
    const ps = document.querySelectorAll('#story-text p');
    if(!ps.length) return;
    const el = ps[Math.floor(Math.random()*ps.length)];
    el.classList.add('text-jitter');
    setTimeout(()=> el.classList.remove('text-jitter'), 260);
  }

  function randomTextGlitch(){
    const container = document.getElementById("story-text");
    if (!container) return;
    const ps = Array.from(container.querySelectorAll("p"));
    if (!ps.length) return;
    const p = ps[Math.floor(Math.random()*ps.length)];
    const t = p.textContent;
    if (t.length < 6) return;
    const idx = 1 + Math.floor(Math.random()*(t.length-2));
    const gl = "◆※#＠▓░╳";
    const mutated  = gl[Math.floor(Math.random()*gl.length)];
    p.textContent = t.slice(0,idx) + mutated + t.slice(idx+1);
    setTimeout(()=>{ p.textContent = t; }, 140);
  }

  /* ===== カルテ：データ／生成／詳細モーダル ===== */

  const recordsData = [
    { no:"333", name:"<span class='mosaic'>████</span>", diag:"B-33型《バーバラさん》接触症", sym:"頭痛、悪夢、窓の外の気配", prog:"赤い日記帳が届いた夜から症状出現。夜間、窓から赤い日記が持ち去られるのを確認。", mosaic:true },
    { no:"444", name:"██", diag:"窓辺幻視症", sym:"吐き気、視線恐怖", prog:"窓辺で赤い日記を確認。以後、睡眠障害が悪化。", mosaic:false },
    { no:"666", name:"<span class='mosaic'>███</span>", diag:"呼称追跡性障害", sym:"耳鳴り、名を呼ばれる幻聴", prog:"呼ばれた翌日、窓に赤い日記が置かれていた。", mosaic:true },
    { no:"777", name:"█", diag:"夜間接触症候群", sym:"過度の不安、失神", prog:"窓を開けた際、背中に何かを感じ赤い日記が消失。体調急変。", mosaic:false },
    { no:"888", name:"<span class='mosaic'>████</span>", diag:"視覚残像症", sym:"視覚異常、残像", prog:"赤い日記帳の残像を複数回確認。頭痛増悪。", mosaic:true },
    { no:"999", name:"██", diag:"急性幻視性不安", sym:"視覚異常、記憶欠落", prog:"証言と記録の齟齬が多発。最後に赤い日記帳を所持。", mosaic:false }
  ];

  function buildRecords(){
    const list = document.getElementById("records-list");
    list.innerHTML = "";
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
      list.appendChild(card);
    });

    // 詳細ボタン
    document.querySelectorAll(".open-detail").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const id = btn.getAttribute("data-id");
        const data = recordsData.find(r=>r.no===id);
        openDetailModal(data);
      });
    });
  }

  // モーダル
  const modal      = document.getElementById("modal");
  const modalBody  = document.getElementById("modal-body");
  const modalTitle = document.getElementById("modal-title");
  const modalClose = document.getElementById("modal-close");

  function openDetailModal(data){
    const title = `患者記録 No.${data.no}`;
    const body  = `
      <p><strong>患者名：</strong>${data.name}</p>
      <p><strong>診断名：</strong>${data.diag}</p>
      <p><strong>症状：</strong>${data.sym}</p>
      <p><strong>経過：</strong>${data.prog}</p>
      ${data.mosaic ? `<p class="garbled">※ 記録の一部が読み取り不能です。</p>` : ``}
    `;
    modalTitle.textContent = title;
    modalBody.innerHTML    = body;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
  }
  modalClose.addEventListener("click", ()=>{
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden","true");
  });

  // 自動更新（1回だけ）
  let autoUpdatedOnce = false;
  function triggerAutoUpdate(){
    if (autoUpdatedOnce) return; autoUpdatedOnce = true;
    const cards = Array.from(document.querySelectorAll("#screen-records .card"));
    if (cards.length <= 1) return;
    const target = cards[1 + Math.floor(Math.random()*(cards.length-1))];
    const tdList = target.querySelectorAll("td");
    if (!tdList.length) return;
    const field = tdList[tdList.length-1]; // 経過
    field.innerHTML = `状態悪化を確認。<span class="mosaic">赤い日記帳</span>の所在不明。<span class="badge-update">更新</span>`;
    target.classList.add("updated","glitch");
    setTimeout(()=> target.classList.remove("glitch"), 300);
  }
});
