const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let WATER_BAR_WIDTH = 0;
const WATER_BAR_HEIGHT = 10;
let WATER_BAR_OUTLINE_WIDTH = 110; // Outline width (separate from bar width)
let WATER_BAR_OUTLINE = 3; // Outline thickness
let refillSpeed = 0.7; //the speed in which players bucket will refill
let drainSpeed = 0.7; //the speed in which players bucket will drain

const WATER_MAX = 100;

let player = {
    x: canvas.width - canvas.width / 5,
    y: canvas.height - canvas.height / 5,
    radius: 35,
    speed: 5,
    img: new Image(),
    angle: 0,
    water: WATER_MAX,
    maxWater: WATER_MAX,
    draw(ctx) {
        // Drawing the Truck Detection Box
        const rectWidth = 150;
        const rectHeight = 300;
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.strokeRect(
            canvas.width - canvas.width / 11,
            canvas.height - canvas.height / 3.3,
            rectWidth,
            rectHeight
        );
        ctx.restore();

        // Drawing a collision circle for the player
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, 36, 0, Math.PI * 2); // (centerX, centerY, radius, startAngle, endAngle)
        ctx.strokeStyle = 'red'; // Change color as needed
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

        if (this.img.complete) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.drawImage(
                this.img,
                -this.radius * 1.5,
                -this.radius * 1.25,
                this.radius * 3,
                this.radius * 2.5
            );
            ctx.restore();
        }

        // Center the outline under the player
        const outlineX = player.x - WATER_BAR_OUTLINE_WIDTH / 2;
        const outlineY = player.y + player.radius * 1.5;

        // Align the left side of the blue bar with the left side of the outline's inner area
        const barX = outlineX + WATER_BAR_OUTLINE;
        const barY = outlineY + WATER_BAR_OUTLINE;

        // Draw outline (black)
        ctx.fillStyle = 'black';
        ctx.fillRect(
            outlineX,
            outlineY,
            WATER_BAR_OUTLINE_WIDTH,
            WATER_BAR_HEIGHT + 2 * WATER_BAR_OUTLINE
        );

        // Draw water (light blue)
        const fillRatio = this.water / this.maxWater;
        ctx.fillStyle = '#7ed6ff';
        ctx.fillRect(
            barX,
            barY,
            WATER_BAR_WIDTH * fillRatio,
            WATER_BAR_HEIGHT
        );
    }
};

const truck = {
    x: canvas.width - canvas.width / 18,
    y: canvas.height - canvas.height / 6,
    width: 115,
    height: 230,
    img: new Image()
};
truck.img.src = 'img/Water-truck-Photoroom.png';

player.img.src = 'img/EmptyBucketSprite-Photoroom.png';

let imagesLoaded = 0;

let villageSpawnAmount = 3; // Amount of villages spawned on screen
const spawnImgSrc = 'img/house-village-city-atl-png.webp';

const spawnImg = new Image();
spawnImg.src = spawnImgSrc;

function spawnRandomImages(amount) {
    const images = [];
    const minDist = spawnImg.width; // Minimum allowed distance between centers
    const playerBuffer = player.radius * 2; // Minimum distance from player
    // Red rectangle properties (adjust to match your actual values)
    const rectWidth = 150;
    const rectHeight = 300;
    const rectX = canvas.width - canvas.width / 11;
    const rectY = canvas.height - canvas.height / 3.3;

    for (let i = 0; i < amount; i++) {
        let tries = 0;
        let x, y, valid;
        do {
            x = Math.random() * (canvas.width - spawnImg.width) + spawnImg.width / 2;
            y = Math.random() * (canvas.height - spawnImg.height) + spawnImg.height / 2;
            valid = true;

            // 1. Check distance from other images
            for (const img of images) {
                const dx = x - img.x;
                const dy = y - img.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist) {
                    valid = false;
                    break;
                }
            }

            // 2. Check distance from player spawn
            const dxPlayer = x - player.x;
            const dyPlayer = y - player.y;
            const distPlayer = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer);
            if (distPlayer < playerBuffer + spawnImg.width / 2) {
                valid = false;
            }

            // 3. Check overlap with red rectangle
            const left = x - spawnImg.width / 2;
            const right = x + spawnImg.width / 2;
            const top = y - spawnImg.height / 2;
            const bottom = y + spawnImg.height / 2;
            const rectLeft = rectX;
            const rectRight = rectX + rectWidth;
            const rectTop = rectY;
            const rectBottom = rectY + rectHeight;

            // Check if image rectangle overlaps red rectangle
            if (
                right > rectLeft &&
                left < rectRight &&
                bottom > rectTop &&
                top < rectBottom
            ) {
                valid = false;
            }

            tries++;
            if (tries > 1000) break;
        } while (!valid);
        images.push({ x, y });
    }
    return images;
}

let randomImages = [];
spawnImg.onload = function () {
    randomImages = spawnRandomImages(villageSpawnAmount);
    draw(); // Redraw after images are spawned
};

player.img.onload = truck.img.onload = function () {
    imagesLoaded++;
    if (imagesLoaded === 2) {
        draw();
        update();
    }
};

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;

    if (spawnImg.complete && randomImages.length > 0) {
        randomImages.forEach(obj => {
            ctx.drawImage(
                spawnImg,
                obj.x - spawnImg.width / 2,
                obj.y - spawnImg.height / 2
            );
        });
    }

    randomImages.forEach(obj => {
        // Draw the image
        ctx.drawImage(
            spawnImg,
            obj.x - spawnImg.width / 2,
            obj.y - spawnImg.height / 2
        );

        // Draw the collision circle for the villages
        ctx.save();
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, spawnImg.width / 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    });

    // Draw the truck image
    if (truck.img.complete) {
        ctx.save();
        ctx.translate(truck.x, truck.y);

        ctx.drawImage(
            truck.img,
            -truck.width / 2,
            -truck.height / 2,
            truck.width,
            truck.height
        );
        ctx.restore();
    }

    player.draw(ctx);

    // Clamp player position to stay within canvas borders
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
}

function movePlayer(dx, dy) {
    player.x += dx;
    player.y += dy;
    draw();
}

// Set the rotation angle in radians (e.g., 45 degrees = Math.PI / 4)
const angle = Math.PI / 4; // Change this value as needed

const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

function CollisionCheck() {
    // Player collision circle
    const playerCircle = {
        x: player.x,
        y: player.y,
        r: 36
    };

    // Truck collision rectangle (red box in bottom left)
    const rectWidth = 150;
    const rectHeight = 300;
    const rectX = canvas.width - canvas.width / 11;
    const rectY = canvas.height - canvas.height / 3.3;

    // Find closest point on rectangle to player center
    const closestX = Math.max(rectX, Math.min(playerCircle.x, rectX + rectWidth));
    const closestY = Math.max(rectY, Math.min(playerCircle.y, rectY + rectHeight));

    // Distance from player center to closest point
    const dx = playerCircle.x - closestX;
    const dy = playerCircle.y - closestY;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq <= playerCircle.r * playerCircle.r && WATER_BAR_WIDTH < WATER_MAX) {
        console.log("player touching truck");
        WATER_BAR_WIDTH += refillSpeed;
    }

    // Check collision with each village's red collision circle
    if (spawnImg.complete && randomImages.length > 0) {
        const villageRadius = spawnImg.width / 3;
        randomImages.forEach((village, idx) => {
            const dx = playerCircle.x - village.x;
            const dy = playerCircle.y - village.y;
            const distSq = dx * dx + dy * dy;
            if (distSq <= (playerCircle.r + villageRadius) * (playerCircle.r + villageRadius) && WATER_BAR_WIDTH > 0) {
                console.log(`player touching a village (index: ${idx})`);
                WATER_BAR_WIDTH -= drainSpeed;
            }
        });
    }
}

function update() {
    let dx = 0, dy = 0;
    if (keys['arrowup'] || keys['w']) dy -= player.speed;
    if (keys['arrowdown'] || keys['s']) dy += player.speed;
    if (keys['arrowleft'] || keys['a']) dx -= player.speed;
    if (keys['arrowright'] || keys['d']) dx += player.speed;

    // Set angle based on current keys
    if ((keys['w'] || keys['arrowup']) && (keys['d'] || keys['arrowright'])) {
        player.angle = Math.PI / 4;
    } else if ((keys['w'] || keys['arrowup']) && (keys['a'] || keys['arrowleft'])) {
        player.angle = -Math.PI / 4;
    } else if ((keys['s'] || keys['arrowdown']) && (keys['d'] || keys['arrowright'])) {
        player.angle = (3 * Math.PI) / 4;
    } else if ((keys['s'] || keys['arrowdown']) && (keys['a'] || keys['arrowleft'])) {
        player.angle = (-3 * Math.PI) / 4;
    } else if (keys['d'] || keys['arrowright']) {
        player.angle = Math.PI / 2;
    } else if (keys['a'] || keys['arrowleft']) {
        player.angle = -Math.PI / 2;
    } else if (keys['w'] || keys['arrowup']) {
        player.angle = 0;
    } else if (keys['s'] || keys['arrowdown']) {
        player.angle = Math.PI;
    }

    if (dx !== 0 || dy !== 0) {
        player.x += dx;
        player.y += dy;
    }

    // Always redraw and check for collision, even if not moving
    draw();
    CollisionCheck();

    requestAnimationFrame(update);
}