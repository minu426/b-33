document.addEventListener('DOMContentLoaded', () => {
  const scrEntry   = document.getElementById('screen-entry');
  const scrLoading = document.getElementById('screen-loading');
  const scrStory   = document.getElementById('screen-story');

  const inputName  = document.getElementById('entry-name');
  const btnEntry   = document.getElementById('btn-entry');
  const perEl      = document.getElementById('load-per');
  const whoNameEl  = document.getElementById('player-name-display');

  let visitorName  = '来訪者';

  // 画面切替の基本
  function showScreen(target){
    document.querySelectorAll('.screen').forEach(s=>{
      s.classList.remove('active'); s.classList.add('hidden'); // hiddenはCSSで使ってないが保険
    });
    target.classList.remove('hidden'); target.classList.add('active');
  }

  // 受付 → ロード
  btnEntry.addEventListener('click', ()=>{
    const val = (inputName.value||'').trim();
    if(!val){
      // ちょい震え演出（CSSなしでも動く簡易版）
      inputName.style.transform='translateX(2px)'; setTimeout(()=>inputName.style.transform='',150);
      return;
    }
    visitorName = val.slice(0,20);
    whoNameEl.textContent = visitorName;

    showScreen(scrLoading);
    startLoading(()=>{
      // ロード完了 → ストーリー
      showScreen(scrStory);
      // タイトルウィンドウのフェードアップ
      requestAnimationFrame(()=>{
        const box = scrStory.querySelector('.fade-up');
        if(box) box.classList.add('show');
      });
    });
  });

  // ローディング（序盤遅く→終盤早く）
  function startLoading(done){
    let p = 0;
    function step(){
      p += (p<40?1:(p<80?2:5));
      if(p>100) p=100;
      perEl.textContent = p + '%';
      if(p<100){
        setTimeout(step, Math.max(20, 120*Math.pow(0.86, p/10)));
      }else{
        // ちょっと間を置いてから切替
        setTimeout(()=> done && done(), 350);
      }
    }
    step();
  }
});
