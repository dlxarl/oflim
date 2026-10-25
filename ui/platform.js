/**
 * OFLIM Platform & Window Environment Manager
 * Detects operating system (macOS, Windows, Linux, Browser) and tracks
 * fullscreen state to dynamically adjust titlebar spacing.
 */

class PlatformManager {
  static init() {
    const isElectron = Boolean(window.electronAPI && window.electronAPI.isElectron);
    const platform = window.electronAPI?.platform || (
      navigator.userAgent.includes('Mac') ? 'darwin' : 
      navigator.userAgent.includes('Win') ? 'win32' : 'linux'
    );

    if (!isElectron) {
      document.body.classList.add('env-browser');
      return;
    }

    if (platform === 'darwin') {
      document.body.classList.add('os-mac');

      const updateFullscreen = (isFS) => {
        document.body.classList.toggle('is-fullscreen', Boolean(isFS));
      };

      if (window.electronAPI.onFullScreenChange) {
        window.electronAPI.onFullScreenChange(updateFullscreen);
      }
      if (window.electronAPI.isFullScreen) {
        window.electronAPI.isFullScreen().then(updateFullscreen);
      }

      window.addEventListener('resize', () => {
        if (window.electronAPI.isFullScreen) {
          window.electronAPI.isFullScreen().then(updateFullscreen);
        }
      });
    } else if (platform === 'win32') {
      document.body.classList.add('os-win');
    } else {
      document.body.classList.add('os-linux');
    }

    // Fallback standard HTML5 fullscreen event
    document.addEventListener('fullscreenchange', () => {
      document.body.classList.toggle('is-fullscreen', Boolean(document.fullscreenElement));
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PlatformManager };
}
