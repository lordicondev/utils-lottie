# Lottie Utilities

Reads and changes Lordicon icon files (Lottie JSON): their states, colours and stroke, and
makes customised copies of an icon. No DOM needed, so it runs in Node as well as the browser.

```bash
npm install @lordicon/utils-lottie
```

```js
import { customizeIcon, defaultColors, defaultState, readStates } from '@lordicon/utils-lottie';

const data = await (await fetch('/icons/share.json')).json();

defaultState(readStates(data)).name; // 'hover-pinch'
defaultColors(data); // { primary: '#121331' }
customizeIcon(data, { colors: { primary: 'red' }, stroke: 'bold' }); // a new file
```

## States

An icon holds several animations, its states: an entrance (`in-reveal`), hover effects
(`hover-pinch`), sometimes a morph (`morph-select`) or a loop. One of them, usually a hover,
is the default.

```js
import {
    defaultState,
    findState,
    readStates,
    stateSegment,
    stateType,
} from '@lordicon/utils-lottie';

const states = readStates(data); // [{ name: 'in-reveal', ... }, { name: 'hover-pinch', default: true, ... }, ...]
const hover = defaultState(states); // the default state
findState(states, 'morph'); // by name, or the first whose name starts with it

stateType(hover); // 'hover'; also 'in', 'morph', 'loop', or null
stateSegment(hover); // [40, 101]: its frames, the end excluded
```

A morph goes to a second look and back. When its marker has a ratio (`morph-select:0.5`),
the way there and the way back are two halves of the state; without one, the whole state
plays forwards and then backwards.

```js
import { splitSegment, stateEndFrame } from '@lordicon/utils-lottie';

const morph = findState(states, 'morph-select');
splitSegment(morph); // [[110, 140], [140, 171]]; null without a ratio
stateEndFrame(morph); // 139: where it holds its second look; the last frame without a ratio
```

## Colours

```js
import { defaultColors, formatColors, parseColors, resolveColor } from '@lordicon/utils-lottie';

resolveColor('Tomato'); // '#ff6347'
resolveColor('nope'); // null

defaultColors(data); // { primary: '#121331' }

parseColors('primary:red, secondary:#0f0'); // { primary: '#ff0000', secondary: '#00ff00' }
formatColors({ primary: 'red' }); // 'primary:#ff0000'
```

To swap a colour wherever an icon uses it, whatever its name there, `colorsByName` turns the
swap into colours by name. Say the dark `#121331` should be white on a dark background:

```js
import { colorsByName, customizeIcon, formatColors } from '@lordicon/utils-lottie';

const colors = colorsByName(data, { '#121331': '#ffffff' }); // { primary: '#ffffff' }

customizeIcon(data, { colors }); // a recoloured copy
formatColors(colors); // 'primary:#ffffff', for the colors attribute
```

The icon's own colours by name work in place of the file:
`colorsByName({ primary: '#121331' }, { '#121331': '#ffffff' })`.

Lottie keeps a colour as `[r, g, b]` in 0–1: `toLottieColor('red')` gives `[1, 0, 0]`,
`fromLottieColor([1, 0, 0])` gives `'#ff0000'`.

## Stroke

```js
import { hasStroke, parseStroke, strokeName } from '@lordicon/utils-lottie';

hasStroke(data); // true when the width can be changed
parseStroke('bold'); // 3; also 'light', 'regular', 1, 2, 3
strokeName(3); // 'bold'
```

## A customised copy

`customizeIcon(data, properties, options?)` returns a new file with the colours, stroke and
default state baked in. The original is left alone.

```js
import { customizeIcon } from '@lordicon/utils-lottie';

customizeIcon(data, { colors: { primary: 'red' }, stroke: 'bold', state: 'hover-pinch' });
customizeIcon(data, { stroke: 'bold' }, { minify: 'partial' }); // drops the other widths
customizeIcon(data, { state: 'hover-pinch' }, { minify: 'full' }); // one state, from frame 0, no expressions
```

`removeExpressions(data)` strips expressions on its own.

## Controls

The low-level way in. An icon keeps its colours and stroke in effect controls on its layers;
`readControls(data)` lists them as `{ name, type, path, value }`. Pass `{ renderer: true }`
for paths into a running `@lordicon/internal` animation made from the data.

```js
import { readControls, resetControls, updateControls } from '@lordicon/utils-lottie';

const controls = readControls(data);
const primary = controls.filter((control) => control.name === 'primary');

updateControls(data, primary, 'red'); // also '#f00' or [1, 0, 0]
resetControls(data, controls); // the values they had when read
```

The `type` tells what `value` holds: a Lottie colour for `color`, `[x, y]` for `point`, a
number for `slider`, `checkbox` and `feature` (the stroke is a `feature`).

## Reading and changing

A function that returns something leaves the data alone; one that changes the data returns
nothing. The data-changing ones are `updateControls`, `resetControls` and
`removeExpressions`. `customizeIcon` returns a new file.

## Types

```ts
import { isIconData, type IconData } from '@lordicon/utils-lottie';

const data: unknown = JSON.parse(text);
if (isIconData(data)) data.markers; // typed from here on
```

`IconData` describes the parts of a Lottie file these utilities read (frame rate, in and out
points, size, layers, markers); other fields are not described. A type of your own with those
fields works too. Every function that reads a
file takes it, and `customizeIcon` returns the type it is given.

## Details

**Markers.** A state is a marker in the file, named `flags:name:params`:
`default:morph-select:0.5` is the state `morph-select`, marked as the default, with a split
ratio of 0.5. Markers without a name or without frames are skipped. Two markers may share a
name; `findState` returns the first.

**Frames.** A marker runs from frame `tm` to frame `tm + dr`, both included: a state's last
keyframes sit on `tm + dr`. So a segment is `[tm, tm + dr + 1)`, with the end exclusive as
`setSegment()` takes it, and `customizeIcon` ends a file at `op = tm + dr + 1`. Without the
`+ 1` a state stops one frame short of its final pose.

**Morphs and ratios.** Not every morph has a ratio. With one, the state is two animations
in a row: frames up to the ratio lead to the second look, the rest lead back. Without one, the
state is a single animation to the second look, and the way back is the same frames played
backwards; `splitSegment` returns null and `stateEndFrame` the last frame. A ratio counts only
between 0 and 1, both excluded, and `splitSegment(state, ratio)` can impose one. Each half
keeps at least one frame, and a single-frame state is not split.

**Colours.** Any `#rgb` or `#rrggbb` value or CSS colour name. Colours with transparency are
not accepted. Values that are not colours are skipped: `parseColors` leaves the pair out,
`customizeIcon` and `updateControls` leave the colour as it was.

**States in `customizeIcon`.** The other markers keep their params. A state the file does not
have changes nothing.

## Upgrading

What changed between versions, and what to write instead of the old names, is in
[CHANGELOG.md](CHANGELOG.md).

## Development

```sh
npm install
npm test
npm run check      # types, lint, formatting
npm run build
npm start          # the examples
```
