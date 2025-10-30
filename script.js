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
    ctx.strokeStyle = "rgba(180, 200, 255, 0.5)";
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

function drawVectorAnimated(x, y, k) {
    drawAxes();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const scale = 40;

    const x1 = cx + x * scale;
    const y1 = cy - y * scale;
    const x2 = cx + (x * k) * scale;
    const y2 = cy - (y * k) * scale;

    // بردار اصلی (سبز)
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    drawArrowHead(x1, y1, Math.atan2(y1 - cy, x1 - cx), "#10b981");

    // انیمیشن برای بردار قرمز
    let progress = 0;
    const steps = 40;

    function animate() {
        drawAxes();
        // باز رسم بردار اصلی
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        drawArrowHead(x1, y1, Math.atan2(y1 - cy, x1 - cx), "#10b981");

        const xt = cx + (x * k * scale * progress);
        const yt = cy - (y * k * scale * progress);

        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(xt, yt);
        ctx.stroke();

        if (progress < 1) {
            progress += 0.03;
            requestAnimationFrame(animate);
        } else {
            drawArrowHead(x2, y2, Math.atan2(y2 - cy, x2 - cx), "#ef4444");
        }
    }

    animate();

    document.getElementById("result").textContent =
        `بردار ${k}A = (${(x * k).toFixed(1)}, ${(y * k).toFixed(1)})`;
    document.getElementById("result").style.display = "block";
}

function drawArrowHead(x, y, angle, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 14 * Math.cos(angle - Math.PI / 6), y - 14 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - 14 * Math.cos(angle + Math.PI / 6), y - 14 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}

function drawVector() {
    drawAxes();
    const x = parseFloat(document.getElementById("x").value);
    const y = parseFloat(document.getElementById("y").value);
    const k = parseFloat(document.getElementById("k").value);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // ✅ مقیاس خودکار بر اساس بزرگ‌ترین مؤلفه
    const maxVal = Math.max(Math.abs(x * k), Math.abs(y * k), Math.abs(x), Math.abs(y));
    const scale = Math.min(canvas.width, canvas.height) / (maxVal * 3);

    const x1 = cx + x * scale;
    const y1 = cy - y * scale;
    const x2 = cx + (x * k) * scale;
    const y2 = cy - (y * k) * scale;

    // بردار اصلی
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    drawArrowHead(x1, y1, Math.atan2(y1 - cy, x1 - cx), "#10b981");

    // بردار ضرب‌شده
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    drawArrowHead(x2, y2, Math.atan2(y2 - cy, x2 - cx), "#ef4444");

    // نمایش نتیجه
    document.getElementById("result").textContent =
        `بردار ${k}A = (${(x * k).toFixed(1)}, ${(y * k).toFixed(1)})`;
    document.getElementById("result").style.display = "block";
}


drawAxes();
