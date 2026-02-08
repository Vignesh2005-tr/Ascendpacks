<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Ascend Payment</title>
  <style>
    #paymentModal {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.6);
      justify-content: center;
      align-items: center;
    }
    #paymentModal .modal-content {
      background: #111;
      color: #fff;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
  </style>
</head>
<body>

<form id="Customer">
  <label>Price:
    <input type="text" id="price" name="price" value="40">
  </label>
  <p id="amountDisplay">Amount: ₹40</p>

  <label><input type="checkbox" id="agree"> I agree</label><br>
  <label><input type="checkbox" id="paymentConfirm"> Payment Confirmed</label><br>
  <input type="text" id="utr" placeholder="Enter UTR / Transaction ID"><br>
  <input type="file" name="payment_proof"><br>

  <select id="method" name="method">
    <option value="">--Select Method--</option>
    <option value="UPI">UPI</option>
    <option value="GPay">GPay</option>
  </select><br><br>

  <button type="button" id="openPaymentBtn">🛒 Open UPI Payment</button>
  <button type="button" onclick="closePaymentModal()">✖ Close</button>
  <button type="submit" id="submitBtn" disabled>Submit</button>
</form>

<!-- Modal -->
<div id="paymentModal">
  <div class="modal-content">
    <h2>ASCEND PAYMENT</h2>
    <p>Total Amount: <span id="modalAmount">₹0</span></p>
    <div id="qrCode"></div>
  </div>
</div>

<p id="successMsg" style="color:lime"></p>
<p id="errorMsg" style="color:red"></p>
<p id="cooldownMsg" style="color:orange"></p>

<script>
/* =========================
   ASCEND STORE – PAYMENT JS
========================= */

const checkbox = document.getElementById("agree");
const submitBtn = document.getElementById("submitBtn");
const form = document.getElementById("Customer");
const paymentConfirm = document.getElementById("paymentConfirm");
const amountDisplay = document.getElementById("amountDisplay");

/* BUY NOTICE */
function showBuyNotice() {
    alert("✅ Please check Discord for further instructions!\n\nYour request will be verified by our admin team.");
}

/* PAYMENT MODAL */
function openPaymentModal() {
    const priceField = document.getElementById("price");
    const amount = priceField ? priceField.value : "0";

    if (!amount || amount === "0") {
        alert("⚠️ Please select a valid amount first");
        return;
    }

    document.getElementById("modalAmount").textContent = "₹" + amount;
    generateQRCode(amount);
    document.getElementById("paymentModal").style.display = "flex";
}

function closePaymentModal() {
    document.getElementById("paymentModal").style.display = "none";
}

/* QR GENERATION */
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

/* SUBMIT ENABLE CHECK */
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

/* AMOUNT DISPLAY */
function updateAmountDisplay() {
    const priceField = document.getElementById("price");
    const amount = priceField ? priceField.value : "0";
    amountDisplay.textContent = `Amount: ₹${amount}`;
}
updateAmountDisplay();

/* FORM SUBMIT */
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

    if (!/^[0-9]{12,18}$/.test(utr)) {
        showMessage('error', '⚠️ Please enter a valid 12–18 digit UTR / Transaction ID');
        return;
    }

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

    const payload = {
        content: "<@&1461606860372316377> <@&1461606866810437702>",
        username: "ASCEND STORE",
        embeds: [{
            title: "🛒 New Purchase Request",
            color: 8311585,
            fields: [
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

    const WEBHOOK_URL = "YOUR_DISCORD_WEBHOOK_URL";

    fetch(WEBHOOK_URL, { method: "POST", body: formData })
        .then(res => {
            if (!res.ok) throw new Error("Webhook failed");
            showMessage('success', '✅ Request sent successfully! Admin will verify your payment soon.');
            startCooldown();
            form.reset();
            submitBtn.disabled = true;
        })
        .catch(err => {
            showMessage('error', '❌ Error sending request. Please try again later.');
            console.error(err);
        });
});

/* WIRE BUTTON */
document.getElementById("openPaymentBtn").addEventListener("click", openPaymentModal);
</script>
</body>
</html>
