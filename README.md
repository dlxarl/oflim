# OFLIM — Silver Bromide B&W Film Simulation & Darkroom Console

OFLIM is a high-performance desktop application and darkroom console engineered for authentic analog black & white film emulation. Built on Electron, WebGL 2.0, and vanilla modern web technologies, OFLIM accurately simulates the sensitometry, characteristic D-Log E response curves, physical optical lens filtration, multi-zone silver halide grain synthesis, and chemical darkroom push/pull development of 19 legendary photographic emulsions.

---

## 1. Overview & Key Capabilities

- **19 Authentic B&W Emulsions**: Faithfully modeled spectral sensitivity curves and silver bromide characteristics across historical Kodak, Fujifilm, Ilford, Agfa, Paterson, Shanghai, Adox, and Konica film stocks.
- **Dual-Octave Isotropic Silver Halide Grain**: Non-repeating Box-Muller Gaussian noise sampling coupled with golden ratio ($\phi = 0.618033$) clustering that completely eliminates spatial aliasing, moiré patterns, and float precision banding.
- **Physical Optical Lens Filters**: Panchromatic convolutions representing physical optical glass screw-on filters (Red, Orange, Yellow, Green, Aqua, Blue, Magenta).
- **Format-Dependent Micro-Acutance**: Dynamic grain frequency scaling across 4 camera formats:
  - `Half Frame` (1.60×) — Expressive, gritty street reportage grain.
  - `35mm Standard` (1.00×) — Benchmark 35mm negative resolution.
  - `120 Medium Format` (0.65×) — Tight, refined tonality.
  - `4×5 Large Format` (0.40×) — Ultra-fine, velvety sheet film sharpness.
- **Dual-Tier Asynchronous GPU Architecture**:
  - *Real-time viewport*: 2048px hardware preview via `createImageBitmap` delivering locked 60–120 FPS interaction even with 100+ megapixel source negatives.
  - *Pristine Master Export*: Dedicated offscreen WebGL pipeline that renders 100% full-resolution camera negatives.
- **Interactive Split & Hold-to-Compare**:
  - Live split-view slider comparing untouched RAW negative vs. OFLIM processed state.
  - Hold `Spacebar` inspection for instantaneous A/B comparison without mode toggling.
- **Darkroom History Engine (Undo / Redo)**: Complete state stack preserving sliders, steppers, presets, filters, formats, and grain seeds with `Cmd/Ctrl + Z` and `Cmd/Ctrl + Shift + Z`.
- **Fluid Canvas Navigation**: Multi-touch trackpad pinch-to-zoom, two-finger pan, mouse grab/drag, and floating Zoom HUD (`−`, `%`, `+`, `FIT`).
- **Collapsible Console Sidebar**: Full-viewport focus mode toggled with `Tab` or `\`.

---

## 2. Architecture & Technical Design

OFLIM uses a modular architecture with clean separation of concerns:

```
agbr-app/
├── index.html              # Darkroom stage DOM, technical HUD, control layout
├── style.css               # Precision design system inspired by 21st.dev dark console
├── main.js                 # Electron main process, window lifecycle, OS menu, IPC bridge
├── preload.js              # Secure contextBridge exposing electronAPI to renderer
├── renderer.js             # Central darkroom orchestrator & event bus
│
├── engine/
│   ├── presets.js          # Emulsion profiles, sensitometry D-Log E curves, optical filters
│   └── processor.js        # WebGL 2.0 rendering engine & dual-octave grain synthesis
│
├── ui/
│   ├── platform.js         # Operating system detection (macOS, Windows, Browser) & titlebar spacing
│   ├── shortcuts.js        # Physical keycode (e.code) mapping & multilingual input shielding
│   ├── telemetry.js        # Real-time negative metadata formatting (MP, aspect ratio, DX codes)
│   └── components.js       # Dynamic film cassette carousel & optical filter matrix
│
├── assets/                 # App icon (.icns, .png) and static assets
└── build/                  # Iconset assets and native macOS icns packaging files
```

### Sensitometry & Shader Pipeline (`engine/processor.js`)

1. **Optical Filter Convolution**: The input RGB negative is convolved with normalized spectral transmission weights:
   $$I_{\text{pan}} = \mathbf{w}_{\text{filter}} \cdot \mathbf{c}_{\text{RGB}}$$
2. **Exposure & Optical Density**:
   $$E = 2^{\text{density} + 0.25 \cdot \text{push}}$$
   $$\text{norm} = I_{\text{pan}} \cdot E$$
3. **Characteristic D-Log E Curve Compression**:
   Non-linear toe compression compresses deep shadows while the highlight shoulder applies exponential decay roll-off:
   $$\text{norm}_{\text{toe}} = \left(\frac{\text{norm}}{\text{toe}}\right) \cdot \text{toe} \cdot 0.75 \quad (\text{for } \text{norm} < \text{toe})$$
   $$\text{norm}_{\text{shoulder}} = \text{shoulder} + (1 - \text{shoulder})\left(1 - \exp\left(-\frac{\text{norm} - \text{shoulder}}{1 - \text{shoulder}}\right)\right) \quad (\text{for } \text{norm} > \text{shoulder})$$
4. **Midtone Contrast (Gamma)**:
   Midtone gamma contrast pivoted around 18% photographic middle gray:
   $$\text{norm} = (\text{norm} - 0.18) \cdot \gamma + 0.18$$
5. **Dual-Octave Golden-Ratio Grain Synthesis**:
   A 1024×1024 seamless Box-Muller Gaussian texture is sampled across two golden-ratio non-harmonic spatial octaves:
   $$\mathbf{uv}_1 = \text{fract}(\mathbf{v} \cdot \mathbf{s}_1 + \mathbf{o}_1)$$
   $$\mathbf{uv}_2 = \text{fract}(\mathbf{v} \cdot (\mathbf{s}_1 \cdot \phi) + \mathbf{o}_2), \quad \phi = 0.618033$$
   $$\text{noise} = 0.70 \cdot g_1 + 0.35 \cdot g_2$$
   Grain intensity is dynamically interpolated across photographic zones (shadows, midtones, highlights) and blended with the continuous tone curve.

---

## 3. Emulsion Directory (19 Film Stocks)

| Emulsion | Year | ISO | Character & Tonal Profile |
| :--- | :--- | :--- | :--- |
| **Kodak 4OO TX** | 2003 | 400 | The legendary photojournalism benchmark. Punchy micro-contrast, deep blacks, classic silver grain. |
| **Agfa APX 4OO** | 1991 | 400 | Crisp edge acutance, pronounced midtone separation, and classic German tonal curve. |
| **Fujifilm NEOPAN 4OO**| 1988 | 400 | Japanese panchromatic staple. Ultra-fine edge acutance with smooth tonal roll-off. |
| **Fujifilm FP-3OOOB** | Expired | 3000| Ultra-fast peel-apart instant packfilm. Velvety deep blacks and intense contrast. |
| **Ilford HP5** | 1976 | 400 | British fine-art standard. Broad exposure latitude and soft highlight retention. |
| **Lomography Lady Grey**| 2012 | 400 | Smooth, modern silver palette with balanced midtones. |
| **Paterson Acupan 8OO** | 1998 | 800 | High-speed European portrait stock with rich, atmospheric grain structure. |
| **Shanghai GP3 1OO** | 1958 | 100 | Traditional Chinese emulsion with silky highlights and low base fog. |
| **Aiko Lightpan SS 1OO** | 1990 | 100 | Gentle portrait contrast with delicate tonal gradations. |
| **Konica Motto Mini 4OO**| 1999 | 400 | 1990s Japanese street aesthetic designed for premium compact rangefinders. |
| **Fuji Super Presto 16OO**| 2010| 1600| High-speed low-light emulsion with gritty developer clumping. |
| **Adox CHS 5O PET** | 2014 | 50 | Single-layer emulsion replica of 1950s formulations; microscopic grain acutance. |
| **Friendship 1OO Pan** | 1988 | 100 | Nostalgic matte finish with distinct vintage tonal response. |
| **Fujifilm Neopan SS** | 1966 | 100 | High silver content with warm, rich shadow detail. |
| **Konica Infrared 75O** | 2002 | 50 | Near-infrared simulation: glowing Wood Effect on vegetation, near-black skies. |
| **Agfapan 1OOO Pro** | 1985 | 1000| Professional high-speed stock with bold silver bromide crystalline structure. |
| **Kodak Plus-X 125** | 1954 | 125 | Classic cinema and portrait stock with fine grain and rich shadow latitude. |
| **Ilford Pan F Plus** | 1989 | 50 | Ultra-fine grain with high contrast and razor-sharp edge acutance. |
| **Kodak Tri-X 4OO (1965)**| 1965 | 400| Vintage early Tri-X formulation with gritty silver clustering. |

---

## 4. Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| **`Cmd/Ctrl + O`** / **`O`** | Open Source Negative | Load raw photo, JPEG, PNG, or TIFF |
| **`Cmd/Ctrl + S`** / **`S`** | Export Processed Master | Save pristine 100% full-resolution negative |
| **`Cmd/Ctrl + Z`** | Undo | Revert last parameter, preset, filter, or slider change |
| **`Cmd/Ctrl + Shift + Z`** / **`Cmd/Ctrl + Y`** | Redo | Reapply previously undone action |
| **`Space` (Hold)** | Compare to Raw | Momentarily reveals original untouched negative |
| **`C`** | Toggle Split View | Interactive A/B split divider slider |
| **`[` / `]`** | Previous / Next Emulsion | Single-step cycling through 19 film stocks |
| **`1` / `2` / `3` / `4`** | Film Format | Select Half Frame, 35mm, 120, or 4×5 Large format |
| **`Tab`** / **`\`** | Toggle Sidebar Console | Collapse/expand the parameter sidebar |
| **`Cmd/Ctrl + +` / `−`** | Zoom In / Out | Scale canvas view |
| **`0`** | Fit to Viewport | Reset pan offset and zoom to 100% fit |
| **`R`** / **`Cmd/Ctrl + R`** | Reset Adjustments | Reset all sliders to neutral baseline |
| **Trackpad Pinch** | Pinch to Zoom | Smooth scaling anchored to cursor position |
| **Two-Finger Scroll / Drag** | Pan Negative | Smooth canvas panning |

*Note: All single-letter shortcuts include layout-agnostic physical key fallback (`e.code`), functioning identically across Ukrainian, Cyrillic, QWERTY, and international keyboard layouts.*

---

## 5. Development & Build Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended, tested on v24.22.1)
- macOS (tested on Apple Silicon arm64)

### Running Locally

```bash
# Navigate to the application directory
cd agbr-app

# Install dependencies
npm install

# Launch OFLIM in desktop development mode
npm start
```

### Packaging for Apple Silicon (macOS arm64)

```bash
# Compile and build the standalone OFLIM.app bundle
npm run build:mac
```

The resulting standalone macOS bundle will be located at:
```
agbr-app/dist/OFLIM-darwin-arm64/OFLIM.app
```

---

## 6. License

This project is licensed under the MIT License.
