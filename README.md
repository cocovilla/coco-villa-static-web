# Coco Villa Unawatuna — Static Website

A fully static HTML/CSS/JS website for **Coco Villa Unawatuna**, designed for hosting on GitHub Pages. No server, database, or build step required.

## Structure

```
static_web/
├── index.html        # Main page (single-page site)
├── style.css         # All styles (no framework dependencies)
├── app.js            # Vanilla JS (navbar, gallery, carousel, modal, map)
├── .nojekyll         # GitHub Pages: disable Jekyll processing
└── assets/           # All images (copied from /client/public)
    ├── logo.png
    ├── hero.png
    ├── beach.jpg
    ├── path.jpg
    ├── coconut.png
    ├── rain.jpg
    ├── fruit.jpeg
    ├── room_detail.jpg
    ├── room_bed.jpg
    └── room_kitchen.jpg
```

## Deploying to GitHub Pages

1. Push the contents of this `static_web/` folder to the `gh-pages` branch (or to the `docs/` folder of your repo, configured in Settings > Pages).
2. In **GitHub → Settings → Pages**, set the source to `gh-pages` branch / root.
3. Your site will be live at `https://<username>.github.io/<repo>/`

## Before Go-Live Checklist

- [ ] Replace `https://wa.me/94XXXXXXXXX` with the real WhatsApp number in `index.html` (3 occurrences).
- [ ] Replace `https://www.booking.com` with the direct property link.
- [ ] Replace `https://www.airbnb.com` with the direct listing link.
- [ ] Update social media links in the footer.
- [ ] Add real `og:image` and Open Graph meta tags for social sharing.

## Features

- ✅ 100% static — no API calls, no database
- ✅ Booking modal with Booking.com, Airbnb, and WhatsApp options
- ✅ Drag-scrollable garden photo gallery
- ✅ Auto-advancing room image carousel
- ✅ Interactive Google Maps with nearby attraction previews
- ✅ Smooth scroll reveal animations
- ✅ Mobile-responsive, accessible (WCAG AA)
- ✅ Google Fonts (Playfair Display + Jost)
- ✅ Focus-trapped modal with keyboard navigation
