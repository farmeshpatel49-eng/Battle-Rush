// Admin Configuration (Change your UPI ID here)
const ADMIN_UPI = "6267635352@api"; // Replace with your actual UPI ID
const ADMIN_NAME = "Battle Rush Official";

// 1. Render Wallet Page with UPI QR Code
function renderWalletView() {
    return `
    <div class="card">
        <h3>💰 Wallet Balance</h3>
        <h1 style="color:var(--green); font-size:32px; margin:10px 0;">₹${data.user.wallet || 0}</h1>
        <div style="display:flex; gap:10px;">
            <button class="btn primary" style="flex:1" onclick="showAddMoneyModal()">+ ADD MONEY</button>
            <button class="btn" style="flex:1" onclick="toast('Withdrawal requested!')">WITHDRAW</button>
        </div>
    </div>

    <div class="card">
        <h3>Recent Transactions</h3>
        ${(data.user.transactions || []).map(t => `
            <div class="info-row" style="margin-top:10px;">
                <span>${t.type} (${t.date})</span>
                <span style="color:${t.amount > 0 ? 'var(--green)' : 'var(--red)'}">${t.amount > 0 ? '+' : ''}₹${t.amount}</span>
            </div>
        `).join('') || '<p class="muted">No transactions yet.</p>'}
    </div>
    `;
}

// 2. Add Money Modal with Live QR & Payment Gateways
function showAddMoneyModal() {
    modal(`
        <button class="close" onclick="closeModal()">×</button>
        <h2>Add Money to Wallet</h2>
        <p class="muted">Scan QR or use UPI to pay</p>

        <div class="field" style="margin-top:12px;">
            <label>Amount (₹)</label>
            <input id="addAmount" type="number" value="50" onchange="updateQR()">
        </div>

        <div class="qr-card">
            <p style="font-size:12px; color:var(--muted)">Scan using any UPI App</p>
            <img id="qrCodeImg" class="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${ADMIN_UPI}&pn=${encodeURIComponent(ADMIN_NAME)}&am=50&cu=INR">
            <div class="upi-apps">
                <a href="upi://pay?pa=${ADMIN_UPI}&pn=${encodeURIComponent(ADMIN_NAME)}&am=50&cu=INR" class="upi-btn">Pay via UPI App</a>
            </div>
        </div>

        <div class="field">
            <label>Transaction ID / UTR Number</label>
            <input id="utrNo" placeholder="Enter 12-digit UTR No. after payment">
        </div>

        <button class="btn primary" style="width:100%; margin-top:10px;" onclick="submitAddMoney()">SUBMIT PAYMENT</button>
    `);
}

function updateQR() {
    const amt = document.getElementById("addAmount").value || 10;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${ADMIN_UPI}&pn=${encodeURIComponent(ADMIN_NAME)}&am=${amt}&cu=INR`;
    document.getElementById("qrCodeImg").src = qrUrl;
}

function submitAddMoney() {
    const amt = Number(document.getElementById("addAmount").value);
    const utr = document.getElementById("utrNo").value.trim();
    if (!amt || amt < 10) return toast("Minimum deposit amount is ₹10");
    if (!utr || utr.length < 6) return toast("Enter valid UTR / Transaction ID");

    // Add Balance (Demo Auto-approval)
    data.user.wallet = (data.user.wallet || 0) + amt;
    if(!data.user.transactions) data.user.transactions = [];
    data.user.transactions.unshift({ type: "Deposit (UPI)", amount: amt, date: new Date().toLocaleDateString() });

    save();
    closeModal();
    render();
    toast(`₹${amt} added to wallet successfully!`);
}

// 3. Render My Games Page with Room ID & Password Display
function renderMyGamesView() {
    const joinedMatches = data.tournaments.filter(t => t.joinedUsers && t.joinedUsers.includes(data.user.id));

    if (joinedMatches.length === 0) {
        return `<div class="card"><p class="muted">Aapne abhi koi match join nahi kiya hai.</p></div>`;
    }

    return joinedMatches.map(t => {
        const isRoomReady = t.roomId && t.roomPass;
        return `
        <div class="card">
            <h3>${t.name}</h3>
            <p class="muted">⏰ Match Time: ${t.time} | Mode: ${t.mode}</p>

            ${isRoomReady ? `
                <div class="room-card">
                    <p style="color:var(--green); font-weight:bold; font-size:13px;">✅ ROOM ID & PASSWORD RELEASED</p>
                    <div class="room-row">
                        <span>ROOM ID: <span class="room-val">${t.roomId}</span></span>
                        <button class="copy-btn" onclick="copyText('${t.roomId}')">COPY</button>
                    </div>
                    <div class="room-row">
                        <span>PASSWORD: <span class="room-val">${t.roomPass}</span></span>
                        <button class="copy-btn" onclick="copyText('${t.roomPass}')">COPY</button>
                    </div>
                </div>
            ` : `
                <div class="room-card" style="border-color:var(--line);">
                    <p style="color:var(--gold); font-size:13px;">⏰ Room ID & Password match start hone se 15 min pehle dikhai dega.</p>
                </div>
            `}
        </div>
        `;
    }).join('');
}

function copyText(txt) {
    navigator.clipboard.writeText(txt);
    toast("Copied: " + txt);
}
