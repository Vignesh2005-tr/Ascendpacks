const checkbox = document.getElementById("agree");
const submitBtn = document.getElementById("submitBtn");
const form = document.getElementById("Customer");
const paymentConfirm = document.getElementById("paymentConfirm");
const amountDisplay = document.getElementById("amountDisplay");

/* ================= BUY NOTICE ================= */

function showBuyNotice() {
    alert("✅ Please check Discord for further instructions!\n\nYour request will be processed by our team.");
}

/* ================= PAYMENT MODAL ================= */

function openPaymentModal() {
    const priceField = document.getElementById("price");
    const amount = priceField ? priceField.value : "0";

    if (amount === "0" || amount === "") {
        alert("⚠️ Please select a valid amount first");
        return;
    }

    const modal = document.getElementById("paymentModal");
    const modalAmount = document.getElementById("modalAmount");
    const modalAmountNum = document.getElementById("modalAmountNum");

    modalAmount.textContent = "₹" + amount;
    modalAmountNum.textContent = amount;

    generateQRCode(amount);
    modal.style.display = "flex";
}

function closePaymentModal() {
    document.getElementById("paymentModal").style.display = "none";
}

/* ================= QR CODE ================= */

function generateQRCode(amount) {
    const upiID = "gajaraj1628@okhdfcbank";
    const qrContainer = document.getElementById("qrCode");

    qrContainer.innerHTML = "";

    const upiString = `upi://pay?pa=${upiID}&pn=ASCEND&am=${amount}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;

    const img = document.createElement("img");
    img.src = qrUrl;
    img.style.maxWidth = "200px";
    img.alt = "UPI QR Code";

    qrContainer.appendChild(img);
}

/* ================= GPAY ================= */

function initiateGpayPayment() {
    const priceField = document.getElementById("price");
    const amount = priceField ? priceField.value : "0";

    if (amount === "0" || amount === "") {
        alert("⚠️ Please select a valid amount first");
        return;
    }

    const upiID = "gajaraj1628@okhdfcbank";
    const payeeName = "ASCEND STORE";
    const upiLink = `upi://pay?pa=${upiID}&pn=${payeeName}&am=${amount}`;

    window.location.href = upiLink;

    setTimeout(() => {
        const paymentDone = confirm("✅ Payment Successful?\n\nClick OK to confirm.");
        if (paymentDone) {
            paymentConfirm.checked = true;
            checkbox.checked = true;
            checkSubmitConditions();
            showSuccessScreen();
        }
    }, 3000);

    closePaymentModal();
}

/* ================= SUCCESS SCREEN ================= */

function showSuccessScreen() {
    const itemField = document.getElementById("item");
    const itemName = itemField ? itemField.value : "Pack";

    alert("✅ SUCCESSFUL PURCHASE\n\nPack: " + itemName + "\n\nNow click Submit to send request.");
}

/* ================= ENABLE SUBMIT ================= */

function checkSubmitConditions() {
    submitBtn.disabled = !(checkbox.checked && paymentConfirm.checked);
}

checkbox.addEventListener("change", checkSubmitConditions);
paymentConfirm.addEventListener("change", checkSubmitConditions);

/* ================= URL PARAMS ================= */

const params = new URLSearchParams(window.location.search);
const vehicle = params.get("vehicle");
const pack = params.get("pack");
const price = params.get("price");

function ensurePriceField(priceValue) {
    let priceField = document.getElementById("price");
    if (!priceField) {
        priceField = document.createElement("input");
        priceField.type = "hidden";
        priceField.id = "price";
        form.appendChild(priceField);
    }
    priceField.value = priceValue;
    return priceField;
}

if (vehicle || pack) {
    let itemField = document.getElementById("item");
    if (!itemField) {
        itemField = document.createElement("input");
        itemField.type = "hidden";
        itemField.id = "item";
        form.appendChild(itemField);
    }
    itemField.value = vehicle || pack;
}

ensurePriceField(price || "0");

/* ================= SUBMIT TO DISCORD ================= */

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const itemValue = document.getElementById("item")?.value || "Not specified";
    const priceValue = document.getElementById("price")?.value || "Not specified";
    const fileInput = document.querySelector('input[name="payment_proof"]');

    if (!fileInput.files.length) {
        alert("⚠️ Please upload payment proof image");
        return;
    }

    const file = fileInput.files[0];

    const payload = {
        content: "<@&1461606860372316377> <@&1461606866810437702>",
        username: "ASCEND STORE",
        embeds: [{
            title: "🛒 New Purchase Request",
            color: 8311585,
            fields: [
                { name: "IC Name", value: form.pname.value, inline: true },
                { name: "GPay", value: form.gpay_name.value, inline: true },
                { name: "Item", value: itemValue, inline: true },
                { name: "Amount", value: "₹" + priceValue, inline: true },
                { name: "Payment", value: "✅ Paid", inline: true },
                { name: "Proof", value: `${fileName} | ${fileSize} KB`, inline: false }
            ],
            timestamp: new Date().toISOString()
        }]
    };

    const formData = new FormData();
    formData.append("payload_json", JSON.stringify(payload));
    formData.append("file", file);

    const WEBHOOK_URLS = [
        "https://discord.com/api/webhooks/1470090123080106156/3AqTyeYpozL26bebIpjkgaFaXXtvl2JI2hMyjx34FzLr7k_vMimCexkmY4h4ClutJZvB",
        "https://discord.com/api/webhooks/1469756792908152883/bYlDZ5hHPPDeN_wdd1HLOCUqSGeXPC-PWNyJHOIv_zEiA99tXEzCMDWRA46Cc24NEdKH"
    ];

    Promise.all(
        WEBHOOK_URLS.map(url =>
            fetch(url, { method: "POST", body: formData })
        )
    )
    .then(res => {
        if (res.every(r => r.ok)) {
            alert("✅ Request sent successfully!");
            form.reset();
        } else {
            alert("❌ failed.");
        }
    })
    .catch(err => alert("❌ Error: " + err.message));
});


