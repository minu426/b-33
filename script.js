document.addEventListener("DOMContentLoaded", () => {
  // 画面
  const scrLoading = document.getElementById("screen-loading");
  const scrName    = document.getElementById("screen-name");
  const scrStory   = document.getElementById("screen-story");
  const scrWarn    = document.getElementById("screen-warning");
  const scrRecLoad = document.getElementById("screen-records-loading");
  const scrRecords = document.getElementById("screen-records");
  const noise      = document.getElementById("noise");

  // パーセンテージ
  const perEl  = document.getElementById("load-per");
  const recPer = document.getElementById("rec-per");

  // タイプライター
  const storyTextEl = document.getElementById("story-text");
  const storyHTML = (
    "昔、とある少女が惨殺され、その少女は赤い日記帳に日々の出来事を綴っていた。<br><br>" +
    "少女の死後、その赤い日記帳は忽然と姿を消し、どこを探しても見つからなかった。<br><br>" +
    "やがて、噂を聞いた者の家に見たことのない赤い日記帳が届くようになったが、決して開いてはならないと言われている。<br><br>" +
    "その日記帳が届いた夜、バーバラさんと呼ばれる存在が現れる。<br><br>" +
    "バーバラさんの顔を見ず、扉を開けて背中に乗せ、部屋の窓を開けて外に送り出さなければならない。<br><br>" +
    "日記帳を開いたり、バーバラさんの顔を見てしまった者の運命や、バーバラさんの正体は謎に包まれている。<br><br>" +
    "彼女は惨殺された少女の成れの果てなのか、犯人なのか、誰にもわからない。"
  );

  // モーダル
  const modal        = document.getElementById("modal");
  const modalTitle   = document.getElementById("modal-title");
  const modalBody    = document.getElementById("modal-body");
  const modalClose   = document.getElementById("modal-close");
  const modalToStory = document.getElementById("modal-to-story");

  // ユーティリティ
  function show(el){ el.classList.remove("hidden"); el.classList.add("active"); }
  function hide(el){ el.classList.add("hidden"); el.classList.remove("active"); }
  function flashNoise(ms=260){ noise.classList.add("strong"); setTimeout(()=>noise.classList.remove("strong"), ms); }

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
          startTypewriterHTML(storyTextEl, storyHTML, 26);
        }, 2000); // 2秒
      }, 720);
    }
  })();

  // ストーリー → 注意
  document.getElementById("btn-to-warning").addEventListener("click", ()=>{
    flashNoise(220);
    hide(scrStory);
    show(scrWarn);
  });

  // 同意 → カルテロード → 一覧
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

  // 詳細モーダル（スムース開閉）
  function openModal(){ modal.classList.add("open"); modal.setAttribute("aria-hidden","false"); }
  function closeModal(){ modal.classList.remove("open"); modal.setAttribute("aria-hidden","true"); }

  const detailMap = {
    "333": { title:"患者記録 No.333", body:
      `<p><strong>患者名：</strong><span class="blacked">████</span></p>
       <p><strong>診断名：</strong>B-33型《バーバラさん》接触症</p>
       <p><strong>症状：</strong>窓外に赤い日記帳を確認。悪寒・悪夢・記憶の断片化。</p>
       <p><strong>処方：</strong>顔を見ずに背中に乗せ、窓から外へ送る行為の継続。日記帳の破棄は禁止。</p>
       <p><strong>備考：</strong><span class="marker">一部記録は検閲により非表示</span></p>`},
    "444": { title:"患者記録 No.444", body:
      `<p><strong>診断名：</strong>窓辺幻視症</p>
       <p><strong>経過：</strong>夜間に窓外で赤い日記帳を持つ者を視認。以後睡眠障害が増悪。</p>`},
    "666": { title:"患者記録 No.666", body:
      `<p><strong>診断名：</strong>呼称追跡性障害</p>
       <p><strong>経過：</strong>名を呼ぶ声の出現。記録保持者は赤い日記帳を最後に所持。</p>`},
    "777": { title:"患者記録 No.777", body:
      `<p><strong>診断名：</strong>夜間接触症候群</p>
       <p><strong>経過：</strong>窓を開けた際、背中に何かを感じ赤い日記が消失。体調急変。</p>`},
    "888": { title:"患者記録 No.888", body:
      `<p><strong>診断名：</strong>視覚残像症</p>
       <p><strong>経過：</strong>赤い日記帳の残像を複数回確認。頭痛増悪。</p>`},
    "999": { title:"患者記録 No.999", body:
      `<p><strong>診断名：</strong>急性幻視性不安</p>
       <p><strong>経過：</strong>証言と記録の齟齬が多発。最後に赤い日記帳を所持。</p>`}
  };

  // デリゲーションでもOKだが今回は個別取得
  document.querySelectorAll(".open-detail").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-id");
      const d  = detailMap[id] || detailMap["333"];
      modalTitle.textContent = d.title;
      const extra = Math.random()<0.6 ? `<p class="garbled">※ 記録の一部が読取不能です。</p>` : "";
      modalBody.innerHTML = d.body + extra;
      flashNoise(180);
      openModal();
    });
  });

  modalClose.addEventListener("click", closeModal);
  modalToStory.addEventListener("click", ()=>{
    closeModal();
    hide(scrRecords);
    show(scrStory);
  });

  // ========== タグを壊さないタイプライター（ランダム速度＋スクロール追従） ==========
  function startTypewriterHTML(target, html, base=26){
    target.innerHTML = "";
    let i = 0;
    const scrollBox = document.getElementById("story-scroll");
    (function step(){
      if (i >= html.length) return;
      if (html[i] === "<"){
        let j = i; while (j < html.length && html[j] !== ">") j++;
        target.innerHTML += html.slice(i, j+1);
        i = j+1;
      } else {
        target.innerHTML += html[i];
        i++;
      }
      if (scrollBox) scrollBox.scrollTop = scrollBox.scrollHeight;
      const jitter = Math.random()*14 - 7; // -7〜+7ms
      const delay  = Math.max(8, base + jitter);
      setTimeout(step, delay);
    })();
  }
});
