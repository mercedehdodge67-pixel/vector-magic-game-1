const canvas = document.getElementById("vectorCanvas");
const ctx = canvas.getContext("2d");

// اندازه canvas (می‌توانید طبق نیاز تغییر بدید)
function resizeCanvas() {
    canvas.width = Math.max(600, window.innerWidth * 0.9);
    canvas.height = Math.max(400, window.innerHeight * 0.5);
}
resizeCanvas();
window.addEventListener('resize', () => {
    resizeCanvas();
    drawAxesOnly(); // بعد از تغییر اندازه، محورها را تازه کن
});

let cachedAxesImage = null; // تصویر محورها برای سرعت و حفظ ثبات

// رسم فقط محورها/شبکه و ذخیره تصویر آنها
function drawAxesOnly(unitPixels = 40) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = Math.round(canvas.width / 2);
    const cy = Math.round(canvas.height / 2);

    // شبکه: فاصله خطوط برابر با unitPixels و مرکز روی تقاطع
    ctx.strokeStyle = "rgba(180, 200, 255, 0.35)";
    ctx.lineWidth = 1;

    // محاسبه شروع خطوط طوری که cx,cy روی تقاطع باشد
    // خطوط عمودی
    for (let x = cx % unitPixels; x < canvas.width; x += unitPixels) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    // خطوط افقی
    for (let y = cy % unitPixels; y < canvas.height; y += unitPixels) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // محورهای اصلی (خط میانی)
    ctx.strokeStyle = "#1e3a8a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, canvas.height);
    ctx.moveTo(0, cy);
    ctx.lineTo(canvas.width, cy);
    ctx.stroke();

    // ذخیره‌ی تصویر محورها برای استفاده در انیمیشن‌ها
    cachedAxesImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// محاسبه مقیاس (پیکسل در هر واحد) طوری که بزرگ‌ترین طول در محدوده بماند
function calculateAutoScale(x, y, k) {
    const absVals = [
        Math.abs(x),
        Math.abs(y),
        Math.abs(x * k),
        Math.abs(y * k)
    ];
    const maxUnits = Math.max(...absVals, 1); // اگر همه صفر بودند، از 1 استفاده کن
    const margin = 0.95; // درصد استفاده از نصف کوچک‌ترین بعد بوم
    const maxCanvasHalf = Math.min(canvas.width, canvas.height) / 2;
    let unitPixels = (maxCanvasHalf * margin) / maxUnits;

    // محدودیت‌ها برای خوانایی
    const MIN_PIXELS = 4;
    const MAX_PIXELS = 120;
    unitPixels = Math.max(MIN_PIXELS, Math.min(MAX_PIXELS, unitPixels));

    // Round to integer so خطوط شبکه دقیقاً در مختصات صحیح بیفتند
    unitPixels = Math.round(unitPixels);

    // اگر unitPixels خیلی کوچک شد، باز هم راند می‌کنیم؛ این باعث می‌شود تقاطع‌ها دقیق باشند
    return unitPixels;
}

// رسم نوک فلش متناسب با مقیاس
function drawArrowHead(x, y, angle, color, unitPixels) {
    // اندازه نوک متناسب با اندازه واحد
    const size = Math.max(6, Math.round(unitPixels * 0.25));
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size * Math.cos(angle - Math.PI / 6), y - size * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x - size * Math.cos(angle + Math.PI / 6), y - size * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}

// انیمیشن تدریجی؛ نکته مهم: ما تصویر محورها + بردارهای قبلی را در startImage ذخیره می‌کنیم
function animateVector(cx, cy, xEnd, yEnd, color, lineWidth, unitPixels, onComplete) {
    const startImage = ctx.getImageData(0, 0, canvas.width, canvas.height); // تصویر فعلی (محورها + بردارهای قبل)
    let frameIndex = 0;
    const totalFrames = 50; // حدود 0.8s - 1s

    function step() {
        frameIndex++;
        const t = easeOutCubic(frameIndex / totalFrames); // انیمیشن نرم‌تر
        const x = cx + (xEnd - cx) * t;
        const y = cy + (yEnd - cy) * t;

        // بازگردانی تصویر قبل (محورها + بردارهای قبلی)
        ctx.putImageData(startImage, 0, 0);

        // رسم بردار فعلی تا موقعیت x,y
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();

        // نوک فلش
        drawArrowHead(x, y, Math.atan2(y - cy, x - cx), color, unitPixels);

        if (frameIndex < totalFrames) {
            requestAnimationFrame(step);
        } else {
            // در پایان، بردار کامل را ثابت روی بوم رسم کن
            ctx.putImageData(startImage, 0, 0);
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();
            drawArrowHead(xEnd, yEnd, Math.atan2(yEnd - cy, xEnd - cx), color, unitPixels);
            if (onComplete) onComplete();
        }
    }

    requestAnimationFrame(step);
}

// منحنی ease برای انیمیشن (نرم و طبیعی)
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// اصلی: محاسبه مکان دقیق نقاط شبکه و رسم بردارها
function drawVector() {
    // خواندن ورودی‌ها
    const x = Number.parseFloat(document.getElementById("x").value) || 0;
    const y = Number.parseFloat(document.getElementById("y").value) || 0;
    const k = Number.parseFloat(document.getElementById("k").value) || 1;

    // مرکز بوم (این مرکز روی یک تقاطع شبکه خواهد بود)
    const cx = Math.round(canvas.width / 2);
    const cy = Math.round(canvas.height / 2);

    // محاسبه واحد پیکسلی: هر واحد مختصات معادل unitPixels پیکسل است
    const unitPixels = calculateAutoScale(x, y, k);

    // ابتدا محورها/شبکه را با همان فاصله unitPixels رسم کن و ذخیره کن
    drawAxesOnly(unitPixels);

    // تبدیل مختصات بردار (x,y) به پیکسل (دقت: cx + x * unitPixels)
    const x1 = cx + Math.round(x * unitPixels);
    const y1 = cy - Math.round(y * unitPixels); // معکوس محور y برای بوم

    const x2 = cx + Math.round(x * k * unitPixels);
    const y2 = cy - Math.round(y * k * unitPixels);

    // رسم بردار اصلی با انیمیشن و نگه داشتن آن
    animateVector(cx, cy, x1, y1, "#10b981", Math.max(2, Math.round(unitPixels * 0.08)), unitPixels, () => {
        // پس از اتمام، بردار ضرب‌شده را نیز با کمی تاخیر رسم کن
        setTimeout(() => {
            // توجه: هنگام شروع انیمیشن بعدی، animateVector تصویر فعلی (که شامل بردار سبز کامل است) را گرفته و روی آن انیمیت می‌کند — بنابراین بردار سبز باقی می‌ماند
            animateVector(cx, cy, x2, y2, "#ef4444", Math.max(2, Math.round(unitPixels * 0.1)), unitPixels);
        }, 180);
    });

    // نمایش نتایج عددی (مختصات بردار ضرب‌شده)
    document.getElementById("result").textContent =
        `بردار ${k}A = (${(x * k).toFixed(2)}, ${(y * k).toFixed(2)})`;
}

// رسم اولیه‌ی محورها با unit پیش‌فرض
drawAxesOnly(40);

// متصل کردن دکمه
document.querySelector("button").addEventListener("click", (e) => {
    e.preventDefault();
    drawVector();
});
