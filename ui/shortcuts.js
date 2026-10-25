/**
 * OFLIM Keyboard Shortcuts & Interaction Orchestrator
 * Features:
 * - Layout-agnostic physical key mapping via e.code (works seamlessly on Ukrainian, Cyrillic, QWERTY, etc.)
 * - Multilingual fallbacks for regional keyboard layouts
 * - Safe Spacebar hold & release inspection (no strobe toggles or repeat conflicts)
 * - Single-step preset cycling with e.repeat filtering
 * - Input focus shielding
 * - Native Electron application menu event relay
 */

class ShortcutManager {
  constructor(handlers = {}) {
    this.handlers = handlers;
    this.isSpaceHolding = false;
    this.preSpaceCompareState = false;

    this.onKeyDown = this.handleKeyDown.bind(this);
    this.onKeyUp = this.handleKeyUp.bind(this);
    this.onBlur = this.handleBlur.bind(this);

    this.bindEvents();
    this.bindMenuRelay();
  }

  isInputFocused() {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName ? el.tagName.toUpperCase() : '';
    return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
  }

  handleKeyDown(e) {
    if (this.isInputFocused()) return;

    const code = e.code;
    const key = (e.key || '').toLowerCase();

    // 1. Space: Hold to inspect original raw negative
    if (code === 'Space') {
      e.preventDefault();
      if (!e.repeat && !this.isSpaceHolding) {
        this.isSpaceHolding = true;
        if (this.handlers.onSpaceHold) {
          this.handlers.onSpaceHold(true);
        }
      }
      return;
    }

    // Stop key repeats for discrete actions
    if (e.repeat) return;

    const isCtrlOrCmd = e.metaKey || e.ctrlKey;

    // 2. Undo / Redo (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, Cmd/Ctrl+Y, Ukrainian 'я')
    if (isCtrlOrCmd && (code === 'KeyZ' || key === 'z' || key === 'я')) {
      e.preventDefault();
      if (e.shiftKey) {
        if (this.handlers.onRedo) this.handlers.onRedo();
      } else {
        if (this.handlers.onUndo) this.handlers.onUndo();
      }
      return;
    }
    if (isCtrlOrCmd && (code === 'KeyY' || key === 'y' || key === 'н')) {
      e.preventDefault();
      if (this.handlers.onRedo) this.handlers.onRedo();
      return;
    }

    // 3. Export Master: [S] or Cmd/Ctrl+S (English, Cyrillic Ukrainian 'і', Russian 'ы')
    if (code === 'KeyS' || key === 's' || key === 'і' || key === 'ы') {
      e.preventDefault();
      if (this.handlers.onExport) this.handlers.onExport();
      return;
    }

    // 3. Open Negative: [O] or Cmd/Ctrl+O (English, Cyrillic 'о')
    if (code === 'KeyO' || key === 'o' || key === 'о') {
      e.preventDefault();
      if (this.handlers.onOpen) this.handlers.onOpen();
      return;
    }

    // 4. Split Compare Toggle: [C] (English, Cyrillic 'с')
    if (code === 'KeyC' || key === 'c' || key === 'с') {
      e.preventDefault();
      if (this.handlers.onSplitToggle) this.handlers.onSplitToggle();
      return;
    }

    // 5. Reset Adjustments: [R] or Cmd/Ctrl+R (English, Cyrillic 'к' / 'р')
    if (code === 'KeyR' || key === 'r' || key === 'к' || key === 'р') {
      e.preventDefault();
      if (this.handlers.onReset) this.handlers.onReset();
      return;
    }

    // 6. Previous Film Preset: [ (English, Cyrillic Ukrainian 'х', Russian 'х')
    if (code === 'BracketLeft' || key === '[' || key === 'х') {
      e.preventDefault();
      if (this.handlers.onPrevPreset) this.handlers.onPrevPreset();
      return;
    }

    // 7. Next Film Preset: ] (English, Cyrillic Ukrainian 'ї', Russian 'ъ')
    if (code === 'BracketRight' || key === ']' || key === 'ї' || key === 'ъ') {
      e.preventDefault();
      if (this.handlers.onNextPreset) this.handlers.onNextPreset();
      return;
    }

    // 8. Film Formats: 1 (Half), 2 (35mm), 3 (120), 4 (4x5)
    if (code === 'Digit1' || key === '1') { e.preventDefault(); if (this.handlers.onSelectFormat) this.handlers.onSelectFormat(0); return; }
    if (code === 'Digit2' || key === '2') { e.preventDefault(); if (this.handlers.onSelectFormat) this.handlers.onSelectFormat(1); return; }
    if (code === 'Digit3' || key === '3') { e.preventDefault(); if (this.handlers.onSelectFormat) this.handlers.onSelectFormat(2); return; }
    if (code === 'Digit4' || key === '4') { e.preventDefault(); if (this.handlers.onSelectFormat) this.handlers.onSelectFormat(3); return; }

    // 9. Toggle Sidebar Panel: Tab or Backslash \
    if (code === 'Tab' || code === 'Backslash' || key === '\\') {
      e.preventDefault();
      if (this.handlers.onToggleSidebar) this.handlers.onToggleSidebar();
      return;
    }

    // 10. Zoom Shortcuts: Cmd/Ctrl + Plus/Minus/0, or 0 (Fit)
    if ((e.metaKey || e.ctrlKey) && (code === 'Equal' || key === '=' || key === '+')) {
      e.preventDefault();
      if (this.handlers.onZoomIn) this.handlers.onZoomIn();
      return;
    }
    if ((e.metaKey || e.ctrlKey) && (code === 'Minus' || key === '-' || key === '_')) {
      e.preventDefault();
      if (this.handlers.onZoomOut) this.handlers.onZoomOut();
      return;
    }
    if (code === 'Digit0' || key === '0') {
      e.preventDefault();
      if (this.handlers.onZoomFit) this.handlers.onZoomFit();
      return;
    }
  }

  handleKeyUp(e) {
    if (e.code === 'Space') {
      e.preventDefault();
      if (this.isSpaceHolding) {
        this.isSpaceHolding = false;
        if (this.handlers.onSpaceHold) {
          this.handlers.onSpaceHold(false);
        }
      }
    }
  }

  handleBlur() {
    if (this.isSpaceHolding) {
      this.isSpaceHolding = false;
      if (this.handlers.onSpaceHold) {
        this.handlers.onSpaceHold(false);
      }
    }
  }

  bindEvents() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  bindMenuRelay() {
    if (window.electronAPI && window.electronAPI.onMenuAction) {
      window.electronAPI.onMenuAction((action) => {
        switch (action) {
          case 'openFile': if (this.handlers.onOpen) this.handlers.onOpen(); break;
          case 'exportPhoto': if (this.handlers.onExport) this.handlers.onExport(); break;
          case 'nextFilter': if (this.handlers.onNextPreset) this.handlers.onNextPreset(); break;
          case 'prevFilter': if (this.handlers.onPrevPreset) this.handlers.onPrevPreset(); break;
          case 'undo': if (this.handlers.onUndo) this.handlers.onUndo(); break;
          case 'redo': if (this.handlers.onRedo) this.handlers.onRedo(); break;
          case 'toggleSplit': if (this.handlers.onSplitToggle) this.handlers.onSplitToggle(); break;
          case 'toggleCompare': if (this.handlers.onCompareToggle) this.handlers.onCompareToggle(); break;
          case 'resetAdjustments': if (this.handlers.onReset) this.handlers.onReset(); break;
        }
      });
    }
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ShortcutManager };
}
