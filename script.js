/* v5 script.js — animated, auto-scaling, no axis numbers, bold Persian text */
let x = 3, y = 4, k = 2;
let sketchInstance;
let anim = { t: 1, targetT: 1 }; // for smooth animation

function fmtNum(n){
  // show negative sign as unicode minus, trim trailing zeros
  const minus = n < 0 ? '−' : '';
  const v = Math.abs(n);
  // remove trailing zeros nicely
  let s = (Math.round((v + Number.EPSILON) * 1000) / 1000).toString();
  // ensure decimal comma replaced if needed (keep dot for simplicity)
  return minus + s;
}

function updateResultText(){
  const nx = Math.round((k * x) * 1000) / 1000;
  const ny = Math.round((k * y) * 1000) / 1000;
  let kText = '';
  if(k === 1) kText = 'A';
  else if(k === -1) kText = '−A';
  else kText = (k.toString().replace('-', '−') + 'A');
  document.getElementById('resultText').innerText = `بردار ${kText} = (${fmtNum(nx)}, ${fmtNum(ny)})`;
}

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const calcBtn = document.getElementById('calcBtn');
  const resetBtn = document.getElementById('resetBtn');

  calcBtn.addEventListener('click', () => {
    const xv = parseFloat(document.getElementById('x').value);
    const yv = parseFloat(document.getElementById('y').value);
    const kv = parseFloat(document.getElementById('k').value);

    x = isNaN(xv) ? 0 : xv;
    y = isNaN(yv) ? 0 : yv;
    k = isNaN(kv) ? 1 : kv;

    anim.targetT = 0;
    setTimeout(()=>{ anim.targetT = 1; }, 40);

    updateResultText();
    if(sketchInstance && typeof sketchInstance.redrawCanvas === 'function') sketchInstance.redrawCanvas();
  });

  resetBtn.addEventListener('click', () => {
    document.getElementById('x').value = 3;
    document.getElementById('y').value = 4;
    document.getElementById('k').value = 2;
    x = 3; y = 4; k = 2;
    anim.targetT = 0; setTimeout(()=>{ anim.targetT = 1; }, 40);
    updateResultText();
    if(sketchInstance && typeof sketchInstance.redrawCanvas === 'function') sketchInstance.redrawCanvas();
  });

  updateResultText();
});

// p5 sketch with auto-scale and animation
(function(){
  const s = (p) => {
    let unit = 28;
    let canvasW = 400;

    p.setup = function(){
      const holder = document.getElementById('sketch-holder');
      canvasW = Math.max(260, holder.clientWidth - 12);
      p.createCanvas(canvasW, canvasW).parent('sketch-holder');
      p.pixelDensity(1);
      p.noLoop();
      p.frameRate(60);
      p.redraw();
    };

    p.windowResized = function(){
      const holder = document.getElementById('sketch-holder');
      canvasW = Math.max(220, holder.clientWidth - 12);
      p.resizeCanvas(canvasW, canvasW);
      if(typeof p.redraw === 'function') p.redraw();
    };

    p.redrawCanvas = function(){ p.redraw(); };

    p.draw = function(){
      anim.t += (anim.targetT - anim.t) * 0.18;

      p.clear();
      p.push();
      p.translate(p.width/2, p.height/2);

      // compute auto scale based on max component (original and multiplied)
      const maxComp = Math.max(Math.abs(x), Math.abs(y), Math.abs(k*x), Math.abs(k*y), 1);
      const margin = 40;
      unit = Math.max(10, Math.floor((Math.min(p.width,p.height)/2 - margin) / maxComp));

      // draw grid lines (no numbers)
      p.push();
      p.stroke(255,255,255,20);
      p.strokeWeight(1);
      for(let gx = -p.width/2; gx <= p.width/2; gx += unit){
        p.line(gx, -p.height/2, gx, p.height/2);
      }
      for(let gy = -p.height/2; gy <= p.height/2; gy += unit){
        p.line(-p.width/2, gy, p.width/2, gy);
      }
      p.pop();

      // axes with glow
      p.push();
      p.stroke(255,255,255,200);
      p.strokeWeight(2);
      p.line(-p.width/2+6, 0, p.width/2-6, 0);
      p.line(0, -p.height/2+6, 0, p.height/2-6);
      p.pop();

      // original vector (A)
      const ax = x * unit;
      const ay = -y * unit;
      p.push();
      p.stroke(26,200,180, 220);
      p.strokeWeight(3.2);
      p.line(0,0, ax, ay);
      drawArrow(p, ax, ay, 8, [26,200,180]);
      p.pop();

      // multiplied vector with animation
      const mx = k * x;
      const my = k * y;
      const mx_px = mx * unit * anim.t;
      const my_px = -my * unit * anim.t;

      p.push();
      p.drawingContext.shadowBlur = 20;
      p.drawingContext.shadowColor = 'rgba(122,78,246,0.18)';
      p.stroke(k < 0 ? [224,75,75] : [80,120,255]);
      p.strokeWeight(4.2);
      p.line(0,0, mx_px, my_px);
      drawArrow(p, mx_px, my_px, 10, k < 0 ? [224,75,75] : [80,120,255]);
      p.drawingContext.shadowBlur = 0;
      p.pop();

      p.pop();

      if(Math.abs(anim.t - anim.targetT) > 0.001) p.redraw();
    };

    function drawArrow(p, tx, ty, size, col){
      p.push();
      p.translate(tx, ty);
      const angle = Math.atan2(ty, tx);
      p.rotate(angle);
      p.noStroke();
      p.fill(col || [30,30,30]);
      p.triangle(-size, -size/2, -size, size/2, 0, 0);
      p.pop();
    }
  };

  sketchInstance = new p5(s);
  window.addEventListener('resize', () => { if(sketchInstance && typeof sketchInstance.redrawCanvas === 'function') sketchInstance.redrawCanvas(); });
})();
