# claude-borealis

**Borealis Mocha**: 
A Claude Code look for the desktop and mobile apps: the Borealis idea
(an aurora over mountain ridges and a mirroring lake, drawn in dots) rebuilt
on Catppuccin colours.

- **Night (dark mode): Catppuccin Mocha.** Teal accent like the aurora's lower
  edge, mauve for its crown, the Mocha base/mantle/crust ladder for surfaces.
  The scene shows teal → sky → sapphire → blue → mauve curtains swaying over
  three ridges, with twinkling stars, a crescent moon and a shooting star
  every 13 seconds.
- **Day (light mode): Catppuccin Latte.** Teal and pink, a two-ink print on
  Latte paper, with a low pink sun and curtains thinned to dawn bands.
- Code highlighting asks for `catppuccin-mocha` / `catppuccin-latte` where the
  surface offers them.
- The scene is one SVG (no script, no network), seen through a 3-unit dot
  screen, animated with CSS, and held still under reduced motion.

The terminal and editors draw no look, so there it does nothing.

![The night scene: teal, blue and mauve aurora curtains over dark ridges and a lake](preview-scene.svg)

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install borealis --marketplace vanhoof/claude-borealis
```

Answer `y` to add the marketplace, then pick a scope (user is first). From a shell:

```bash
claude plugin install borealis --marketplace vanhoof/claude-borealis
```

In the desktop app, where `/plugin` does not run: click **+** next to the prompt
box, then **Plugins**, **Add marketplace** with `vanhoof/claude-borealis`, then
**Add plugin**.

The look applies when a session starts; on the desktop app's New screen it
appears after your first message.

Inspired by [Adolanium/hermes-borealis](https://github.com/Adolanium/hermes-borealis)
(MIT); colours from [Catppuccin](https://catppuccin.com/palette) (MIT). The
scene art and code here are new.
