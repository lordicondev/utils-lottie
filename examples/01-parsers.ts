import { parseColor } from '../src';

const label = document.getElementById('label');

label!.innerText = parseColor('red');
label!.style.color = parseColor('red');