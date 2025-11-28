# Animated Icons Assets

Place your downloaded Lottie JSON files from https://animatedicons.co/icons/minimalistic?type=free here.

Recommended filenames to match the current mapping in `icon-loader.js`:

- `dashboard.json`
- `trophy.json`
- `book.json`
- `chat.json`
- `calendar.json`
- `logout.json`
- `check.json`
- `target.json`
- `timer.json`
- `megaphone.json`

You can also override per element by setting a custom `data-src` attribute with a direct path to a JSON file.

Usage notes:
- We use Lottie Web to render animations.
- Icons loop and autoplay by default.
- If a JSON file is missing, the UI will gracefully fall back to the original emoji.