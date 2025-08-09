document.addEventListener("DOMContentLoaded", () => {
  // 各画面
  const scrEntry   = document.getElementById("screen-entry");
  const scrLoading = document.getElementById("screen-loading");
  const scrName    = document.getElementById("screen-name");
  const scrStory   = document.getElementById("screen-story");
  const scrWarn    = document.getElementById("screen-warning");
  const scrRecLoad = document.getElementById("screen-records-loading");
  const scrRecords = document.getElementById("screen-records");

  const noise      = document.getElementById("noise");

  // 入力
  const nickInput  = document.getElementById("nick-input");
  const btnStart   = document.getElementById("btn-start");
  const whoNameEl  = document.getElementById("who-name");
  let visitorName  = "来訪者";

  // ロード表示
  const perEl  = document.getElementById("load-per");
  const recPer = document.getElementById("rec-per");

  // 発祥テキスト
  const storyText  = document.getElementById("story-text");
  const chantText  = document.getElementById("chant-text");
  const btnWarning = document.getElementById("btn-to-warning");
  const btnAgree   = document.getElementById("btn-agree");

  // カルテ
  const recordsList = document.getElementById("records-list");

  // モーダル
  const modal       = document.getElementById("modal");
  const modalTitle  = document.getElementById("modal-title");
  const modalBody   = document.getElementById("modal-body");
  const modalClose  = document.getElementById("modal-close");

  // --------------------------------------------------
  // 画面切り替え
  function showScreen(screen) {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
    screen.classList.remove("hidden");
    screen.classList.add("active");
  }

  // --------------------------------------------------
  // ランダム「ガガガ」歪み
  function randomJolt() {
    const target = document.querySelector(".screen.active");
    if (!target) return;
    target.classList.add("jolt");
    setTimeout(() => target.classList.remove("jolt"), 250);
    const next = Math.random() * 5000 + 4000; // 4〜9秒
    setTimeout(randomJolt, next);
  }
  randomJolt();

  // --------------------------------------------------
  // 受付 → 名前保持
  btnStart.addEventListener("click", () => {
    const val = nickInput.value.trim();
    if (!val) {
      nickInput.classList.add("entry-error");
      setTimeout(()=>nickInput.classList.remove("entry-error"), 200);
      return;
    }
    visitorName = val;
    whoNameEl.textContent = visitorName;
    startFirstLoading();
  });

  function startFirstLoading(){
    showScreen(scrLoading);
    let per = 0;
    const timer = setInterval(()=>{
      per += Math.random()*10;
      if (per>=100) {
        clearInterval(timer);
        setTimeout(()=>{
          showScreen(scrName);
          setTimeout(()=> showScreen(scrStory), 2000);
          startStory();
        }, 600);
      }
      perEl.textContent = `${Math.floor(per)}%`;
    }, 150);
  }

  // --------------------------------------------------
  // 発祥テキスト & 「たすけて」連打
  const storyLines = [
    "―― 198X年、地方の療養施設で不可解な噂が広がり始めた。",
    "入院患者の一部が、夜になると『バーバラさん』の名をつぶやく。",
    "医療記録には存在しないその人物像は、日に日に輪郭を帯びていった。",
    "やがて…"
  ];

  function startStory(){
    storyText.innerHTML = "";
    let idx = 0;

    function typeLine(){
      if (idx < storyLines.length){
        const p = document.createElement("p");
        storyText.appendChild(p);
        typeWriter(p, storyLines[idx], () => {
          idx++;
          typeLine();
        });
      } else {
        setTimeout(startChant, 1200); // 間を空けてから「たすけて」開始
      }
    }
    typeLine();
  }

  function typeWriter(el, text, cb){
    let i = 0;
    const timer = setInterval(()=>{
      el.textContent += text.charAt(i);
      i++;
      if (i >= text.length){
        clearInterval(timer);
        if (cb) cb();
      }
    }, 70);
  }

  function startChant(){
    chantText.classList.add("show");
    let count = 0;
    const chantTimer = setInterval(()=>{
      chantText.textContent += "たすけて";
      count++;
      if (count>50) clearInterval(chantTimer);
    }, 80); // 間隔短く
  }

  btnWarning.addEventListener("click", ()=> showScreen(scrWarn));
  btnAgree.addEventListener("click", ()=> startRecordLoading());

  // --------------------------------------------------
  // カルテ読み込み
  function startRecordLoading(){
    showScreen(scrRecLoad);
    let per = 0;
    const timer = setInterval(()=>{
      per += Math.random()*8;
      if (per>=100) {
        clearInterval(timer);
        setTimeout(()=>{
          showScreen(scrRecords);
          loadRecords();
        }, 600);
      }
      recPer.textContent = `${Math.floor(per)}%`;
    }, 150);
  }

  // 仮カルテ
  const sampleRecords = [
    { name:"患者A", age:"34", note:"意味不明の単語を繰り返す。夜間に壁を叩く音あり。"},
    { name:"患者B", age:"28", note:"幻覚を訴える。視線が常に右上に固定される。"}
  ];

  function loadRecords(){
    recordsList.innerHTML = "";
    sampleRecords.forEach((rec, i)=>{
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <table class="karte">
          <tr><th>氏名</th><td>${rec.name}</td></tr>
          <tr><th>年齢</th><td>${rec.age}</td></tr>
          <tr><th>症状</th><td>${rec.note}</td></tr>
        </table>
      `;
      div.addEventListener("click", ()=> openModal(rec));
      recordsList.appendChild(div);
    });
  }

  // --------------------------------------------------
  // モーダル
  function openModal(data){
    modalTitle.textContent = `${data.name} の記録`;
    modalBody.textContent = data.note;
    modal.classList.add("open");
  }
  modalClose.addEventListener("click", ()=> modal.classList.remove("open"));
});
