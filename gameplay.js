const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
    x: canvas.width / 2,                //replace the sprite images with more clear ones
    y: canvas.height / 2,
    radius: 30,
    speed: 5,
    img: new Image()
};

player.img.src = 'img/EmptyBucketSprite-Photoroom.png';

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Make image edges sharper (especially for pixel art)
    ctx.imageSmoothingEnabled = false;

    // Draw the player image centered at (player.x, player.y)
    if (player.img.complete) {
        ctx.drawImage(
            player.img,
            player.x - player.radius,
            player.y - player.radius,
            player.radius * 3,
            player.radius * 2.5
        );
    }
}

function movePlayer(dx, dy) {
    player.x += dx;
    player.y += dy;
    draw();
}

player.img.onload = draw; // Draw when image is loaded

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            movePlayer(0, -player.speed);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            movePlayer(0, player.speed);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            movePlayer(-player.speed, 0);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            movePlayer(player.speed, 0);
            break;
    }
});