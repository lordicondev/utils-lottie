import { extractProperties } from '../src';
import { loadIcon } from './utils';

const iconData = await loadIcon('lock');

const label = document.getElementById('label');

label!.innerText = JSON.stringify(extractProperties(iconData), null, '\t');