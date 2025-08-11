 document.addEventListener("DOMContentLoaded", () => {

  /* ---------- 要素参照 ---------- */
  const scrIntro   = document.getElementById("screen-intro");
  const scrEntry   = document.getElementById("screen-entry");
  const scrLoading = document.getElementById("screen-loading");
  const scrName    = document.getElementById("screen-name");
  const scrStory   = document.getElementById("screen-story");
  const scrWarn    = document.getElementById("screen-warning");
  const scrRecLoad = document.getElementById("screen-records-loading");
  const scrRecords = document.getElementById("screen-records");

  const nickInput  = document.getElementById("nick-input");
  const btnStart   = document.getElementById("btn-start");
  const whoNameEl  = document.getElementById("who-name");

  const perEl  = document.getElementById("load-per");
  const recPer = document.getElementById("rec-per");

  const storyText = document.getElementById("story-text");
  const btnWarning= document.getElementById("btn-to-warning");
  const btnAgree  = document.getElementById("btn-agree");
  const btnBack   = document.getElementById("btn-back-story");

  const winChant  = document.getElementById("win-chant");
  const chantWrap = document.getElementById("chant-scroll");
  const chantText = document.getElementById("chant-text");

  const recordsList = document.getElementById("records-list");

  const modal      = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalBody  = document.getElementById("modal-body");
  const modalClose = document.getElementById("modal-close");

  const vNoiseStory   = document.getElementById("v-noise-story");
  const vNoiseRecords = document.getElementById("v-noise-records");
  const seGlitch = document.getElementById("se-glitch");
  const seHum    = document.getElementById("se-hum");
  const seBtn    = document.getElementById("se-btn");

  let visitorName  = "来訪者";

  /* ---------- 画面切替 ---------- */
  function playBtn(){ try{ seBtn && seBtn.play().catch(()=>{});}catch{} }
  function glitch(){ try{ seGlitch && seGlitch.play().catch(()=>{});}catch{} }

  function showScreen(screen){
    document.querySelectorAll(".screen").forEach(s=>{
      s.classList.remove("active"); s.classList.add("hidden");
      s.classList.remove("global-break","rgb-split","screen-tear");
    });
    screen.classList.remove("hidden");
    screen.classList.add("active");
    // 画面ごとのノイズ映像再生調整
    if(screen===scrStory){ safePlay(vNoiseStory); safePause(vNoiseRecords); }
    else if(screen===scrRecords){ safePlay(vNoiseRecords); safePause(vNoiseStory); }
    else { safePause(vNoiseStory); safePause(vNoiseRecords); }
  }
  function safePlay(v){ if(!v) return; try{ v.currentTime=0; v.play().catch(()=>{}); }catch{} }
  function safePause(v){ if(!v) return; try{ v.pause(); }catch{} }

  // トランジション演出
  function transit(screen){
    const active = document.querySelector(".screen.active");
    if(active){ active.classList.add("global-break","screen-tear","rgb-split"); }
    glitch();
    setTimeout(()=> showScreen(screen), 240);
  }

  // ボタン押した感触
  document.body.addEventListener("pointerdown", e=>{
    const t=e.target.closest(".btn"); if(!t) return;
    playBtn();
    document.body.classList.add("dim");
    setTimeout(()=> document.body.classList.remove("dim"), 120);
  });

  /* ---------- イントロ → 受付 ---------- */
  // 読める長さ（約3.5秒）+ 余韻で 4.5秒
  setTimeout(()=>{
    transit(scrEntry);
    window.scrollTo({top:0,behavior:"auto"});
  }, 4500);

  /* ---------- 受付 → ロード → 見出し → 発祥 ---------- */
  btnStart.addEventListener("click", ()=>{
    const val = (nickInput.value||"").trim();
    if(!val){ nickInput.classList.add("shake"); setTimeout(()=>nickInput.classList.remove("shake"),220); return; }
    visitorName = val.slice(0,20);
    whoNameEl.textContent = visitorName;

    transit(scrLoading);
    startInitialLoading(()=>{
      transit(scrName);
      // 怪異名：遅延タイプ＋光り
      setTimeout(()=> {
        document.querySelector(".kaiki").classList.add("glow-burst");
      }, 400);
      // 少し待って発祥へ
      setTimeout(()=>{
        transit(scrStory);
        startStory();
      }, 1600);
      // 入力でズームした場合に戻す
      setTimeout(()=> window.scrollTo({top:0,behavior:"auto"}), 200);
    });
  });

  function startInitialLoading(done){
    let p=0;
    (function step(){
      p += (p<40?1:(p<80?2:5));
      if(p>100) p=100;
      perEl.textContent = p+"%";
      if(p<100) setTimeout(step, Math.max(18, 120*Math.pow(0.85,p/10)));
      else { setTimeout(done, 300); }
    })();
  }

  /* ---------- 発祥ストーリー本文（完成文→遅れてフェード） ---------- */

  const storyParagraphs = [
    `昔、とある少女が惨殺された。少女は<span class="blurword smeary">赤い日記帳</span>に、毎日を欠かさず記した。`,
    `少女の死後、その<span class="blurword smeary">赤い日記帳</span>は忽然と消えた。探しても、どこにもない。`,
    `やがて噂を聞いた家には、見覚えのない<span class="blurword smeary">赤い日記帳</span>が数日のうちに届くという。だがそれは、<span class="jitter blurword">開いてはならない</span>。`,
    `その夜、<span class="jitter blurword">バーバラさん</span>と呼ばれるものが現れる。顔を見てはならない。`,
    `扉を開け、背中にそれを乗せ、部屋の窓を開けて外へ送り出す。そうしなければならない。`,
    `もしも日記帳を開いたり、<span class="jitter blurword">バーバラさん</span>の顔を見てしまったなら、誰もその先を語らない。`,
    `それが惨殺された少女の成れの果てなのか、それとも犯人なのか──判別はつかない。`,
    `ただ、噂を聞いた者のもとへは必ず<span class="blurword smeary">赤い日記帳</span>が届く。<span class="jitter blurword">開いてはならない</span>。`
  ];

  function startStory(){
    storyText.innerHTML = "";
    storyParagraphs.forEach(t=>{
      const p=document.createElement("p");
      p.innerHTML = t;
      storyText.appendChild(p);
    });
    // 本文は少し遅れてフェード（CSS側 .fade-in-delay を利用）
    // 受信ログはさらに遅らせて出現＋タイプ
    setTimeout(()=>{
      winChant.classList.remove("hidden");
      // ここで一度だけ表示アニメ（CSS .fade-in-later）
      startChant();
    }, 2600);
  }

  // 受信ログ＝「絶対に見るな」をタイプ連打
  function typeText(el, text, speed=14){
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
    chantText.classList.add("show");
    let running = true;
    btnWarning.addEventListener("click", ()=> running=false, {once:true});
    (async function loop(){
      while(running){
        const burst = 1 + Math.floor(Math.random()*3);
        for(let i=0;i<burst;i++){ await typeText(chantText, "絶対に見るな", 12); }
        chantWrap.scrollTop = chantWrap.scrollHeight;
        await wait(320 + Math.random()*520);
      }
    })();
  }
  const wait = ms => new Promise(r=>setTimeout(r,ms));

  /* ---------- 注意 → カルテロード ---------- */
  btnWarning?.addEventListener("click", ()=>{
    transit(scrWarn);
  });

  btnAgree?.addEventListener("click", ()=>{
    transit(scrRecLoad);
    startRecordLoading();
  });

  function startRecordLoading(){
    let p=0;
    const t=setInterval(()=>{
      p += (p<60?4:8);
      if(p>100)p=100;
      recPer.textContent = p+"%";
      if(p>=100){
        clearInterval(t);
        setTimeout(()=>{
          transit(scrRecords);
          buildRecords();
          setTimeout(triggerAutoUpdate, 1000 + Math.random()*1200);
          setTimeout(slowCorruptRecords, 1500);
        }, 220);
      }
    }, 90);
  }

  btnBack?.addEventListener("click", ()=> transit(scrStory));

  /* ---------- カルテ生成 ---------- */
  const recordsData = [
    { no:"112", name:"<span class='mosaic'>██</span>",   diag:"B-33型《バーバラさん》接触症", sym:"頭痛、悪夢、窓の外の気配", prog:"日記が届いた夜に発症。窓から消失を確認。", mosaic:true },
    { no:"203", name:"██",                               diag:"窓辺幻視症",               sym:"吐き気、視線恐怖",         prog:"窓辺で赤い日記を確認後、睡眠障害が増悪。", mosaic:false },
    { no:"317", name:"<span class='mosaic'>███</span>",  diag:"接近過敏",                 sym:"首筋の寒気、肩圧迫感",     prog:"背部に重量感。窓を開けると軽減。", mosaic:true },
    { no:"666", name:"<span class='mosaic'>██</span>",   diag:"呼称追跡性障害",           sym:"名を呼ばれる幻聴、耳鳴り", prog:"呼称の翌日、窓に赤い日記を発見。", mosaic:true },
    { no:"742", name:"█",                               diag:"夜間接触症候群",           sym:"過度の不安、失神",         prog:"窓を開けた瞬間、背中に感触。以後、日記は行方不明。", mosaic:false },
    { no:"871", name:"<span class='mosaic'>████</span>", diag:"視覚残像症",               sym:"残像、光点",               prog:"複数回の残像確認。頭痛増悪。", mosaic:true },
    { no:"904", name:"██",                              diag:"急性幻視性不安",           sym:"視覚異常、記憶欠落",       prog:"証言と記録の齟齬が多発。最終所持者。", mosaic:false }
  ];

  function buildRecords(){
    recordsList.innerHTML = "";
    recordsData.forEach(rec=>{
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <table class="karte gothic">
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

  /* ---------- モーダル＆文字化け（常時ちょい混入＋詳細で強化） ---------- */
  let corruptTimer=null, corruptSession=[];
  function collectTextNodes(root){
    const out=[];
    const w=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode:(n)=>{
        if(!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        let p=n.parentElement;
        while(p){
          if(p.classList && (p.classList.contains('mosaic') || p.dataset.noCorrupt!==undefined)) return NodeFilter.FILTER_REJECT;
          p=p.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n; while((n=w.nextNode())) out.push(n);
    return out;
  }
  const GLITCH_SET="◆※#＠▓░╳■□△◎◢◣";
  const HOMO={"ー":"—","-":"－","・":"･","。":"｡","、":"､","口":"□","日":"■","〇":"○","○":"◯","人":"入","田":"亩","カ":"力","へ":"∧","ン":"ソ","テ":"ﾃ","タ":"ﾀ"};
  function corruptString(src, rate){
    let out=""; for(let i=0;i<src.length;i++){
      const ch=src[i]; if(/\s/.test(ch)){ out+=ch; continue; }
      if(Math.random()<rate){
        out += (Math.random()<0.4 && HOMO[ch]) ? HOMO[ch] :
          GLITCH_SET[Math.floor(Math.random()*GLITCH_SET.length)];
      }else out+=ch;
    } return out;
  }
  function applyCorruption(session,rate){ session.forEach(it=> it.node.nodeValue=corruptString(it.original,rate)); }
  function restoreCorruption(session){ session.forEach(it=> it.node.nodeValue=it.original); }

  function startModalCorruption(root,{startRate=.06,step=.05,maxRate=.45,periodMs=1000}={}){
    stopModalCorruption();
    corruptSession = collectTextNodes(root).map(n=>({node:n,original:n.nodeValue}));
    applyCorruption(corruptSession,startRate);
    corruptTimer=setInterval(()=>{
      startRate=Math.min(maxRate,startRate+step);
      applyCorruption(corruptSession,startRate);
      root.closest('.modal-inner')?.classList.add('rgb-split');
      setTimeout(()=> root.closest('.modal-inner')?.classList.remove('rgb-split'), 160);
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
      ${data.mosaic ? `<p class="smeary">※ 記録の一部が読み取り不能です。</p>` : ``}
    `;
    modal.classList.add("open"); modal.setAttribute("aria-hidden","false");
    glitch();
    startModalCorruption(modalBody);
  }
  modalClose.addEventListener("click", ()=>{
    stopModalCorruption();
    modal.classList.remove("open"); modal.setAttribute("aria-hidden","true");
  });

  /* ---------- 一覧のランダム腐食（常時） ---------- */
  function slowCorruptRecords(){
    const fields=document.querySelectorAll('#records-list .karte tr:last-child td');
    fields.forEach((td,i)=>{
      const nodes = collectTextNodes(td).map(n=>({node:n,original:n.nodeValue}));
      let t=0; setInterval(()=>{
        t++; const r = Math.min(0.18, 0.02 + 0.02*t);
        nodes.forEach(it=> it.node.nodeValue = corruptString(it.original, r));
      }, 4000 + i*1200);
    });
  }

  /* ---------- 自動更新 ---------- */
  let autoUpdatedOnce=false;
  function triggerAutoUpdate(){
    if(autoUpdatedOnce) return; autoUpdatedOnce=true;
    const cards=[...document.querySelectorAll("#records-list .card")];
    if(cards.length<=1) return;
    const target=cards[1 + Math.floor(Math.random()*(cards.length-1))];
    const tds=target.querySelectorAll("td"); if(!tds.length) return;
    const field=tds[tds.length-1];
    field.innerHTML = `状態悪化を確認。<span class="mosaic">赤い日記帳</span>の所在不明。<span class="badge-update">更新</span>`;
    target.classList.add("updated");
    glitch();
  }

  /* ---------- ランダムFXループ（ノイズ・ズレ・引き裂き） ---------- */
  (function randomFxLoop(){
    const active=document.querySelector('.screen.active');
    if(active){
      const c=Math.random();
      if (c < 0.35) active.classList.add('rgb-split');
      else if (c < 0.60) active.classList.add('screen-tear');
      else active.classList.add('jolt');
      setTimeout(()=> active.classList.remove('rgb-split','screen-tear','jolt'), 320);
    }
    setTimeout(randomFxLoop, 1600 + Math.random()*3200);
  })();

  /* ---------- モバイルSafari対策：入力後にスクロール戻す ---------- */
  nickInput.addEventListener("blur", ()=>{ setTimeout(()=>window.scrollTo({top:0,behavior:"auto"}), 50); });

});
   
