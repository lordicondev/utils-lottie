# Changelog

## 2.0.0

Every function takes and returns typed data, and a function either reads the data or changes
it, never both. What `customizeIcon` produces is the same as in 1.4.

### Migrating from 1.x

| 1.x                                                       | 2.0                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| `extractLottieProperties(data, { lottieInstance })`       | `readControls(data, { renderer })`                           |
| `updateLottieProperties`, `resetLottieProperties`         | `updateControls`, `resetControls`                            |
| `LottieProperty`, `LottiePropertyType`                    | `IconControl`, `IconControlType`                             |
| `remapColors(data, byHex)`                                | `customizeIcon(data, { colors: colorsByName(data, byHex) })` |
| `hexToTupleColor`, `tupleColorToHex`, `RgbTuple`          | `toLottieColor`, `fromLottieColor`, `LottieColor`            |
| `hexToRgb`, `rgbToHex`, `RgbColor`                        | none                                                         |
| `customizeIcon(data, properties, 'full')`                 | `customizeIcon(data, properties, { minify: 'full' })`        |
| `parseColor`                                              | `resolveColor`, which gives null instead of black            |
| `parseState`                                              | none                                                         |
| `LottieData`, `LottieAnimationInstance`                   | `IconData`; `updateControls` takes any object                |
| `get`, `set`, `has`, `isNil`, `isObjectLike`, `deepClone` | none; `structuredClone` for a copy                           |

`remapColors` changed the data and returned it; its replacement returns a copy and leaves the
data alone.

### Added

- `colorsByName()` takes the icon's own colours by name as well as the icon.

### Changed

- `IconControl` is a union by `type`, so `value` is typed: a `LottieColor` for a `color`, and
  so on.
- `toLottieColor()` takes any colour, names too, and gives null for what is not one.
- `customizeIcon()` returns the type it is given.
- `IconData` and the Lottie types have no index signature any more: an interface of your own
  with the same fields is accepted, and fields they do not describe need that type.
- `updateControls()` takes a colour as hex, a name or a Lottie colour, no longer `{ r, g, b }`,
  and a point as `[x, y]`, no longer `{ x, y }`.
- `parseStroke()` gives null for what is not a width, `parseColors()` null when no pair is a
  colour.
- `IconState.default` is always set.

## 1.4.0

Nothing is removed or renamed; code written for 1.3 keeps working. Some results change where
1.3 gave wrong ones.

### Added

- `IconData` (with `LottieMarker`, `LottieLayer`, `LottieEffect`, `LottieAsset`) and
  `isIconData()`: a typed Lottie file and a check for one.
- States: `stateType()`, `stateSegment()`, `stateRatio()`, `splitSegment()`, `stateEndFrame()`,
  `findState()`, `defaultState()`.
- Colours: `defaultColors()`, `colorsByName()`, `resolveColor()`, `formatColors()`.
- Stroke: `hasStroke()`, `strokeName()`.
- An `exports` map. Only the package root can be imported, as before in practice.

### Fixed

- `customizeIcon()` with a `state`:
    - ends the file at `tm + dr + 1`, so the state's last frame plays (it stopped one frame short);
    - keeps the params of the other markers (`morph-select:0.5` lost its ratio);
    - changes nothing when the file has no such state (it dropped the default flag, and with
      `'full'` left an empty icon).
- `customizeIcon()` with `minify`: no longer removes layers whose name holds a `:` but no
  stroke prefix, such as a morph's `morph-select:0.5` layers or `Rectangle 2 :M`.
- `customizeIcon()`, `remapColors()` and `updateLottieProperties()` skip values that are not
  colours instead of writing black.
- `remapColors()` matches colours whatever their case or form (`#ABC`, `#aabbcc`, `red`).
- `hexToRgb()` and `hexToTupleColor()` read `#rgb`; `tupleColorToHex()` clamps values outside 0–1.
- `parseColors()` trims spaces and leaves out pairs that are not colours; `parseStroke()` trims
  and ignores case.
- `parseColor()` returns lower-case `#rrggbb`, and black for a malformed hex.
- `readStates()` skips markers without a name or without frames.
- `extractLottieProperties()` skips effects without a name; `set()` does nothing on a missing path.
- Three colour names had wrong values or keys: `indianred`, `mediumpurple`, `palevioletred`.

### Deprecated

- `parseColor()`: use `resolveColor()`, which returns null for what is not a colour.
- `parseState()`: nothing to parse.
