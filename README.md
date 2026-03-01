# Baby Gender Reveal — Scratch-Off Game

A mobile-friendly, interactive scratch-off game for baby gender reveal parties. Guests scratch 3×3 cards to discover the baby's gender, with a progress bar, animated effects, and a confetti celebration.

**Live demo:** [canalesb93.github.io/gender-reveal](https://canalesb93.github.io/gender-reveal/)

## Features

- **Scratch-off mechanic** — Canvas-based with smooth touch support and retina rendering
- **Progressive reveal** — Background color bleeds through as you scratch, building anticipation
- **Progress bar** — Tracks boy vs. girl reveals with animated emoji reactions
- **Celebration screen** — Confetti explosions, emoji rain, and a customizable reveal message
- **Rigged mode** — Add `?rigged` to the URL for a dramatic predetermined reveal arc
- **Fully configurable** — Change the gender, colors, emojis, text, and more via `config.js`
- **Mobile-first** — Optimized for iOS Safari (safe areas, touch handling, no scroll/zoom)
- **Zero build step** — Pure HTML, CSS, and vanilla JS. Just serve the files.

## Quick Start

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/gender-reveal.git
   cd gender-reveal
   ```

2. Edit `config.js` to set the baby's gender, names, and other details.

3. Serve the files with any static HTTP server:
   ```bash
   # Python
   python3 -m http.server 8000

   # Node.js (npx, no install needed)
   npx serve .

   # PHP
   php -S localhost:8000
   ```

4. Open `http://localhost:8000` in your browser.

## Configuration

All customization is done in [`config.js`](config.js). Here are the key options:

| Option | Type | Default | Description |
|---|---|---|---|
| `gender` | `'boy'` or `'girl'` | `'girl'` | The baby's gender — all colors, emojis, and text auto-derive from this |
| `title` | string | `'Baby Gender Reveal'` | Main heading above the grid |
| `subtitle` | string | `'Scratch to find out!'` | Subheading / instructions |
| `dueDate` | string or `null` | `null` | Due date shown on celebration (e.g. `'Coming July 2026'`) |
| `parentNames` | string or `null` | `null` | Names shown at the bottom of the celebration screen |
| `celebrationImage` | string or `null` | `null` | Path to an image on the celebration screen (e.g. ultrasound) |
| `ogImage` | string or `null` | `null` | Full URL to a preview image for social media sharing |
| `riggedSequence` | array | drama arc | Predetermined reveal order when `?rigged` is in the URL |

Colors (pink/blue), emojis (👧/👦), celebration text ("It's a Girl!"/"It's a Boy!"), confetti, and emoji rain are all automatically derived from the `gender` setting.

### Example: Configuring for a Boy Reveal

```js
var REVEAL_CONFIG = {
  gender: 'boy',
  title: "Alex & Jordan's",
  subtitle: 'Baby Gender Reveal',
  dueDate: 'Coming March 2026',
  parentNames: 'Alex & Jordan',
  celebrationImage: 'ultrasound.png',
  riggedSequence: ['boy', 'boy', 'girl', 'girl', 'girl', 'girl', 'boy', 'boy', 'boy'],
};
```

## Rigged Mode

Append `?rigged` to the URL to reveal cards in the order specified by `riggedSequence` in your config. This is useful for a live party reveal where you want a dramatic arc (e.g., the losing side takes the lead, then the winning side comes back).

After the first play, the rigged param is automatically removed so replays are random.

## Deployment

This is a static site — no build step, no server-side logic. Deploy it anywhere that can serve static files:

**Simple hosting:**
- Upload the files to any web server or VPS and serve with nginx, Apache, or a simple HTTP server
- Point a domain at the server if desired

**Cloud / PaaS:**
- **Netlify / Vercel / Cloudflare Pages** — Connect your repo and deploy automatically
- **GitHub Pages** — Enable Pages in repo settings and set the source to the `main` branch
- **AWS S3 + CloudFront** — Upload files to an S3 bucket with static website hosting enabled

**VPS (manual):**
```bash
# Copy files to your server
scp -r . user@your-server:~/gender-reveal/

# SSH in and serve
ssh user@your-server
cd ~/gender-reveal
python3 -m http.server 80
```

### Adding a Custom Image

To show an image on the celebration screen (e.g. an ultrasound photo):

1. Place the image in the project directory
2. Set `celebrationImage: 'your-image.png'` in `config.js`

For social media link previews (Open Graph):

1. Place a preview image in the project directory
2. Set `ogImage: 'https://your-domain.com/og-image.jpg'` in `config.js` (must be a full URL)

## File Structure

```
gender-reveal/
├── index.html   — HTML structure (rarely needs editing)
├── style.css    — All styles and animations
├── app.js       — Game logic, scratch mechanic, effects
├── config.js    — Your customization (edit this!)
└── README.md    — You are here
```

## Browser Support

Tested on:
- iOS Safari 16+ (primary target)
- Chrome / Edge (desktop & mobile)
- Firefox (desktop & mobile)

## License

MIT
