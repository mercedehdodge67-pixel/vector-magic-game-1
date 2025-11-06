const canvas = document.getElementById("vectorCanvas");
const ctx = canvas.getContext("2d");

// -------------------- تابع تبدیل اعداد به فارسی --------------------
function toPersianDigits(num) {
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    return num.toString().split('').map(ch =>
        (/\d/.test(ch) ? persianDigits[ch] : ch)
    ).join('');
}

// -------------------- تنظیم اندازه‌ی مربعی canvas --------------------
function resizeCanvas() {
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.6;
    const size = Math.round(Math.min(maxWidth, maxHeight));
    canvas.width = size;
    canvas.height = size;
}
resizeCanvas();
window.addEventListener('resize', () => {
    resizeCanvas();
    drawAxesOnly(); 
});

let cachedAxesImage = null;

// -------------------- محاسبه مقیاس (نسخه نهایی برای ±50) --------------------
function calculateUnitForGrid(x = 0, y = 0, k = 1) {
    const candidates = [Math.abs(x), Math.abs(y), Math.abs(x * k), Math.abs(y * k)];
    const maxAbs = Math.max(...candidates, 1);
    const halfCanvasUsable = canvas.width / 2 * 0.9;
    const unitForMax = halfCanvasUsable / maxAbs;
    return unitForMax;
}

// -------------------- رسم محور‌ها --------------------
function drawAxesOnly(unitPixels) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const half = canvas.width / 2;

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.moveTo(0, half);
    ctx.lineTo(canvas.width, half);
    ctx.moveTo(half, 0);
    ctx.lineTo(half, canvas.height);
    ctx.stroke();
}

// -------------------- رسم فلش --------------------
function drawArrowHead(x, y, angle, color, unitPixels, thickness) {
    const headlen = 10 + 2 * thickness;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - headlen * Math.cos(angle - Math.PI / 6),
               y - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - headlen * Math.cos(angle + Math.PI / 6),
               y - headlen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(x, y);
    ctx.fillStyle = color;
    ctx.fill();
}

// -------------------- رسم بردار --------------------
function drawVector(x, y, k = 1) {
    drawAxesOnly();

    const half = canvas.width / 2;
    const unitPixels = calculateUnitForGrid(x, y, k);
    const xEnd = half + x * unitPixels;
    const yEnd = half - y * unitPixels;

    ctx.beginPath();
    ctx.moveTo(half, half);
    ctx.lineTo(xEnd, yEnd);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.stroke();
    drawArrowHead(xEnd, yEnd, Math.atan2(half - yEnd, xEnd - half), "red", unitPixels, 3);

    // --- نمایش بردار ورودی به‌صورت عمودی و با اعداد فارسی ---
    const resultElem = document.getElementById("result");
    if (resultElem) {
        const xPers = toPersianDigits(x);
        const yPers = toPersianDigits(y);
        resultElem.innerHTML = `[\n${xPers}<br>${yPers}\n]`;
        resultElem.style.fontFamily = "'IRANSans', sans-serif";
        resultElem.style.fontSize = "1.4rem";
        resultElem.style.textAlign = "center";
        resultElem.style.lineHeight = "1.6";
        resultElem.style.whiteSpace = "pre";
    }
}

// -------------------- اجرای اولیه --------------------
drawVector(3, 4);
