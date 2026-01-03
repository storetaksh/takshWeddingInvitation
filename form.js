document.querySelector(".rsvp-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const nameInput = this.querySelector('input[type="text"]');
    const attendanceSelect = this.querySelector("select");

    const name = nameInput.value.trim();
    const attendance = attendanceSelect.value;

    if (!name) {
        alert("Please enter your name.");
        return;
    }

    // Get wedding data
    const weddingData = window.weddingData;
    if (!weddingData) {
        alert("Unable to load wedding information. Please try again.");
        return;
    }

    const groomName = weddingData.couple.groom.name;
    const brideName = weddingData.couple.bride.name;

    let message = "";

    if (attendance === "yes") {
        message = `Hi ${groomName} & ${brideName}! I'm delighted to confirm my presence for your wedding celebrations.\nWarm regards,\n${name}`;
    } else {
        message = `Hi ${groomName} & ${brideName}! Thank you so much for the invitation. Unfortunately, I won't be able to attend the wedding.\nWith best wishes,\n${name}`;
    }

    const phoneNumber = weddingData.contact.whatsapp;
    const encodedMessage = encodeURIComponent(message);

    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappURL, "_blank");
});
