import lottie from '@lordicon/player-web-internal';
import { deepClone, customizeIcon } from "../src";
import { downloadJSON } from "./utils";

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

    element.addEventListener("click", (e) => {
        e.preventDefault();

        downloadJSON("file", animationData);
    });
}

const iconLock = await loadIcon("lock");
const iconHourglass = await loadIcon("hourglass");

const icon1 = document.getElementById("icon-1");
const icon2 = document.getElementById("icon-2");
const icon3 = document.getElementById("icon-3");
const icon4 = document.getElementById("icon-4");
const icon5 = document.getElementById("icon-5");

initIcon(icon1, iconLock);
initIcon(icon2, customizeIcon(iconLock, { state: "hover-locked" }, "full"));
initIcon(icon3, iconHourglass);
initIcon(
    icon4,
    customizeIcon(iconHourglass, { state: "loop-spin", stroke: 3 }, "partial")
);
initIcon(
    icon5,
    customizeIcon(iconHourglass, { state: "loop-spin", stroke: 3 }, "full")
);
