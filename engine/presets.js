/**
 * OFLIM Film Presets Catalog
 * Complete authentic 19-film catalog extracted from original binary
 */

const FILM_PRESETS = [
  {
    id: 'kodak-400tx',
    code: 'KTX',
    name: '4OO TX',
    brand: 'Kodak',
    year: '2OO3 EXPIRED',
    iso: 400,
    tagline: 'Legendary Street & Photojournalism Standard',
    description: 'High microcontrast, deep rich blacks, and classic crystalline grain structure. The benchmark of 20th century B&W photography.',
    colors: { fg: '#FBFBFB', bg: '#535353', border: '#707070' },
    curve: {
      contrast: 1.35,
      toe: 0.12,
      shoulder: 0.88,
      midtones: 1.05
    },
    grain: {
      intensityL: 0.36,
      intensityM: 0.46,
      intensityR: 0.22,
      roughness: 1.05
    },
    filterWeights: [0.30, 0.59, 0.11]
  },
  {
    id: 'agfa-apx-400',
    code: 'AX4',
    name: 'APX 4OO',
    brand: 'Agfa',
    year: '1991',
    iso: 400,
    tagline: 'European Graphic Tonal Separation',
    description: 'Distinct European acutance, bold mid-gray tonal separation, and crisp edge definition.',
    colors: { fg: '#ECECEC', bg: '#535353', border: '#666666' },
    curve: {
      contrast: 1.30,
      toe: 0.10,
      shoulder: 0.89,
      midtones: 1.04
    },
    grain: {
      intensityL: 0.34,
      intensityM: 0.46,
      intensityR: 0.22,
      roughness: 1.08
    },
    filterWeights: [0.31, 0.57, 0.12]
  },
  {
    id: 'fujifilm-neopan-400',
    code: 'FN4',
    name: 'NEOPAN 4OO',
    brand: 'Fujifilm',
    year: '1988',
    iso: 400,
    tagline: 'Japanese Fine-Grain Panchromatic',
    description: 'Crisp microcontrast, delicate smooth highlight roll-off, and refined gray graduation.',
    colors: { fg: '#222222', bg: '#C5C5C5', border: '#DDDDDD' },
    curve: {
      contrast: 1.25,
      toe: 0.08,
      shoulder: 0.92,
      midtones: 1.02
    },
    grain: {
      intensityL: 0.28,
      intensityM: 0.36,
      intensityR: 0.16,
      roughness: 0.95
    },
    filterWeights: [0.28, 0.60, 0.12]
  },
  {
    id: 'fujifilm-fp-3000b',
    code: 'FP3',
    name: 'FP-3OOOB',
    brand: 'Fujifilm',
    year: 'EXPIRED',
    iso: 3000,
    tagline: 'Instant Pack-Film Legend',
    description: 'Ultra-high speed peel-apart instant film. Stark contrast, deep charcoal blacks, and remarkable sharpness.',
    colors: { fg: '#BFBFBF', bg: '#E8E8E8', border: '#FFFFFF' },
    curve: {
      contrast: 1.55,
      toe: 0.18,
      shoulder: 0.82,
      midtones: 1.15
    },
    grain: {
      intensityL: 0.40,
      intensityM: 0.46,
      intensityR: 0.28,
      roughness: 1.18
    },
    filterWeights: [0.32, 0.56, 0.12]
  },
  {
    id: 'ilford-hp5',
    code: 'IH5',
    name: 'HP5',
    brand: 'Ilford',
    year: '1976',
    iso: 400,
    tagline: 'British Fine-Art Workhorse',
    description: 'Wide exposure latitude, gentle shadow gradients, and forgiving highlight transitions.',
    colors: { fg: '#7B7B7B', bg: '#E4E4E4', border: '#CCCCCC' },
    curve: {
      contrast: 1.15,
      toe: 0.06,
      shoulder: 0.94,
      midtones: 0.98
    },
    grain: {
      intensityL: 0.30,
      intensityM: 0.40,
      intensityR: 0.18,
      roughness: 1.0
    },
    filterWeights: [0.29, 0.58, 0.13]
  },
  {
    id: 'lomo-lady-grey',
    code: 'LLG',
    name: 'Lady Grey',
    brand: 'Lomo',
    year: '2O12',
    iso: 400,
    tagline: 'Moody Cinematic Medium Grain',
    description: 'Rich deep shadows, glowing highlight diffusion, and an evocative street-cinema feel.',
    colors: { fg: '#BABABA', bg: '#535353', border: '#777777' },
    curve: {
      contrast: 1.28,
      toe: 0.11,
      shoulder: 0.90,
      midtones: 1.03
    },
    grain: {
      intensityL: 0.38,
      intensityM: 0.48,
      intensityR: 0.24,
      roughness: 1.10
    },
    filterWeights: [0.30, 0.58, 0.12]
  },
  {
    id: 'lucky-shd-100',
    code: 'LS1',
    name: 'SHD 1OO',
    brand: 'Lucky',
    year: '2OO8',
    iso: 100,
    tagline: 'Classic Baoding Silver Halide',
    description: 'High acutance, characteristic Chinese domestic emulsion, bright highlights with distinct micro-grain.',
    colors: { fg: '#DDDDDD', bg: '#535353', border: '#888888' },
    curve: {
      contrast: 1.22,
      toe: 0.07,
      shoulder: 0.91,
      midtones: 1.0
    },
    grain: {
      intensityL: 0.22,
      intensityM: 0.28,
      intensityR: 0.12,
      roughness: 0.92
    },
    filterWeights: [0.29, 0.60, 0.11]
  },
  {
    id: 'orwo-np15',
    code: 'O15',
    name: 'NP15',
    brand: 'ORWO',
    year: 'EXPIRED',
    iso: 25,
    tagline: 'East German Micro-Contrast Master',
    description: 'Original Wolfen factory ultra-slow emulsion. Incredible resolving power, velvety blacks, and minimal grain.',
    colors: { fg: '#A0A0A0', bg: '#5F5F5F', border: '#777777' },
    curve: {
      contrast: 1.32,
      toe: 0.05,
      shoulder: 0.95,
      midtones: 1.02
    },
    grain: {
      intensityL: 0.10,
      intensityM: 0.14,
      intensityR: 0.06,
      roughness: 0.70
    },
    filterWeights: [0.27, 0.63, 0.10]
  },
  {
    id: 'paterson-acupan-800',
    code: 'PA8',
    name: 'Acupan 8OO',
    brand: 'Paterson',
    year: '1998 EXPIRED',
    iso: 800,
    tagline: 'Atmospheric Expressive Grain',
    description: 'Specialist British high-speed emulsion. Tight microcontrast, gritty cinematic grain, and moody tones.',
    colors: { fg: '#8B8B8B', bg: '#747474', border: '#999999' },
    curve: {
      contrast: 1.38,
      toe: 0.14,
      shoulder: 0.86,
      midtones: 1.08
    },
    grain: {
      intensityL: 0.52,
      intensityM: 0.68,
      intensityR: 0.36,
      roughness: 1.28
    },
    filterWeights: [0.33, 0.55, 0.12]
  },
  {
    id: 'shanghai-gp3-100',
    code: 'SG3',
    name: 'GP3 1OO',
    brand: 'Shanghai',
    year: '1958',
    iso: 100,
    tagline: 'Traditional Slow-Speed Panchromatic',
    description: 'Silky smooth tonal transitions, rich silver depth, and fine, tight crystalline grain.',
    colors: { fg: '#000000', bg: '#F4F4F4', border: '#CCCCCC' },
    curve: {
      contrast: 1.10,
      toe: 0.05,
      shoulder: 0.95,
      midtones: 0.96
    },
    grain: {
      intensityL: 0.16,
      intensityM: 0.22,
      intensityR: 0.09,
      roughness: 0.85
    },
    filterWeights: [0.27, 0.62, 0.11]
  },
  {
    id: 'tura-400',
    code: 'TP4',
    name: 'Tura 4OO',
    brand: 'Tura',
    year: '1998 EXPIRED',
    iso: 400,
    tagline: 'German Independent Vintage Stock',
    description: 'Bold mid-gray emphasis, sharp acutance, and distinctive organic grain patterns.',
    colors: { fg: '#3F3F3F', bg: '#939393', border: '#AAAAAA' },
    curve: {
      contrast: 1.26,
      toe: 0.09,
      shoulder: 0.90,
      midtones: 1.02
    },
    grain: {
      intensityL: 0.38,
      intensityM: 0.48,
      intensityR: 0.24,
      roughness: 1.10
    },
    filterWeights: [0.30, 0.58, 0.12]
  },
  {
    id: 'aiko-lightpan-ss-100',
    code: 'AL1',
    name: 'Lightpan SS 1OO',
    brand: 'Aiko',
    year: '199O EXPIRED',
    iso: 100,
    tagline: 'Vintage Asian Commercial Stock',
    description: 'Gentle contrast with creamy highlight rendition and delicate silver steps.',
    colors: { fg: '#3F3F3F', bg: '#222222', border: '#555555' },
    curve: {
      contrast: 1.06,
      toe: 0.04,
      shoulder: 0.96,
      midtones: 0.95
    },
    grain: {
      intensityL: 0.18,
      intensityM: 0.24,
      intensityR: 0.10,
      roughness: 0.88
    },
    filterWeights: [0.28, 0.60, 0.12]
  },
  {
    id: 'konica-motto-mini-pan-400',
    code: 'KP4',
    name: 'Motto Mini Pan 4OO',
    brand: 'Konica',
    year: '1999 EXPIRED',
    iso: 400,
    tagline: 'Street Snapshot Point-and-Shoot',
    description: 'Gritty, punchy, high-energy street snapshot aesthetic with stark gray contrast.',
    colors: { fg: '#D6D6D6', bg: '#707070', border: '#888888' },
    curve: {
      contrast: 1.30,
      toe: 0.12,
      shoulder: 0.86,
      midtones: 1.06
    },
    grain: {
      intensityL: 0.44,
      intensityM: 0.54,
      intensityR: 0.30,
      roughness: 1.15
    },
    filterWeights: [0.31, 0.58, 0.11]
  },
  {
    id: 'fujifilm-super-presto-1600',
    code: 'FSP',
    name: 'Super Presto 16OO',
    brand: 'Fujifilm',
    year: '2O1O EXPIRED',
    iso: 1600,
    tagline: 'Extreme Night Concert Emulsion',
    description: 'Heavily pushed grain clumping, compressed shadows, and high luminous energy for night imagery.',
    colors: { fg: '#313131', bg: '#A4A4A4', border: '#CCCCCC' },
    curve: {
      contrast: 1.45,
      toe: 0.20,
      shoulder: 0.80,
      midtones: 1.12
    },
    grain: {
      intensityL: 0.62,
      intensityM: 0.76,
      intensityR: 0.46,
      roughness: 1.38
    },
    filterWeights: [0.34, 0.54, 0.12]
  },
  {
    id: 'adox-chs-50-pet',
    code: 'AC5',
    name: 'CHS 5O PET',
    brand: 'Adox',
    year: '2O14 EXPIRED',
    iso: 50,
    tagline: 'Orthopanchromatic Master Resolution',
    description: 'Single-layer German archival formulation. Unmatched acutance, expansive latitude, microscopic grain.',
    colors: { fg: '#FBFBFB', bg: '#989898', border: '#B5B5B5' },
    curve: {
      contrast: 1.20,
      toe: 0.04,
      shoulder: 0.97,
      midtones: 1.0
    },
    grain: {
      intensityL: 0.10,
      intensityM: 0.12,
      intensityR: 0.05,
      roughness: 0.72
    },
    filterWeights: [0.25, 0.65, 0.10]
  },
  {
    id: 'friendship-100-pan',
    code: 'F1P',
    name: '1OO Pan Film',
    brand: 'Friendship',
    year: '1988 EXPIRED',
    iso: 100,
    tagline: 'Vintage Domestic Formulation',
    description: 'Nostalgic matte tonal character with soft highlight roll-off and warm silver separation.',
    colors: { fg: '#636363', bg: '#1B1B1B', border: '#444444' },
    curve: {
      contrast: 1.08,
      toe: 0.07,
      shoulder: 0.93,
      midtones: 0.98
    },
    grain: {
      intensityL: 0.22,
      intensityM: 0.28,
      intensityR: 0.12,
      roughness: 0.92
    },
    filterWeights: [0.29, 0.59, 0.12]
  },
  {
    id: 'fujifilm-neopan-ss',
    code: 'FNS',
    name: 'Neopan SS',
    brand: 'Fujifilm',
    year: '1966 EXPIRED',
    iso: 100,
    tagline: 'Showa Era Silver Classic',
    description: 'Classic vintage formulation with generous silver bromide content and delicate shadow texture.',
    colors: { fg: '#252525', bg: '#535353', border: '#666666' },
    curve: {
      contrast: 1.18,
      toe: 0.06,
      shoulder: 0.92,
      midtones: 1.0
    },
    grain: {
      intensityL: 0.22,
      intensityM: 0.26,
      intensityR: 0.11,
      roughness: 0.90
    },
    filterWeights: [0.28, 0.61, 0.11]
  },
  {
    id: 'konica-infrared-750',
    code: 'K17',
    name: 'Infrared 75O',
    brand: 'Konica',
    year: '2002 EXPIRED',
    iso: 750,
    tagline: 'Near-Infrared Wood Effect & Dark Skies',
    description: 'Near-infrared response. Green foliage glows as luminous silver, blue sky renders pure black.',
    colors: { fg: '#000000', bg: '#242424', border: '#444444' },
    curve: {
      contrast: 1.50,
      toe: 0.16,
      shoulder: 0.78,
      midtones: 1.15
    },
    grain: {
      intensityL: 0.36,
      intensityM: 0.46,
      intensityR: 0.30,
      roughness: 1.12
    },
    isInfrared: true,
    filterWeights: [0.65, 0.30, 0.05]
  },
  {
    id: 'agfapan-1000-pro',
    code: 'AP1',
    name: '1OOO Pro',
    brand: 'Agfapan',
    year: '1971 EXPIRED',
    iso: 1000,
    tagline: 'Industrial High-Energy Silver Clumping',
    description: 'High chemical energy, harsh dramatic contrast, and pronounced crystalline grain structure.',
    colors: { fg: '#747474', bg: '#8B8B8B', border: '#AAAAAA' },
    curve: {
      contrast: 1.48,
      toe: 0.19,
      shoulder: 0.83,
      midtones: 1.10
    },
    grain: {
      intensityL: 0.56,
      intensityM: 0.70,
      intensityR: 0.42,
      roughness: 1.32
    },
    filterWeights: [0.32, 0.56, 0.12]
  }
];

// Film format sizes
const FILM_SIZES = [
  { id: 'half', name: 'HALF FRAME', factor: 1.75, desc: 'Visible coarse grain clumping' },
  { id: '35mm', name: '35mm', factor: 1.0, desc: 'Standard 35mm negative grain scale' },
  { id: '120', name: '120 MEDIUM', factor: 0.55, desc: 'Fine, tight medium format grain' },
  { id: 'large', name: '4x5 LARGE', factor: 0.28, desc: 'Ultra-fine sheet film resolution' }
];

// Optical Colour Filters (ColorMix)
const COLOUR_FILTERS = [
  { id: 'none', name: 'NONE', wavelength: 'ALL', hex: '#888888', weights: [0.299, 0.587, 0.114] },
  { id: 'red', name: 'RED', wavelength: '650nm', hex: '#E53935', weights: [0.85, 0.10, 0.05] },
  { id: 'orange', name: 'ORANGE', wavelength: '590nm', hex: '#FB8C00', weights: [0.70, 0.25, 0.05] },
  { id: 'yellow', name: 'YELLOW', wavelength: '570nm', hex: '#FDD835', weights: [0.45, 0.50, 0.05] },
  { id: 'green', name: 'GREEN', wavelength: '530nm', hex: '#43A047', weights: [0.15, 0.75, 0.10] },
  { id: 'aqua', name: 'AQUA', wavelength: '490nm', hex: '#00ACC1', weights: [0.05, 0.55, 0.40] },
  { id: 'blue', name: 'BLUE', wavelength: '450nm', hex: '#1E88E5', weights: [0.05, 0.15, 0.80] },
  { id: 'magenta', name: 'MAGENTA', wavelength: 'MIX', hex: '#D81B60', weights: [0.60, 0.05, 0.35] }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FILM_PRESETS, FILM_SIZES, COLOUR_FILTERS };
}
