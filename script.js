document.addEventListener("DOMContentLoaded", () => {
    const pages = document.querySelectorAll(".page");
    const loadingPercent = document.querySelector(".loading-percent");

    let percent = 0;
    let speed = 200; // 最初は遅い

    function updateLoading() {
        percent++;
        loadingPercent.textContent = percent + "%";

        if (percent < 100) {
            speed = Math.max(20, speed * 0.85); // 徐々に加速
            setTimeout(updateLoading, speed);
        } else {
            setTimeout(() => {
                switchPage("origin-story");
            }, 300);
        }
    }

    updateLoading();

    function switchPage(id) {
        pages.forEach(page => page.classList.remove("active"));
        document.getElementById(id).classList.add("active");
    }

    function pageTransition(targetId) {
        const noiseOverlay = document.querySelector(".noise-overlay");
        noiseOverlay.classList.add("active");
        setTimeout(() => {
            switchPage(targetId);
            noiseOverlay.classList.remove("active");
        }, 500);
    }

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
