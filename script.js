document.addEventListener("DOMContentLoaded", () => {
    let percent = 0;
    const percentElem = document.getElementById("loading-percent");
    const loadingScreen = document.getElementById("loading-screen");
    const nameScreen = document.getElementById("kaijin-name-screen");
    const storyScreen = document.getElementById("story-screen");

    function updatePercent() {
        let increment = percent < 50 ? 1 : (percent < 80 ? 2 : 5);
        percent += increment;
        if (percent > 100) percent = 100;
        percentElem.textContent = percent + "%";

        if (percent < 100) {
            setTimeout(updatePercent, 100);
        } else {
            setTimeout(() => {
                loadingScreen.style.display = "none";
                nameScreen.classList.remove("hidden");
                setTimeout(() => {
                    nameScreen.classList.add("hidden");
                    storyScreen.classList.remove("hidden");
                    startTypewriter();
                }, 2000);
            }, 500);
        }
    }
    updatePercent();
});

function startTypewriter() {
    const element = document.querySelector(".typewriter");
    const text = element.innerHTML;
    element.innerHTML = "";
    let i = 0;

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, 50);
        }
    }
    type();
}

function showWarning() {
    document.getElementById("story-screen").classList.add("hidden");
    document.getElementById("warning-screen").classList.remove("hidden");
}

function showRecords() {
    document.getElementById("warning-screen").classList.add("hidden");
    document.getElementById("records-screen").classList.remove("hidden");
}

function showStory() {
    document.getElementById("records-screen").classList.add("hidden");
    document.getElementById("story-screen").classList.remove("hidden");
}
