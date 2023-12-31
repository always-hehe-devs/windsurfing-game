const canvas = document.querySelector('canvas');
canvas.width = 1024;
canvas.height = 576;

const c = canvas.getContext('2d');

c.fillStyle = 'white';
c.fillRect(0, 0, canvas.width, canvas.height);

class Sprite {
    constructor({initial, animations}) {

        this.initial = initial;
        this.position = {...initial.position};
        this.loop = this.initial.loop;
        this.image = new Image();
        this.image.src = initial.imageSrc;
        this.animations = animations;

        this.frames = {
            current: 0,
            elapsed: 0,
            max: initial.framesMax,
            buffer: 10
        };

        this.image.onload = () => {
            this.width = this.image.width / initial.framesMax;
            this.height = this.image.height;
        };

        if (this.animations) {
            this.frames.buffer = this.initial.frameBuffer;
            for (let key in animations) {
                const image = new Image();
                image.src = this.animations[key].imageSrc;
                this.animations[key].image = image;
            }
        }

    }

    draw() {
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
        );
        this.updateFrames();
    }

    updateFrames() {
        if (this.frames.max === 1) {
            return;
        }
        this.frames.elapsed++;

        if (this.frames.elapsed % this.frames.buffer === 0) {
            if (this.frames.current < this.frames.max - 1) {
                this.frames.current++;
            } else if (this.loop) {
                this.frames.current = 0;
            }
        }
    }
}

class Movable extends Sprite {
    constructor({initial, animations, speed}) {
        super({initial, animations});
        this.speed = speed;
    }

    draw() {
        if (!surfer.crashed) {
            this.position.x -= this.speed;
        }

        c.drawImage(
            this.image,
            0, 0,
            this.width,
            this.height,
            this.position.x,
            this.position.y,
            this.width,
            this.height,
        );
        c.drawImage(
            this.image,
            0,
            0,
            this.width,
            this.height,
            this.width < canvas.width ? this.position.x + canvas.width + this.width * 2 : this.position.x + this.width,
            this.position.y,
            this.width,
            this.height,
        );

        if (this.image.width && this.image.width < canvas.width) {
            if (-this.position.x >= this.image.width * 2) {
                this.position.x = canvas.width;
            }
        } else {
            if (-this.position.x >= this.image.width) {
                this.position.x = 0;
            }
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
};

class WindSurfer extends Sprite {
    constructor({initial, animations}) {
        super({initial, animations});
        this.image.addEventListener('load', () => {
            this.collisionBox = {
                x: this.position.x + 30,
                y: this.position.y + 60,
                width: this.width - 45,
                height: this.height - 80
            };
        });
        this.crashed = false
    }

    handleInput(keys) {
        if (this.image === this.animations['crash'].image) {
            if (this.frames.current === this.frames.max - 1) {
                this.crashed = true;
            }
            return
        }
        if (this.image === this.animations['crash'].image)

        if (keys.w.pressed) {
            this.position.y -= 3;
        }
        if (keys.s.pressed) {
            this.position.y += 3;
        }
        if (keys.a.pressed) {
            this.position.x -= 3;
        }
        if (keys.d.pressed) {
            this.position.x += 3;
        }
        if (keys.space.pressed) {
            this.switchSprite('jumping');
        }
        this.collisionBox = {
            x: this.position.x + 30,
            y: this.position.y + 70,
            width: this.width - 45,
            height: this.height
        };

        if (this.image !== this.animations['surfing'].image && this.frames.current === this.frames.max - 1 && !this.loop) {
            this.switchSprite('surfing');
        }
    }
    crash() {
        this.switchSprite('crash')
    }

    switchSprite(name) {
        this.frames.current = 0
        this.image = this.animations[name].image
        this.frames.max = this.animations[name].framesMax
        this.loop = this.animations[name].loop
        this.frames.buffer = this.animations[name].frameBuffer
    }
}

const surfer = new WindSurfer({
    initial: {
        imageSrc: './img/surfing.png',
        framesMax: 3,
        loop: true,
        position: {
            x: 0,
            y: 0
        },
        frameBuffer: 10
    },
    animations: {
        surfing: {
            imageSrc: './img/surfing.png',
            framesMax: 3,
            loop: true,
            frameBuffer: 10
        },
        jumping: {
            imageSrc: './img/jumping.png',
            framesMax: 10,
            loop: false,
            frameBuffer: 3
        },
        crash: {
            imageSrc: './img/crash.png',
            framesMax: 18,
            loop: false,
            frameBuffer: 2
        }
    }
});

const background = new Movable({
    speed: 5,
    initial: {
        imageSrc: './img/sea.png',
        framesMax: 1,
        position: {
            x:0,
            y:0
        },
    }
});
const waves = new Array(50).fill(0).map(() => {
    return new Movable({
        speed: 5,
        initial: {
            imageSrc: './img/wave.png',
            framesMax: 1,
            position: {
                x:100 + Math.random()*1000,
                y:50 + Math.random()*1000
            },
        }
    });
});

function animate() {
    window.requestAnimationFrame(animate);
    background.draw();
    waves.forEach(wave => wave.draw());
    surfer.draw();
    surfer.handleInput(keys);

    for (let i = 0; i < waves.length; i++) {
        const wave = waves[i];

        if (surfer.collisionBox) {
            if (
                surfer.collisionBox.x >= wave.position.x- surfer.collisionBox.width &&
                surfer.collisionBox.x + surfer.collisionBox.width <= wave.position.x + wave.width+ surfer.collisionBox.width  &&
                surfer.collisionBox.y >= wave.position.y &&
                surfer.collisionBox.y + surfer.collisionBox.height <= wave.position.y + wave.height + surfer.collisionBox.height
            ) {
                console.log('asad')
                surfer.crash()
            }
        }
    }


}

animate();

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w':
            keys.w.pressed = true;
            break;
        case 's':
            keys.s.pressed = true;
            break;
        case 'a':
            keys.a.pressed = true;
            break;
        case 'd':
            keys.d.pressed = true;
            break;
        case ' ':
            keys.space.pressed = true;
            break;

    }
});

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w':
            keys.w.pressed = false;
            break;
        case 's':
            keys.s.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
        case ' ':
            keys.space.pressed = false;
            break;

    }
});