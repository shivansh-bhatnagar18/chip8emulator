class CPU{

    constructor(renderer, keyboard, speaker){
        this.renderer = renderer;
        this.keyboard = keyboard;
        this.speaker = speaker;

        this.memory = new Uint8Array(4096);
        //the classic chip8 emulator has a memory of 4kB
        this.registers = new Uint8Array(16);
        //16 8-bit regiters and an index variable to store memory address of the current registers
        this.i = 0 // points to nothing at initialisation
        this.program_counter = 0x200;
        //executing address stored
        this.register_stack = new Array();

        this.delayTimer = 0;
        this.soundTimer = 0;
        
        this.stop = false;
        //some registers require pausing
        this.speed = 10;
    }


    loadingSpritesInRAM(){
        //sprites are  representations of all hex values in 5 bytes codes
        const sprites = [
        0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
        0x20, 0x60, 0x20, 0x20, 0x70, // 1
        0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
        0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
        0x90, 0x90, 0xF0, 0x10, 0x10, // 4
        0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
        0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
        0xF0, 0x10, 0x20, 0x40, 0x40, // 7
        0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
        0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
        0xF0, 0x90, 0xF0, 0x90, 0x90, // A
        0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
        0xF0, 0x80, 0x80, 0x80, 0xF0, // C
        0xE0, 0x90, 0x90, 0x90, 0xE0, // D
        0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
        0xF0, 0x80, 0xF0, 0x80, 0x80  // F picked up from chatGPT
        ];

        for(let i=0; i<sprites.length;i++){
            this.memory[i] = sprites[i];//loaded sprites in the memory
        }
    }


    loadROMIntoMemory(element){
        for(let el = 0; el<element.length;el++){
            this.memory[0x200 +el] = element[el];
        }
    }


    loadROM(romrom){
        var request = new XMLHttpRequest;
        var self = this;
        //for loading contents directly from the HTTPS
        request.onload = function() {
            if(request.response){
                //if the request was able to retrienve responce from the server
                let program = new Uint8Array(request.response);
                self.loadROMIntoMemory(program);
                //loading the got ROM data into the memory
            }
        }

        request.open('GET','Games/'+romrom);
        request.responseType = 'arraybuffer';

        request.send();//send the get request from the games folder of the emulator
    }

    cycle(){
        for (let i =0 ; i < this.speed; i++){
            if(!this.stop){
                let opcode = (this.memory[this.program_counter] << 8 | this.memory[this.program_counter +1]);
                //combining two 8 bit instructions into a single 16 bit instruction
                this.executeInstructionCode(opcode);
            }
        }
        if(!this.stop){
            this.updateTimers();
        }
        this.playSound();
        this.renderer.render();
    }

    updateTimers(){
        if(this.delayTImer > 0){
            this.delayTimer -=1;//to check whether the instructions had their values set 
        }

        if(this.soundTimer > 0){
            this.soundTimer -=1; // to control the sound 
        }
    }

    playSound(){
        if(this.soundTimer > 0){
            this.speaker.play(440);
        }else{
            this.speaker.stop();
        }
    }


    executeInstructionCode(opcode){

        //each instruction is 16 bits long so the program counter needs to be incremented by 2
        this.program_counter = this.program_counter + 2;

        //x is the lower 4 bits of the higher byte
        let x = (opcode & 0x0F00) >> 8;
        //y is the higher 4 bits of the lower byte
        let y = (opcode & 0x00F0) >> 4;


        //switch case for the instructions to be performed 
        switch (opcode & 0xF000) {
            case 0x0000:
                switch (opcode) {
                    case 0x00E0:
                        this.renderer.clear();
                        break;
                    case 0x00EE:
                        this.program_counter = this.register_stack.pop();
                        break;
                }
        
                break;
            case 0x1000:
                this.program_counter = (opcode & 0xFFF);
                break;
            case 0x2000:
                this.register_stack.push(this.program_counter);
                this.program_counter = (opcode & 0xFFF);
                break;
            case 0x3000:
                if (this.registers[x] === (opcode & 0xFF)){
                    this.program_counter += 2;
                }
                break;
            case 0x4000:
                if (this.registers[x] !== (opcode & 0xFF)) {
                    this.program_counter += 2;
                }
                break;
            case 0x5000:
                if (this.registers[x] === this.registers[y]) {
                    this.program_counter += 2;
                }
                break;
            case 0x6000:
                this.registers[x] = (opcode & 0xFF);
                break;
            case 0x7000:
                this.registers[x] += (opcode & 0xFF);
                break;
            case 0x8000:
                switch (opcode & 0xF) {
                    case 0x0:
                        this.registers[x] = this.registers[y];
                        break;
                    case 0x1:
                        this.registers[x] |= this.registers[y];
                        break;
                    case 0x2:
                        this.registers[x] &= this.registers[y];
                        break;
                    case 0x3:
                        this.registers[x] ^= this.registers[y];
                        break;
                    case 0x4:
                        let sum = (this.registers[x] += this.registers[y]);

                        this.registers[0xF] = 0;

                        if (sum > 0xFF) {
                            this.registers[0xF] = 1;
                        }

                        this.registers[x] = sum;
                        break;
                    case 0x5:
                        this.registers[0xF] = 0;

                        if (this.registers[x] > this.registers[y]) {
                            this.registers[0xF] = 1;
                        }

                        this.registers[x] -= this.registers[y];
                        break;
                    case 0x6:
                        this.registers[0xF] = (this.registers[x] & 0x1);

                        this.registers[x] >>= 1;
                        break;
                    case 0x7:
                        this.registers[0xF] = 0;

                        if (this.registers[y] > this.registers[x]) {
                            this.registers[0xF] = 1;
                        }

                        this.registers[x] = this.registers[y] - this.registers[x];
                        break;
                    case 0xE:
                        this.registers[0xF] = (this.registers[x] & 0x80);
                        this.registers[x] <<= 1;
                        break;
                }
        
                break;
            case 0x9000:
                if (this.registers[x] !== this.registers[y]) {
                    this.program_counter += 2;
                }
                break;
            case 0xA000:
                this.i = (opcode & 0xFFF);
                break;
            case 0xB000:
                this.program_counter = (opcode & 0xFFF) + this.registers[0];
                break;
            case 0xC000:
                let rand = Math.floor(Math.random() * 0xFF);

                this.registers[x] = rand & (opcode & 0xFF);
                break;
            case 0xD000:
                let width = 8;
                let height = (opcode & 0xF);

                this.registers[0xF] = 0;

                for (let row = 0; row < height; row++) {
                    let sprite = this.memory[this.i + row];

                    for (let col = 0; col < width; col++) {
                        // checking condtion for the sprite to be non zero
                        if ((sprite & 0x80) > 0) {
                            if (this.renderer.setPixel(this.registers[x] + col, this.registers[y] + row)) {
                                this.registers[0xF] = 1;
                            }
                        }

                        // Shift the sprite left 1. 
                        sprite <<= 1;
                    }
                }
                break;
            case 0xE000:
                switch (opcode & 0xFF) {
                    case 0x9E:
                        if (this.keyboard.isKeyPressed(this.registers[x])) {
                            this.program_counter += 2;
                        }
                        break;
                    case 0xA1:
                        if (!this.keyboard.isKeyPressed(this.registers[x])) {
                            this.program_counter += 2;
                        }
                        break;
                }
        
                break;
            case 0xF000:
                switch (opcode & 0xFF) {
                    case 0x07:
                        this.registers[x] = this.delayTimer;
                        break;
                    case 0x0A:
                        this.stop = true;

                        this.keyboard.onNextKeyPress = function(key) {
                            this.registers[x] = key;
                            this.stop = false;
                        }.bind(this);
                        break;
                    case 0x15:
                        this.delayTimer = this.registers[x];
                        break;
                    case 0x18:
                        this.soundTimer = this.registers[x];
                        break;
                    case 0x1E:
                        this.i += this.registers[x];
                        break;
                    case 0x29:
                        this.i = this.registers[x] * 5;
                        break;
                    case 0x33:
                            // Get the hundreds digit and place it in I.
                        this.memory[this.i] = parseInt(this.registers[x] / 100);

                        this.memory[this.i + 1] = parseInt((this.registers[x] % 100) / 10);

                        this.memory[this.i + 2] = parseInt(this.registers[x] % 10);
                        break;
                    case 0x55:
                        for (let registerIndex = 0; registerIndex <= x; registerIndex++) {
                            this.memory[this.i + registerIndex] = this.v[registerIndex];
                        }
                        break;
                    case 0x65:
                        for (let registerIndex = 0; registerIndex <= x; registerIndex++) {
                            this.v[registerIndex] = this.memory[this.i + registerIndex];
                        }
                        break;
                }
        
                break;
        
            default:
                throw new Error('Unknown opcode ' + opcode);
        }
    }
}

export default CPU