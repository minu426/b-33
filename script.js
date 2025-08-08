JS

document.addEventListener("DOMContentLoaded", () => {
    const pages = document.querySelectorAll(".page");
    const loadingPercent = document.querySelector(".loading-percent");
    const loadingScreen = document.getElementById("loading-screen");

    let percent = 0;
    let speed = 200; // 最初は遅い

    // ページ切り替え共通関数
    function switchPage(id) {
        pages.forEach(page => page.classList.remove("active"));
        document.getElementById(id).classList.add("active");
    }

    // ノイズ付きページ切り替え
    function pageTransition(targetId) {
        const noiseOverlay = document.querySelector(".noise-overlay");
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
            speed = Math.max(20, speed * 0.85); // 徐々に加速
            setTimeout(updateLoading, speed);
        } else {
            setTimeout(() => {
                switchPage("origin-story");

                // 発祥ストーリー画面のテキストにタイプライター演出
                const storyParagraph = document.querySelector("#origin-story p");
                const originalText = storyParagraph.innerHTML.replace(/<br>/g, "\n");
                typeWriter(storyParagraph, originalText, 30);
            }, 300);
        }
    }

    updateLoading(); // ロード開始

    // 発祥ストーリー → 注意事項
    document.getElementById("to-warning").addEventListener("click", () => {
        pageTransition("warning");
    });

    // 注意事項 → カルテ
    document.getElementById("to-patients").addEventListener("click", () => {
        pageTransition("patients");
    });

    // カルテ → 発祥ストーリー
    document.getElementById("back-to-story").addEventListener("click", () => {
        pageTransition("origin-story");
    });

    // 発祥ストーリー画面の歪み演出
    const originStory = document.getElementById("origin-story");
    originStory.addEventListener("mouseenter", () => {
        originStory.style.filter = "url('#glitch')";
    });
    originStory.addEventListener("mouseleave", () => {
        originStory.style.filter = "none";
    });
});
