/**
 * NewsTracker - A modular scrolling news ticker with theme support
 * @version 1.0.0
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
   */

  /**
   * Default configuration
   * @type {NewsTrackerOptions}
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
    scrollSpeed: 40,
    autoStart: true
  };

  /**
   * Create a NewsTracker instance
   * @param {NewsTrackerOptions} options - Configuration options
   */
  constructor(options = {}) {
    this.config = { ...NewsTracker.defaultOptions, ...options };
    this.container = document.querySelector(this.config.containerSelector);
    this.currentTheme = 'default';
    this.isRunning = false;
    
    if (!this.container) {
      console.error('NewsTracker: Container element not found');
      return;
    }

    this.initialize();
    this.config.autoStart && this.start();
  }

  /**
   * Initialize the ticker DOM and styles
   */
  initialize() {
    this.injectStyles();
    this.createTickerStructure();
    this.generateNewsItems();
    this.setTheme('default');
    this.addEventListeners();
  }

  /**
   * Create base DOM structure
   */
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
        </div>
      </div>
    `;
  }

  /**
   * Generate news items from provided data
   */
  generateNewsItems() {
    const content = this.container.querySelector('.nt-ticker-content');
    content.innerHTML = '';
    
    // Create original items
    const fragment = document.createDocumentFragment();
    this.config.newsData.forEach(article => {
      fragment.appendChild(this.createNewsItem(article));
    });
    content.appendChild(fragment);
    
    // Clone items for seamless loop
    const clone = content.cloneNode(true);
    clone.classList.add('nt-cloned');
    content.parentNode.appendChild(clone);
  }

  /**
   * Create individual news item element
   * @param {Object} article 
   * @returns {HTMLElement}
   */
  createNewsItem(article) {
    const item = document.createElement('div');
    item.className = 'nt-news-item';
    item.innerHTML = `
      <strong>[${article.category}]</strong>
      ${article.title}
      <span class="nt-timestamp">${this.getTimeStamp()}</span>
    `;
    return item;
  }

  /**
   * Inject required CSS styles
   */
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
        animation: nt-scroll ${this.config.scrollSpeed}s linear infinite;
      }

      .nt-ticker-content.nt-cloned {
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

      @keyframes nt-scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Set active theme
   * @param {string} themeName 
   */
  setTheme(themeName) {
    if (!this.config.themes[themeName]) {
      console.warn(`NewsTracker: Theme "${themeName}" not found`);
      return;
    }

    this.currentTheme = themeName;
    const theme = this.config.themes[themeName];
    this.container.style.backgroundColor = theme.background;
    this.container.style.color = theme.text;
    
    this.container.querySelectorAll('.nt-news-item').forEach(item => {
      item.style.backgroundColor = theme.itemBg;
      item.style.border = `1px solid ${theme.itemBorder}`;
    });
  }

  /**
   * Start the ticker animation
   */
  start() {
    this.isRunning = true;
    this.container.querySelector('.nt-ticker-content').style.animationPlayState = 'running';
  }

  /**
   * Pause the ticker animation
   */
  pause() {
    this.isRunning = false;
    this.container.querySelector('.nt-ticker-content').style.animationPlayState = 'paused';
  }

  /**
   * Update news data
   * @param {Object[]} newData 
   */
  updateNews(newData) {
    this.config.newsData = newData;
    this.generateNewsItems();
  }

  /**
   * Add event listeners
   */
  addEventListeners() {
    this.container.querySelector('.nt-theme-select').addEventListener('change', (e) => {
      this.setTheme(e.target.value);
    });

    window.addEventListener('resize', () => {
      const ticker = this.container.querySelector('.nt-ticker-content');
      ticker.style.animation = 'none';
      setTimeout(() => {
        ticker.style.animation = `nt-scroll ${this.config.scrollSpeed}s linear infinite`;
      }, 10);
    });
  }

  /**
   * Generate timestamp
   * @returns {string}
   */
  getTimeStamp() {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

  /**
   * Destroy the instance and clean up
   */
  destroy() {
    window.removeEventListener('resize', this.handleResize);
    this.container.innerHTML = '';
    this.container.style = '';
  }
}

export default NewsTracker;