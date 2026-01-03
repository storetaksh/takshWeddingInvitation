(function () {
    const oneDay = 24 * 60 * 60 * 1000;

    const countdownEl = document.getElementById("countdown");
    const labelEl = document.getElementById("countdown-label");

    function updateCountdown() {
        // Get wedding data
        const weddingData = window.weddingData;
        if (!weddingData) {
            countdownEl.innerHTML = "Loading...";
            return;
        }

        const eventDate = new Date(weddingData.wedding.date).getTime() - oneDay;
        const now = new Date().getTime();
        const diff = eventDate - now;

        // 🟢 EVENT IS TODAY
        if (diff <= 0 && diff > -oneDay) {
            countdownEl.classList.add("countdown-today");
            labelEl.innerText = "Together we celebrate";
            countdownEl.innerHTML = "✨ Today is the day ✨";
            return;
        }

        // ⚪ EVENT IS IN THE PAST
        if (diff <= -86400000) {
            countdownEl.classList.add("countdown-past");
            labelEl.innerText = "With blessings of the gods";
            countdownEl.innerHTML = "Forever begins here 💛";
            return;
        }

        // 🔵 EVENT IS IN FUTURE
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);

        labelEl.innerText = "The countdown begins";
        countdownEl.innerHTML = `
      <span class="cd-unit">${days}<small>D</small></span>
      <span class="cd-unit">${hours.toString().padStart(2, "0")}<small>H</small></span>
      <span class="cd-unit">${mins.toString().padStart(2, "0")}<small>M</small></span>
    `;
    }

    // Start countdown immediately
    updateCountdown();
    setInterval(updateCountdown, 60000); // update every minute
})();