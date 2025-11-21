import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform float mouse;
uniform float uEnableWaves;

void main() {
    vUv = uv;
    float time = uTime * 5.;

    float waveFactor = uEnableWaves;

    vec3 transformed = position;

    transformed.x += sin(time + position.y) * 0.5 * waveFactor;
    transformed.y += cos(time + position.z) * 0.15 * waveFactor;
    transformed.z += sin(time + position.x) * waveFactor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float mouse;
uniform float uTime;
uniform sampler2D uTexture;

void main() {
    float time = uTime;
    vec2 pos = vUv;
    
    float move = sin(time + mouse) * 0.01;
    float r = texture2D(uTexture, pos + cos(time * 2. - time + pos.x) * .01).r;
    float g = texture2D(uTexture, pos + tan(time * .5 + pos.x - time) * .01).g;
    float b = texture2D(uTexture, pos - cos(time * 2. + time + pos.y) * .01).b;
    float a = texture2D(uTexture, pos).a;
    gl_FragColor = vec4(r, g, b, a);
}
`;

const mapRange = (n, start, stop, start2, stop2) => {
  return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
};

const PX_RATIO = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
const RESPONSIVE_ASCII_REF_WIDTH = 900;
const RESPONSIVE_ASCII_MIN_RATIO = 0.25;

const getResponsiveAsciiFontSize = (baseFontSize, width) => {
  if (!width || !baseFontSize) {
    return baseFontSize;
  }
  const ratio = Math.min(1, Math.max(width / RESPONSIVE_ASCII_REF_WIDTH, RESPONSIVE_ASCII_MIN_RATIO));
  return Number((baseFontSize * ratio).toFixed(2));
};

class AsciiFilter {
  constructor(renderer, { fontSize, fontFamily, charset, invert } = {}) {
    this.renderer = renderer;
    this.domElement = document.createElement('div');
    this.domElement.style.position = 'absolute';
    this.domElement.style.top = '0';
    this.domElement.style.left = '0';
    this.domElement.style.width = '100%';
    this.domElement.style.height = '100%';

    this.pre = document.createElement('pre');
    this.domElement.appendChild(this.pre);

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.domElement.appendChild(this.canvas);

    this.deg = 0;
    this.invert = invert ?? true;
    this.fontSize = fontSize ?? 12;
    this.fontFamily = fontFamily ?? "'Courier New', monospace";
    this.charset =
      charset ??
      " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

    this.context.webkitImageSmoothingEnabled = false;
    this.context.mozImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;
    this.context.imageSmoothingEnabled = false;

    this.onMouseMove = this.onMouseMove.bind(this);
    document.addEventListener('mousemove', this.onMouseMove, { passive: true });
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height);
    this.reset();

    this.center = { x: width / 2, y: height / 2 };
    this.mouse = { x: this.center.x, y: this.center.y };
  }

  reset() {
    if (!this.width || !this.height) {
      return;
    }
    this.context.font = `${this.fontSize}px ${this.fontFamily}`;
    const charWidth = this.context.measureText('A').width;

    this.cols = Math.floor(this.width / (this.fontSize * (charWidth / this.fontSize)));
    this.rows = Math.floor(this.height / this.fontSize);

    this.canvas.width = this.cols;
    this.canvas.height = this.rows;
    this.pre.style.fontFamily = this.fontFamily;
    this.pre.style.fontSize = `${this.fontSize}px`;
    this.pre.style.margin = '0';
    this.pre.style.padding = '0';
    this.pre.style.lineHeight = '1em';
    this.pre.style.position = 'absolute';
    this.pre.style.left = '50%';
    this.pre.style.top = '50%';
    this.pre.style.transform = 'translate(-50%, -50%)';
    this.pre.style.zIndex = '9';
    this.pre.style.backgroundAttachment = 'fixed';
    this.pre.style.mixBlendMode = 'difference';
  }

  setFontSize(newSize) {
    const nextFontSize = Math.max(2, newSize);
    if (Math.abs(nextFontSize - this.fontSize) < 0.01) {
      return;
    }
    this.fontSize = nextFontSize;
    if (this.width && this.height) {
      this.reset();
    }
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);

    const w = this.canvas.width;
    const h = this.canvas.height;
    this.context.clearRect(0, 0, w, h);
    if (this.context && w && h) {
      this.context.drawImage(this.renderer.domElement, 0, 0, w, h);
    }

    this.asciify(this.context, w, h);
    this.hue();
  }

  onMouseMove(e) {
    this.mouse = { x: e.clientX * PX_RATIO, y: e.clientY * PX_RATIO };
  }

  get dx() {
    return this.mouse.x - this.center.x;
  }

  get dy() {
    return this.mouse.y - this.center.y;
  }

  hue() {
    const deg = (Math.atan2(this.dy, this.dx) * 180) / Math.PI;
    this.deg += (deg - this.deg) * 0.075;
    this.domElement.style.filter = `hue-rotate(${this.deg.toFixed(1)}deg)`;
  }

  asciify(ctx, w, h) {
    if (w && h) {
      const imgData = ctx.getImageData(0, 0, w, h).data;
      let str = '';
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = x * 4 + y * 4 * w;
          const [r, g, b, a] = [imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]];

          if (a === 0) {
            str += ' ';
            continue;
          }

          let gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
          let idx = Math.floor((1 - gray) * (this.charset.length - 1));
          if (this.invert) idx = this.charset.length - idx - 1;
          str += this.charset[idx];
        }
        str += '\n';
      }
      this.pre.innerHTML = str;
    }
  }

  dispose() {
    document.removeEventListener('mousemove', this.onMouseMove);
  }
}

class CanvasTxt {
  constructor(txt, { fontSize = 200, fontFamily = 'Arial', color = '#fdf9f3', lineSpacing = 1 } = {}) {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.txt = txt;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.color = color;
    this.lineSpacing = lineSpacing;

    this.font = `600 ${this.fontSize}px ${this.fontFamily}`;
  }

  getLines() {
    return this.txt.split('\n');
  }

  resize() {
    this.context.font = this.font;
    const lines = this.getLines();
    const safeLines = lines.length ? lines : [''];
    const widths = safeLines.map(line => Math.ceil(this.context.measureText(line || ' ').width));
    const maxWidth = widths.length ? Math.max(...widths) : 0;
    const metrics = this.context.measureText('M');
    const lineHeight = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) || this.fontSize;
    const step = lineHeight * this.lineSpacing;
    const totalHeight = (safeLines.length > 0 ? lineHeight + step * (safeLines.length - 1) : lineHeight) + 20;

    this.canvas.width = maxWidth + 20;
    this.canvas.height = totalHeight;
    this.cachedLineHeight = lineHeight;
    this.cachedStep = step;
  }

  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.color;
    this.context.font = this.font;
    const lines = this.getLines();
    const safeLines = lines.length ? lines : [''];
    const metrics = this.context.measureText('M');
    const baseline = metrics.actualBoundingBoxAscent || this.fontSize;
    const step = this.cachedStep ?? this.cachedLineHeight ?? this.fontSize;

    safeLines.forEach((line, index) => {
      const yPos = 10 + baseline + index * step;
      this.context.fillText(line, 10, yPos);
    });
  }

  get width() {
    return this.canvas.width;
  }

  get height() {
    return this.canvas.height;
  }

  get texture() {
    return this.canvas;
  }
}

class CanvAscii {
  constructor(
    {
      text,
      asciiFontSize,
      textFontSize,
      textColor,
      planeBaseHeight,
      enableWaves,
      textFontFamily,
      lineSpacing,
      scaleMultiplier,
      verticalOffset,
    },
    containerElem,
    width,
    height
  ) {
    this.textString = text;
    this.asciiFontSize = asciiFontSize;
    this.textFontSize = textFontSize;
    this.textColor = textColor;
    this.planeBaseHeight = planeBaseHeight;
    this.container = containerElem;
    this.width = width;
    this.height = height;
    this.enableWaves = enableWaves;
    this.textFontFamily = textFontFamily || 'IBM Plex Mono';
    this.lineSpacing = lineSpacing ?? 1;
    this.scaleMultiplier = scaleMultiplier ?? 1;
    this.verticalOffset = verticalOffset ?? 0;

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.camera.position.z = 30;

    this.scene = new THREE.Scene();
    this.mouse = { x: 0, y: 0 };

    this.onMouseMove = this.onMouseMove.bind(this);

    this.setMesh();
    this.setRenderer();
  }

  setMesh() {
    this.textCanvas = new CanvasTxt(this.textString, {
      fontSize: this.textFontSize,
      fontFamily: this.textFontFamily,
      color: this.textColor,
      lineSpacing: this.lineSpacing,
    });
    this.textCanvas.resize();
    this.textCanvas.render();

    this.texture = new THREE.CanvasTexture(this.textCanvas.texture);
    this.texture.minFilter = THREE.NearestFilter;

    const textAspect = this.textCanvas.width / this.textCanvas.height;
    const baseH = this.planeBaseHeight;
    const planeW = baseH * textAspect;
    const planeH = baseH;

    this.geometry = new THREE.PlaneGeometry(planeW, planeH, 36, 36);
    this.basePlaneWidth = planeW;
    this.basePlaneHeight = planeH;
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        mouse: { value: 1.0 },
        uTexture: { value: this.texture },
        uEnableWaves: { value: this.enableWaves ? 1.0 : 0.0 },
      },
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x000000, 0);

    this.filter = new AsciiFilter(this.renderer, {
      fontFamily: 'IBM Plex Mono',
      fontSize: this.asciiFontSize,
      invert: true,
    });

    this.container.appendChild(this.filter.domElement);
    this.setSize(this.width, this.height);

    this.container.addEventListener('mousemove', this.onMouseMove, { passive: true });
    this.container.addEventListener('touchmove', this.onMouseMove, { passive: true });
  }

  setAsciiFontSize(size) {
    if (!this.filter || typeof size !== 'number' || Number.isNaN(size)) {
      return;
    }
    const normalized = Math.max(2, size);
    if (Math.abs(normalized - this.asciiFontSize) < 0.05) {
      return;
    }
    this.asciiFontSize = normalized;
    this.filter.setFontSize(normalized);
  }

  setSize(w, h) {
    this.width = w;
    this.height = h;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.filter.setSize(w, h);

    this.center = { x: w / 2, y: h / 2 };
    this.fitMeshToViewport();
  }

  fitMeshToViewport() {
    if (!this.mesh) return;
    const fovInRadians = THREE.MathUtils.degToRad(this.camera.fov);
    const distance = this.camera.position.z;
    const frustumHeight = 2 * Math.tan(fovInRadians / 2) * distance;
    const frustumWidth = frustumHeight * this.camera.aspect;
    const widthScale = (frustumWidth * 0.92) / this.basePlaneWidth;
    const heightScale = (frustumHeight * 0.85) / this.basePlaneHeight;
    const safeScale = Math.min(1, widthScale, heightScale);
    const finalScale = Math.max(0.01, safeScale * this.scaleMultiplier);
    this.mesh.scale.set(finalScale, finalScale, 1);
    const overflowFactor = Math.max(0, this.scaleMultiplier - 1);
    const overflowShift = overflowFactor * safeScale * this.basePlaneHeight * 0.5;
    const manualShift = this.verticalOffset * this.basePlaneHeight * finalScale;
    this.mesh.position.y = -overflowShift + manualShift;
  }

  load() {
    this.animate();
  }

  onMouseMove(evt) {
    const e = evt.touches ? evt.touches[0] : evt;
    const bounds = this.container.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    this.mouse = { x, y };
  }

  animate() {
    const animateFrame = () => {
      this.animationFrameId = requestAnimationFrame(animateFrame);
      this.render();
    };
    animateFrame();
  }

  render() {
    const time = new Date().getTime() * 0.001;

    this.textCanvas.render();
    this.texture.needsUpdate = true;

    this.mesh.material.uniforms.uTime.value = Math.sin(time);

    this.updateRotation();
    this.filter.render(this.scene, this.camera);
  }

  updateRotation() {
    // Disabled mouse-based rotation - keep mesh at default rotation
    this.mesh.rotation.x += (0 - this.mesh.rotation.x) * 0.035;
    this.mesh.rotation.y += (0 - this.mesh.rotation.y) * 0.035;
  }

  clear() {
    this.scene.traverse(obj => {
      if (obj.isMesh && typeof obj.material === 'object' && obj.material !== null) {
        Object.keys(obj.material).forEach(key => {
          const matProp = obj.material[key];
          if (matProp !== null && typeof matProp === 'object' && typeof matProp.dispose === 'function') {
            matProp.dispose();
          }
        });
        obj.material.dispose();
        obj.geometry.dispose();
      }
    });
    this.scene.clear();
  }

  dispose() {
    cancelAnimationFrame(this.animationFrameId);
    this.filter.dispose();
    this.container.removeChild(this.filter.domElement);
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('touchmove', this.onMouseMove);
    this.clear();
    this.renderer.dispose();
  }
}

export default function ASCIIText({
  text = 'CUPI',
  asciiFontSize = 8,
  textFontSize = 260,
  textColor = '#fdf9f3',
  planeBaseHeight = 8,
  enableWaves = true,
  textFontFamily = 'IBM Plex Mono',
  lineSpacing = 1,
  scaleMultiplier = 1,
  verticalOffset = 0,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const asciiRef = useRef(null);
  const containerStyles = useMemo(
    () => ({
      position: 'absolute',
      inset: 0,
      '--ascii-font-family': textFontFamily,
      ...style,
    }),
    [style, textFontFamily],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const initAscii = (width, height) => {
      const responsiveFontSize = getResponsiveAsciiFontSize(asciiFontSize, width);
      asciiRef.current = new CanvAscii(
        {
          text,
          asciiFontSize: responsiveFontSize,
          textFontSize,
          textColor,
          planeBaseHeight,
          enableWaves,
          textFontFamily,
          lineSpacing,
          scaleMultiplier,
          verticalOffset,
        },
        containerRef.current,
        width,
        height
      );
      asciiRef.current.load();
    };

    const setupWithDimensions = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      if (width === 0 || height === 0) return false;
      initAscii(width, height);
      return true;
    };

    if (!setupWithDimensions()) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.boundingClientRect.width > 0 && entry.boundingClientRect.height > 0) {
            initAscii(entry.boundingClientRect.width, entry.boundingClientRect.height);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
        if (asciiRef.current) asciiRef.current.dispose();
      };
    }

    const ro = new ResizeObserver(entries => {
      if (!entries[0] || !asciiRef.current) return;
      const { width: w, height: h } = entries[0].contentRect;
      if (w > 0 && h > 0) {
        asciiRef.current.setSize(w, h);
        const responsiveFontSize = getResponsiveAsciiFontSize(asciiFontSize, w);
        asciiRef.current.setAsciiFontSize(responsiveFontSize);
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      if (asciiRef.current) asciiRef.current.dispose();
    };
  }, [text, asciiFontSize, textFontSize, textColor, planeBaseHeight, enableWaves, textFontFamily, lineSpacing, scaleMultiplier, verticalOffset]);

  return (
    <div
      ref={containerRef}
      className={`ascii-text-container ${className}`.trim()}
      style={containerStyles}
    />
  );
}
