// === ������� ����� ===
const canvas = document.getElementById("vectorCanvas");
const ctx = canvas.getContext("2d");
let cx, cy, unitPixels;
let currentVector = null;
let isMobile = /Mobi|Android/i.test(navigator.userAgent);

// ���� ����� ������
if (isMobile) {
  const note = document.createElement("div");
  note.style.textAlign = "center";
  note.style.color = "#b30000";
  note.style.fontSize = "16px";
  note.style.fontWeight = "bold";
  note.style.marginBottom = "8px";
  note.innerText =
    "����� ����� ǐ� ����� ����� ��� ���� �� ���� ������ ����ϡ �� ���ڝ��� ���� �� ���� ���� ���� ����� ���� ��� ������� ����.";
  document.body.prepend(note);
}

// === ����� ������ ��� ������ ����� ===
function resizeCanvas() {
  const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9);
  canvas.width = size;
  canvas.height = size;
  cx = canvas.width / 2;
  cy = canvas.height / 2;
  unitPixels = calculateAutoScale();
  drawCoordinateSystem();
}

// === ����� ��Ϙ�� ���� �?? ===
function calculateAutoScale() {
  const maxCanvasHalf = canvas.width / 2;
  const targetMaxUnits = 50;
  const margin = 0.9;
  let unit = (maxCanvasHalf * margin) / targetMaxUnits;

  const MIN_PIXELS = 4;
  const MAX_PIXELS = 120;
  unit = Math.max(MIN_PIXELS, Math.min(MAX_PIXELS, unit));
  unit = Math.round(unit);
  return unit;
}

// === ��� ������� ������ ===
function drawCoordinateSystem() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "black";

  // ���� x
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(canvas.width, cy);
  ctx.stroke();

  // ���� y
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, canvas.height);
  ctx.stroke();

  // �����������
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  for (let i = -50; i <= 50; i += 10) {
    const x = cx + i * unitPixels;
    const y = cy - i * unitPixels;

    // ���� x
    ctx.beginPath();
    ctx.moveTo(x, cy - 4);
    ctx.lineTo(x, cy + 4);
    ctx.stroke();
    if (i !== 0) ctx.fillText(i.toString(), x, cy + 6);

    // ���� y
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

  // ��� ����� ���� (�� ���� ����)
  if (currentVector) drawVector(currentVector.x, currentVector.y, "red", 3);
}

// === ��� ����� ===
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

  // ���� �������
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

// === ����� ������� ===
function setVector(x, y) {
  currentVector = { x, y };
  drawCoordinateSystem();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ����� ����� ���� ������:
setVector(20, 30);
