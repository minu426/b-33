document.addEventListener("DOMContentLoaded", () => {
    const loadingText = document.getElementById("loading-text");
    const loadingScreen = document.getElementById("loading-screen");
    const storyContainer = document.getElementById("story-container");
    const storyText = document.getElementById("story-text");
    const openRecord = document.getElementById("open-record");
    const recordModal = document.getElementById("record-modal");
    const closeRecord = document.getElementById("close-record");
    const backToStory = document.getElementById("back-to-story");

    // ロード画面パーセント（遅→速）
    let percent = 0;
    function updateLoading() {
        loadingText.textContent = `${percent}%`;
        percent++;
        let delay = 100 - percent; // 徐々に速く
        if (percent <= 100) {
            setTimeout(updateLoading, Math.max(10, delay));
        } else {
            // ロード完了 → フェードアウト
            loadingScreen.classList.add("hidden");
            setTimeout(startStory, 2000); // 2秒後にストーリー開始
        }
    }
    updateLoading();

    // タイプライター
    function startStory() {
        storyContainer.classList.remove("hidden");
        const text = `彼女は赤い日記帳に日々の出来事を綴っていた。
少女の死後、その赤い日記帳は忽然と姿を消し、どこを探しても見つからなかった。
やがて、噂を聞いた者の家に見たことのない赤い日記帳が届くようになったが、決して開いてはならないと言われている。`;
        let i = 0;
        function type() {
            if (i < text.length) {
                storyText.textContent += text.charAt(i);
                i++;
                setTimeout(type, 80);
            }
        }
        type();
    }

    // モーダル制御
    openRecord.addEventListener("click", () => {
        recordModal.classList.remove("hidden");
    });
    closeRecord.addEventListener("click", () => {
        recordModal.classList.add("hidden");
    });
    backToStory.addEventListener("click", () => {
        recordModal.classList.add("hidden");
    });
});
