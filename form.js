/* =========================
   ASCEND STORE – PAYMENT JS
   BEST OPTION: UTR VERIFY
========================= */

const checkbox = document.getElementById("agree");
const submitBtn = document.getElementById("submitBtn");
const form = document.getElementById("Customer");
const paymentConfirm = document.getElementById("paymentConfirm");
const amountDisplay = document.getElementById("amountDisplay");

/* =========================
   BUY NOTICE
========================= */
function showBuyNotice() {
    alert("✅ Please check Discord for further instructions!\n\nYour request will be verified by our admin team.");
}

/* =========================
   PAYMENT MODAL
========================= */
function openPaymentModal() {
    const priceField = document.getElementById("price");
    const amount = priceField ? priceField.value : "0";

    if (!amount || amount === "0") {
        alert("⚠️ Please select a valid amount first");
        return;
    }

    document.getElementById("modalAmount").textContent = "₹" + amount;
    document.getElementById("modalAmountNum").textContent = amount;

    generateQRCode(amount);
    document.getElementById("paymentModal").style.display = "flex";
}

function closePaymentModal() {
    document.getElementById("paymentModal").style.display = "none";
}

/* =========================
   QR GENERATION
========================= */
function generateQRCode(amount) {
    const upiID = "gajaraj1628@okhdfcbank";
    const qrContainer = document.getElementById("qrCode");
    qrContainer.innerHTML = "";

    const upiString = `upi://pay?pa=${upiID}&pn=ASCEND&am=${amount}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;

    const img = document.createElement("img");
    img.src = qrUrl;
    img.alt = "UPI QR";
    img.style.maxWidth = "200px";
    qrContainer.appendChild(img);
}

/* =========================
   SUBMIT ENABLE CHECK
========================= */
function checkSubmitConditions() {
    const utrField = document.getElementById("utr");
    const utrFilled = utrField && utrField.value.trim().length > 0;

    submitBtn.disabled = !(
        checkbox.checked &&
        paymentConfirm.checked &&
        utrFilled
    );
}

checkbox.addEventListener("change", checkSubmitConditions);
paymentConfirm.addEventListener("change", checkSubmitConditions);

/* =========================
   AMOUNT DISPLAY
========================= */
function updateAmountDisplay() {
    const priceField = document.getElementById("price");
    const amount = priceField ? priceField.value : "0";
    amountDisplay.textContent = `Amount: ₹${amount}`;
}

/* =========================
   URL PARAMS
========================= */
const params = new URLSearchParams(window.location.search);
const vehicle = params.get("vehicle");
const pack = params.get("pack");
const price = params.get("price");

function ensureHiddenField(id, value) {
    let field = document.getElementById(id);
    if (!field) {
        field = document.createElement("input");
        field.type = "hidden";
        field.id = id;
        field.name = id;
        form.appendChild(field);
    }
    field.value = value;
}

if (vehicle) ensureHiddenField("item", vehicle);
if (pack) ensureHiddenField("item", pack);
ensureHiddenField("price", price || "0");
updateAmountDisplay();

/* =========================
   FORM SUBMIT
========================= */
let cooldown = 30;
let cooldownRunning = false;

function showMessage(type, text) {
    const success = document.getElementById('successMsg');
    const error = document.getElementById('errorMsg');
    if (type === 'success') {
        success.textContent = text;
        error.textContent = '';
    } else if (type === 'error') {
        error.textContent = text;
        success.textContent = '';
    }
}

function startCooldown() {
    cooldownRunning = true;
    let timeLeft = cooldown;
    const cd = document.getElementById('cooldownMsg');
    submitBtn.disabled = true;

    cd.textContent = `Cooldown: ${timeLeft}s`;
    const timer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(timer);
            cd.textContent = '';
            submitBtn.disabled = false;
            cooldownRunning = false;
        } else {
            cd.textContent = `Cooldown: ${timeLeft}s`;
        }
    }, 1000);
}

form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Clear messages
    showMessage('success', '');
    showMessage('error', '');

    if (cooldownRunning) {
        showMessage('error', 'Please wait before submitting again.');
        return;
    }

    const method = document.getElementById('method')?.value || '';
    if (!method) {
        showMessage('error', 'Please select a payment method.');
        return;
    }

    const item = document.getElementById("item")?.value || "Not specified";
    const amount = document.getElementById("price")?.value || "0";
    const utr = document.getElementById("utr").value.trim();
    const fileInput = document.querySelector('input[name="payment_proof"]');

    /* UTR VALIDATION */
    if (!/^[0-9]{12,18}$/.test(utr)) {
        showMessage('error', '⚠️ Please enter a valid 12–18 digit UTR / Transaction ID');
        return;
    }

    /* FILE VALIDATION */
    if (!fileInput.files || fileInput.files.length === 0) {
        showMessage('error', '⚠️ Please upload payment proof');
        return;
    }

    const file = fileInput.files[0];
    const ext = file.name.split(".").pop().toUpperCase();
    const allowed = ["PNG", "JPG", "JPEG", "GIF", "WEBP"];

    if (!allowed.includes(ext)) {
        showMessage('error', '❌ Invalid file format! Allowed: PNG, JPG, JPEG, GIF, WEBP');
        return;
    }

    /* DISCORD PAYLOAD */
    const payload = {
        content: "<@&1461606860372316377> <@&1461606866810437702>",
        username: "ASCEND STORE",
        embeds: [{
            title: "🛒 New Purchase Request",
            color: 8311585,
            fields: [
                { name: "IC Name", value: form.pname.value, inline: true },
                { name: "Discord", value: form.dname.value, inline: true },
                { name: "GPay Name", value: form.gpay_name.value, inline: true },
                { name: "Item", value: item, inline: true },
                { name: "Amount", value: "₹" + amount, inline: true },
                { name: "Payment Method", value: method, inline: true },
                { name: "🔑 UTR / Transaction ID", value: utr, inline: false },
                { name: "💳 Payment Status", value: "⏳ Pending Admin Verification", inline: true }
            ],
            footer: { text: "ASCEND ROLEPLAY" },
            timestamp: new Date().toISOString()
        }]
    };

    const formData = new FormData();
    formData.append("payload_json", JSON.stringify(payload));
    formData.append("file", file);

    const WEBHOOK_URL = "https://discord.com/api/webhooks/1469756792908152883/bYlDZ5hHPPDeN_wdd1HLOCUqSGeXPC-PWNyJHOIv_zEiA99tXEzCMDWRA46Cc24NEdKH";

    fetch(WEBHOOK_URL, { method: "POST", body: formData })
        .then(res => {
            if (!res.ok) throw new Error("Webhook failed");
            showMessage('success', '✅ Request sent successfully! Admin will verify your payment soon.');
            startCooldown();
            // show success modal / thank you
            showSuccessScreen();
            form.reset();
            submitBtn.disabled = true;
        })
        .catch(err => {
            showMessage('error', '❌ Error sending request. Please try again later.');
            console.error(err);
        });
});
