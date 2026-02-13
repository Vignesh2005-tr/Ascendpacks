const checkbox = document.getElementById("agree");
const submitBtn = document.getElementById("submitBtn");
const form = document.getElementById("Customer");

// 1. AUTO-LOAD DATA FROM CATALOG
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedPrice = urlParams.get('price');
    const selectedVehicle = urlParams.get('vehicle');

    if (selectedPrice) document.getElementById("price").value = selectedPrice;
    if (selectedVehicle) {
        document.getElementById("item").value = selectedVehicle;
        document.getElementById("itemDisplay").textContent = selectedVehicle + " (₹" + selectedPrice + ")";
    }
};

// 2. VALIDATION (Only need to agree to rules now)
checkbox.addEventListener("change", function() {
    submitBtn.disabled = !checkbox.checked;
});

// 3. SUBMIT TO DISCORD
form.addEventListener("submit", function (e) {
    e.preventDefault();

    submitBtn.value = "Sending...";
    submitBtn.disabled = true;

    const itemValue = document.getElementById("item").value || "General Request";
    const priceValue = document.getElementById("price").value || "N/A";

    const payload = {
        username: "ASCEND REQUEST BOT",
        content: "📩 **NEW ORDER REQUEST** <@&1461606860372316377>",
        embeds: [{
            title: "Item Request Details",
            color: 0xff00ff,
            fields: [
                { name: "👤 IC Name", value: form.pname.value, inline: true },
                { name: "🆔 Discord", value: form.dname.value, inline: true },
                { name: "📦 Requested Pack", value: itemValue, inline: true },
                { name: "💰 Price to Pay", value: "₹" + priceValue, inline: true },
                { name: "📝 Status", value: "Waiting for Staff Contact", inline: false }
            ],
            footer: { text: "ASCEND ROLEPLAY" },
            timestamp: new Date().toISOString()
        }]
    };

    const WEBHOOK_URLS = [
        "https://discord.com/api/webhooks/1469756792908152883/bYlDZ5hHPPDeN_wdd1HLOCUqSGeXPC-PWNyJHOIv_zEiA99tXEzCMDWRA46Cc24NEdKH",
        "https://discord.com/api/webhooks/1470090123080106156/3AqTyeYpozL26bebIpjkgaFaXXtvl2JI2hMyjx34FzLr7k_vMimCexkmY4h4ClutJZvB"
    ];

    // Simple fetch (no FormData needed as there is no file upload)
    Promise.all(WEBHOOK_URLS.map(url => 
        fetch(url, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload) 
        })
    ))
    .then(() => {
        alert("✅ Request sent! Please wait for staff to message you on Discord.");
        form.reset();
        window.location.href = "index.html";
    })
    .catch(() => {
        alert("❌ Error sending request.");
        submitBtn.disabled = false;
    });
});
