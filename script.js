const canvas = document.getElementById("vectorCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.5;

function drawAxes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const unit = 40;

    // خطوط شبکه
    ctx.strokeStyle = "rgba(180, 200, 255, 0.3)";
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

// تابع محاسبه مقیاس مناسب برای بردارها
function calculateAutoScale(x, y, k) {
    const maxVector = Math.max(
        Math.abs(x),
        Math.abs(y),
        Math.abs(x * k),
        Math.abs(y * k)
    );
    const margin = 0.8; // برای اینکه در لبه‌ها نباشد
    const maxCanvas = Math.min(canvas.width, canvas.height) / 2;
    const scale = (maxCanvas * margin) / (maxVector || 1);
    return Math.min(scale, 80); // حداکثر بزرگنمایی
}

function animateVector(cx, cy, xEnd, yEnd, color, lineWidth, callback) {
    let progress = 0;
    const duration = 60; // تعداد فریم‌ها (تقریباً 1 ثانیه)
    function step() {
        progress++;
        const t = progress / duration;
        const x = cx + (xEnd - cx) * t;
        const y = cy + (yEnd - cy) * t;
        drawAxes();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
        drawArrowHead(x, y, Math.atan2(y - cy, x - cx), color);
        if (progress < duration) {
            requestAnimationFrame(step);
        } else if (callback) {
            callback();
        }
    }
    step();
}

function drawVector() {
    drawAxes();
    const x = parseFloat(document.getElementById("x").value);
    const y = parseFloat(document.getElementById("y").value);
    const k = parseFloat(document.getElementById("k").value);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const scale = calculateAutoScale(x, y, k);

    const x1 = cx + x * scale;
    const y1 = cy - y * scale;
    const x2 = cx + (x * k) * scale;
    const y2 = cy - (y * k) * scale;

    // ابتدا بردار اصلی را با انیمیشن رسم کن
    animateVector(cx, cy, x1, y1, "#10b981", 3, () => {
        // سپس بردار ضرب‌شده را با تأخیر کوتاه رسم کن
        setTimeout(() => {
            animateVector(cx, cy, x2, y2, "#ef4444", 4);
        }, 400);
    });

    // نمایش نتیجه
    document.getElementById("result").textContent =
        `بردار ${k}A = (${(x * k).toFixed(1)}, ${(y * k).toFixed(1)})`;
}

function drawArrowHead(x, y, angle, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 10 * Math.cos(angle - Math.PI / 6), y - 10 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - 10 * Math.cos(angle + Math.PI / 6), y - 10 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}

drawAxes();
