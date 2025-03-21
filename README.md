**README.md**


# NewsTracker Module 📰

A customizable, themeable news ticker component for continuous scrolling content displays. Easily integrate into any web project.

## Features

- 📦 Modular ES6 implementation
- 🎨 5 built-in themes + custom theme support
- 🔄 Continuous seamless scrolling
- ⚡ Responsive design
- 🕹️ API controls (start/pause/update)
- 📱 Mobile-friendly

## Installation

### NPM/Yarn (Coming Soon)
```bash
# (Package publication planned for future release)
# npm install news-tracker-js
```

## Usage

### Basic Implementation
```javascript
const tracker = new NewsTracker({
  containerSelector: '#news-container',
  newsData: [
    { title: 'Tech Breakthrough', category: 'Technology' },
    { title: 'Market Update', category: 'Finance' }
  ],
  scrollSpeed: 30,
  autoStart: true
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `containerSelector` | string | `#news-tracker-container` | CSS selector for container |
| `newsData` | Array | `[]` | Array of {title, category} objects |
| `scrollSpeed` | number | 40 | Animation duration (seconds) |
| `themes` | Object | Built-in themes | Custom theme definitions |
| `autoStart` | boolean | true | Auto-start animation |

## API Methods

```javascript
// Change theme
tracker.setTheme('dark');

// Control animation
tracker.start();
tracker.pause();

// Update content
tracker.updateNews([...new items...]);

// Clean up
tracker.destroy();
```

## Custom Themes
```javascript
const customThemes = {
  ...NewsTracker.defaultOptions.themes,
  'midnight': {
    background: '#0a192f',
    text: '#64ffda',
    itemBg: '#172a45',
    itemBorder: '#64ffda'
  }
};

new NewsTracker({ themes: customThemes });
```

## Development

1. Clone repository
   ```bash
   git clone https://github.com/zoxxx/news-tracker.git
   ```

2. Start local server
   ```bash
   python3 -m http.server 8000
   ```
   Visit `http://localhost:8000`

## Contributing

Pull requests welcome! For major changes, please open an issue first.

## License

MIT © [zoxxx]
