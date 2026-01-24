// ==========================================
// SPACE INVADERS - Juego Completo
// ==========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos del DOM
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const gameOverScreen = document.getElementById('gameOver');
const startScreen = document.getElementById('startScreen');
const pauseScreen = document.getElementById('pauseScreen');
const finalScoreElement = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Estado del juego
let gameState = {
    score: 0,
    lives: 3,
    level: 1,
    isRunning: false,
    isPaused: false,
    gameOver: false
};

// Configuracion del juego
const config = {
    playerSpeed: 7,
    bulletSpeed: 10,
    enemyBulletSpeed: 5,
    enemyRows: 5,
    enemyCols: 10,
    enemyPadding: 10,
    enemyOffsetTop: 50,
    enemyOffsetLeft: 50
};

// ==========================================
// CLASE JUGADOR
// ==========================================
class Player {
    constructor() {
        this.width = 50;
        this.height = 30;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 20;
        this.speed = config.playerSpeed;
        this.bullets = [];
        this.canShoot = true;
        this.shootCooldown = 250;
    }

    draw() {
        ctx.save();

        // Cuerpo principal de la nave
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        // Cabina
        ctx.fillStyle = '#00cc00';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + 5);
        ctx.lineTo(this.x + this.width / 2 + 10, this.y + this.height - 5);
        ctx.lineTo(this.x + this.width / 2 - 10, this.y + this.height - 5);
        ctx.closePath();
        ctx.fill();

        // Brillo
        ctx.fillStyle = '#66ff66';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 10, 3, 0, Math.PI * 2);
        ctx.fill();

        // Motores
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(this.x + 5, this.y + this.height, 8, 5);
        ctx.fillRect(this.x + this.width - 13, this.y + this.height, 8, 5);

        ctx.restore();
    }

    move(direction) {
        if (direction === 'left' && this.x > 0) {
            this.x -= this.speed;
        }
        if (direction === 'right' && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
    }

    shoot() {
        if (this.canShoot) {
            this.bullets.push(new Bullet(
                this.x + this.width / 2 - 2,
                this.y,
                -config.bulletSpeed,
                '#00ff00'
            ));
            this.canShoot = false;
            playSound('shoot');
            setTimeout(() => this.canShoot = true, this.shootCooldown);
        }
    }

    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            bullet.draw();
            return bullet.y > 0;
        });
    }

    reset() {
        this.x = canvas.width / 2 - this.width / 2;
        this.bullets = [];
    }
}

// ==========================================
// CLASE BALA
// ==========================================
class Bullet {
    constructor(x, y, speed, color) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 15;
        this.speed = speed;
        this.color = color;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

// ==========================================
// CLASE ENEMIGO
// ==========================================
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 30;
        this.type = type;
        this.alive = true;
        this.animFrame = 0;
        this.colors = {
            0: '#ff0000',
            1: '#ff6600',
            2: '#ffff00',
            3: '#00ffff',
            4: '#ff00ff'
        };
        this.points = {
            0: 50,
            1: 40,
            2: 30,
            3: 20,
            4: 10
        };
    }

    draw() {
        if (!this.alive) return;

        const color = this.colors[this.type];
        ctx.save();

        // Cuerpo del alien
        ctx.fillStyle = color;

        // Diferentes formas segun el tipo
        if (this.type === 0) {
            // Alien tipo 1 - Cuadrado con antenas
            ctx.fillRect(this.x + 5, this.y + 10, 30, 15);
            ctx.fillRect(this.x + 10, this.y + 5, 20, 5);
            ctx.fillRect(this.x, this.y, 5, 10);
            ctx.fillRect(this.x + 35, this.y, 5, 10);
        } else if (this.type === 1) {
            // Alien tipo 2 - Forma de pulpo
            ctx.fillRect(this.x + 10, this.y, 20, 20);
            ctx.fillRect(this.x + 5, this.y + 5, 30, 10);
            ctx.fillRect(this.x, this.y + 20, 10, 10);
            ctx.fillRect(this.x + 30, this.y + 20, 10, 10);
        } else if (this.type === 2) {
            // Alien tipo 3 - Triangular
            ctx.beginPath();
            ctx.moveTo(this.x + 20, this.y);
            ctx.lineTo(this.x + 40, this.y + 25);
            ctx.lineTo(this.x, this.y + 25);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 3) {
            // Alien tipo 4 - Circular
            ctx.beginPath();
            ctx.arc(this.x + 20, this.y + 15, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(this.x + 5, this.y + 25, 10, 5);
            ctx.fillRect(this.x + 25, this.y + 25, 10, 5);
        } else {
            // Alien tipo 5 - Clasico
            ctx.fillRect(this.x + 5, this.y + 5, 30, 20);
            ctx.fillRect(this.x, this.y + 10, 40, 10);
            ctx.fillRect(this.x + 5, this.y + 25, 5, 5);
            ctx.fillRect(this.x + 30, this.y + 25, 5, 5);
        }

        // Ojos
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 12, this.y + 10, 5, 5);
        ctx.fillRect(this.x + 23, this.y + 10, 5, 5);

        ctx.restore();
    }

    getPoints() {
        return this.points[this.type];
    }
}

// ==========================================
// CLASE FLOTA DE ENEMIGOS
// ==========================================
class EnemyFleet {
    constructor() {
        this.enemies = [];
        this.direction = 1;
        this.speed = 1;
        this.dropDistance = 20;
        this.bullets = [];
        this.shootChance = 0.002;
        this.init();
    }

    init() {
        this.enemies = [];
        const enemyWidth = 40;
        const enemyHeight = 30;

        for (let row = 0; row < config.enemyRows; row++) {
            for (let col = 0; col < config.enemyCols; col++) {
                const x = config.enemyOffsetLeft + col * (enemyWidth + config.enemyPadding);
                const y = config.enemyOffsetTop + row * (enemyHeight + config.enemyPadding);
                this.enemies.push(new Enemy(x, y, row));
            }
        }
    }

    update() {
        let shouldDrop = false;
        let minX = canvas.width;
        let maxX = 0;

        // Encontrar los bordes de la flota
        this.enemies.forEach(enemy => {
            if (enemy.alive) {
                minX = Math.min(minX, enemy.x);
                maxX = Math.max(maxX, enemy.x + enemy.width);
            }
        });

        // Verificar si hay que cambiar direccion
        if (maxX >= canvas.width - 10 || minX <= 10) {
            shouldDrop = true;
            this.direction *= -1;
        }

        // Mover enemigos
        this.enemies.forEach(enemy => {
            if (enemy.alive) {
                if (shouldDrop) {
                    enemy.y += this.dropDistance;
                }
                enemy.x += this.speed * this.direction;
            }
        });

        // Disparos aleatorios de enemigos
        this.enemies.forEach(enemy => {
            if (enemy.alive && Math.random() < this.shootChance) {
                this.bullets.push(new Bullet(
                    enemy.x + enemy.width / 2 - 2,
                    enemy.y + enemy.height,
                    config.enemyBulletSpeed,
                    '#ff0000'
                ));
            }
        });

        // Actualizar balas enemigas
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            bullet.draw();
            return bullet.y < canvas.height;
        });
    }

    draw() {
        this.enemies.forEach(enemy => enemy.draw());
    }

    getAliveCount() {
        return this.enemies.filter(e => e.alive).length;
    }

    increaseSpeed(amount) {
        this.speed += amount;
        this.shootChance += 0.0005;
    }

    reset() {
        this.direction = 1;
        this.speed = 1 + (gameState.level - 1) * 0.3;
        this.shootChance = 0.002 + (gameState.level - 1) * 0.001;
        this.bullets = [];
        this.init();
    }
}

// ==========================================
// CLASE EXPLOSION
// ==========================================
class Explosion {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.particles = [];
        this.duration = 30;
        this.frame = 0;

        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 5 + 2,
                alpha: 1
            });
        }
    }

    update() {
        this.frame++;
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.03;
            p.size *= 0.95;
        });
    }

    draw() {
        this.particles.forEach(p => {
            if (p.alpha > 0) {
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });
    }

    isDone() {
        return this.frame >= this.duration;
    }
}

// ==========================================
// CLASE ESTRELLAS (FONDO)
// ==========================================
class StarField {
    constructor() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.1,
                brightness: Math.random()
            });
        }
    }

    update() {
        this.stars.forEach(star => {
            star.y += star.speed;
            star.brightness = 0.5 + Math.sin(Date.now() * 0.003 + star.x) * 0.5;
            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
        });
    }

    draw() {
        this.stars.forEach(star => {
            ctx.save();
            ctx.globalAlpha = star.brightness;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
}

// ==========================================
// CLASE NAVE MISTERIOSA (UFO)
// ==========================================
class UFO {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 30;
        this.width = 60;
        this.height = 25;
        this.speed = 3;
        this.direction = 1;
        this.points = [100, 150, 200, 300];
    }

    spawn() {
        if (!this.active && Math.random() < 0.001) {
            this.active = true;
            this.direction = Math.random() < 0.5 ? 1 : -1;
            this.x = this.direction === 1 ? -this.width : canvas.width;
            playSound('ufo');
        }
    }

    update() {
        if (this.active) {
            this.x += this.speed * this.direction;
            if (this.x > canvas.width + this.width || this.x < -this.width) {
                this.active = false;
            }
        }
    }

    draw() {
        if (!this.active) return;

        ctx.save();

        // Cuerpo del UFO
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + 15, 30, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cupula
        ctx.fillStyle = '#ff66ff';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + 10, 15, 10, 0, Math.PI, 0);
        ctx.fill();

        // Luces
        ctx.fillStyle = '#ffff00';
        for (let i = 0; i < 5; i++) {
            const lx = this.x + 10 + i * 10;
            ctx.beginPath();
            ctx.arc(lx, this.y + 15, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Brillo
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff00ff';

        ctx.restore();
    }

    getPoints() {
        return this.points[Math.floor(Math.random() * this.points.length)];
    }
}

// ==========================================
// SISTEMA DE SONIDO (usando Web Audio API)
// ==========================================
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch(type) {
        case 'shoot':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'explosion':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'playerHit':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
        case 'ufo':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
        case 'levelUp':
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
            break;
    }
}

// ==========================================
// INSTANCIAS DEL JUEGO
// ==========================================
let player;
let enemyFleet;
let explosions = [];
let starField;
let ufo;
let keys = {};

// ==========================================
// FUNCIONES DEL JUEGO
// ==========================================

function initGame() {
    player = new Player();
    enemyFleet = new EnemyFleet();
    starField = new StarField();
    ufo = new UFO();
    explosions = [];
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.gameOver = false;
    updateUI();
}

function updateUI() {
    scoreElement.textContent = gameState.score;
    livesElement.textContent = gameState.lives;
    levelElement.textContent = gameState.level;
}

function checkCollisions() {
    // Balas del jugador vs enemigos
    player.bullets.forEach((bullet, bulletIndex) => {
        enemyFleet.enemies.forEach(enemy => {
            if (enemy.alive &&
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {

                enemy.alive = false;
                player.bullets.splice(bulletIndex, 1);
                gameState.score += enemy.getPoints();
                explosions.push(new Explosion(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height / 2,
                    enemy.colors ? enemy.colors[enemy.type] : '#ff0000'
                ));
                playSound('explosion');
                updateUI();

                // Aumentar velocidad de la flota
                enemyFleet.increaseSpeed(0.05);
            }
        });

        // Balas del jugador vs UFO
        if (ufo.active &&
            bullet.x < ufo.x + ufo.width &&
            bullet.x + bullet.width > ufo.x &&
            bullet.y < ufo.y + ufo.height &&
            bullet.y + bullet.height > ufo.y) {

            const points = ufo.getPoints();
            gameState.score += points;
            explosions.push(new Explosion(
                ufo.x + ufo.width / 2,
                ufo.y + ufo.height / 2,
                '#ff00ff'
            ));
            playSound('explosion');
            ufo.active = false;
            player.bullets.splice(bulletIndex, 1);
            updateUI();
        }
    });

    // Balas enemigas vs jugador
    enemyFleet.bullets.forEach((bullet, bulletIndex) => {
        if (bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y) {

            enemyFleet.bullets.splice(bulletIndex, 1);
            gameState.lives--;
            explosions.push(new Explosion(
                player.x + player.width / 2,
                player.y + player.height / 2,
                '#00ff00'
            ));
            playSound('playerHit');
            updateUI();

            if (gameState.lives <= 0) {
                endGame();
            }
        }
    });

    // Enemigos llegan al jugador
    enemyFleet.enemies.forEach(enemy => {
        if (enemy.alive && enemy.y + enemy.height >= player.y) {
            endGame();
        }
    });
}

function checkLevelComplete() {
    if (enemyFleet.getAliveCount() === 0) {
        gameState.level++;
        playSound('levelUp');
        enemyFleet.reset();
        player.reset();
        updateUI();
    }
}

function endGame() {
    gameState.gameOver = true;
    gameState.isRunning = false;
    finalScoreElement.textContent = gameState.score;
    gameOverScreen.classList.remove('hidden');
}

function handleInput() {
    if (keys['ArrowLeft'] || keys['KeyA']) {
        player.move('left');
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        player.move('right');
    }
    if (keys['Space']) {
        player.shoot();
    }
}

function gameLoop() {
    if (!gameState.isRunning || gameState.isPaused) return;

    // Limpiar canvas
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Actualizar y dibujar estrellas
    starField.update();
    starField.draw();

    // Manejar input
    handleInput();

    // Actualizar UFO
    ufo.spawn();
    ufo.update();
    ufo.draw();

    // Actualizar y dibujar jugador
    player.draw();
    player.updateBullets();

    // Actualizar y dibujar enemigos
    enemyFleet.update();
    enemyFleet.draw();

    // Actualizar y dibujar explosiones
    explosions = explosions.filter(exp => {
        exp.update();
        exp.draw();
        return !exp.isDone();
    });

    // Verificar colisiones
    checkCollisions();

    // Verificar nivel completado
    checkLevelComplete();

    // Continuar loop
    if (!gameState.gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;

    // Prevenir scroll con flechas y espacio
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }

    // Pausa
    if (e.code === 'KeyP' || e.code === 'Escape') {
        if (gameState.isRunning && !gameState.gameOver) {
            gameState.isPaused = !gameState.isPaused;
            pauseScreen.classList.toggle('hidden');
            if (!gameState.isPaused) {
                gameLoop();
            }
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

startBtn.addEventListener('click', () => {
    // Iniciar contexto de audio (necesario para algunos navegadores)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    startScreen.classList.add('hidden');
    initGame();
    gameState.isRunning = true;
    gameLoop();
});

restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    initGame();
    gameState.isRunning = true;
    gameLoop();
});

// ==========================================
// INICIALIZACION
// ==========================================
console.log('Space Invaders cargado. Presiona INICIAR para jugar!');
