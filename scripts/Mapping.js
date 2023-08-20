class Mapping{
    constructor(){
        this.KEYMAPPING = {
            49: 0x1, // 1
            50: 0x2, // 2
            51: 0x3, // 3
            52: 0xc, // 4
            81: 0x4, // Q
            87: 0x5, // W
            69: 0x6, // E
            82: 0xD, // R
            65: 0x7, // A
            83: 0x8, // S
            68: 0x9, // D
            70: 0xE, // F
            90: 0xA, // Z
            88: 0x0, // X
            67: 0xB, // C
            86: 0xF  // V Adopted this key mapping from freeCodeCamp.
            //Chip8 has a hex key pad which needs to be mapped to keys on the keyboard for mimicing the hardware.
        }

        this.keyPressed = [];
        this.oneNextKeyPressed = null;
        //for dual key presses
        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
        window.addEventListener('keyup', this.onKeyUp.bind(this), false);       
    }

    isKeyPressed(keycode){
        return this.keyPressed[keycode];
    }

    oneKeyDown(event){
        let key = this.KEYMAPPING[event.which]; // finding the actual key from chip8 according to the mapping
        this.keyPressed[key] = true;

        if(this.oneNextKeyPressed != null && key){//checking for the specific dual keys which require another key to be pressed
            this.oneNextKeyPressed(parseInt(key));
            this.oneNextKeyPressed = null;
        }
    }

    oneKeyUp(event){
        let key = this.KEYMAPPING[event.which];
        this.keyPressed[key] = false;
    }
}

export default Mapping;