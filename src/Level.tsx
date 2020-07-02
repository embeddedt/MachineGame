import Swal from 'sweetalert2';
import domtoimage from 'dom-to-image-more';
import Panzoom, { PanzoomObject } from '@panzoom/panzoom';
import { Howl } from 'howler';
import { machineInputOptions } from './machines';

var correctSound = new Howl({
    src: ['sounds/correct.mp3']
});


function cropImageFromCanvas(ctx) {
    var canvas = ctx.canvas, 
      w = canvas.width, h = canvas.height,
      pix = {x:[], y:[]},
      imageData = ctx.getImageData(0,0,canvas.width,canvas.height),
      x, y, index;
  
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        index = (y * w + x) * 4;
        if (imageData.data[index+3] > 0) {
          pix.x.push(x);
          pix.y.push(y);
        } 
      }
    }
    pix.x.sort(function(a,b){return a-b});
    pix.y.sort(function(a,b){return a-b});
    var n = pix.x.length-1;
  
    w = 1 + pix.x[n] - pix.x[0];
    h = 1 + pix.y[n] - pix.y[0];
    var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);
  
    canvas.width = w;
    canvas.height = h;
    ctx.putImageData(cut, 0, 0);
  
    var image = canvas.toDataURL();
    return image;
}
export default class Level {
    svgElement: SVGSVGElement;
    machines: Array<SVGGraphicsElement>;
    infoBar: HTMLDivElement;
    gameContainer: HTMLDivElement;
    panzoom: PanzoomObject;
    constructor(protected levelName: string) {
        this.infoBar = document.querySelector(".info-bar");
    }
    async loadSVG() {
        const svgFile = await fetch(`levels/${this.levelName}.svg`);
        const svgTags = await svgFile.text();
        const container = document.querySelector(".svg-container");
        container.innerHTML = svgTags;
        this.svgElement = container.querySelector("svg");
        if(this.svgElement == null)
            throw new Error("No SVG element");
        this.panzoom = Panzoom(this.svgElement, {
            minScale: 0.25,
            maxScale: 5,
            overflow: 'visible'
        });
        this.svgElement.parentElement.addEventListener('wheel', this.panzoom.zoomWithWheel);
        this.gameContainer = document.querySelector("#game-container");
    }
    async run() {
        const isIE11 = !!window.MSInputMethodContext && !!(document as any).documentMode;
        const applyClickableStyles = (machine: SVGElement, apply: boolean) => {
            if(isIE11)
                return;
            machine.style.pointerEvents = apply ? "fill" : "";
            machine.style.cursor = apply ? "pointer" : "";
        };
        this.infoBar.textContent = "";
        await this.loadSVG();
        this.gameContainer.classList.add("svg-visible");
        await new Promise(resolve => setTimeout(resolve, 750));
        this.machines = Array.from(this.svgElement.querySelectorAll("[data-machinetype]"));
        this.machines.forEach(machine => {
            const bbox = machine.getBBox();
            const fakeRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            const FAKE_MARGIN = 5;
            fakeRect.setAttribute("x", (bbox.x-FAKE_MARGIN).toString());
            fakeRect.setAttribute("y", (bbox.y-FAKE_MARGIN).toString());
            fakeRect.setAttribute("width", (bbox.width+(FAKE_MARGIN*2)).toString());
            fakeRect.setAttribute("height",(bbox.height+(FAKE_MARGIN*2)).toString());
            fakeRect.setAttribute("fill", "none");
            fakeRect.classList.add("stroke-rect");
            machine.appendChild(fakeRect);
            machine.classList.add("panzoom-exclude");
        });
        while(this.machines.length > 0) {
            this.infoBar.textContent = this.machines.length > 1 ? `Find the ${this.machines.length} simple machines.` : "Find the simple machine.";
            let currentTarget = null;
            const clickEvent = await new Promise<MouseEvent>(resolve => {
                const _this = this;
                const onClick = function(e) {
                    _this.machines.forEach(m => {
                        m.removeEventListener("click", onClick);
                        m.classList.remove("clickable");
                        applyClickableStyles(m, false);
                    });
                    currentTarget = this;
                    resolve(e);
                }
                this.machines.forEach(m => {
                    m.addEventListener("click", onClick)
                    m.classList.add("clickable");
                    applyClickableStyles(m, true);
                });
            });
            const machine = currentTarget as SVGGraphicsElement;
            machine.classList.add("bobbing");
            machine.classList.add("hover-force-visible");
            machine.querySelectorAll(".hover-visible").forEach(el => el.parentNode.appendChild(el));
            const machineIndex = this.machines.indexOf(machine);
            if(machineIndex == -1)
                throw new Error("Bad machine reference");
            const machineType = machine.getAttribute("data-machinetype");
            const machineTypeIndex = Object.keys(machineInputOptions).indexOf(machineType);
            if(machineTypeIndex == -1) {
                throw new Error("Unexpected machine type: " + machineType);
            }
            let img = undefined;
            if(!isIE11 && machine.getAttribute("data-skipraster") != "true") {
                try {
                    const canvas: HTMLCanvasElement = await domtoimage.toCanvas(this.svgElement, {
                        filter: function(node: Node) {
                            let baseVal = (node == machine || machine.contains(node) || node.contains(machine));
                            if(baseVal && node.nodeType == Node.ELEMENT_NODE)
                                baseVal = baseVal && !(node as Element).classList.contains("stroke-rect");
                            return baseVal;
                        }
                    });
                    img = cropImageFromCanvas(canvas.getContext("2d"));
                } catch(e) {
                    console.error(e);
                }
            }
            
            let numTries = 0;
            machine.classList.remove("bobbing");
            let existingAnswers = [];
            const customQuestion = machine.getAttribute("data-question");
            await Swal.fire({
                allowEscapeKey: false,
                allowEnterKey: false,
                allowOutsideClick: false,
                title: customQuestion || 'What type of machine is this?',
                imageUrl: img,
                input: 'select',
                inputOptions: machineInputOptions,
                inputPlaceholder: 'Select a machine',
                showCancelButton: false,
                inputValidator: (value) => {
                    return new Promise((resolve) => {
                        if(value == "")
                            resolve("You need to choose a machine.");
                        else if (value === machineType) {
                            resolve()
                        } else {
                            if(existingAnswers.indexOf(value) == -1) {
                                numTries++;
                                existingAnswers.push(value);
                            }
                            if(numTries < 3)
                                resolve('Try again!');
                            else
                                resolve('The correct answer is "' + Object.values(machineInputOptions)[machineTypeIndex] + '".');
                        }
                    })
                }
            });
            machine.classList.remove("panzoom-exclude");
            this.machines.splice(machineIndex, 1);
            this.infoBar.textContent = "Nice work!";
            correctSound.play();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        this.panzoom.destroy();
        this.gameContainer.classList.remove("svg-visible");
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.svgElement.remove();
    } 
}