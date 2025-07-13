// Game constants
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const TANK_SIZE = 30;
const BULLET_SIZE = 4;
const BULLET_SPEED = 8;
const TANK_SPEED = 3;
const AI_TANK_SPEED = 2;
const AI_SHOOT_RANGE = 200;
const AI_SHOOT_COOLDOWN = 1000; // milliseconds

// Game state
let canvas, ctx;
let player;
let enemies = [];
let bullets = [];
let obstacles = [];
let keys = {};
let mouse = { x: 0, y: 0 };
let gameRunning = true;
let score = 0;
let lastEnemyShot = 0;
let currentLevel = 1;
let totalLevels = 5;

// Tank class
class Tank {
    constructor(x, y, color, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.angle = 0; // Tank body angle
        this.turretAngle = 0; // Turret angle (separate from body)
        this.health = 100;
        this.isPlayer = isPlayer;
        this.lastShot = 0;
        this.shootCooldown = 300; // milliseconds
        this.size = TANK_SIZE;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Tank body
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
        // Tank tracks (on sides)
        ctx.fillStyle = '#333';
        ctx.fillRect(-this.size/2, -this.size/2 - 5, this.size, 5);
        ctx.fillRect(-this.size/2, this.size/2, this.size, 5);
        
        // Tank turret
        ctx.fillStyle = this.isPlayer ? '#4CAF50' : '#f44336';
        ctx.fillRect(-this.size/3, -this.size/3, this.size*2/3, this.size*2/3);
        
        ctx.restore();
        
        // Draw turret and barrel separately with turret angle
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.turretAngle);
        
        // Tank barrel
        ctx.fillStyle = '#666';
        ctx.fillRect(0, -3, this.size/2 + 10, 6);
        
        ctx.restore();
        
        // Health bar
        this.drawHealthBar();
    }

    drawHealthBar() {
        const barWidth = 40;
        const barHeight = 4;
        const healthPercent = this.health / 100;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barWidth/2, this.y - this.size/2 - 15, barWidth, barHeight);
        
        ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FF9800' : '#f44336';
        ctx.fillRect(this.x - barWidth/2, this.y - this.size/2 - 15, barWidth * healthPercent, barHeight);
    }

    move(dx, dy) {
        const newX = this.x + dx;
        const newY = this.y + dy;
        
        // Check boundaries
        if (newX >= this.size/2 && newX <= CANVAS_WIDTH - this.size/2 &&
            newY >= this.size/2 && newY <= CANVAS_HEIGHT - this.size/2) {
            
            // Check obstacle collisions
            let canMove = true;
            for (let obstacle of obstacles) {
                if (this.checkCollision(obstacle, newX, newY)) {
                    canMove = false;
                    break;
                }
            }
            
            if (canMove) {
                this.x = newX;
                this.y = newY;
            }
        }
    }

    checkCollision(obstacle, x, y) {
        return x + this.size/2 > obstacle.x &&
               x - this.size/2 < obstacle.x + obstacle.width &&
               y + this.size/2 > obstacle.y &&
               y - this.size/2 < obstacle.y + obstacle.height;
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShot > this.shootCooldown) {
            const bulletX = this.x + Math.cos(this.turretAngle) * (this.size/2 + 10);
            const bulletY = this.y + Math.sin(this.turretAngle) * (this.size/2 + 10);
            
            bullets.push(new Bullet(bulletX, bulletY, this.turretAngle, this.isPlayer));
            this.lastShot = now;
            
            // Play sound effect
            playSound('shoot');
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            return true; // Tank destroyed
        }
        return false;
    }
}

// Bullet class
class Bullet {
    constructor(x, y, angle, isPlayerBullet) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = BULLET_SPEED;
        this.isPlayerBullet = isPlayerBullet;
        this.size = BULLET_SIZE;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.fillStyle = this.isPlayerBullet ? '#FFD700' : '#FF4444';
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
        // Bullet trail
        ctx.strokeStyle = this.isPlayerBullet ? '#FFA500' : '#FF6666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-this.size/2 - 5, 0);
        ctx.lineTo(-this.size/2, 0);
        ctx.stroke();
        
        ctx.restore();
    }

    isOutOfBounds() {
        return this.x < 0 || this.x > CANVAS_WIDTH || 
               this.y < 0 || this.y > CANVAS_HEIGHT;
    }

    checkCollision(tank) {
        const dx = this.x - tank.x;
        const dy = this.y - tank.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < tank.size/2 + this.size/2;
    }
}

// Obstacle class
class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw() {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add some texture
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        for (let i = 0; i < this.width; i += 10) {
            ctx.beginPath();
            ctx.moveTo(this.x + i, this.y);
            ctx.lineTo(this.x + i, this.y + this.height);
            ctx.stroke();
        }
    }
}

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Create player tank
    player = new Tank(100, CANVAS_HEIGHT/2, '#4CAF50', true);
    
    // Create enemy tanks based on current level
    enemies = [];
    for (let enemyData of LEVELS[currentLevel].enemies) {
        // Validate spawn position
        if (isValidSpawnPosition(enemyData.x, enemyData.y)) {
            enemies.push(new Tank(enemyData.x, enemyData.y, '#f44336'));
        } else {
            // Find alternative spawn position if original is invalid
            let altX = enemyData.x;
            let altY = enemyData.y;
            
            // Try positions around the original location
            for (let offset = 50; offset <= 200; offset += 50) {
                // Try different directions
                const positions = [
                    { x: enemyData.x + offset, y: enemyData.y },
                    { x: enemyData.x - offset, y: enemyData.y },
                    { x: enemyData.x, y: enemyData.y + offset },
                    { x: enemyData.x, y: enemyData.y - offset },
                    { x: enemyData.x + offset, y: enemyData.y + offset },
                    { x: enemyData.x - offset, y: enemyData.y - offset }
                ];
                
                for (let pos of positions) {
                    if (isValidSpawnPosition(pos.x, pos.y)) {
                        altX = pos.x;
                        altY = pos.y;
                        break;
                    }
                }
                
                if (isValidSpawnPosition(altX, altY)) break;
            }
            
            enemies.push(new Tank(altX, altY, '#f44336'));
        }
    }
    
    // Create obstacles
    createObstacles();
    
    // Event listeners
    document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
    document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);
    document.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    document.addEventListener('click', () => {
        if (gameRunning) {
            player.shoot();
        }
    });
    
    // Start game loop
    gameLoop();
}

// Level definitions
const LEVELS = {
    1: {
        name: "Training Ground",
        obstacles: [
            new Obstacle(300, 200, 60, 200),
            new Obstacle(500, 400, 60, 200),
            new Obstacle(700, 100, 60, 200),
            new Obstacle(900, 500, 60, 200),
            new Obstacle(400, 600, 200, 60),
            new Obstacle(800, 300, 200, 60)
        ],
        enemies: [
            { x: CANVAS_WIDTH - 100, y: 100 },
            { x: CANVAS_WIDTH - 100, y: CANVAS_HEIGHT - 100 },
            { x: CANVAS_WIDTH - 200, y: CANVAS_HEIGHT/2 }
        ]
    },
    2: {
        name: "Urban Warfare",
        obstacles: [
            new Obstacle(200, 150, 80, 150),
            new Obstacle(400, 300, 80, 150),
            new Obstacle(600, 150, 80, 150),
            new Obstacle(800, 300, 80, 150),
            new Obstacle(1000, 150, 80, 150),
            new Obstacle(300, 500, 150, 80),
            new Obstacle(600, 500, 150, 80),
            new Obstacle(900, 500, 150, 80),
            new Obstacle(150, 650, 200, 60),
            new Obstacle(450, 650, 200, 60),
            new Obstacle(750, 650, 200, 60)
        ],
        enemies: [
            { x: CANVAS_WIDTH - 150, y: 150 },
            { x: CANVAS_WIDTH - 150, y: CANVAS_HEIGHT - 150 },
            { x: CANVAS_WIDTH - 250, y: CANVAS_HEIGHT/2 },
            { x: CANVAS_WIDTH - 350, y: 200 },
            { x: CANVAS_WIDTH - 350, y: CANVAS_HEIGHT - 200 }
        ]
    },
    3: {
        name: "Maze Runner",
        obstacles: [
            new Obstacle(250, 100, 40, 300),
            new Obstacle(450, 100, 40, 300),
            new Obstacle(650, 100, 40, 300),
            new Obstacle(850, 100, 40, 300),
            new Obstacle(250, 500, 40, 300),
            new Obstacle(450, 500, 40, 300),
            new Obstacle(650, 500, 40, 300),
            new Obstacle(850, 500, 40, 300),
            new Obstacle(350, 200, 300, 40),
            new Obstacle(350, 400, 300, 40),
            new Obstacle(350, 600, 300, 40),
            new Obstacle(550, 300, 300, 40),
            new Obstacle(550, 500, 300, 40)
        ],
        enemies: [
            { x: CANVAS_WIDTH - 100, y: 150 },
            { x: CANVAS_WIDTH - 100, y: 350 },
            { x: CANVAS_WIDTH - 100, y: 550 },
            { x: CANVAS_WIDTH - 200, y: 250 },
            { x: CANVAS_WIDTH - 200, y: 450 },
            { x: CANVAS_WIDTH - 300, y: 350 }
        ]
    },
    4: {
        name: "Fortress Assault",
        obstacles: [
            new Obstacle(400, 100, 400, 60),
            new Obstacle(400, 200, 60, 200),
            new Obstacle(740, 200, 60, 200),
            new Obstacle(400, 500, 400, 60),
            new Obstacle(200, 300, 60, 200),
            new Obstacle(940, 300, 60, 200),
            new Obstacle(300, 400, 200, 60),
            new Obstacle(700, 400, 200, 60)
        ],
        enemies: [
            { x: CANVAS_WIDTH - 100, y: 150 },
            { x: CANVAS_WIDTH - 100, y: 350 },
            { x: CANVAS_WIDTH - 100, y: 550 },
            { x: CANVAS_WIDTH - 200, y: 250 },
            { x: CANVAS_WIDTH - 200, y: 450 },
            { x: CANVAS_WIDTH - 300, y: 350 },
            { x: CANVAS_WIDTH - 400, y: 200 },
            { x: CANVAS_WIDTH - 400, y: 500 }
        ]
    },
    5: {
        name: "Final Battle",
        obstacles: [
            new Obstacle(200, 100, 60, 600),
            new Obstacle(400, 100, 60, 600),
            new Obstacle(600, 100, 60, 600),
            new Obstacle(800, 100, 60, 600),
            new Obstacle(1000, 100, 60, 600),
            new Obstacle(300, 200, 400, 60),
            new Obstacle(300, 400, 400, 60),
            new Obstacle(300, 600, 400, 60),
            new Obstacle(800, 200, 200, 60),
            new Obstacle(800, 400, 200, 60),
            new Obstacle(800, 600, 200, 60)
        ],
        enemies: [
            { x: CANVAS_WIDTH - 150, y: 150 },
            { x: CANVAS_WIDTH - 150, y: 350 },
            { x: CANVAS_WIDTH - 150, y: 550 },
            { x: CANVAS_WIDTH - 250, y: 250 },
            { x: CANVAS_WIDTH - 250, y: 450 },
            { x: CANVAS_WIDTH - 350, y: 150 },
            { x: CANVAS_WIDTH - 350, y: 350 },
            { x: CANVAS_WIDTH - 350, y: 550 },
            { x: CANVAS_WIDTH - 500, y: 200 },
            { x: CANVAS_WIDTH - 500, y: 400 }
        ]
    }
};

function createObstacles() {
    obstacles = [...LEVELS[currentLevel].obstacles];
}

function isValidSpawnPosition(x, y) {
    // Check if position is within canvas bounds
    if (x < TANK_SIZE/2 || x > CANVAS_WIDTH - TANK_SIZE/2 ||
        y < TANK_SIZE/2 || y > CANVAS_HEIGHT - TANK_SIZE/2) {
        return false;
    }
    
    // Check if position overlaps with any obstacle
    for (let obstacle of obstacles) {
        if (x + TANK_SIZE/2 > obstacle.x &&
            x - TANK_SIZE/2 < obstacle.x + obstacle.width &&
            y + TANK_SIZE/2 > obstacle.y &&
            y - TANK_SIZE/2 < obstacle.y + obstacle.height) {
            return false;
        }
    }
    
    return true;
}

function updatePlayer() {
    // Tank body rotation
    if (keys['a']) player.angle -= 0.05; // Rotate left
    if (keys['d']) player.angle += 0.05; // Rotate right
    
    // Forward/backward movement
    let moveSpeed = 0;
    if (keys['w']) moveSpeed = TANK_SPEED; // Move forward
    if (keys['s']) moveSpeed = -TANK_SPEED; // Move backward
    
    if (moveSpeed !== 0) {
        const dx = Math.cos(player.angle) * moveSpeed;
        const dy = Math.sin(player.angle) * moveSpeed;
        player.move(dx, dy);
    }
    
    // Turret aiming (mouse controls turret only)
    const dx_aim = mouse.x - player.x;
    const dy_aim = mouse.y - player.y;
    player.turretAngle = Math.atan2(dy_aim, dx_aim);
}

function updateEnemies() {
    const now = Date.now();
    
    for (let enemy of enemies) {
        if (enemy.health <= 0) continue;
        
        // Calculate direction to player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const targetAngle = Math.atan2(dy, dx);
        
        // Aim turret at player
        enemy.turretAngle = targetAngle;
        
        // Always rotate tank body towards player
        let angleDiff = targetAngle - enemy.angle;
        
        // Normalize angle difference to [-π, π]
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Rotate towards target angle
        if (Math.abs(angleDiff) > 0.1) {
            if (angleDiff > 0) {
                enemy.angle += 0.03; // Rotate left
            } else {
                enemy.angle -= 0.03; // Rotate right
            }
        }
        
        // Move towards player if too far
        if (distance > AI_SHOOT_RANGE) {
            // Move forward in the direction the tank is facing
            const moveX = Math.cos(enemy.angle) * AI_TANK_SPEED;
            const moveY = Math.sin(enemy.angle) * AI_TANK_SPEED;
            enemy.move(moveX, moveY);
        }
        
        // Shoot if cooldown is ready (no range limit)
        if (now - lastEnemyShot > AI_SHOOT_COOLDOWN) {
            enemy.shoot();
            lastEnemyShot = now;
        }
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.update();
        
        // Remove bullets that are out of bounds
        if (bullet.isOutOfBounds()) {
            bullets.splice(i, 1);
            continue;
        }
        
        // Check collision with tanks
        if (bullet.isPlayerBullet) {
            // Player bullet hits enemy
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (enemy.health > 0 && bullet.checkCollision(enemy)) {
                    if (enemy.takeDamage(25)) {
                        enemies.splice(j, 1);
                        score += 100;
                        playSound('explosion');
                    }
                    bullets.splice(i, 1);
                    break;
                }
            }
        } else {
            // Enemy bullet hits player
            if (bullet.checkCollision(player)) {
                if (player.takeDamage(20)) {
                    gameOver(false);
                }
                bullets.splice(i, 1);
                playSound('hit');
            }
        }
        
        // Check collision with obstacles
        for (let obstacle of obstacles) {
            if (bullet.x > obstacle.x && bullet.x < obstacle.x + obstacle.width &&
                bullet.y > obstacle.y && bullet.y < obstacle.y + obstacle.height) {
                bullets.splice(i, 1);
                break;
            }
        }
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#4a7c59';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw grid pattern
    ctx.strokeStyle = '#3a6b4a';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
    }
    
    // Draw obstacles
    for (let obstacle of obstacles) {
        obstacle.draw();
    }
    
    // Draw bullets
    for (let bullet of bullets) {
        bullet.draw();
    }
    
    // Draw tanks
    player.draw();
    for (let enemy of enemies) {
        enemy.draw();
    }
}

function updateUI() {
    document.getElementById('health').textContent = player.health;
    document.getElementById('score').textContent = score;
    document.getElementById('enemies').textContent = enemies.filter(e => e.health > 0).length;
    document.getElementById('level').textContent = currentLevel;
}

function checkWinCondition() {
    if (enemies.length === 0) {
        if (currentLevel < totalLevels) {
            nextLevel();
        } else {
            gameOver(true);
        }
    }
}

function gameOver(won) {
    gameRunning = false;
    const gameOverDiv = document.getElementById('gameOver');
    const gameOverText = document.getElementById('gameOverText');
    
    if (won) {
        if (currentLevel >= totalLevels) {
            gameOverText.textContent = 'Congratulations! You completed all levels!';
        } else {
            gameOverText.textContent = 'Victory! You destroyed all enemies!';
        }
    } else {
        gameOverText.textContent = 'Game Over! Your tank was destroyed!';
    }
    
    gameOverDiv.style.display = 'block';
}

function nextLevel() {
    currentLevel++;
    bullets = [];
    lastEnemyShot = 0;
    
    // Reset player position and health
    player.x = 100;
    player.y = CANVAS_HEIGHT/2;
    player.health = 100;
    
    // Create new enemies for the level
    enemies = [];
    for (let enemyData of LEVELS[currentLevel].enemies) {
        // Validate spawn position
        if (isValidSpawnPosition(enemyData.x, enemyData.y)) {
            enemies.push(new Tank(enemyData.x, enemyData.y, '#f44336'));
        } else {
            // Find alternative spawn position if original is invalid
            let altX = enemyData.x;
            let altY = enemyData.y;
            
            // Try positions around the original location
            for (let offset = 50; offset <= 200; offset += 50) {
                // Try different directions
                const positions = [
                    { x: enemyData.x + offset, y: enemyData.y },
                    { x: enemyData.x - offset, y: enemyData.y },
                    { x: enemyData.x, y: enemyData.y + offset },
                    { x: enemyData.x, y: enemyData.y - offset },
                    { x: enemyData.x + offset, y: enemyData.y + offset },
                    { x: enemyData.x - offset, y: enemyData.y - offset }
                ];
                
                for (let pos of positions) {
                    if (isValidSpawnPosition(pos.x, pos.y)) {
                        altX = pos.x;
                        altY = pos.y;
                        break;
                    }
                }
                
                if (isValidSpawnPosition(altX, altY)) break;
            }
            
            enemies.push(new Tank(altX, altY, '#f44336'));
        }
    }
    
    // Create new obstacles for the level
    createObstacles();
    
    // Show level transition message
    showLevelMessage();
}

function restartGame() {
    gameRunning = true;
    score = 0;
    currentLevel = 1;
    bullets = [];
    lastEnemyShot = 0;
    
    // Reset player
    player.x = 100;
    player.y = CANVAS_HEIGHT/2;
    player.health = 100;
    
    // Reset enemies
    enemies = [];
    for (let enemyData of LEVELS[currentLevel].enemies) {
        enemies.push(new Tank(enemyData.x, enemyData.y, '#f44336'));
    }
    
    // Reset obstacles
    createObstacles();
    
    document.getElementById('gameOver').style.display = 'none';
}

function showLevelMessage() {
    const levelMessage = document.getElementById('levelMessage');
    levelMessage.textContent = `Level ${currentLevel}: ${LEVELS[currentLevel].name}`;
    levelMessage.style.display = 'block';
    
    setTimeout(() => {
        levelMessage.style.display = 'none';
    }, 3000);
}

function playSound(type) {
    // Simple sound simulation - in a real game you'd use actual audio files
    console.log(`Playing ${type} sound`);
}

function gameLoop() {
    if (gameRunning) {
        updatePlayer();
        updateEnemies();
        updateBullets();
        checkWinCondition();
        updateUI();
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game when page loads
window.addEventListener('load', init); 