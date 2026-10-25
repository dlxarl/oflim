/**
 * OFLIM Negative Telemetry & Optical Specifications Viewer
 * Computes and displays authentic camera negative metrics:
 * dimensions, megapixel count, aspect ratio, and emulsion codes.
 */

class TelemetryViewer {
  constructor(elements = {}) {
    this.elFilename = elements.filename;
    this.elFormat = elements.format;
    this.elDimensions = elements.dimensions;
    this.elResolution = elements.resolution;
    this.elAspect = elements.aspect;
    this.elEmulsionCode = elements.emulsionCode;
  }

  static calculateAspectRatio(width, height) {
    if (!width || !height) return '—';
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    const rW = Math.round(width / divisor);
    const rH = Math.round(height / divisor);
    const orientation = width >= height ? 'LANDSCAPE' : 'PORTRAIT';
    return `${rW}:${rH} (${orientation})`;
  }

  update({ filename, width, height, emulsionCode }) {
    if (this.elFilename) {
      this.elFilename.textContent = filename || 'Untitled.jpg';
      this.elFilename.title = filename || 'Untitled.jpg';
    }

    if (this.elFormat && filename) {
      const ext = filename.split('.').pop().toUpperCase();
      this.elFormat.textContent = `${ext} · 8-BIT`;
    }

    if (this.elDimensions) {
      this.elDimensions.textContent = `${width} × ${height} px`;
    }

    if (this.elResolution) {
      const mp = ((width * height) / 1000000).toFixed(2);
      this.elResolution.textContent = `${mp} MP`;
    }

    if (this.elAspect) {
      this.elAspect.textContent = TelemetryViewer.calculateAspectRatio(width, height);
    }

    if (this.elEmulsionCode && emulsionCode) {
      this.elEmulsionCode.textContent = emulsionCode;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TelemetryViewer };
}
