class Speaker{

    constructor(){
        const audiocontext = window.AudioContext || window.webkitAudioContext;
        
        this.audcontext = new audiocontext();

        this.gain = this.audcontext.createGain();
        this.finish = this.audcontext.destination;

        this.gain.connect(this.finish);
    }

    play(frequency){
        if (this.audcontext || !!this.oscillator){
            this.oscillator = this.audcontext.createOscillator();

            this.oscillator.frequency.setValueAtTime(frequency || 440 , this.audcontext.currentTime);
            this.oscillator.type = 'square'; 

            this.oscillator.connect(this.gain);
            this.oscillator.start();
        }
    }

    stop(){
        if(this.oscillator){
            this.oscillator.stop();
            this.oscillator.disconnect();
            this.oscillator = null;
        }
    }
}
export default Speaker;