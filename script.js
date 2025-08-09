document.addEventListener("DOMContentLoaded", () => {
  // 画面
  const scrLoading = document.getElementById("screen-loading");
  const scrName    = document.getElementById("screen-name");
  const scrStory   = document.getElementById("screen-story");
  const scrWarn    = document.getElementById("screen-warning");
  const scrRecLoad = document.getElementById("screen-records-loading");
  const scrRecords = document.getElementById("screen-records");
  const noise      = document.getElementById("noise");

  // パーセント
  const perEl  = document.getElementById("load-per");
  const recPer = document.getElementById("rec-per");

  // ストーリー
  const storyTextRoot = document.getElementById("story-text");
  const storyParagraphs = [
    "昔、とある少女が惨殺され、その少女は赤い日記帳に日々の出来事を綴っていた。",
    "少女の死後、その赤い日記帳は忽然と姿を消し、どこを探しても見つからなかった。",
    "やがて、噂を聞いた者の家に見たことのない赤い日記帳が届くようになったが、決して開いてはならないと言われている。",
    "その日記帳が届いた夜、バーバラさんと呼ばれる存在が現れる。",
    "バーバラさんの顔を見ず、扉を開けて背中に乗せ、部屋の窓を開けて外に送り出さなければならない。",
    "日記帳を開いたり、バーバラさんの顔を見てしまった者の運命や、バーバラさんの正体は謎に包まれている。",
    "彼女は惨殺された少女の成れの果てなのか、犯人なのか、誰にもわからない。"
  ];

  // モーダル
  const modal      = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody  = document.getElementById("modal-body");
  const modalClose = document.getElementById("modal-close");

  // util
  function show(el){ el.classList.remove("hidden"); el.classList.add("active"); }
  function hide(el){ el.classList.add("hidden"); el.classList.remove("active"); }
  function flashNoise(ms=260){ noise.classList.add("strong"); setTimeout(()=>noise.classList.remove("strong"), ms); }
  function microShake(el){ el.classList.add("shake"); setTimeout(()=> el.classList.remove("shake"), 200); }
  function joltOnce(target=document.body){ target.classList.add("jolt"); setTimeout(()=>target.classList.remove("jolt"), 240); }

  // ランダム歪み（ガガガ）を不定期に発火
  (function scheduleJolt(){
    const next = 2600 + Math.random()*5200; // 2.6〜7.8秒のどこか
    setTimeout(()=>{ joltOnce(document.querySelector(".browser.retro") || document.body); scheduleJolt(); }, next);
  })();

  // ===== ロード（遅→速） =====
  let p = 0, base = 120;
  (function tick(){
    p += (p < 40 ? 1 : (p < 80 ? 2 : 5));
    if (p > 100) p = 100;
    perEl.textContent = p + "%";
    if (p < 100){
      const d = Math.max(18, base * Math.pow(0.85, p/10));
      setTimeout(tick, d);
    } else {
      scrLoading.style.transition = "opacity .7s ease";
      scrLoading.style.opacity = "0";
      flashNoise(220);
      setTimeout(()=>{
        hide(scrLoading);
        show(scrName);
        setTimeout(()=>{
          hide(scrName);
          show(scrStory);
          flashNoise(180);
          startTypewriterParagraphs(storyTextRoot, storyParagraphs, 22)
            .then(()=> startHelpChant("story-text"));
        }, 2000);
      }, 720);
    }
  })();

  // ストーリー → 注意
  document.getElementById("btn-to-warning").addEventListener("click", ()=>{
    flashNoise(220);
    hide(scrStory);
    show(scrWarn);
    setTimeout(()=> microShake(document.querySelector("#screen-warning .center")), 280);
  });

  // 同意 → ロード → 一覧
  document.getElementById("btn-agree").addEventListener("click", ()=>{
    hide(scrWarn);
    show(scrRecLoad);
    let rp = 0;
    const t = setInterval(()=>{
      rp += (rp < 60 ? 4 : 8);
      if (rp > 100) rp = 100;
      recPer.textContent = rp + "%";
      if (rp >= 100){
        clearInterval(t);
        setTimeout(()=>{
          hide(scrRecLoad);
          show(scrRecords);
          flashNoise(220);
          // 一覧表示後に一度だけ自動更新
          setTimeout(triggerAutoUpdate, 1000 + Math.random()*1500);
        }, 180);
      }
    }, 90);
  });

  // 一覧 ←→ ストーリー
  document.getElementById("btn-back-story").addEventListener("click", ()=>{
    flashNoise(220);
    hide(scrRecords);
    show(scrStory);
  });

  // 詳細コンテンツ（mosaicフラグで注記表示）
  const detailMap = {
    "333": {
      title:"患者記録 No.333",
      mosaic:true,
      body:`
        <p><strong>患者名：</strong><span class="mosaic">████</span></p>
        <p><strong>診断名：</strong>B-33型《バーバラさん》接触症</p>
        <p><strong>症状：</strong>窓外に赤い日記帳を確認。悪寒・悪夢・記憶の断片化。</p>
        <p><strong>処方：</strong>顔を見ずに背中に乗せ、窓から外へ送る行為の継続。日記帳の破棄は禁止。</p>
      `
    },
    "444": {
      title:"患者記録 No.444",
      mosaic:false,
      body:`<p><strong>診断名：</strong>窓辺幻視症</p><p><strong>経過：</strong>夜間に窓外で赤い日記帳を持つ者を視認。以後睡眠障害が増悪。</p>`
    },
    "666": {
      title:"患者記録 No.666",
      mosaic:true,
      body:`<p><strong>診断名：</strong>呼称追跡性障害</p><p><strong>経過：</strong><span class="mosaic">名を呼ぶ声の出現</span>。記録保持者は赤い日記帳を最後に所持。</p>`
    },
    "777": {
      title:"患者記録 No.777",
      mosaic:false,
      body:`<p><strong>診断名：</strong>夜間接触症候群</p><p><strong>経過：</strong>窓を開けた際、背中に何かを感じ赤い日記が消失。体調急変。</p>`
    },
    "888": {
      title:"患者記録 No.888",
      mosaic:true,
      body:`<p><strong>診断名：</strong>視覚残像症</p><p><strong>経過：</strong><span class="mosaic">赤い日記帳の残像を複数回確認</span>。頭痛増悪。</p>`
    },
    "999": {
      title:"患者記録 No.999",
      mosaic:false,
      body:`<p><strong>診断名：</strong>急性幻視性不安</p><p><strong>経過：</strong>証言と記録の齟齬が多発。最後に赤い日記帳を所持。</p>`
    }
  };

  // モーダル開閉
  function openModal(){ modal.classList.add("open"); modal.setAttribute("aria-hidden","false"); }
  function closeModal(){ modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); }
  modalClose.addEventListener("click", closeModal);

  document.querySelectorAll(".open-detail").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-id");
      const d  = detailMap[id] || detailMap["333"];
      modalTitle.textContent = d.title;

      let injected = d.body;
      if (d.mosaic){
        injected += `<p class="garbled">※ 記録の一部が読み取り不能です。</p>`;
      }
      modalBody.innerHTML = injected;

      // オープン演出：ノイズ＋局所ジョルト＋微振動
      flashNoise(160);
      const inner = modal.querySelector(".modal-inner");
      inner.classList.add("glitch");
      setTimeout(()=> inner.classList.remove("glitch"), 260);
      microShake(inner);

      openModal();
    });
  });

  // ===== 段落タイプライター（ランダム速度＋スクロール追従＋末尾一文字回避） =====
  function typeOneParagraph(pEl, text, base=22){
    return new Promise(resolve=>{
      pEl.textContent = "";
      let i = 0;
      (function step(){
        if (i >= text.length){
          // 末尾一文字改行を避けるため、最後の2文字の間に「ワード結合子(Ｕ+2060)」を入れる
          try{
            const t = pEl.textContent;
            if (t.length > 2){
              pEl.textContent = t.slice(0, -2) + "\u2060" + t.slice(-2);
            }
          }catch(e){}
          resolve(); return;
        }
        pEl.textContent += text.charAt(i);
        i++;
        const jitter = Math.random()*14 - 7; // -7〜+7ms
        const delay  = Math.max(6, base + jitter);
        const scrollBox = document.getElementById("story-scroll");
        if (scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;
        setTimeout(step, delay);
      })();
    });
  }

  async function startTypewriterParagraphs(root, paragraphs, base=22){
    root.innerHTML = "";
    for (let idx=0; idx<paragraphs.length; idx++){
      const p = document.createElement("p");
      root.appendChild(p);
      await typeOneParagraph(p, paragraphs[idx], base);
    }
  }

  // “たすけて” 自動追記（勢い＆字間詰め）
  function startHelpChant(containerId="story-text"){
    const root = document.getElementById(containerId);
    const line = document.createElement("p");
    line.className = "help-chant";
    root.appendChild(line);
    setTimeout(()=> line.classList.add("show"), 10);

    let running = true;
    document.getElementById("btn-to-warning").addEventListener("click", ()=> running = false, { once:true });

    (function loop(){
      if(!running) return;
      // 1ループで複数回 たすけて を叩き込む
      const burst = 1 + Math.floor(Math.random()*3); // 1〜3個
      let chunk = "";
      for(let i=0;i<burst;i++){ chunk += (chunk ? "　" : "") + "たすけて"; }
      line.textContent += (line.textContent ? "　" : "") + chunk;

      const scrollBox = document.getElementById("story-scroll");
      if (scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;

      setTimeout(loop, 380 + Math.random()*420); // 速め
    })();
  }

  // 患者記録 自動更新（1回だけ）
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
