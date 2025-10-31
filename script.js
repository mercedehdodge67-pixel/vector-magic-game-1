const canvas = document.getElementById("vectorCanvas");
const ctx = canvas.getContext("2d");

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
    // بزرگ‌ترین مختصات مورد نیاز (از هر دو بردار: اصلی و ضرب‌شده)
    const candidates = [Math.abs(x), Math.abs(y), Math.abs(x * k), Math.abs(y * k)];
    const maxAbs = Math.max(...candidates, 1);

    // نصف بوم (در پیکسل)
    const halfCanvas = Math.min(canvas.width, canvas.height) / 2;

    // ✅ استفاده کامل از نیمه‌ی بوم برای نمایش دقیق ±50 واحد
    // اگر بخواهی کمی فاصله از لبه داشته باشی، مقدار را مثلاً 0.96 بگذار.
    const margin = 1;

    // ناحیه‌ی قابل‌استفاده‌ی نصف بوم (بر حسب پیکسل)
    const halfCanvasUsable = halfCanvas * margin;

    // هر نیمه‌ی بوم حداکثر ۵۰ واحد را نمایش می‌دهد
    const unitForMax = halfCanvasUsable / 50;

    // اگر بردار کوچک‌تر است، واحد پیکسلی بزرگ‌تر شود تا واضح‌تر دیده شود
    const unitForVector = halfCanvasUsable / maxAbs;

    // از بین دو مقدار، واحدی را انتخاب کن که هم بردار جا شود و هم از ±50 تجاوز نکند
    const unitPixels = Math.max(unitForMax, unitForVector);

    return unitPixels;
}

// -------------------- رسم شبکه و محورها --------------------
function drawAxesOnly(unitPixels) {
    if (!unitPixels) unitPixels = calculateUnitForGrid();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const halfUnits = 50; // هر محور از -50 تا +50

    ctx.strokeStyle = "rgba(180, 200, 255, 0.35)";
    ctx.lineWidth = 1;

    for (let u = -halfUnits; u <= halfUnits; u++) {
        const x = cx + u * unitPixels;
        if (x >= 0 && x <= canvas.width) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        const y = cy - u * unitPixels;
        if (y >= 0 && y <= canvas.height) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
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

    cachedAxesImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// -------------------- محدود کردن نوک بردار --------------------
function clampToGrid(px, py, cx, cy, unitPixels) {
    const maxOffset = 50 * unitPixels; // ±50 واحد واقعی
    const dx = px - cx;
    const dy = py - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= maxOffset) {
        return { x: px, y: py, clipped: false, angle: Math.atan2(dy, dx) };
    } else {
        const scale = maxOffset / distance;
        return {
            x: cx + dx * scale,
            y: cy + dy * scale,
            clipped: true,
            angle: Math.atan2(dy, dx)
        };
    }
}

// -------------------- انیمیشن رسم بردار --------------------
function animateVector(cx, cy, xEnd, yEnd, color, lineWidth, unitPixels, onComplete, showArrowBeyond, clipAngle) {
    const startImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let frameIndex = 0;
    const totalFrames = 50;

    function step() {
        frameIndex++;
        const t = easeOutCubic(frameIndex / totalFrames);
        const x = cx + (xEnd - cx) * t;
        const y = cy + (yEnd - cy) * t;

        ctx.putImageData(startImage, 0, 0);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();

        drawArrowHead(x, y, Math.atan2(y - cy, x - cx), color, unitPixels, lineWidth);

        if (frameIndex < totalFrames) {
            requestAnimationFrame(step);
        } else {
            ctx.putImageData(startImage, 0, 0);
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();
            drawArrowHead(xEnd, yEnd, Math.atan2(yEnd - cy, xEnd - cx), color, unitPixels, lineWidth);

            if (showArrowBeyond) drawBoundaryArrow(xEnd, yEnd, clipAngle);
            if (onComplete) onComplete();
        }
    }

    requestAnimationFrame(step);
}

// -------------------- نوک فلش --------------------
function drawArrowHead(x, y, angle, color, unitPixels, thickness) {
    const size = Math.max(6, unitPixels * 0.25);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size * Math.cos(angle - Math.PI / 6), y - size * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - size * Math.cos(angle + Math.PI / 6), y - size * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}

// -------------------- فلش خاکستری هشدار در مرز --------------------
function drawBoundaryArrow(x, y, angle) {
    const size = 14;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = "rgba(120,120,120,0.7)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * Math.cos(-Math.PI / 6), -size * Math.sin(-Math.PI / 6));
    ctx.lineTo(-size * Math.cos(Math.PI / 6), -size * Math.sin(Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// -------------------- انیمیشن نرم --------------------
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// -------------------- تابع اصلی --------------------
function drawVector() {
    const x = parseFloat(document.getElementById("x").value) || 0;
    const y = parseFloat(document.getElementById("y").value) || 0;
    const k = parseFloat(document.getElementById("k").value) || 1;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const unitPixels = calculateUnitForGrid(x, y, k);
    drawAxesOnly(unitPixels);

    const x1 = cx + x * unitPixels;
    const y1 = cy - y * unitPixels;
    const x2 = cx + x * k * unitPixels;
    const y2 = cy - y * k * unitPixels;

    const end1 = clampToGrid(x1, y1, cx, cy, unitPixels);
    const end2 = clampToGrid(x2, y2, cx, cy, unitPixels);

    animateVector(
        cx, cy,
        end1.x, end1.y,
        "#10b981",
        Math.max(2, unitPixels * 0.08),
        unitPixels,
        () => {
            setTimeout(() => {
                animateVector(
                    cx, cy,
                    end2.x, end2.y,
                    "#ef4444",
                    Math.max(2, unitPixels * 0.1),
                    unitPixels,
                    null,
                    end2.clipped,
                    end2.angle
                );
            }, 180);
        },
        end1.clipped,
        end1.angle
    );

    document.getElementById("result").textContent =
        `بردار ${k}A = (${(x * k).toFixed(2)}, ${(y * k).toFixed(2)})`;
}

// -------------------- اجرا --------------------
drawAxesOnly(calculateUnitForGrid());
document.querySelector("button").addEventListener("click", (e) => {
    e.preventDefault();
    drawVector();
});
