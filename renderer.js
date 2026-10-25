/**
 * OFLIM Darkroom Renderer & UI Orchestrator
 * High-performance coordinator for the B&W Silver Bromide emulation stage.
 * Delegated Architecture:
 * - Engine: Film Presets (engine/presets.js) & GPU Sensitometry (engine/processor.js)
 * - Platform & Titlebar: PlatformManager (ui/platform.js)
 * - Shortcuts: ShortcutManager (ui/shortcuts.js)
 * - Telemetry: TelemetryViewer (ui/telemetry.js)
 * - UI Components: UIComponents (ui/components.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Platform Layout (macOS / Windows / Browser / Fullscreen)
  PlatformManager.init();

  // 2. Initialize Sensitometry GPU Engine
  const processor = new OfllimProcessor();

  // Application State
  let masterImage = null; // Full-resolution original negative
  let previewImage = null; // High-speed preview bitmap (max edge 2048px)
  let origDimensions = { width: 1920, height: 1080 };
  let previewDimensions = { width: 1920, height: 1080 };
  let currentFileName = 'Untitled_Negative.jpg';
  let activePresetIndex = 0;
  let activeFilmSize = FILM_SIZES[1]; // 35mm
  let activeColorFilter = COLOUR_FILTERS[0]; // Panchromatic
  let grainSeed = 1337;
  let isComparing = false;
  let isSplitActive = false;
  let splitPos = 0.5; // Center split line
  let isDraggingSplit = false;
  let renderPending = false;
  let renderScheduled = false;

  // DOM Elements
  const canvas = document.getElementById('mainCanvas');
  const canvasHolder = document.getElementById('canvasHolder');
  const canvasWrapper = document.getElementById('canvasWrapper');
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const splitHandle = document.getElementById('splitHandle');
  const controlSidebar = document.querySelector('aside.control-sidebar');

  // Zoom HUD Elements
  const zoomHud = document.getElementById('zoomHud');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnZoomFit = document.getElementById('btnZoomFit');
  const valZoomLevel = document.getElementById('valZoomLevel');

  // Header Buttons
  const btnOpen = document.getElementById('btnOpen');
  const btnUndo = document.getElementById('btnUndo');
  const btnRedo = document.getElementById('btnRedo');
  const btnSplitCompare = document.getElementById('btnSplitCompare');
  const btnCompare = document.getElementById('btnCompare');
  const btnReset = document.getElementById('btnReset');
  const btnToggleSidebar = document.getElementById('btnToggleSidebar');
  const btnExport = document.getElementById('btnExport');

  // Controls & Metrics
  const filmCarousel = document.getElementById('filmCarousel');
  const filterChipsGrid = document.getElementById('filterChipsGrid');
  const filmSizeControl = document.getElementById('filmSizeControl');
  const metricGrainFactor = document.getElementById('metricGrainFactor');
  const presetYearBadge = document.getElementById('presetYearBadge');
  const activeFilterMetric = document.getElementById('activeFilterMetric');
  const btnNewSeed = document.getElementById('btnNewSeed');

  // Sliders & Values
  const sliders = {
    density: document.getElementById('sliderDensity'),
    pullPush: document.getElementById('sliderPullPush'),
    contrast: document.getElementById('sliderContrast'),
    highlights: document.getElementById('sliderHighlights'),
    shadows: document.getElementById('sliderShadows'),
    grainL: document.getElementById('sliderGrainL'),
    grainM: document.getElementById('sliderGrainM'),
    grainR: document.getElementById('sliderGrainR'),
    grainScale: document.getElementById('sliderGrainScale')
  };

  const values = {
    density: document.getElementById('valDensity'),
    pullPush: document.getElementById('valPullPush'),
    contrast: document.getElementById('valContrast'),
    highlights: document.getElementById('valHighlights'),
    shadows: document.getElementById('valShadows'),
    grainL: document.getElementById('valGrainL'),
    grainM: document.getElementById('valGrainM'),
    grainR: document.getElementById('valGrainR'),
    grainScale: document.getElementById('valGrainScale')
  };

  // Toast System
  const toastNotice = document.getElementById('toastNotice');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimer;

  function showToast(msg) {
    clearTimeout(toastTimer);
    toastMessage.textContent = msg;
    toastNotice.classList.add('show');
    toastTimer = setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 2400);
  }

  // 3. Telemetry Viewer Module
  const telemetry = new TelemetryViewer({
    filename: document.getElementById('metaFilename'),
    format: document.getElementById('metaFormat'),
    dimensions: document.getElementById('metaDimensions'),
    resolution: document.getElementById('metaResolution'),
    aspect: document.getElementById('metaAspect'),
    emulsionCode: document.getElementById('metaEmulsionCode')
  });

  // 5. Undo / Redo History State Machine
  const undoStack = [];
  const redoStack = [];
  const MAX_HISTORY = 50;
  let isApplyingHistory = false;

  function captureState(description = 'Adjustment') {
    return {
      description,
      presetIndex: activePresetIndex,
      filmSizeId: activeFilmSize.id,
      colorFilterId: activeColorFilter.id,
      grainSeed,
      density: parseFloat(sliders.density.value),
      pullPush: parseFloat(sliders.pullPush.value),
      contrast: parseFloat(sliders.contrast.value),
      highlights: parseFloat(sliders.highlights.value),
      shadows: parseFloat(sliders.shadows.value),
      grainL: parseFloat(sliders.grainL.value),
      grainM: parseFloat(sliders.grainM.value),
      grainR: parseFloat(sliders.grainR.value),
      grainScale: parseFloat(sliders.grainScale.value)
    };
  }

  function updateUndoRedoButtons() {
    if (btnUndo) {
      btnUndo.disabled = undoStack.length === 0;
      btnUndo.title = undoStack.length > 0 
        ? `Undo ${undoStack[undoStack.length - 1].description} (Cmd+Z)` 
        : 'Nothing to Undo (Cmd+Z)';
    }
    if (btnRedo) {
      btnRedo.disabled = redoStack.length === 0;
      btnRedo.title = redoStack.length > 0 
        ? `Redo ${redoStack[redoStack.length - 1].description} (Cmd+Shift+Z)` 
        : 'Nothing to Redo (Cmd+Shift+Z)';
    }
  }

  function pushState(description = 'Adjustment') {
    if (isApplyingHistory) return;
    const state = captureState(description);
    undoStack.push(state);
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack.length = 0; // Clear redo tree on new branching action
    updateUndoRedoButtons();
  }

  function applyState(state) {
    isApplyingHistory = true;

    // Apply preset
    if (typeof state.presetIndex === 'number' && state.presetIndex !== activePresetIndex) {
      activePresetIndex = state.presetIndex;
      UIComponents.updateActiveCassette(filmCarousel, activePresetIndex);
      const preset = FILM_PRESETS[activePresetIndex];
      if (presetYearBadge) presetYearBadge.textContent = preset.year;
      telemetry.update({
        filename: currentFileName,
        width: origDimensions.width,
        height: origDimensions.height,
        emulsionCode: `${preset.code}-${preset.iso}`
      });
    }

    // Apply film size
    if (state.filmSizeId && state.filmSizeId !== activeFilmSize.id) {
      activeFilmSize = FILM_SIZES.find(s => s.id === state.filmSizeId) || FILM_SIZES[1];
      filmSizeControl.querySelectorAll('.segmented-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.size === activeFilmSize.id);
      });
      if (metricGrainFactor) metricGrainFactor.textContent = `${activeFilmSize.factor.toFixed(2)}× SCALE`;
    }

    // Apply color filter
    if (state.colorFilterId && state.colorFilterId !== activeColorFilter.id) {
      activeColorFilter = COLOUR_FILTERS.find(f => f.id === state.colorFilterId) || COLOUR_FILTERS[0];
      UIComponents.updateActiveFilter(filterChipsGrid, activeColorFilter.id);
      if (activeFilterMetric) {
        activeFilterMetric.textContent = activeColorFilter.id === 'none' ? 'PANCHROMATIC' : `${activeColorFilter.name} (${activeColorFilter.wavelength})`;
      }
    }

    // Apply grain seed
    if (typeof state.grainSeed === 'number' && state.grainSeed !== grainSeed) {
      grainSeed = state.grainSeed;
      processor.updateNoiseSeed(grainSeed);
    }

    // Apply slider values
    const sliderKeys = ['density', 'pullPush', 'contrast', 'highlights', 'shadows', 'grainL', 'grainM', 'grainR', 'grainScale'];
    sliderKeys.forEach(k => {
      if (typeof state[k] === 'number') {
        sliders[k].value = state[k];
        updateSliderDisplay(k, state[k]);
      }
    });

    isApplyingHistory = false;
    triggerRender();
  }

  function handleUndo() {
    if (undoStack.length === 0) {
      showToast('Nothing to undo');
      return;
    }
    const currentState = captureState();
    redoStack.push(currentState);
    const prevState = undoStack.pop();
    applyState(prevState);
    updateUndoRedoButtons();
    showToast(`Undo: ${prevState.description}`);
  }

  function handleRedo() {
    if (redoStack.length === 0) {
      showToast('Nothing to redo');
      return;
    }
    const currentState = captureState();
    undoStack.push(currentState);
    const nextState = redoStack.pop();
    applyState(nextState);
    updateUndoRedoButtons();
    showToast(`Redo: ${nextState.description}`);
  }

  if (btnUndo) btnUndo.addEventListener('click', handleUndo);
  if (btnRedo) btnRedo.addEventListener('click', handleRedo);
  updateUndoRedoButtons();

  // 4. Preset & Emulsion Selection
  function selectPreset(idx, trackHistory = true) {
    if (trackHistory && !isApplyingHistory) {
      pushState(`Emulsion: ${FILM_PRESETS[idx < 0 ? FILM_PRESETS.length - 1 : (idx >= FILM_PRESETS.length ? 0 : idx)].name}`);
    }

    if (idx < 0) idx = FILM_PRESETS.length - 1;
    if (idx >= FILM_PRESETS.length) idx = 0;
    activePresetIndex = idx;

    UIComponents.updateActiveCassette(filmCarousel, activePresetIndex);

    const preset = FILM_PRESETS[activePresetIndex];
    if (presetYearBadge) presetYearBadge.textContent = preset.year;
    telemetry.update({
      filename: currentFileName,
      width: origDimensions.width,
      height: origDimensions.height,
      emulsionCode: `${preset.code}-${preset.iso}`
    });

    triggerRender();
  }

  // 6. Initialize UI Components
  UIComponents.renderFilmCarousel(filmCarousel, FILM_PRESETS, activePresetIndex, (idx) => {
    selectPreset(idx);
  });

  UIComponents.renderFilterChips(filterChipsGrid, COLOUR_FILTERS, activeColorFilter.id, (filter) => {
    if (filter.id !== activeColorFilter.id) {
      pushState(`Lens Filter: ${filter.name}`);
    }
    activeColorFilter = filter;
    UIComponents.updateActiveFilter(filterChipsGrid, filter.id);
    if (activeFilterMetric) {
      activeFilterMetric.textContent = filter.id === 'none' ? 'PANCHROMATIC' : `${filter.name} (${filter.wavelength})`;
    }
    triggerRender();
  });

  // Film Format Segmented Control
  filmSizeControl.querySelectorAll('.segmented-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sizeId = btn.dataset.size;
      if (sizeId !== activeFilmSize.id) {
        pushState(`Format: ${sizeId}`);
      }
      filmSizeControl.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilmSize = FILM_SIZES.find(s => s.id === sizeId) || FILM_SIZES[1];
      if (metricGrainFactor) metricGrainFactor.textContent = `${activeFilmSize.factor.toFixed(2)}× SCALE`;
      showToast(`Format: ${activeFilmSize.name} (${activeFilmSize.desc})`);
      triggerRender();
    });
  });

  // Sliders & Steppers
  function updateSliderDisplay(key, val) {
    if (key === 'density') {
      values.density.textContent = (val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)) + ' EV';
    } else if (key === 'pullPush') {
      values.pullPush.textContent = (val >= 0 ? `+${val.toFixed(1)}` : val.toFixed(1)) + ' STOP';
    } else if (key === 'contrast' || key === 'highlights' || key === 'shadows') {
      values[key].textContent = (val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2));
    } else if (key === 'grainL' || key === 'grainM' || key === 'grainR') {
      values[key].textContent = `${Math.round(val * 100)}%`;
    } else if (key === 'grainScale') {
      values.grainScale.textContent = `${val.toFixed(2)}×`;
    }
  }

  // Track slider changes on pointerdown and commit to history on change
  let sliderDragInitialState = null;
  Object.keys(sliders).forEach(key => {
    const slider = sliders[key];
    slider.addEventListener('pointerdown', () => {
      sliderDragInitialState = captureState(key.toUpperCase());
    });
    slider.addEventListener('input', () => {
      updateSliderDisplay(key, parseFloat(slider.value));
      triggerRender();
    });
    slider.addEventListener('change', () => {
      if (sliderDragInitialState) {
        undoStack.push(sliderDragInitialState);
        if (undoStack.length > MAX_HISTORY) undoStack.shift();
        redoStack.length = 0;
        updateUndoRedoButtons();
        sliderDragInitialState = null;
      }
    });
  });

  document.querySelectorAll('.btn-step').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const step = parseFloat(btn.dataset.step);
      const slider = document.getElementById(targetId);
      if (slider) {
        pushState(`Step ${targetId.replace('slider', '')}`);
        let val = parseFloat(slider.value) + step;
        val = Math.max(parseFloat(slider.min), Math.min(parseFloat(slider.max), val));
        slider.value = val;

        const key = targetId.replace('slider', '').charAt(0).toLowerCase() + targetId.replace('slider', '').slice(1);
        updateSliderDisplay(key, val);
        triggerRender();
      }
    });
  });

  btnNewSeed.addEventListener('click', () => {
    pushState('Re-seed Grain');
    grainSeed = Math.floor(Math.random() * 999999);
    processor.updateNoiseSeed(grainSeed);
    showToast(`New Crystal Seed: ${grainSeed}`);
    triggerRender();
  });

  // 6. Hardware-Accelerated Preview Generator (2048px max edge for locked 120 FPS)
  async function generatePreviewBitmap(sourceImg, maxEdge = 2048) {
    const origW = sourceImg.naturalWidth || sourceImg.width;
    const origH = sourceImg.naturalHeight || sourceImg.height;

    if (Math.max(origW, origH) <= maxEdge) {
      return { bitmap: sourceImg, width: origW, height: origH };
    }

    const scale = maxEdge / Math.max(origW, origH);
    const previewW = Math.round(origW * scale);
    const previewH = Math.round(origH * scale);

    if (window.createImageBitmap) {
      try {
        const bitmap = await createImageBitmap(sourceImg, {
          resizeWidth: previewW,
          resizeHeight: previewH,
          resizeQuality: 'high'
        });
        return { bitmap, width: previewW, height: previewH };
      } catch (err) {
        console.warn('createImageBitmap fallback:', err);
      }
    }

    const c = document.createElement('canvas');
    c.width = previewW;
    c.height = previewH;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sourceImg, 0, 0, previewW, previewH);
    return { bitmap: c, width: previewW, height: previewH };
  }

  // 7. Dual-Tier Image Loading
  async function loadImage(src, filename = 'Untitled.jpg') {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      masterImage = img;
      currentFileName = filename;

      dropZone.style.display = 'none';
      canvasHolder.style.display = 'flex';

      const origW = img.naturalWidth || img.width;
      const origH = img.naturalHeight || img.height;
      origDimensions = { width: origW, height: origH };

      const preset = FILM_PRESETS[activePresetIndex];
      telemetry.update({
        filename,
        width: origW,
        height: origH,
        emulsionCode: `${preset.code}-${preset.iso}`
      });

      // Generate optimized high-speed preview
      const previewData = await generatePreviewBitmap(img, 2048);
      previewImage = previewData.bitmap;
      previewDimensions = { width: previewData.width, height: previewData.height };

      processor.initGL(canvas);
      processor.uploadPreviewImage(previewImage, origW, origH);

      // Reset undo history for the new negative
      undoStack.length = 0;
      redoStack.length = 0;
      updateUndoRedoButtons();

      triggerRender();
      showToast(`Loaded ${filename} (${((origW * origH) / 1000000).toFixed(1)} MP)`);
    };
    img.src = src;
  }

  async function handleOpenFile() {
    if (window.electronAPI && window.electronAPI.openFile) {
      const res = await window.electronAPI.openFile();
      if (res && res.dataUrl) {
        loadImage(res.dataUrl, res.fileName);
      }
    } else {
      fileInput.click();
    }
  }

  btnOpen.addEventListener('click', handleOpenFile);
  dropZone.addEventListener('click', handleOpenFile);

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => loadImage(evt.target.result, file.name);
      reader.readAsDataURL(file);
    }
  });

  // Drag and Drop
  window.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
  window.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); });
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => loadImage(evt.target.result, file.name);
      reader.readAsDataURL(file);
    }
  });

  // 8. Sidebar Toggle (Default: Open)
  let isSidebarOpen = true;
  function toggleSidebar(forceState) {
    if (typeof forceState === 'boolean') {
      isSidebarOpen = forceState;
    } else {
      isSidebarOpen = !isSidebarOpen;
    }
    if (controlSidebar) {
      controlSidebar.classList.toggle('collapsed', !isSidebarOpen);
    }
    if (btnToggleSidebar) {
      btnToggleSidebar.classList.toggle('active', isSidebarOpen);
    }
  }

  if (btnToggleSidebar) {
    btnToggleSidebar.addEventListener('click', () => toggleSidebar());
  }

  // 9. Interactive Zoom, Pan & Native Trackpad Gestures Engine
  let zoomLevel = 1.0; // 1.0 = 100%
  let panX = 0;
  let panY = 0;
  let isPanning = false;
  let startPanX = 0;
  let startPanY = 0;

  function updateCanvasTransform() {
    if (!canvasHolder) return;
    canvasHolder.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
    if (valZoomLevel) {
      valZoomLevel.textContent = `${Math.round(zoomLevel * 100)}%`;
    }
  }

  function setZoom(newZoom, centerX, centerY) {
    const clampedZoom = Math.max(0.1, Math.min(8.0, newZoom));
    if (Math.abs(clampedZoom - zoomLevel) < 0.001) return;

    if (centerX !== undefined && centerY !== undefined && canvasWrapper) {
      const rect = canvasWrapper.getBoundingClientRect();
      const originX = centerX - rect.left - rect.width / 2;
      const originY = centerY - rect.top - rect.height / 2;
      const ratio = clampedZoom / zoomLevel;
      panX = originX - (originX - panX) * ratio;
      panY = originY - (originY - panY) * ratio;
    }

    zoomLevel = clampedZoom;
    updateCanvasTransform();
  }

  function resetZoom() {
    zoomLevel = 1.0;
    panX = 0;
    panY = 0;
    updateCanvasTransform();
  }

  // Zoom HUD Button listeners
  if (btnZoomIn) btnZoomIn.addEventListener('click', () => setZoom(zoomLevel * 1.25));
  if (btnZoomOut) btnZoomOut.addEventListener('click', () => setZoom(zoomLevel / 1.25));
  if (btnZoomFit) btnZoomFit.addEventListener('click', resetZoom);
  if (valZoomLevel) valZoomLevel.addEventListener('dblclick', resetZoom);

  // Trackpad Pinch-to-zoom (Ctrl+wheel in Chromium) & Smooth Two-Finger Pan / Wheel
  if (canvasWrapper) {
    canvasWrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Trackpad pinch-to-zoom gesture or Ctrl+Mousewheel
        const factor = Math.exp(-e.deltaY * 0.01);
        setZoom(zoomLevel * factor, e.clientX, e.clientY);
      } else {
        // Trackpad two-finger swipe or standard mouse wheel
        panX -= e.deltaX;
        panY -= e.deltaY;
        updateCanvasTransform();
      }
    }, { passive: false });

    // Trackpad / Mouse Drag Panning
    canvasWrapper.addEventListener('mousedown', (e) => {
      // Ignore if clicking on split handle, zoom HUD, or action buttons
      if (e.target.closest('#splitHandle') || e.target.closest('#zoomHud') || e.target.closest('button')) {
        return;
      }
      isPanning = true;
      startPanX = e.clientX - panX;
      startPanY = e.clientY - panY;
      canvasHolder.classList.add('is-panning');
    });

    window.addEventListener('mousemove', (e) => {
      if (isDraggingSplit && canvas) {
        const rect = canvas.getBoundingClientRect();
        if (rect.width > 0) {
          const relativeX = (e.clientX - rect.left) / rect.width;
          updateSplitPosition(relativeX);
        }
        return;
      }
      if (isPanning) {
        panX = e.clientX - startPanX;
        panY = e.clientY - startPanY;
        updateCanvasTransform();
      }
    });

    window.addEventListener('mouseup', () => {
      if (isPanning) {
        isPanning = false;
        if (canvasHolder) canvasHolder.classList.remove('is-panning');
      }
      isDraggingSplit = false;
    });

    // Touch / Gestures for Touchscreens & Multi-Touch Trackpads
    let initialPinchDistance = null;
    let initialPinchZoom = 1.0;

    canvasWrapper.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDistance = Math.hypot(dx, dy);
        initialPinchZoom = zoomLevel;
      } else if (e.touches.length === 1) {
        isPanning = true;
        startPanX = e.touches[0].clientX - panX;
        startPanY = e.touches[0].clientY - panY;
      }
    }, { passive: true });

    canvasWrapper.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && initialPinchDistance) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDistance = Math.hypot(dx, dy);
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const ratio = currentDistance / initialPinchDistance;
        setZoom(initialPinchZoom * ratio, midX, midY);
      } else if (e.touches.length === 1 && isPanning) {
        panX = e.touches[0].clientX - startPanX;
        panY = e.touches[0].clientY - startPanY;
        updateCanvasTransform();
      }
    }, { passive: true });

    canvasWrapper.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) initialPinchDistance = null;
      if (e.touches.length === 0) isPanning = false;
    });
  }

  // 10. Split View Slider
  function toggleSplit() {
    isSplitActive = !isSplitActive;
    btnSplitCompare.classList.toggle('active', isSplitActive);
    splitHandle.style.display = isSplitActive ? 'flex' : 'none';
    if (isSplitActive) {
      updateSplitPosition(0.5);
    } else {
      triggerRender();
    }
  }

  btnSplitCompare.addEventListener('click', toggleSplit);

  function updateSplitPosition(pos) {
    splitPos = Math.max(0.01, Math.min(0.99, pos));
    splitHandle.style.left = `${(splitPos * 100).toFixed(1)}%`;
    triggerRender();
  }

  splitHandle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingSplit = true;
  });

  // 9. Compare Mode Toggle
  function setComparing(state) {
    if (isComparing === state) return;
    isComparing = state;
    btnCompare.classList.toggle('active', isComparing);
    triggerRender();
  }

  btnCompare.addEventListener('click', () => setComparing(!isComparing));

  // 10. Reset Adjustments
  function resetAdjustments() {
    pushState('Reset Sliders');
    sliders.density.value = 0;
    sliders.pullPush.value = 0;
    sliders.contrast.value = 0;
    sliders.highlights.value = 0;
    sliders.shadows.value = 0;
    sliders.grainL.value = 1;
    sliders.grainM.value = 1;
    sliders.grainR.value = 1;
    sliders.grainScale.value = 1;

    Object.keys(sliders).forEach(key => updateSliderDisplay(key, parseFloat(sliders[key].value)));

    activeColorFilter = COLOUR_FILTERS[0];
    UIComponents.updateActiveFilter(filterChipsGrid, 'none');
    if (activeFilterMetric) activeFilterMetric.textContent = 'PANCHROMATIC';

    showToast('Darkroom sliders reset');
    triggerRender();
  }

  btnReset.addEventListener('click', resetAdjustments);

  // 11. Pristine Full-Resolution Master Export
  async function handleExport() {
    if (!masterImage) {
      showToast('No image loaded to export');
      return;
    }

    const preset = FILM_PRESETS[activePresetIndex];
    const baseName = currentFileName.replace(/\.[^/.]+$/, '');
    const cleanPreset = preset.code;
    const defaultName = `${baseName}_OFLIM_${cleanPreset}.jpg`;

    showToast(`Rendering ${((origDimensions.width * origDimensions.height) / 1000000).toFixed(1)} MP master export...`);

    try {
      const dataUrl = await processor.renderExport(masterImage, origDimensions, {
        preset,
        filmSize: activeFilmSize,
        density: parseFloat(sliders.density.value),
        pullPush: parseFloat(sliders.pullPush.value),
        contrast: parseFloat(sliders.contrast.value),
        highlights: parseFloat(sliders.highlights.value),
        shadows: parseFloat(sliders.shadows.value),
        colorFilter: activeColorFilter,
        grainIntensityL: parseFloat(sliders.grainL.value),
        grainIntensityM: parseFloat(sliders.grainM.value),
        grainIntensityR: parseFloat(sliders.grainR.value),
        grainScale: parseFloat(sliders.grainScale.value)
      });

      if (window.electronAPI && window.electronAPI.saveFile) {
        const res = await window.electronAPI.saveFile(defaultName, dataUrl);
        if (res && res.success) {
          showToast(`Saved full-res master: ${res.filePath}`);
        }
      } else {
        const a = document.createElement('a');
        a.download = defaultName;
        a.href = dataUrl;
        a.click();
        showToast(`Exported ${defaultName}`);
      }
    } catch (err) {
      console.error('Master export error:', err);
      showToast('Export failed. Check console.');
    }
  }

  btnExport.addEventListener('click', handleExport);

  // 12. GPU Render Loop Execution
  function triggerRender() {
    if (!previewImage) return;
    if (renderPending) {
      renderScheduled = true;
      return;
    }
    renderPending = true;
    requestAnimationFrame(() => {
      renderPending = false;
      executeRender();
      if (renderScheduled) {
        renderScheduled = false;
        triggerRender();
      }
    });
  }

  function executeRender() {
    if (!previewImage) return;

    const preset = FILM_PRESETS[activePresetIndex];
    processor.renderPreview(canvas, previewDimensions, {
      preset,
      filmSize: activeFilmSize,
      density: parseFloat(sliders.density.value),
      pullPush: parseFloat(sliders.pullPush.value),
      contrast: parseFloat(sliders.contrast.value),
      highlights: parseFloat(sliders.highlights.value),
      shadows: parseFloat(sliders.shadows.value),
      colorFilter: activeColorFilter,
      grainIntensityL: parseFloat(sliders.grainL.value),
      grainIntensityM: parseFloat(sliders.grainM.value),
      grainIntensityR: parseFloat(sliders.grainR.value),
      grainScale: parseFloat(sliders.grainScale.value),
      isCompare: isComparing,
      splitPos: isSplitActive ? splitPos : null
    });
  }

  // 13. Dedicated Shortcut Manager Module
  let preSpaceCompareState = false;
  new ShortcutManager({
    onSpaceHold: (isHolding) => {
      if (isHolding) {
        preSpaceCompareState = isComparing;
        setComparing(true);
      } else {
        setComparing(preSpaceCompareState);
      }
    },
    onExport: handleExport,
    onOpen: handleOpenFile,
    onSplitToggle: toggleSplit,
    onCompareToggle: () => setComparing(!isComparing),
    onReset: resetAdjustments,
    onPrevPreset: () => selectPreset(activePresetIndex - 1),
    onNextPreset: () => selectPreset(activePresetIndex + 1),
    onSelectFormat: (idx) => {
      const btns = filmSizeControl.querySelectorAll('.segmented-btn');
      if (btns[idx]) btns[idx].click();
    },
    onUndo: handleUndo,
    onRedo: handleRedo,
    onToggleSidebar: () => toggleSidebar(),
    onZoomIn: () => setZoom(zoomLevel * 1.25),
    onZoomOut: () => setZoom(zoomLevel / 1.25),
    onZoomFit: resetZoom
  });

  // 14. Create Architectural Demo Negative for Launch
  function createDemoPhoto() {
    const demoCanvas = document.createElement('canvas');
    demoCanvas.width = 1600;
    demoCanvas.height = 1060;
    const ctx = demoCanvas.getContext('2d');

    const sky = ctx.createLinearGradient(0, 0, 0, 700);
    sky.addColorStop(0, '#0c2438');
    sky.addColorStop(0.5, '#2e5a7a');
    sky.addColorStop(0.8, '#8b6354');
    sky.addColorStop(1, '#d4a373');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1600, 1060);

    const sunGlow = ctx.createRadialGradient(800, 380, 20, 800, 380, 220);
    sunGlow.addColorStop(0, '#ffffff');
    sunGlow.addColorStop(0.3, '#fff4e0');
    sunGlow.addColorStop(0.7, 'rgba(255, 220, 180, 0.4)');
    sunGlow.addColorStop(1, 'rgba(255, 200, 150, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(800, 380, 220, 0, Math.PI * 2);
    ctx.fill();

    // Brutalist architecture
    ctx.fillStyle = '#1c2128';
    ctx.beginPath();
    ctx.moveTo(0, 1060);
    ctx.lineTo(0, 480);
    ctx.lineTo(380, 320);
    ctx.lineTo(600, 580);
    ctx.lineTo(820, 440);
    ctx.lineTo(1050, 620);
    ctx.lineTo(1600, 380);
    ctx.lineTo(1600, 1060);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#11151a';
    ctx.fillRect(160, 320, 220, 480);

    ctx.fillStyle = '#dcdcd5';
    for (let i = 0; i < 12; i++) {
      ctx.fillRect(160, 350 + i * 36, 180, 16);
    }

    ctx.fillStyle = '#0a0d11';
    ctx.beginPath();
    ctx.moveTo(0, 620);
    ctx.lineTo(240, 780);
    ctx.lineTo(460, 680);
    ctx.lineTo(720, 850);
    ctx.lineTo(0, 1060);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#050709';
    ctx.fillRect(940, 420, 8, 400);
    ctx.beginPath();
    ctx.arc(944, 425, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0e1217';
    ctx.beginPath();
    ctx.arc(720, 660, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(714, 672, 12, 45);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(780, 720, 110, 14, -0.2, 0, Math.PI * 2);
    ctx.fill();

    loadImage(demoCanvas.toDataURL('image/jpeg', 0.96), 'Brutalist_Negative_1976.jpg');
  }

  createDemoPhoto();
});
