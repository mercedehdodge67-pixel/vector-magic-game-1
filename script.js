const canvas = document.getElementById("vectorCanvas");
const ctx = canvas.getContext("2d");

// تنظیم خودکار اندازه
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.55;

// تابع رسم محور و شبکه
function drawAxes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const unit = Math.min(canvas.width, canvas.height) / 20; // مقیاس تطبیقی

    // خطوط شبکه
    ctx.strokeStyle = "rgba(160, 190, 255, 0.4)";
    for (let x = 0; x < canvas.width; x += unit) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += unit) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // محورهای اصلی
    ctx.strokeStyle = "#1e3a8a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, canvas.height);
    ctx.moveTo(0, cy);
    ctx.lineTo(canvas.width, cy);
    ctx.stroke();
}

// تابع رسم فلش
function drawArrowHead(x, y, angle, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 10 * Math.cos(angle - Math.PI / 6), y - 10 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - 10 * Math.cos(angle + Math.PI / 6), y - 10 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}

// تابع رسم بردارها
function drawVector() {
    drawAxes();

    const x = parseFloat(document.getElementById("x").value);
    const y = parseFloat(document.getElementById("y").value);
    const k = parseFloat(document.getElementById("k").value);

    if (isNaN(x) || isNaN(y) || isNaN(k)) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const unit = Math.min(canvas.width, canvas.height) / 20;

    // محاسبه نقاط
    const x1 = cx + x * unit;
    const y1 = cy - y * unit;
    const x2 = cx + (x * k) * unit;
    const y2 = cy - (y * k) * unit;

    // بردار اصلی (سبز)
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    drawArrowHead(x1, y1, Math.atan2(y1 - cy, x1 - cx), "#10b981");

    // بردار ضرب‌شده (قرمز)
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    drawArrowHead(x2, y2, Math.atan2(y2 - cy, x2 - cx), "#ef4444");

    // نمایش نتیجه
    const result = document.getElementById("result");
    result.style.display = "block";
    result.style.fontWeight = "bold";
    result.style.fontSize = "1.2em";
    result.textContent = `A = (${x.toFixed(1)}, ${y.toFixed(1)})   ⇒   ${k < 0 ? k : k}A = (${(x * k).toFixed(1)}, ${(y * k).toFixed(1)})`;
}

// اجرای اولیه
drawAxes();
