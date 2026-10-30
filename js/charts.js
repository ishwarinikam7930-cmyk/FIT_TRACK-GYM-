/* ============================================
   FitTrack – Canvas Progress Chart
   Lightweight bar/line chart with smooth animation.
   ============================================ */

const Charts = {

  drawBarChart(canvasId, data, labels) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.parentElement) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    canvas.width = rect.width * dpr;
    canvas.height = (rect.height || 220) * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = (rect.height || 220) + 'px';
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height || 220;
    const padding = { top: 25, right: 20, bottom: 35, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const barCount = data.length;
    const barGap = 12;
    const barWidth = Math.min(36, Math.max(16, (chartW - barGap * (barCount + 1)) / barCount));
    const maxVal = Math.max(...data, 80);
    const minVal = Math.min(...data, 50);

    // Animate
    this._animateChart(ctx, {
      width, height, padding, chartW, chartH,
      barWidth, barGap, barCount, maxVal, minVal,
      data, labels
    }, 0);
  },

  _animateChart(ctx, config, progress) {
    const { width, height, padding, chartW, chartH, barWidth, barGap, barCount, maxVal, minVal, data, labels } = config;
    const eased = this._easeOutCubic(Math.min(progress, 1));

    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    const gridSteps = 4;
    const valRange = maxVal - (minVal > 0 ? minVal - 5 : 0);
    const baseVal = minVal > 0 ? minVal - 5 : 0;

    for (let i = 0; i <= gridSteps; i++) {
      const y = padding.top + (chartH / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      const labelVal = Math.round(maxVal - (valRange / gridSteps) * i);
      ctx.fillText(labelVal + ' kg', padding.left - 8, y + 4);
    }

    // Bars
    const totalBarsWidth = barCount * barWidth + (barCount - 1) * barGap;
    const startX = padding.left + (chartW - totalBarsWidth) / 2;

    data.forEach((val, i) => {
      const normalizedH = ((val - baseVal) / valRange) * chartH * eased;
      const x = startX + i * (barWidth + barGap);
      const y = padding.top + chartH - normalizedH;

      // Bar gradient
      const gradient = ctx.createLinearGradient(x, y, x, padding.top + chartH);
      gradient.addColorStop(0, '#10B981');
      gradient.addColorStop(1, '#34D399');

      // Bar with rounded top
      const radius = 4;
      ctx.beginPath();
      ctx.moveTo(x, padding.top + chartH);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, padding.top + chartH);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Value on top of bar
      if (eased > 0.8) {
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.globalAlpha = (eased - 0.8) / 0.2;
        ctx.fillText(val + 'k', x + barWidth / 2, y - 6);
        ctx.globalAlpha = 1;
      }

      // X-axis labels
      ctx.fillStyle = '#64748B';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i] || '', x + barWidth / 2, height - padding.bottom + 18);
    });

    if (progress < 1) {
      requestAnimationFrame(() => {
        this._animateChart(ctx, config, progress + 0.04);
      });
    }
  },

  _easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  },

  handleResize(canvasId, data, labels) {
    let timeout;
    window.addEventListener('resize', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.drawBarChart(canvasId, data, labels);
      }, 150);
    });
  },

  init() {
    const { chartData, chartLabels } = FitTrackData.progressData;
    const chartEl = document.getElementById('progress-chart');
    if (chartEl) {
      this.drawBarChart('progress-chart', chartData, chartLabels);
      this.handleResize('progress-chart', chartData, chartLabels);
    }
  }
};
