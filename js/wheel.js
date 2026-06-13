// ============================================================
//  wheel.js — Ruota della Fortuna: Canvas Wheel + Spin Logic
// ============================================================

var Wheel = (function () {

	// ----------------------------------------------------------
	// Spicchi della ruota (configurabili)
	// width: larghezza relativa dello spicchio (più alto = più largo)
	// ----------------------------------------------------------
	var SLICES = [
		{ label: '500€',        type: 'prize',    value: 500,  color: '#ff5c8a', textColor: '#fff', width: 0.8 },
		{ label: 'PASSA',       type: 'pass',     value: 0,    color: '#9e9eb8', textColor: '#fff', width: 1 },
		{ label: 'Foto con Gaia (200€)', type: 'prize',    value: 200,  color: '#ffb3c6', textColor: '#5a0020', width: 1.2 },
		{ label: 'BANCAROTTA',  type: 'bankrupt', value: 0,    color: '#2d1833', textColor: '#ff5c8a', width: 0.6 },
		{ label: '800€',        type: 'prize',    value: 800,  color: '#e03a64', textColor: '#fff', width: 0.5 },
		{ label: '300€',        type: 'prize',    value: 300,  color: '#ffd6e0', textColor: '#5a0020', width: 1.0 },
		{ label: '600€',        type: 'prize',    value: 600,  color: '#ff5c8a', textColor: '#fff', width: 0.7 },
		{ label: 'PASSA',       type: 'pass',     value: 0,    color: '#9e9eb8', textColor: '#fff', width: 1 },
		{ label: 'Bacio di Gaia (350€)',        type: 'prize',    value: 350,  color: '#ff85a2', textColor: '#5a0020', width: 1.3 },
		{ label: '150€',        type: 'prize',    value: 150,  color: '#ffd6e0', textColor: '#5a0020', width: 1.0 },
		{ label: '250€',        type: 'prize',    value: 250,  color: '#ffd6e0', textColor: '#5a0020', width: 1.0 },
		{ label: 'BANCAROTTA',  type: 'bankrupt', value: 0,    color: '#1a0a1e', textColor: '#ff5c8a', width: 0.7 },
		{ label: '1000€',       type: 'prize',    value: 1000, color: '#c9184a', textColor: '#fff', width: 0.4 },
		{ label: 'BANCAROTTA',  type: 'bankrupt', value: 0,    color: '#1a0a1e', textColor: '#ff5c8a', width: 0.7 },
		{ label: '400€',        type: 'prize',    value: 400,  color: '#ff9ab2', textColor: '#5a0020', width: 0.9 },
		{ label: '200€',        type: 'prize',    value: 400,  color: '#ff9ab2', textColor: '#5a0020', width: 0.9 },
		{ label: 'PASSA',       type: 'pass',     value: 0,    color: '#9e9eb8', textColor: '#fff', width: 1 },
		{ label: 'Fai un passo di salsa (800€)',        type: 'prize',    value: 800,  color: '#ff9ab2', textColor: '#5a0020', width: 0.7 }
		,{ label: '400€',        type: 'prize',    value: 400,  color: '#ff9ab2', textColor: '#5a0020', width: 0.9 }
	];

	var canvas, ctx;
	var currentAngle = 0;        // angolo corrente in radianti
	var isSpinning   = false;
	var sliceAngles  = [];        // angoli calcolati per ogni spicchio

	// Angolo puntatore: il puntatore è fisso in cima (angolo 270° = -Math.PI/2)
	var POINTER_ANGLE = -Math.PI / 2;

	// ----------------------------------------------------------
	// Calcola gli angoli degli spicchi basandosi sui pesi
	// ----------------------------------------------------------
	function _calculateSliceAngles() {
		sliceAngles = [];
		var totalWeight = 0;

		// Somma tutti i pesi
		SLICES.forEach(function (slice) {
			totalWeight += (slice.width || 1);
		});

		// Calcola l'angolo di ogni spicchio proporzionalmente al peso
		var currentAngle = 0;
		SLICES.forEach(function (slice) {
			var angle = (slice.width || 1) / totalWeight * 2 * Math.PI;
			sliceAngles.push({ start: currentAngle, end: currentAngle + angle });
			currentAngle += angle;
		});
	}

	// ----------------------------------------------------------
	// Init
	// ----------------------------------------------------------
	function init(canvasId) {
		canvas = document.getElementById(canvasId);
		if (!canvas) { console.error('Wheel: canvas non trovato:', canvasId); return; }
		ctx = canvas.getContext('2d');
		_calculateSliceAngles(); // calcola gli angoli basati sui pesi
		draw();
	}

	// ----------------------------------------------------------
	// Disegna la ruota sull'angolo corrente
	// ----------------------------------------------------------
	function draw() {
		if (!ctx) return;
		var W = canvas.width;
		var H = canvas.height;
		var cx = W / 2;
		var cy = H / 2;
		var radius = Math.min(cx, cy) - 12;

		ctx.clearRect(0, 0, W, H);

		// --- Disegna ogni spicchio ---
		SLICES.forEach(function (slice, i) {
			if (!sliceAngles[i]) return;
			var startAngle = currentAngle + sliceAngles[i].start;
			var endAngle   = currentAngle + sliceAngles[i].end;
			var midAngle   = startAngle + (endAngle - startAngle) / 2;

			// Riempimento
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			ctx.arc(cx, cy, radius, startAngle, endAngle);
			ctx.closePath();
			ctx.fillStyle = slice.color;
			ctx.fill();

			// Bordo spicchio
			ctx.strokeStyle = 'rgba(255,255,255,0.25)';
			ctx.lineWidth = 1.5;
			ctx.stroke();

			// Testo
			ctx.save();
			ctx.translate(cx, cy);
			ctx.rotate(midAngle);
			ctx.textAlign = 'right';
			ctx.fillStyle = slice.textColor;

			var fontSize = slice.label.length > 6 ? 9 : 12;
			ctx.font = 'bold ' + fontSize + 'px Arial';
			ctx.shadowColor = 'rgba(0,0,0,0.4)';
			ctx.shadowBlur = 3;
			ctx.fillText(slice.label, radius - 10, 5);
			ctx.restore();
		});

		// --- Cerchio centrale ---
		ctx.beginPath();
		ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
		ctx.fillStyle = '#fff0f3';
		ctx.fill();
		ctx.strokeStyle = '#ff5c8a';
		ctx.lineWidth = 3;
		ctx.stroke();

		// Stellina centrale
		ctx.fillStyle = '#ff5c8a';
		ctx.font = 'bold 18px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('★', cx, cy);
		ctx.textBaseline = 'alphabetic';

		// --- Bordo esterno ---
		ctx.beginPath();
		ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
		ctx.strokeStyle = '#ff5c8a';
		ctx.lineWidth = 4;
		ctx.shadowColor = 'rgba(255,92,138,0.5)';
		ctx.shadowBlur = 12;
		ctx.stroke();
		ctx.shadowBlur = 0;

		// --- Puntatore (freccia in cima) ---
		_drawPointer(cx, cy, radius);
	}

	// ----------------------------------------------------------
	// Disegna la freccia puntatore
	// ----------------------------------------------------------
	function _drawPointer(cx, cy, radius) {
		var px = cx;
		var py = cy - radius - 8;
		ctx.beginPath();
		ctx.moveTo(px, py + 22);
		ctx.lineTo(px - 11, py);
		ctx.lineTo(px + 11, py);
		ctx.closePath();
		ctx.fillStyle = '#c9184a';
		ctx.shadowColor = 'rgba(201,24,74,0.6)';
		ctx.shadowBlur = 8;
		ctx.fill();
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 1.5;
		ctx.stroke();
		ctx.shadowBlur = 0;
	}

	// ----------------------------------------------------------
	// Calcola lo spicchio puntato dall'angolo corrente
	// ----------------------------------------------------------
	function _getPointedSlice() {
		// Normalizza l'angolo corrente rispetto al puntatore
		var normalizedAngle = ((POINTER_ANGLE - currentAngle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
		
		// Trova quale spicchio contiene questo angolo
		for (var i = 0; i < sliceAngles.length; i++) {
			if (normalizedAngle >= sliceAngles[i].start && normalizedAngle < sliceAngles[i].end) {
				return SLICES[i];
			}
		}
		
		// Fallback (shouldn't happen)
		return SLICES[0];
	}

	// ----------------------------------------------------------
	// Anima lo spin della ruota
	// ----------------------------------------------------------
	function spin(onComplete) {
		if (isSpinning) return;
		isSpinning = true;

		// Suono di rotazione (hook — il file verrà aggiunto in seguito)
		if (typeof playSpinSound === 'function') playSpinSound();

		// Scegli un angolo totale: 5-10 giri completi + offset casuale
		var extraRotations = (5 + Math.floor(Math.random() * 5)) * 2 * Math.PI;
		var randomOffset   = Math.random() * 2 * Math.PI;
		var totalRotation  = extraRotations + randomOffset;

		var duration   = 4000; // ms
		var startTime  = null;
		var startAngle = currentAngle;

		function easeOut(t) {
			// Cubic ease-out
			return 1 - Math.pow(1 - t, 3);
		}

		function animate(timestamp) {
			if (!startTime) startTime = timestamp;
			var elapsed  = timestamp - startTime;
			var progress = Math.min(elapsed / duration, 1);
			var eased    = easeOut(progress);

			currentAngle = startAngle + totalRotation * eased;
			draw();

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				isSpinning = false;
				var result = _getPointedSlice();
				if (typeof onComplete === 'function') onComplete(result);
			}
		}

		requestAnimationFrame(animate);
	}

	// ----------------------------------------------------------
	// API pubblica
	// ----------------------------------------------------------
	return {
		init:   init,
		spin:   spin,
		draw:   draw,
		slices: SLICES
	};

})();
