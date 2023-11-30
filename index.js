const canvas = document.querySelector('canvas');
canvas.width = 1024;
canvas.height = 576;

const c = canvas.getContext('2d');

c.fillStyle = 'white';
c.fillRect(0, 0, canvas.width, canvas.height);

class Sprite {
    constructor({initial ,animations}) {

        this.initial = initial
        this.position = {...initial.position};
        this.loop = this.initial.loop
        this.image = new Image()
        this.image.src = initial.imageSrc
        this.animations = animations

        this.image.onload = ()=> {
            this.width = this.image.width / initial.framesMax
            this.height = this.image.height;
        }

        if(this.animations) {
            for (let key in animations) {
                const image = new Image();
                image.src = this.animations[key].imageSrc
                this.animations[key].image = image;
            }
        }
        this.frames = {
            current:0,
            elapsed: 0,
            max: initial.framesMax
        }
    }

    draw() {
        c.fillStyle= 'red'
        c.drawImage(
            this.image,
            this.frames.current * this.width,
            0,
            this.width,
            this.height,
            this.position.x,
            this.position.y,
            this.width,
            this.height,
        )
        this.updateFrames()
    }
    updateFrames() {
        if (this.frames.max === 1) {
            return
        }
        this.frames.elapsed++
        if (this.frames.elapsed % 10 === 0) {
            if (this.frames.current < this.frames.max-1) {
                this.frames.current++
            } else if (this.loop) {
                this.frames.current = 0
            }
        }
    }
}

class Background extends Sprite {
    constructor({initial, animations, speed}) {
        super({initial, animations})
        this.speed = 10
    }

    draw() {
        this.position.x -= this.speed
        c.drawImage(
            this.image,
            0,
            0,
            this.width,
            this.height,
            this.position.x,
            this.position.y,
            this.width,
            this.height,
        )
        c.drawImage(
            this.image,
            0,
            0,
            this.width,
            this.height,
            this.position.x +this.width,
            this.position.y,
            this.width,
            this.height,
        )
        // console.log(this.position.x,this.image.width)
        if (-this.position.x >= this.image.width) {
            this.position.x = 0
        }
    }
}
const keys = {
    w: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
    s: {
        pressed: false,
    },
    space: {
        pressed: false,
    },
}
class WindSurfer extends Sprite {
    constructor({initial, animations}) {
        super({initial, animations})
    }
    handleInput(keys) {
        if (keys.w.pressed) {
            this.position.y -=3
        }
        if (keys.s.pressed) {
            this.position.y +=3
        }
        if (keys.a.pressed) {
            this.position.x -=3
        }
        if (keys.d.pressed) {
            this.position.x +=3
        }
        if (keys.space.pressed) {
            this.switchSprite('jumping')
        }
        // console.log(this.frames.current, this.image)
        if(this.image !== this.animations['surfing'].image && this.frames.current === this.frames.max-1 && !this.loop) {
            console.log('asdasd')
            // this.frames.current = 0
            this.switchSprite('surfing')
            // this.image = this.animations['surfing'].image
        }
    }

    switchSprite(name) {
        this.frames.current = 0
        this.image = this.animations[name].image
        this.frames.max = this.animations[name].framesMax
        this.loop = this.animations[name].loop
    }
}

const surfer = new WindSurfer({
    initial: {
        imageSrc: './img/surfing.png',
        framesMax: 3,
        loop:true,
        position: {
            x:100,
            y:300
        },
    },
    animations: {
        surfing: {
            imageSrc: './img/surfing.png',
            framesMax: 3,
            loop: true
        },
        jumping: {
            imageSrc: './img/jumping.png',
            framesMax: 10,
            loop: false
        }
    }
})

const background = new Background({
    speed: 3,
    initial: {
        imageSrc: './img/sea.png',
        framesMax: 1,
        position: {
            x:0,
            y:0
        },
    }
})

function animate() {
    window.requestAnimationFrame(animate)
    background.draw();
    surfer.draw();
    surfer.handleInput(keys)
}

animate()

window.addEventListener('keydown',(event)=> {
    switch (event.key) {
        case 'w':
            keys.w.pressed = true
            break
        case 's':
            keys.s.pressed = true
            break
        case 'a':
            keys.a.pressed = true
            break
        case 'd':
            keys.d.pressed = true
            break
        case ' ':
            keys.space.pressed = true
            break

    }
})

window.addEventListener('keyup',(event)=> {
    switch (event.key) {
        case 'w':
            keys.w.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
        case ' ':
            keys.space.pressed = false
            break

    }
})