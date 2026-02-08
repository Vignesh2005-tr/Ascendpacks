const form = document.getElementById("Customer");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const agree = document.getElementById("agree");
const paymentConfirm = document.getElementById("paymentConfirm");
const method = document.getElementById("method");
const utr = document.getElementById("utr");
const upiSection = document.getElementById("upiSection");

let cooldownRunning = false;
let price = new URLSearchParams(window.location.search).get("price") || "0";

document.getElementById("amountDisplay").textContent = "Amount: ₹" + price;

/* METHOD CHANGE */
method.addEventListener("change", () => {
    upiSection.style.display = method.value === "UPI" ? "block" : "none";
});

/* SUBMIT ENABLE */
function checkSubmit() {
    submitBtn.disabled = !(
        agree.checked &&
        paymentConfirm.checked &&
        utr.value.length >= 12
    );
}

agree.onchange = checkSubmit;
paymentConfirm.onchange = checkSubmit;
utr.oninput = checkSubmit;

/* PAYMENT MODAL */
function openPaymentModal() {
    document.getElementById("paymentModal").style.display = "block";
    generateQR(price);
}

function closePaymentModal() {
    document.getElementById("paymentModal").style.display = "none";
}

function generateQR(amount) {
    const qr = document.getElementById("qrCode");
    qr.innerHTML = "";
    const img = document.createElement("img");
    img.src =
      "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
      encodeURIComponent(`upi://pay?pa=gajaraj1628@okhdfcbank&am=${amount}&cu=INR`);
    qr.appendChild(img);
}

/* COOLDOWN */
function startCooldown() {
    cooldownRunning = true;
    let t = 30;
    submitBtn.disabled = true;
    resetBtn.disabled = true;

    const cd = document.getElementById("cooldownMsg");
    const timer = setInterval(() => {
        cd.textContent = `Cooldown: ${t}s`;
        t--;
        if (t < 0) {
            clearInterval(timer);
            cd.textContent = "";
            cooldownRunning = false;
            resetBtn.disabled = false;
        }
    }, 1000);
}

/* SUBMIT */
form.addEventListener("submit", e => {
    e.preventDefault();
    if (cooldownRunning) return;

    if (!/^[0-9]{12,18}$/.test(utr.value)) {
        document.getElementById("errorMsg").textContent = "Invalid UTR";
        return;
    }

    const file = document.querySelector('[name="payment_proof"]').files[0];
    const payload = {
        username: "ASCEND STORE",
        embeds: [{
            title: "New Purchase",
            fields: [
                { name: "IC Name", value: form.pname.value },
                { name: "Amount", value: "₹" + price },
                { name: "UTR", value: utr.value }
            ]
        }]
    };

    const data = new FormData();
    data.append("payload_json", JSON.stringify(payload));
    data.append("file", file);

    fetch("YOUR_DISCORD_WEBHOOK", { method: "POST", body: data })
    .then(() => {
        document.getElementById("successMsg").textContent = "Sent successfully!";
        startCooldown();
        form.reset();
    });
});
