/* 全体の挙動スクリプト
   - 3つの段階ローディング（加速）
   - ロード→名前2秒→タイプライターでストーリー
   - 注意→同意→カルテロード→一覧
   - レコード詳細モーダル（黒塗り／モザイク／文字化け）
*/

document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.getElementById("loading-screen");
  const percentEl = document.getElementById("loading-percent");

  const nameScreen = document.getElementById("name-screen");
  const storyScreen = document.getElementById("story-screen");
  const storyTextEl = document.getElementById("story-text");

  const warningScreen = document.getElementById("warning-screen");
  const btnToWarning = document.getElementById("btn-to-warning");
  const btnAgree = document.getElementById("btn-agree");

  const recordsLoading = document.getElementById("records-loading");
  const recordsPercent = document.getElementById("records-percent");
  const recordsScreen = document.getElementById("records-screen");
  const noiseLayer = document.getElementById("noise-layer");

  const modal = document.getElementById("detail-modal");
  const detailBody = document.getElementById("detail-body");
  const detailNum = document.getElementById("detail-num");
  const modalClose = document.getElementById("modal-close");
  const modalReturn = document.getElementById("modal-return");

  // helper: show/hide
  function show(el){ el.classList.remove("hidden"); el.classList.add("active"); }
  function hide(el){ el.classList.add("hidden"); el.classList.remove("active"); }

  // ------- ロード（加速） -------
  let percent = 0;
  let baseDelay = 130; // 初期ゆっくり
  function updateLoading(){
    // 加速モデル：段階で刻む
    let inc = percent < 40 ? 1 : (percent < 80 ? 2 : 5);
    percent = Math.min(100, percent + inc);
    percentEl.textContent = percent + "%";

    if(percent < 100){
      // 少し変化のある遅延（短くして加速感）
      let nextDelay = Math.max(18, baseDelay * Math.pow(0.85, percent/10));
      setTimeout(updateLoading, nextDelay);
    } else {
      setTimeout(() => {
        // フェードアウト風 -> ノイズ強化 -> 名前画面 -> 2s -> ストーリー
        loadingScreen.style.transition = "opacity .7s ease";
        loadingScreen.style.opacity = "0";
        noiseLayer.classList.add("strong");
        document.body.style.overflow = "hidden";
        setTimeout(() => {
          loadingScreen.style.display = "none";
          noiseLayer.classList.remove("strong");
          // show name 2s
          nameScreen.classList.remove("hidden");
          setTimeout(() => {
            nameScreen.classList.add("hidden");
            startStorySequence();
            document.body.style.overflow = "auto";
          }, 2000); // ← 2秒でOK
        }, 800);
      }, 300);
    }
  }
  updateLoading();

  // ------- タイプライター（タグ対応） -------
  function typewriterHTML(targetEl, html, speed = 30, callback){
    // html中のタグ（<...>）を一塊として扱い、通常文字は1字ずつ追加する
    targetEl.innerHTML = "";
    let i = 0;
    const len = html.length;
    function step(){
      if(i >= len){
        if(callback) callback();
        return;
      }
      if(html[i] === "<"){
        // consume until '>'
        let j = i;
        while(j < len && html[j] !== ">") j++;
        let tag = html.slice(i, j+1);
        targetEl.innerHTML += tag;
        i = j+1;
        setTimeout(step, speed); // small pause after tag
      } else {
        // normal char
        // escape '<' already handled; append one char
        let ch = html.charAt(i);
        // if it's newline (\n) treat as <br> (but we use <br> in data-text)
        targetEl.innerHTML += ch;
        i++;
        setTimeout(step, speed);
      }
    }
    step();
  }

  // start story: show storyScreen and do typewriter using data-text
  function startStorySequence(){
    storyScreen.classList.remove("hidden");
    // get data-text (contains <br> tags)
    const fullHtml = storyTextEl.getAttribute("data-text");
    // run typewriter after slight delay, with a glitch flash at start
    flashNoise(150);
    setTimeout(() => {
      typewriterHTML(storyTextEl, fullHtml, 28, ()=>{ /* done */ });
    }, 400);
  }

  // noise flash for transition
  function flashNoise(ms=300){
    noiseLayer.classList.add("strong");
    setTimeout(()=>noiseLayer.classList.remove("strong"), ms);
  }

  // ------- ボタン遷移 -------
  btnToWarning.addEventListener("click", ()=> {
    flashNoise(220);
    setTimeout(()=> {
      storyScreen.classList.add("hidden");
      warningScreen.classList.remove("hidden");
    }, 260);
  });

  btnAgree.addEventListener("click", ()=> {
    // 小さなロードをはさんでカルテ一覧へ
    warningScreen.classList.add("hidden");
    recordsLoading.classList.remove("hidden");
    simulateRecordsLoad();
  });

  // records loading
  function simulateRecordsLoad(){
    let p = 0;
    recordsPercent.textContent = "0%";
    const t = setInterval(()=>{
      p += (p < 60 ? 4 : 8);
      if(p >= 100) p = 100;
      recordsPercent.textContent = p + "%";
      if(p >= 100){
        clearInterval(t);
        setTimeout(()=> {
          recordsLoading.classList.add("hidden");
          recordsScreen.classList.remove("hidden");
        }, 300);
      }
    }, 90);
  }

  // ------- レコード詳細モーダル（黒塗り・モザイク・文字化け） -------
  // sample details by id
  const details = {
    "333": {
      num:"No.333",
      body:`
        <p><strong>患者名：</strong><span class="blacked">████</span></p>
        <p><strong>診断名：</strong> B-33型《バーバラさん》接触症</p>
        <p><strong>症状：</strong> 窓外に赤い日記帳を確認。悪寒・悪夢・記憶の断片化。</p>
        <p><strong>処方：</strong> 顔を見ずに背中に乗せ窓から外へ送る行為の継続。日記帳の破棄は禁止。</p>
        <p><strong>備考：</strong> <span class="marker-black">一部記録は検閲により非表示</span></p>
      `
    },
    "444": {
      num:"No.444",
      body:`
        <p><strong>患者名：</strong><span class="blacked">██</span></p>
        <p><strong>診断名：</strong> 窓辺幻視症</p>
        <p><strong>経過：</strong> 夜間に窓外で赤い日記帳を持つ者を視認。以後睡眠障害が増悪。</p>
      `
    },
    "666": {
      num:"No.666",
      body:`
        <p><strong>患者名：</strong><span class="blacked">███</span></p>
        <p><strong>診断名：</strong> 呼称追跡性障害</p>
        <p><strong>経過：</strong> 名を呼ぶ声の出現。記録保持者は赤い日記帳を最後に所持。</p>
      `
    },
    "777": {
      num:"No.777",
      body:`
        <p><strong>患者名：</strong><span class="blacked">█</span></p>
        <p><strong>診断名：</strong> 夜間接触症候群</p>
        <p><strong>経過：</strong> 窓を開けた際、背中に何かを感じ赤い日記が消失。体調急変。</p>
      `
    },
    "999": {
      num:"No.999",
      body:`
        <p><strong>患者名：</strong><span class="blacked">██</span></p>
        <p><strong>診断名：</strong> 急性幻視性不安</p>
        <p><strong>経過：</strong> 記憶欠落、記録の矛盾が多発。最後に赤い日記帳所持。</p>
      `
    }
  };

  // open modal when clicking detail button
  document.querySelectorAll(".record-open").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = btn.getAttribute("data-id");
      openDetail(id);
    });
  });

  function openDetail(id){
    const d = details[id] || details["333"];
    detailNum.textContent = d.num;
    // inject and add garble / mosaic randomly for atmosphere
    let injected = d.body;
    // add occasional garble
    if(Math.random() < 0.6){
      injected += `<p class="garbled">※記録の一部が文字化けしています。</p>`;
    }
    detailBody.innerHTML = injected;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden","false");
  }

  modalClose && modalClose.addEventListener("click", ()=> {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden","true");
  });

  modalReturn && modalReturn.addEventListener("click", ()=> {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden","true");
    // go back to story
    recordsScreen.classList.add("hidden");
    storyScreen.classList.remove("hidden");
  });

  // back button in records
  document.getElementById("btn-back-to-story").addEventListener("click", ()=>{
    flashAndShow(storyScreen, recordsScreen);
  });

  // helper to flash noise then show/hide
  function flashAndShow(showEl, hideEl){
    noiseLayer.classList.add("strong");
    setTimeout(()=>{
      if(hideEl) hideEl.classList.add("hidden");
      showEl.classList.remove("hidden");
      noiseLayer.classList.remove("strong");
    }, 260);
  }

}); // DOMContentLoaded end
