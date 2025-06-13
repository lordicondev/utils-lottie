import { extractLottieProperties } from '../src';
import { loadIcon } from './utils';

const iconData = await loadIcon('lock');

const label = document.getElementById('label');

label!.innerText = JSON.stringify(extractLottieProperties(iconData), null, '\t');