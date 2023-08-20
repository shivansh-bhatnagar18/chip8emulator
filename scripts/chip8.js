import Renderer from "./Renderer";
import Mapping from "./Mapping";
import Speaker from "./Speaker";
import CPU from "./control";

const renderer = new Renderer(10);
const mapping = new Mapping();
const speaker = new Speaker();
const cpu = new CPU(renderer, keyboard, speaker)

let loop, fps = 60, fpsInterval, startTime, currentTime, pastTime, elapsed;

function init(){

    fpsInterval = 1000/fps;
    pastTime = Date.now();
    startTime = pastTime;

    cpu.loadingSpritesInRAM();
    cpu.loadROM('BLITZ'); 

    loop = requestAnimationFrame(step);
}

function step(){

    currentTime = Date.now();
    elapsed = currentTime - pastTime;

    if ( elapsed > fpsInterval){
        cpu.cycle();
    }
    loop = requestAnimationFrame(step);
}

init();