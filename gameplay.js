const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
    x: canvas.width - canvas.width / 5,
    y: canvas.height - canvas.height / 5,
    radius: 40,
    speed: 5,
    img: new Image(),
    angle: 0
};

const truck = {
    x: canvas.width - canvas.width / 15,
    y: canvas.height - canvas.height / 5,
    width: 450,
    height: 325,
    img: new Image()
};
truck.img.src = 'img/watertruck-full-charity-water-pickup-truck-png-Photoroom.png';

player.img.src = 'img/EmptyBucketSprite-Photoroom.png';

let imagesLoaded = 0;

player.img.onload = truck.img.onload = function() {
    imagesLoaded++;
    if (imagesLoaded === 2) {
        draw();
        update();
    }
};

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

        // Drawing the Truck Detection Box
    const rectWidth = 150;
    const rectHeight = 300;
    ctx.save();
    ctx.fillStyle = 'blue';
    ctx.fillRect(
        canvas.width - canvas.width / 9,
        canvas.height - canvas.height / 3,
        rectWidth,
        rectHeight
    );
    ctx.restore();

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

    if (player.img.complete) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle);
        ctx.drawImage(
            player.img,
            -player.radius * 1.5,
            -player.radius * 1.25,
            player.radius * 3,
            player.radius * 2.5
        );
        ctx.restore();
    }
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
        draw();
    }

    requestAnimationFrame(update);
}