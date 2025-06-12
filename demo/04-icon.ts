import lottie from '@lordicon/player-web-internal';
import { deepClone, transformIcon } from '../src';
import { downloadJSON } from './utils';

async function loadIcon(name) {
    const data = await fetch(`/icons/${name}.json`);
    return await data.json();
}

function initIcon(element, animationData) {
    lottie.loadAnimation({
        container: element,
        loop: true,
        autoplay: true,
        animationData: deepClone(animationData),
        rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
            progressiveLoad: true,
            hideOnTransparent: true,
        },
    });

    element.addEventListener('click', e => {
        e.preventDefault();

        downloadJSON('file', animationData);
    });
}

const iconLock = await loadIcon('lock');
const iconMoneyBag = await loadIcon('money-bag');

const icon1 = document.getElementById('icon-1');
const icon2 = document.getElementById('icon-2');
const icon3 = document.getElementById('icon-3');
const icon4 = document.getElementById('icon-4');
const icon5 = document.getElementById('icon-5');
const icon6 = document.getElementById('icon-6');

initIcon(icon1, iconLock);
initIcon(icon2, transformIcon(iconLock, { colors: { primary: 'red', secondary: 'blue' } }));
initIcon(icon3, transformIcon(iconLock, { stroke: 'bold' }));
initIcon(icon4, transformIcon(iconLock, { state: 'morph-unlocked' }));
initIcon(icon5, transformIcon(iconLock, { state: 'hover-unlocked', stroke: 'light', colors: { primary: 'red', secondary: 'blue' } }));
initIcon(icon6, transformIcon(iconMoneyBag, { stroke: 'bold' }));
