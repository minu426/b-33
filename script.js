document.addEventListener("DOMContentLoaded", () => {
    const pages = document.querySelectorAll(".page");
    const loadingPercent = document.querySelector(".loading-percent");

    let percent = 0;

    // ローディングアニメーション
    const loadingInterval = setInterval(() => {
        percent++;
        loadingPercent.textContent = percent + "%";

        if (percent >= 100) {
            clearInterval(loadingInterval);
            switchPage("origin-story"); // ローディング完了後、発祥ストーリーへ
        }
    }, 30); // 3秒くらいで100%

    // ページ切り替え関数
    function switchPage(id) {
        pages.forEach(page => page.classList.remove("active"));
        document.getElementById(id).classList.add("active");
    }

    // ボタン操作
    document.getElementById("to-warning").addEventListener("click", () => {
        switchPage("warning");
    });

    document.getElementById("to-patients").addEventListener("click", () => {
        switchPage("patients");
    });

    document.getElementById("back-to-story").addEventListener("click", () => {
        switchPage("origin-story");
    });
});
