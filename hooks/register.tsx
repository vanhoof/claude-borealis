import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'


// ════════════════════════════════════════════════════════════════════════
// Palette
// ════════════════════════════════════════════════════════════════════════

// Catppuccin, two flavours: Mocha is the night, Latte is the dawn.
// https://catppuccin.com/palette (MIT). Only the official swatches are used,
// plus two in-between surface steps where the design system wants a closer
// ladder than Catppuccin's own base → surface0 jump.

const MOCHA = {
  rosewater: '#f5e0dc',
  flamingo: '#f2cdcd',
  pink: '#f5c2e7',
  mauve: '#cba6f7',
  red: '#f38ba8',
  maroon: '#eba0ac',
  peach: '#fab387',
  yellow: '#f9e2af',
  green: '#a6e3a1',
  teal: '#94e2d5',
  sky: '#89dceb',
  sapphire: '#74c7ec',
  blue: '#89b4fa',
  lavender: '#b4befe',
  text: '#cdd6f4',
  subtext1: '#bac2de',
  subtext0: '#a6adc8',
  overlay2: '#9399b2',
  overlay1: '#7f849c',
  overlay0: '#6c7086',
  surface2: '#585b70',
  surface1: '#45475a',
  surface0: '#313244',
  base: '#1e1e2e',
  mantle: '#181825',
  crust: '#11111b',
} as const

const LATTE = {
  rosewater: '#dc8a78',
  flamingo: '#dd7878',
  pink: '#ea76cb',
  mauve: '#8839ef',
  red: '#d20f39',
  maroon: '#e64553',
  peach: '#fe640b',
  yellow: '#df8e1d',
  green: '#40a02b',
  teal: '#179299',
  sky: '#04a5e5',
  sapphire: '#209fb5',
  blue: '#1e66f5',
  lavender: '#7287fd',
  text: '#4c4f69',
  subtext1: '#5c5f77',
  subtext0: '#6c6f85',
  overlay2: '#7c7f93',
  overlay1: '#8c8fa1',
  overlay0: '#9ca0b0',
  surface2: '#acb0be',
  surface1: '#bcc0cc',
  surface0: '#ccd0da',
  base: '#eff1f5',
  mantle: '#e6e9ef',
  crust: '#dce0e8',
} as const

// What makeColors is given. Night: a teal (mint) accent like the aurora's lower
// edge, mauve for the violet crown. Day: Latte teal and pink, the two inks.
const DEFINITION = {
  label: 'Borealis Mocha',
  id: 'borealis-mocha',
  codeTheme: { dark: 'catppuccin-mocha', light: 'catppuccin-latte' },
  dark: {
    roles: {
      accent: MOCHA.teal,
      danger: MOCHA.red,
      success: MOCHA.green,
      warning: MOCHA.yellow,
      pro: MOCHA.mauve,
    },
    gray: {
      anchors: {
        'surface-0': MOCHA.base,
        'surface-1': '#232334',
        'surface-2': '#28283a',
        'surface-3': '#2c2d3f',
        'text-primary': MOCHA.text,
        'text-secondary': MOCHA.subtext1,
        'text-muted': MOCHA.subtext0,
      },
    },
    git: {
      added: MOCHA.green,
      removed: MOCHA.red,
      modified: MOCHA.yellow,
      merged: MOCHA.mauve,
      closed: MOCHA.maroon,
      conflicting: MOCHA.peach,
      draft: MOCHA.overlay2,
    },
  },
  light: {
    roles: {
      accent: LATTE.teal,
      danger: LATTE.red,
      success: LATTE.green,
      warning: LATTE.yellow,
      pro: LATTE.pink,
    },
    gray: {
      anchors: {
        'surface-0': LATTE.mantle,
        'surface-1': LATTE.base,
        'surface-2': '#f6f7fa',
        'surface-3': '#f6f7fa',
        'text-primary': LATTE.text,
        'text-secondary': LATTE.subtext1,
        'text-muted': LATTE.subtext0,
      },
    },
    git: {
      // Latte's green, yellow and peach are pale on its own paper; these are
      // the same hues taken a step darker so diffs stay legible.
      added: '#358a22',
      removed: LATTE.red,
      modified: '#a8690f',
      merged: LATTE.mauve,
      closed: LATTE.maroon,
      conflicting: '#c4530a',
      draft: LATTE.subtext0,
    },
  },
}

// ════════════════════════════════════════════════════════════════════════
// Scene
// ════════════════════════════════════════════════════════════════════════

// The scene: aurora curtains over three ridges and a lake that mirrors them,
// under stars, a crescent moon and the odd shooting star. By day (a light
// colour scheme in the scene's frame) it turns into a two-ink Latte print:
// pink and teal ridges on paper, a low pink sun, curtains thinned to dawn bands.
//
// Everything is seen through a dot screen, one dot per 3 units, so the art
// reads as dithered print. The SVG is built once, here, from a seeded random
// source, so it is the same picture every time; it runs no script and moves
// with CSS alone (and holds still under reduced motion).

const SCENE_NAME = 'borealis-mocha'

const W = 1600
const HEIGHT = 1000
const HORIZON = 880 // the lake's far shore
const CELL = 3 // one dot per cell

function random(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// A smooth wandering line in about [-1, 1]: a few octaves of sines.
function wander(r: () => number, octaves: number, period: number): (x: number) => number {
  const parts = Array.from({ length: octaves }, (_, i) => ({
    f: ((Math.PI * 2) / period) * Math.pow(2.13, i) * (0.8 + r() * 0.4),
    p: r() * Math.PI * 2,
    a: Math.pow(0.52, i),
  }))
  const total = parts.reduce((sum, part) => sum + part.a, 0)
  return x => parts.reduce((sum, part) => sum + part.a * Math.sin(x * part.f + part.p), 0) / total
}

const n = (v: number) => Math.round(v)

// A closed shape between two lines over x, as one compact path.
function band(xs: number[], lower: (x: number) => number, upper: (x: number) => number): string {
  const bottom = xs.map(x => `${n(x)},${n(lower(x))}`)
  const top = xs
    .slice()
    .reverse()
    .map(x => `${n(x)},${n(upper(x))}`)
  return `M${bottom.join(' ')} ${top.join(' ')}Z`
}

function span(from: number, to: number, step: number): number[] {
  const out: number[] = []
  for (let x = from; x <= to; x += step) out.push(x)
  return out
}

// ── Aurora ───────────────────────────────────────────────────────────────
// Each curtain hangs from a wandering lower edge and is stacked from five
// bands that follow it, bright at the rim and thinning upward: the steps of
// a five-ink dither. A mask of vertical rays striates it and drifts sideways.

// `cover` is how much of the width a curtain fills: where its envelope falls
// to nothing the sky shows through between curtains.
const CURTAINS = [
  { edge: 655, reach: 380, cover: 0.35, seed: 11, sway: 'swayA' },
  { edge: 560, reach: 300, cover: 0.05, seed: 23, sway: 'swayB' },
  { edge: 470, reach: 220, cover: -0.2, seed: 37, sway: 'swayC' },
] as const

// Where each band ends, as a share of the curtain's reach at that x; the rim
// band also keeps a floor in units so it stays a bright line.
const STEPS = [0.05, 0.14, 0.3, 0.52, 0.76, 1]

const smooth = (v: number) => {
  const t = Math.min(1, Math.max(0, v))
  return t * t * (3 - 2 * t)
}

function curtain(index: number): string {
  const c = CURTAINS[index]!
  const r = random(c.seed)
  const edgeLine = wander(r, 4, 900)
  const reachLine = wander(r, 3, 520)
  const envelope = wander(r, 2, 1300)
  const xs = span(-120, W + 120, 16)
  const env = (x: number) => smooth((envelope(x) + c.cover) * 1.8)
  const edge = (x: number) => c.edge + 70 * edgeLine(x)
  const reach = (x: number) => c.reach * env(x) * (0.55 + 0.45 * reachLine(x))
  const offsets = [0, ...STEPS]
  const at = (share: number, x: number) => (share === 0 ? 0 : Math.max(share * reach(x), Math.min(12, reach(x))))
  const paths = STEPS.map((_, step) => {
    const lower = (x: number) => edge(x) - at(offsets[step]!, x)
    const upper = (x: number) => edge(x) - at(offsets[step + 1]!, x)
    return `<path class="a${step}" d="${band(xs, lower, upper)}"/>`
  })
  // a faint glow hanging just below the rim
  const glow = `<path class="ag" d="${band(xs, x => edge(x) + 22 * env(x), x => edge(x))}"/>`

  return `<g class="curtain ${c.sway}" mask="url(#rays${index})">${glow}${paths.join('')}</g>`
}

function rayMasks(): string {
  const r = random(5)
  const masks = [0, 1, 2].map(index => {
    const rects: string[] = []
    let x = 0
    while (x < 600) {
      const w = CELL * (1 + Math.floor(r() * 4))
      const strength = 0.3 + 0.7 * Math.pow(r(), 1.6)
      rects.push(`<rect x="${x}" width="${w}" height="${HEIGHT}" fill-opacity="${strength.toFixed(2)}"/>`)
      x += w
    }
    return (
      `<pattern id="rp${index}" width="600" height="${HEIGHT}" patternUnits="userSpaceOnUse">` +
      `<g fill="#fff">${rects.join('')}</g></pattern>` +
      `<mask id="rays${index}" maskUnits="userSpaceOnUse" x="-400" y="0" width="${W + 800}" height="${HEIGHT}">` +
      `<rect class="drift d${index}" x="-1200" y="0" width="${W + 2400}" height="${HEIGHT}" fill="url(#rp${index})"/></mask>`
    )
  })
  return masks.join('')
}

// ── Ridges ───────────────────────────────────────────────────────────────

function ridge(seed: number, base: number, height: number, period: number): string {
  const r = random(seed)
  const line = wander(r, 3, period)
  const grit = wander(r, 2, 90)
  const xs = span(-20, W + 20, 8)
  const crest = (x: number) => {
    const sharp = 1 - Math.abs(line(x)) // ridged: sharp crests
    return base - height * (0.2 + 0.8 * sharp * sharp * sharp) - 3 * grit(x)
  }
  return band(xs, () => HORIZON + 2, crest)
}

// ── Sky details ──────────────────────────────────────────────────────────

function stars(): string {
  const r = random(97)
  const out: string[] = []
  // One dot per screen cell: (dx, dy) in cells from the star's own cell.
  const dots = (x: number, y: number, cells: [number, number][]) =>
    cells.map(([dx, dy]) => `M${x + dx * CELL},${y + dy * CELL}h2v2h-2z`).join('')
  const SMALL: [number, number][] = [[0, 0]]
  const MEDIUM: [number, number][] = [[0, 0], [1, 0], [0, 1], [1, 1]]
  const CROSS: [number, number][] = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]
  const SPARK: [number, number][] = [...CROSS, [-2, 0], [2, 0], [0, -2], [0, 2]]
  for (let i = 0; i < 170; i++) {
    const x = CELL * Math.floor((r() * W) / CELL) + 0.5
    const y = CELL * Math.floor((Math.pow(r(), 1.3) * 640) / CELL) + 0.5
    const kind = r()
    const delay = (r() * 9).toFixed(1)
    const speed = (2.5 + r() * 4.5).toFixed(1)
    const style = `animation-delay:-${delay}s;animation-duration:${speed}s`
    if (kind < 0.06) {
      // a few flare: a long twinkle that now and then flashes out into a spark
      const flare = `animation-delay:-${delay}s;animation-duration:${(7 + r() * 6).toFixed(1)}s`
      out.push(`<path class="fl" style="${flare}" d="${dots(x, y, SPARK)}"/>`)
    } else {
      const shape = kind < 0.2 ? CROSS : kind < 0.45 ? MEDIUM : SMALL
      out.push(`<path class="tw" style="${style}" d="${dots(x, y, shape)}"/>`)
    }
  }
  return `<g class="stars">${out.join('')}</g>`
}

// Shooting stars: a bright head with a fading tail, each on its own path and
// clock so they don't arrive in step.
const METEORS = [
  { from: [1300, 90], to: [900, 250], every: 9, delay: 2 },
  { from: [520, 60], to: [180, 200], every: 14, delay: 7 },
  { from: [1050, 210], to: [760, 330], every: 19, delay: 12 },
] as const

function meteors(): { keyframes: string; groups: string; gradients: string } {
  const keyframes = METEORS.map(
    (m, i) =>
      `@keyframes mt${i}{0%,88%{opacity:0;transform:translate(${m.from[0]}px,${m.from[1]}px)}` +
      `89%{opacity:1;transform:translate(${m.from[0]}px,${m.from[1]}px)}` +
      `96%{opacity:0;transform:translate(${m.to[0]}px,${m.to[1]}px)}` +
      `100%{opacity:0;transform:translate(${m.to[0]}px,${m.to[1]}px)}}` +
      `.mt${i}{animation:mt${i} ${m.every}s linear infinite ${m.delay}s}`,
  ).join('')
  const groups = METEORS.map((m, i) => {
    const dx = m.from[0] - m.to[0]
    const dy = m.to[1] - m.from[1]
    const len = Math.hypot(dx, dy)
    // the tail points back up the way the meteor came
    const tx = n((240 * dx) / len)
    const ty = n((-240 * dy) / len)
    return (
      `<g class="meteor mt${i}">` +
      `<line x1="0" y1="0" x2="${tx}" y2="${ty}" stroke="url(#trail${i})" stroke-width="3" stroke-linecap="round"/>` +
      `<rect class="mhead" x="-2" y="-2" width="5" height="5"/></g>`
    )
  }).join('')
  const gradients = METEORS.map((m, i) => {
    const dx = m.from[0] - m.to[0]
    const dy = m.to[1] - m.from[1]
    const len = Math.hypot(dx, dy)
    return `<linearGradient id="trail${i}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${n((240 * dx) / len)}" y2="${n((-240 * dy) / len)}"><stop class="ms0" offset="0"/><stop class="ms1" offset="1"/></linearGradient>`
  }).join('')
  return { keyframes, groups, gradients }
}

const METEOR_PARTS = meteors()

function ripples(): string {
  const r = random(61)
  const out: string[] = []
  for (let i = 0; i < 16; i++) {
    const t = i / 15
    const y = HORIZON + 4 + Math.pow(t, 1.5) * (HEIGHT - HORIZON - 6)
    const dash = n(20 + r() * 80 * (0.4 + t))
    const gap = n(30 + r() * 140)
    const width = (1 + t * 2).toFixed(1)
    out.push(
      `<line class="rip r${i % 3}" x1="-200" y1="${n(y)}" x2="${W + 200}" y2="${n(y)}" stroke-width="${width}" stroke-dasharray="${dash} ${gap}" stroke-dashoffset="${n(r() * 200)}"/>`,
    )
  }
  return `<g class="ripples">${out.join('')}</g>`
}

// ── Colours ──────────────────────────────────────────────────────────────

const NIGHT = {
  skyTop: MOCHA.crust,
  skyMid: MOCHA.mantle,
  skyLow: '#272640', // base, warmed toward mauve where the aurora lights the haze
  a0: MOCHA.teal, // the rim
  a1: MOCHA.sky,
  a2: MOCHA.sapphire,
  a3: MOCHA.blue,
  a4: MOCHA.mauve, // the crown
  glow: MOCHA.teal,
  far: '#3a3654', // surface1 in mauve mist
  mid: '#24243a',
  near: MOCHA.crust,
  lake: MOCHA.crust,
  ripple: MOCHA.lavender,
  screen: MOCHA.crust,
  star: MOCHA.rosewater,
  moon: MOCHA.rosewater,
  sun: '#00000000', // no sun at night
}

const DAY = {
  skyTop: LATTE.base,
  skyMid: '#f3eeef',
  skyLow: '#f6e3e7', // dawn: Latte paper blushing flamingo
  // the curtains thin out by day: same inks at about half strength
  a0: LATTE.pink + '8c',
  a1: '#f08fd68c',
  a2: LATTE.flamingo + '8c',
  a3: '#f2a37f8c', // peach, softened
  a4: LATTE.lavender + '8c',
  glow: LATTE.pink,
  far: '#f2b8e0', // pink, half ink
  mid: LATTE.pink,
  near: LATTE.teal,
  lake: '#e4eef0',
  ripple: LATTE.teal,
  screen: LATTE.base,
  star: '#00000000', // no stars, moon or meteors by day
  moon: '#00000000',
  sun: LATTE.pink,
}

// Each colour is light-dark(day, night), so the scene follows the light or dark
// scheme with no @media rule: the desktop app draws any scene holding an
// @media rule other than prefers-reduced-motion as a still picture
// (anthropics/claude-code#109770).
const vars = (day: Record<string, string>, night: Record<string, string>) =>
  Object.keys(night)
    .map(key => `--${key}:light-dark(${day[key]},${night[key]})`)
    .join(';')

const STYLE = `
svg{color-scheme:light dark;${vars(DAY, NIGHT)};--refl:.5}
.s0{stop-color:var(--skyTop)}.s1{stop-color:var(--skyMid)}.s2{stop-color:var(--skyLow)}
.a0{fill:var(--a0)}.a1{fill:var(--a1);opacity:.85}.a2{fill:var(--a2);opacity:.58}
.a3{fill:var(--a3);opacity:.36}.a4{fill:var(--a4);opacity:.2}.a5{fill:var(--a4);opacity:.08}.ag{fill:var(--glow);opacity:.22}
.far{fill:var(--far)}.mid{fill:var(--mid)}.near{fill:var(--near)}
.lake{fill:var(--lake)}.rip{stroke:var(--ripple);opacity:.28}
.screen{fill:var(--screen)}.refl{opacity:var(--refl)}
.stars{fill:var(--star)}.moon{fill:var(--moon)}.sun{fill:var(--sun)}
.ms0{stop-color:var(--star)}.ms1{stop-color:var(--star);stop-opacity:0}
.curtain{transform-box:fill-box;transform-origin:50% 100%;animation:ease-in-out infinite alternate}
.swayA{animation-name:swayA;animation-duration:23s}
.swayB{animation-name:swayB;animation-duration:31s}
.swayC{animation-name:swayC;animation-duration:41s}
@keyframes swayA{from{transform:translateX(-26px) scaleY(.94) skewX(1.5deg);opacity:.85}to{transform:translateX(30px) scaleY(1.05) skewX(-2deg);opacity:1}}
@keyframes swayB{from{transform:translateX(34px) scaleY(1.04) skewX(-1.5deg);opacity:1}to{transform:translateX(-28px) scaleY(.93) skewX(2deg);opacity:.8}}
@keyframes swayC{from{transform:translateX(-20px) scaleY(.96);opacity:.75}to{transform:translateX(24px) scaleY(1.06);opacity:1}}
.drift{animation:drift linear infinite}
.d0{animation-duration:90s}.d1{animation-duration:130s;animation-direction:reverse}.d2{animation-duration:170s}
@keyframes drift{from{transform:translateX(0)}to{transform:translateX(-600px)}}
.tw{animation:tw ease-in-out infinite}
@keyframes tw{0%,100%{opacity:.18}50%{opacity:1}}
.fl{transform-box:fill-box;transform-origin:50% 50%;animation:fl ease-in-out infinite}
@keyframes fl{0%,62%,100%{opacity:.45;transform:scale(.6)}70%{opacity:1;transform:scale(1.25)}78%{opacity:.8;transform:scale(.9)}}
.mhead{fill:var(--star)}
.rip{animation:rip ease-in-out infinite alternate}
.r0{animation-duration:9s}.r1{animation-duration:13s;animation-direction:alternate-reverse}.r2{animation-duration:17s}
@keyframes rip{from{transform:translateX(-24px)}to{transform:translateX(24px)}}
.meteor{opacity:0}
${METEOR_PARTS.keyframes}
@media (prefers-reduced-motion: reduce){*{animation:none!important}.meteor{display:none}}
`

function build(): string {
  const world = [
    `<rect width="${W}" height="${HORIZON + 2}" fill="url(#sky)"/>`,
    stars(),
    // placed where a phone held upright still shows them (no @media to move them)
    `<g transform="translate(985 160)"><circle class="moon" r="30" mask="url(#crescent)"/></g>`,
    `<g transform="translate(960 735)"><circle class="sun" r="78"/></g>`,
    `<g class="aurora">${CURTAINS.map((_, i) => curtain(i)).join('')}</g>`,
    `<path class="far" d="${ridge(3, 835, 150, 1150)}"/>`,
    `<path class="mid" d="${ridge(8, 866, 95, 820)}"/>`,
    `<path class="near" d="${ridge(15, 884, 48, 560)}"/>`,
  ].join('')

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${HEIGHT}" preserveAspectRatio="xMidYMax slice">`,
    `<style>${STYLE}</style>`,
    '<defs>',
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop class="s0" offset="0"/><stop class="s1" offset=".55"/><stop class="s2" offset="1"/></linearGradient>`,
    METEOR_PARTS.gradients,
    `<mask id="crescent"><rect x="-40" y="-40" width="80" height="80" fill="#fff"/><circle cx="12" cy="-9" r="27" fill="#000"/></mask>`,
    `<clipPath id="lakeClip"><rect y="${HORIZON}" width="${W}" height="${HEIGHT - HORIZON}"/></clipPath>`,
    // one dot per cell: the cell filled with the gap colour, a 2×2 hole left open
    `<pattern id="screen" width="${CELL}" height="${CELL}" patternUnits="userSpaceOnUse"><path class="screen" fill-rule="evenodd" d="M0 0h3v3H0zM.5 .5v2h2v-2z"/></pattern>`,
    rayMasks(),
    '</defs>',
    `<g id="world">${world}</g>`,
    `<rect class="lake" y="${HORIZON + 2}" width="${W}" height="${HEIGHT - HORIZON}"/>`,
    `<g clip-path="url(#lakeClip)"><use href="#world" xlink:href="#world" transform="matrix(1 0 0 -1 0 ${HORIZON * 2 + 4})" class="refl"/>${ripples()}</g>`,
    METEOR_PARTS.groups,
    `<rect width="${W}" height="${HEIGHT}" fill="url(#screen)"/>`,
    '</svg>',
  ].join('')
}

const SCENE = build()

// ════════════════════════════════════════════════════════════════════════
// Hooks
// ════════════════════════════════════════════════════════════════════════

// Borealis in Catppuccin: Mocha by night, Latte by day, over a dithered
// aurora, three ridges and a mirroring lake.
const { theme, problems } = makeColors(DEFINITION)

const LOOK: ThemeSetArgs = {
  colors: theme,
  // Frost the panels: a deeper blur lets them sit lighter (more see-through)
  // while the chat stays readable over the curtains.
  backdrop: { scene: SCENE_NAME, glass: { blur: 24, opacity: 0.55 } },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== SCENE_NAME) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return (
      <Svg
        source={SCENE}
        alt="A dotted aurora in teal, blue and mauve swaying over dark mountain ridges and a still lake, under stars and a crescent moon"
        isInteractive
      />
    )
  })
}
