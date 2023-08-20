import renderer from "./renderer";

const renderer = new renderer(10);

let loop, fps = 60, fpsInterval, startTime, currentTime, pastTime, elapsed;

function init(){

    fpsInterval = 1000/fps;
    pastTime = Date.now();
    startTime = pastTime;

    renderer.testrender();
    renderer.render();

    loop = requestAnimationFrame(step);
}

function step(){

    currentTime = Date.now();
    elapsed = currentTime - pastTime;

    if ( elapsed > fpsInterval){}
    loop = requestAnimationFrame(step);
}

init();