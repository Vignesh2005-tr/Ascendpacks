const checkbox = document.getElementById("agree");
const submitBtn = document.getElementById("submitBtn");
const form = document.getElementById("Customer");
const paymentConfirm = document.getElementById("paymentConfirm");
const amountDisplay = document.getElementById("amountDisplay");

/* Show notice when customer clicks BUY */
function showBuyNotice() {
    alert("✅ Please check Discord for further instructions!\n\nYour request will be processed by our team.");
}

/* Show/Hide Payment Modal */
function openPaymentModal() {
    const priceField = document.getElementById("price");
    const amount = priceField ? priceField.value : "0";
    
    if (amount === "0" || amount === "") {
        alert("⚠️ Please select a valid amount first");
        return;
    }
    
    // Update modal with amount
    const modal = document.getElementById("paymentModal");
    const modalAmount = document.getElementById("modalAmount");
    const modalAmountNum = document.getElementById("modalAmountNum");
    
    modalAmount.textContent = "₹" + amount;
    modalAmountNum.textContent = amount;
    
    // Generate QR code
    generateQRCode(amount);
    
    // Show modal
    modal.style.display = "flex";
}

function closePaymentModal() {
    document.getElementById("paymentModal").style.display = "none";
}

/* Generate QR Code for UPI */
function generateQRCode(amount) {
    const upiID = "gajaraj1628@okhdfcbank";
    const qrContainer = document.getElementById("qrCode");
    
    // Clear previous QR
    qrContainer.innerHTML = "";
    
    // Create UPI string
    const upiString = `upi://pay?pa=${upiID}&pn=ASCEND&am=${amount}`;
    
    // Use QR code API (free service)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
    
    const img = document.createElement('img');
    img.src = qrUrl;
    img.style.maxWidth = '200px';
    img.alt = 'UPI QR Code';
    img.title = 'Scan to pay via UPI';
    
    qrContainer.appendChild(img);
}

/* Close modal when clicking outside */
document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("paymentModal");
    if (modal) {
        window.addEventListener("click", function(event) {
            if (event.target === modal) {
                closePaymentModal();
            }
        });
    }
});

/* Initiate GPAY Payment */
function initiateGpayPayment() {
    const priceField = document.getElementById("price");
    const amount = priceField ? priceField.value : "0";
    
    if (amount === "0" || amount === "") {
        alert("⚠️ Please select a valid amount first");
        return;
    }
    
    const upiID = "gajaraj1628@okhdfcbank";
    const payeeName = "ASCEND STORE";
    
    // Simple UPI URL format - most compatible
    const upiLink = `upi://pay?pa=${upiID}&pn=${payeeName}&am=${amount}`;
    
    // Show payment dialog to user
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    if (isMobile) {
        // On mobile - try to open UPI
        alert(`💳 GPAY PAYMENT\n\nUPI: ${upiID}\nAmount: ₹${amount}\n\n✅ Opening your UPI app...`);
        window.location.href = upiLink;
        
        // After a delay, show success confirmation
        setTimeout(() => {
            const paymentDone = confirm("✅ Payment Successful?\n\nDid you complete the payment?\n\nClick OK to confirm payment & submit form");
            if (paymentDone) {
                document.getElementById("paymentConfirm").checked = true;
                document.getElementById("agree").checked = true;
                checkSubmitConditions();
                showSuccessScreen();
            }
        }, 3000);
        
        closePaymentModal();
    } else {
        // On desktop - show manual payment details
        alert(`💳 GPAY PAYMENT - MANUAL TRANSFER\n\n📱 Device: Browser/Desktop\n\n💰 Payment Details:\nUPI ID: ${upiID}\nAmount: ₹${amount}\nPayee: ${payeeName}\n\n✅ Steps:\n1. Open UPI app on your phone (Google Pay, PhonePe, Paytm)\n2. Send money to: ${upiID}\n3. Enter amount: ₹${amount}\n4. Complete payment\n5. Return to form\n6. Check "I have completed GPAY payment"\n7. Click Submit\n\nOnce payment is done, check the payment confirmation checkbox and submit the form.`);
        closePaymentModal();
    }
}

/* Show Success Screen */
function showSuccessScreen() {
    const itemField = document.getElementById("item");
    const itemName = itemField ? itemField.value : "Pack";
    
    const successModal = document.createElement("div");
    successModal.id = "successModal";
    successModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 20000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    successModal.innerHTML = `
        <div style="background: linear-gradient(145deg, #0f2027, #203a43); border-radius: 20px; padding: 40px; max-width: 600px; width: 90%; border: 2px solid #00f7ff; box-shadow: 0 0 50px rgba(0,247,255,0.8); text-align: center; animation: slideIn 0.5s ease;">
            <div style="font-size: 4rem; margin-bottom: 20px; animation: bounce 1s infinite;">✅</div>
            
            <h1 style="color: #00f7ff; font-size: 2.5rem; margin: 20px 0; text-shadow: 0 0 20px rgba(0,247,255,0.8);">
                SUCCESSFUL BUY PACKS
            </h1>
            
            <h2 style="color: #ff00ff; font-size: 1.8rem; margin: 20px 0; text-shadow: 0 0 15px rgba(255,0,255,0.8);">
                🙏 THANK YOU FOR BUYING
            </h2>
            
            <div style="background: rgba(0,247,255,0.1); border: 1px solid rgba(0,247,255,0.3); border-radius: 10px; padding: 20px; margin: 20px 0;">
                <p style="color: #aaa; font-size: 0.95rem; margin: 10px 0;">📦 Package Purchased</p>
                <p style="color: #00f7ff; font-size: 1.3rem; font-weight: bold; margin: 10px 0;">${itemName}</p>
            </div>
            
            <div style="background: rgba(255,0,255,0.1); border: 1px solid rgba(255,0,255,0.3); border-radius: 10px; padding: 20px; margin: 20px 0;">
                <p style="color: #aaa; font-size: 0.95rem; margin: 10px 0;">📋 Transaction Status</p>
                <p style="color: #ff00ff; font-size: 1.1rem; font-weight: bold; margin: 10px 0;">✅ PAYMENT CONFIRMED</p>
            </div>
            
            <p style="color: #aaa; font-size: 0.9rem; margin: 20px 0; line-height: 1.6;">
                Your purchase request has been received and forwarded to our admin team.<br>
                Check your Discord for further updates & pack activation details.
            </p>
            
            <button onclick="completeAndSubmitForm()" style="padding: 15px 40px; background: linear-gradient(90deg, #00f7ff, #ff00ff); color: #000; border: none; border-radius: 30px; font-weight: bold; cursor: pointer; font-size: 1rem; margin-top: 20px; transition: all 0.3s ease;"
            onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                ✅ SUBMIT PURCHASE REQUEST
            </button>
            
            <style>
                @keyframes slideIn {
                    from { transform: scale(0.5); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes bounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
            </style>
        </div>
    `;
    
    document.body.appendChild(successModal);
}

/* Complete and submit form */
function completeAndSubmitForm() {
    const modal = document.getElementById("successModal");
    if (modal) modal.remove();
    
    // Auto-submit form
    form.dispatchEvent(new Event("submit"));
}

/* Update amount display */
function updateAmountDisplay() {
    const priceField = document.getElementById("price");
    const amount = priceField ? priceField.value : "0";
    amountDisplay.textContent = `Amount: ₹${amount}`;
}

/* Enable submit - check all conditions */
function checkSubmitConditions() {
    const agreeChecked = checkbox.checked;
    const paymentChecked = paymentConfirm.checked;
    submitBtn.disabled = !(agreeChecked && paymentChecked);
}

/* Enable submit */
checkbox.addEventListener("change", checkSubmitConditions);
paymentConfirm.addEventListener("change", checkSubmitConditions);

/* Initialize - ensure DOM is ready */
document.addEventListener("DOMContentLoaded", function() {
    const priceField = document.getElementById("price");
    if (priceField) {
        updateAmountDisplay();
    }
});

/* Read URL params */
const params = new URLSearchParams(window.location.search);
const vehicle = params.get("vehicle");
const pack = params.get("pack");
const price = params.get("price");

/* Ensure price field exists and update display */
function ensurePriceField(priceValue) {
    let priceField = document.getElementById("price");
    if (!priceField) {
        priceField = document.createElement("input");
        priceField.type = "hidden";
        priceField.id = "price";
        form.appendChild(priceField);
    }
    priceField.value = priceValue;
    updateAmountDisplay();
    return priceField;
}

/* Fill item - create hidden fields if they don't exist */
if (vehicle) {
    let itemField = document.getElementById("item");
    if (!itemField) {
        itemField = document.createElement("input");
        itemField.type = "hidden";
        itemField.id = "item";
        form.appendChild(itemField);
    }
    itemField.value = vehicle;
}

if (pack) {
    let itemField = document.getElementById("item");
    if (!itemField) {
        itemField = document.createElement("input");
        itemField.type = "hidden";
        itemField.id = "item";
        form.appendChild(itemField);
    }
    itemField.value = pack;
}

if (price) {
    ensurePriceField(price);
} else {
    ensurePriceField("0");
}

/* Submit */
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const itemField = document.getElementById("item");
    const priceField = document.getElementById("price");
    const fileInput = document.querySelector('input[name="payment_proof"]');
    
    const itemValue = itemField ? itemField.value : "Not specified";
    const priceValue = priceField ? priceField.value : "Not specified";

    // Check if file is selected
    if (!fileInput.files || fileInput.files.length === 0) {
        alert("⚠️ Please upload payment proof image");
        return;
    }

    const file = fileInput.files[0];
    const fileName = file.name;
    const fileSize = (file.size / 1024).toFixed(2); // Size in KB
    const fileExtension = fileName.split('.').pop().toUpperCase();
    
    // Validate image format
    const allowedFormats = ['PNG', 'JPG', 'JPEG', 'GIF', 'WEBP'];
    if (!allowedFormats.includes(fileExtension)) {
        alert("❌ Invalid file format!\n\nAllowed formats: PNG, JPG, JPEG, GIF, WEBP");
        return;
    }

    const payload = {
        content: "<@&1461606860372316377> <@&1461606866810437702>", // Staff role mentions
        username: "ASCEND STORE",
        embeds: [{
            title: "🛒 New Purchase Request",
            color: 8311585,
            fields: [
                { name: "IC Name", value: form.pname.value, inline: true },
                { name: "Discord", value: form.dname.value, inline: true },
                { name: "GPay Name", value: form.gpay_name.value, inline: true },
                { name: "Item", value: itemValue, inline: true },
                { name: "Amount", value: "₹" + priceValue, inline: true },
                { name: "💳 Payment Status", value: "✅ GPAY Payment Confirmed", inline: true },
                { name: "Payment Proof", value: `📸 ${fileName}\n📁 Format: ${fileExtension}\n📊 Size: ${fileSize} KB`, inline: false }
            ],
            footer: { text: "ASCEND ROLEPLAY" },
            timestamp: new Date().toISOString()
        }]
    };

    // Create FormData to send file with webhook
    const formData = new FormData();
    formData.append('payload_json', JSON.stringify(payload));
    formData.append('file', file, fileName);

    // Discord webhook URL
   const WEBHOOK_URLS = [
  "https://discord.com/api/webhooks/1469756792908152883/bYlDZ5hHPPDeN_wdd1HLOCUqSGeXPC-PWNyJHOIv_zEiA99tXEzCMDWRA46Cc24NEdKH",
  "https://discord.com/api/webhooks/1470090123080106156/3AqTyeYpozL26bebIpjkgaFaXXtvl2JI2hMyjx34FzLr7k_vMimCexkmY4h4ClutJZvB"
];

Promise.all(
  WEBHOOK_URLS.map(url =>
    fetch(url, {
      method: "POST",
      body: formData
    })
  )
)
.then(responses => {
  if (responses.every(res => res.ok)) {
    alert("✅ Request sent to all admins successfully!\n\nPayment proof received.");
    form.reset();
    submitBtn.disabled = true;
  } else {
    throw new Error("One or more webhooks failed.");
  }
})
.catch(error => {
  alert("❌ Error sending request: " + error.message);
});
});
