# PG Manager web — visual system

The app shares its design language with the StoreKit merchant app (`ecommnerce/mobile`): warm neutrals, one confident orange accent, soft corners, and Urbanist display type over Plus Jakarta Sans. Light theme only.

## Tokens (`:root` in `src/styles.css`)

| Role | Value |
| --- | --- |
| Primary / pressed / subtle / tint | `#e2511e` / `#b83e15` / `#fef1ea` / `#fde3d3` |
| Canvas / surface / muted surface | `#f4f4f6` / `#ffffff` / `#eeeef1` |
| Text primary / secondary / muted / disabled | `#101014` / `#45454f` / `#5b5b66` / `#8a8a95` |
| Border / strong | `#e6e6ea` / `#d3d3d9` |
| Success / warning / error / info | `#15803d` / `#b45309` / `#be123c` / `#1d4ed8` (each with a tint) |

- **Fonts:** Urbanist 600/700 is used for headings and stat figures (`--font-display`). Plus Jakarta Sans 400–700 is used for everything else. Both load from Google Fonts in `index.html`.
- **Radii:** `--r-sm` 12, `--r` 16 (controls), `--r-lg` 24 (cards). **Shadows:** `--shadow-sm`, `--shadow`, `--shadow-lift`.
- **Controls:** inputs are 52px tall with a 1.5px border, and tint orange on focus and red on error. Buttons are 48px, bold, and scale down slightly when pressed. Badges and chips are pills. Stats are separate shadowed tiles.
- Old teal values must not come back. The last block of `styles.css` sets the type and the focus ring.

## Boundaries

Only presentation changed. API calls, payloads, validation, query keys and navigation routes are the same as before.

## Landing page and sign-in

- `src/screens/Marketing.jsx` + `src/marketing.css`: the public site. Its classes are namespaced (`lp-`, `story-`, `sc-`), and its resets use `:where()`, so they never out-rank a component class.
- `src/components/BedBoard.jsx`: the bed board (rooms as cards, beds as chips: orange = occupied, dashed = vacant, marigold = on notice). It's the hero, the scroll story and the sign-in panel.
- Motion: one load moment (beds fill in, counter counts up) plus the scroll story, which swaps the board state as each date (1st, 5th, 18th, 30th) reaches mid-screen. Both are off under `prefers-reduced-motion`.
- `src/screens/LoginScreen.jsx` + `src/auth.css`: split screen (dark bed-board panel and form). `auth.css` also styles the shared `.auth-shell` / `.auth-card` used by the billing and delete-account screens.
- Copy only states what the product does. No price is shown until `BILLING_PLAN_AMOUNT` is set.
