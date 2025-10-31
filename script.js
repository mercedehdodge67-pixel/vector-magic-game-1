// === تنظیمات اولیه ===
const canvas = document.getElementById("vectorCanvas");
const ctx = canvas.getContext("2d");

let cx, cy, unitPixels;
let currentVector = null;

// تنظیم بوم به شکل مربع و رسم مجدد
function resizeCanvas() {
  // اندازه بوم مربع شود (بر اساس کوچک‌ترِ عرض یا ارتفاع صفحه)
  const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9);
  canvas.width = size;
  canvas.height = size;

  cx = canvas.width / 2;
  cy = canvas.height / 2;
  unitPixels = calculateAutoScale();

  drawCoordinateSystem();
}

// تنظیم مقیاس محور برای محدوده ±۵۰
function calculateAutoScale() {
  const maxCanvasHalf = canvas.width / 2;
  const targetMaxUnits = 50; // محور از -50 تا +50
  const margin = 0.9; // کمی فاصله از لبه‌ها برای زیبایی
  let unit = (maxCanvasHalf * margin) / targetMaxUnits;

  // محدود کردن اندازه پیکسل هر واحد برای جلوگیری از شلوغی زیاد
  const MIN_PIXELS = 4;
  const MAX_PIXELS = 120;
  unit = Math.max(MIN_PIXELS, Math.min(MAX_PIXELS, unit));
  unit = Math.round(unit);

  return unit;
}

// رسم محورهای مختصات
function drawCoordinateSystem() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // محور X و Y
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "black";

  // محور x
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(canvas.width, cy);
  ctx.stroke();

  // محور y
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, canvas.height);
  ctx.stroke();

  // تقسیم‌بندی‌ها (هر 10 واحد)
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  for (let i = -50; i <= 50; i += 10) {
    const x = cx + i * unitPixels;
    const y = cy - i * unitPixels;

    // محور X
    ctx.beginPath();
    ctx.moveTo(x, cy - 4);
    ctx.lineTo(x, cy + 4);
    ctx.stroke();
    if (i !== 0) ctx.fillText(i.toString(), x, cy + 6);

    // محور Y
    ctx.beginPath();
    ctx.moveTo(cx - 4, y);
    ctx.lineTo(cx + 4, y);
    ctx.stroke();
    if (i !== 0) {
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(i.toString(), cx - 6, y);
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
    }
  }

  // رسم بردار فعلی (اگر وجود داشته باشد)
  if (currentVector) drawVector(currentVector.x, currentVector.y, "red", 3);
}

// رسم بردار
function drawVector(x, y, color = "red", lineWidth = 3) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;

  const endX = cx + x * unitPixels;
  const endY = cy - y * unitPixels;

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // فلش انتهایی
  const angle = Math.atan2(cy - endY, endX - cx);
  const arrowLength = 10;
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - arrowLength * Math.cos(angle - Math.PI / 6),
    endY + arrowLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    endX - arrowLength * Math.cos(angle + Math.PI / 6),
    endY + arrowLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// تابع عمومی برای تنظیم بردار
function setVector(x, y) {
  currentVector = { x, y };
  drawCoordinateSystem();
}

// رویداد تغییر اندازه صفحه
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// تست اولیه
setVector(20, 30);
