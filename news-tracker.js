/**
 * NewsTracker - A modular scrolling news ticker with theme support
 * @version 1.1.0
 * @license MIT
 */
class NewsTracker {
  /**
   * @typedef {Object} NewsTrackerOptions
   * @property {string} containerSelector - CSS selector for the container element
   * @property {Object[]} newsData - Array of news articles
   * @property {Object} themes - Custom theme definitions
   * @property {number} scrollSpeed - Animation duration in seconds
   * @property {boolean} autoStart - Whether to start animation immediately
   * @property {number} idleTimeout - Seconds of inactivity before restarting
   */

  static defaultOptions = {
    containerSelector: '#news-tracker-container',
    newsData: [],
    themes: {
      default: { background: '#f0f0f0', text: '#333', itemBg: '#fff', itemBorder: '#ddd' },
      dark: { background: '#1a1a1a', text: '#fff', itemBg: '#333', itemBorder: '#444' },
      blue: { background: '#e3f2fd', text: '#0d47a1', itemBg: '#bbdefb', itemBorder: '#90caf9' },
      green: { background: '#e8f5e9', text: '#2e7d32', itemBg: '#c8e6c9', itemBorder: '#a5d6a7' },
      modern: { background: '#212121', text: '#00ff9d', itemBg: '#424242', itemBorder: '#00ff9d' }
    },
    scrollSpeed: 100,
    autoStart: true,
    idleTimeout: 5
  };

  constructor(options = {}) {
    this.config = { ...NewsTracker.defaultOptions, ...options };
    this.container = document.querySelector(this.config.containerSelector);
    this.currentTheme = 'default';
    this.isScrolling = false;
    this.scrollPosition = 0;
    this.contentWidth = 0;
    this.animationFrameId = null;
    this.isDragging = false;
    this.isHovered = false;
    this.idleTimeoutId = null;
    
    if (!this.container) {
      console.error('NewsTracker: Container element not found');
      return;
    }

    this.initialize();
    this.config.autoStart && this.start();
  }

  initialize() {
    this.injectStyles();
    this.createTickerStructure();
    this.generateNewsItems();
    this.setTheme('default');
    this.addEventListeners();
  }

  createTickerStructure() {
    this.container.innerHTML = `
      <div class="nt-theme-selector">
        <select class="nt-theme-select">
          ${Object.keys(this.config.themes).map(theme => `
            <option value="${theme}">${theme.charAt(0).toUpperCase() + theme.slice(1)}</option>
          `).join('')}
        </select>
      </div>
      <div class="nt-ticker-container">
        <div class="nt-ticker-wrapper">
          <div class="nt-ticker-content"></div>
          <div class="nt-ticker-content nt-cloned"></div>
        </div>
      </div>
    `;
  }

  generateNewsItems() {
    const content = this.container.querySelector('.nt-ticker-content');
    const clone = this.container.querySelector('.nt-cloned');
    content.innerHTML = '';
    
    this.config.newsData.forEach(article => {
      content.appendChild(this.createNewsItem(article));
    });
    
    clone.innerHTML = content.innerHTML;
    this.contentElements = [content, clone];
    this.contentWidth = content.offsetWidth;
  }

  createNewsItem(article) {
    const item = document.createElement('div');
    item.className = 'nt-news-item';
    item.innerHTML = `
      <strong>[${article.category}]</strong>
      ${article.title}
      <a href="${article.url}">[more]</a>
    `;
    return item;
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .nt-ticker-container {
        overflow: hidden;
        white-space: nowrap;
        position: relative;
        padding: 15px 0;
      }
      .nt-ticker-wrapper {
        display: inline-block;
        position: relative;
      }
      .nt-ticker-content {
        display: inline-block;
        position: relative;
      }
      .nt-cloned {
        position: absolute;
        left: 100%;
        top: 0;
      }
      .nt-news-item {
        display: inline-block;
        margin-right: 40px;
        padding: 10px 20px;
        border-radius: 5px;
        transition: all 0.3s ease;
      }
      .nt-theme-selector {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 1000;
      }
    `;
    document.head.appendChild(style);
  }

  setTheme(themeName) {
    if (!this.config.themes[themeName]) return;
    this.currentTheme = themeName;
    const theme = this.config.themes[themeName];
    this.container.style.backgroundColor = theme.background;
    this.container.style.color = theme.text;
    this.container.querySelectorAll('.nt-news-item').forEach(item => {
      item.style.backgroundColor = theme.itemBg;
      item.style.border = `1px solid ${theme.itemBorder}`;
    });
  }

  start() {
    if (this.isScrolling || !this.contentWidth) return;
    this.isScrolling = true;
    this.lastFrameTime = performance.now();
    this.animationLoop();
  }

  animationLoop() {
    if (!this.isScrolling) return;
    
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    const pixelsPerSecond = (this.contentWidth / 2) / this.config.scrollSpeed;
    this.scrollPosition += (deltaTime / 1000) * pixelsPerSecond;

    if (this.scrollPosition >= this.contentWidth) {
      this.scrollPosition -= this.contentWidth;
    }

    this.applyScrollPosition();
    this.animationFrameId = requestAnimationFrame(() => this.animationLoop());
  }

  applyScrollPosition() {
    const translateX = -this.scrollPosition;
    this.contentElements.forEach(el => {
      el.style.transform = `translateX(${translateX}px)`;
    });
  }

  pause() {
    this.isScrolling = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  updateNews(newData) {
    this.config.newsData = newData;
    this.generateNewsItems();
  }

  addEventListeners() {
    this.container.querySelector('.nt-theme-select').addEventListener('change', (e) => {
      this.setTheme(e.target.value);
    });

    // Hover handling
    this.container.addEventListener('mouseenter', () => {
      this.isHovered = true;
      this.pause();
    });
    this.container.addEventListener('mouseleave', () => {
      this.isHovered = false;
      if (!this.isDragging) this.start();
    });

    // Touch events
    this.container.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    this.container.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    this.container.addEventListener('touchend', () => this.handleTouchEnd());

    // Mouse drag events
    this.container.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.container.addEventListener('mouseup', () => this.handleMouseUp());
    this.container.addEventListener('mouseleave', () => this.handleMouseUp());

    // Idle timer reset
    this.container.addEventListener('mousemove', this.recordInteraction.bind(this));
    this.container.addEventListener('touchmove', this.recordInteraction.bind(this));

    window.addEventListener('resize', () => {
      this.contentWidth = this.container.querySelector('.nt-ticker-content').offsetWidth;
    });
  }

  handleTouchStart(e) {
    this.isDragging = true;
    this.startX = e.touches[0].clientX;
    this.startScrollPosition = this.scrollPosition;
    this.pause();
    this.recordInteraction();
    e.preventDefault();
  }

  handleTouchMove(e) {
    if (!this.isDragging) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - this.startX;
    this.scrollPosition = Math.max(0, Math.min(this.startScrollPosition - deltaX, this.contentWidth));
    this.applyScrollPosition();
    this.recordInteraction();
    e.preventDefault();
  }

  handleTouchEnd() {
    this.isDragging = false;
    this.recordInteraction();
  }

  handleMouseDown(e) {
    this.isDragging = true;
    this.startX = e.clientX;
    this.startScrollPosition = this.scrollPosition;
    this.pause();
    this.recordInteraction();
    e.preventDefault();
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;
    const currentX = e.clientX;
    const deltaX = currentX - this.startX;
    this.scrollPosition = Math.max(0, Math.min(this.startScrollPosition - deltaX, this.contentWidth));
    this.applyScrollPosition();
    this.recordInteraction();
    e.preventDefault();
  }

  handleMouseUp() {
    this.isDragging = false;
    this.recordInteraction();
  }

  recordInteraction() {
    clearTimeout(this.idleTimeoutId);
    this.idleTimeoutId = setTimeout(() => {
      if (!this.isDragging && !this.isHovered) {
        this.start();
      }
    }, this.config.idleTimeout * 1000);
  }

  destroy() {
    this.pause();
    window.removeEventListener('resize', this.handleResize);
    this.container.innerHTML = '';
    this.container.style = '';
  }
}

export default NewsTracker;