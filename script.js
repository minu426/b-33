document.addEventListener("DOMContentLoaded", () => {
    const pages = document.querySelectorAll(".page");
    const loadingPercent = document.querySelector(".loading-percent");
    const loadingScreen = document.getElementById("loading-screen");
    const noiseOverlay = document.querySelector(".noise-overlay");

    let percent = 0;
    let speed = 200;

    // ページ切り替え
    function switchPage(id) {
        pages.forEach(page => page.classList.remove("active"));
        document.getElementById(id).classList.add("active");
    }

    // ノイズ付きページ切り替え
    function pageTransition(targetId) {
        noiseOverlay.classList.add("active");
        setTimeout(() => {
            switchPage(targetId);
            noiseOverlay.classList.remove("active");
        }, 500);
    }

    // タイプライター演出
    function typeWriter(element, text, speed = 50, callback) {
        element.textContent = "";
        let i = 0;
        function typing() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typing, speed);
            } else if (callback) {
                callback();
            }
        }
        typing();
    }

    // ロード画面パーセント更新
    function updateLoading() {
        percent++;
        loadingPercent.textContent = percent + "%";

        if (percent < 100) {
            speed = Math.max(20, speed * 0.85);
            setTimeout(updateLoading, speed);
        } else {
            setTimeout(() => {
                // フェードアウト開始
                loadingScreen.classList.add("fade-out");
                document.body.style.overflow = "hidden"; // ロード中はスクロール禁止

                // フェード後にトランジションして発祥ストーリーへ
                setTimeout(() => {
                    document.body.style.overflow = "auto"; // スクロール解除
                    pageTransition("origin-story");

                    // 発祥ストーリーのタイプライター演出
                    const storyParagraph = document.querySelector("#origin-story p");
                    const originalText = storyParagraph.innerHTML.replace(/<br>/g, "\n");
                    typeWriter(storyParagraph, originalText, 30);
                }, 800); // フェード時間と合わせる
            }, 300);
        }
    }

    updateLoading();

    // ボタンの遷移イベント
    document.getElementById("to-warning").addEventListener("click", () => {
        pageTransition("warning");
    });

    document.getElementById("to-patients").addEventListener("click", () => {
        pageTransition("patients");
    });

    document.getElementById("back-to-story").addEventListener("click", () => {
        pageTransition("origin-story");
    });
});
