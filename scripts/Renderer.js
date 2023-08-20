class Renderer{

    constructor(scale){

        this.columns = 64;//this is the default canvas resolution of the chip8emulator
        this.rows = 32; 
        this.scale = scale;//scale is basically a factor tot multiply each pixel with and to increase the display size

        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');

        this.canvas.width = this.columns * this.scale;
        this.canvas.height = this.rows * this.scale;

        this.display = new Array(this.columns * this.rows);
    }

    setPixel(x,y){
        
        if (x > this.columns)
        x = x - this.columns;
        else if (x < 0)
        x = x + this.columns;// setting conditons for the out of bound input value of indexes

        if (y > this.rows)
        y = y - this.rows;
        else if (y < 0)
        y = y + this.rows;// same for the case of y

        let pixel_number = x + (y * this.columns);// finding the index in the array
        this.display[pixel_number] = this.display[pixel_number] ^ 1
        //XOR Operation here toggle the 1/0 value of the pixel element of the array

        return !this.display[pixel_number] // returns true if the pixel was 0ed and false if it doesn't
    }

    clear(){
        this.display = new Array(this.columns * this.rows);
    }// function to clear the entire canvas


    render(){
        this.context.clearRect(0 , 0 , this.canvas.width , this.canvas.height)
        //every time the function runs, all the pixel elements are refreshed
        for (let i = 0; i < this.columns * this.rows ; i++)
        {
            let x = (i % this.columns) * this.scale;// finding out indices based of the display array
            let y = Math.floor(i / this.columns) * this.scale;

            if(this.display[i]){
                this.context.fillStyle = "#000";
                this.context.fillRect(x , y , this.scale , this.scale)//setting the desired pixel to black color
            }
        }
    }

    testrender(){
        this.setPixel(0 , 0);
        this.setPixel(5 , 3);
    }

}
export default Renderer;