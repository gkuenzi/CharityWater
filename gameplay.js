const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// REMINDER!!!!!!!
//Mode Toggle doesn't work && still needs a label under it
//Alert is currently commented out at bottom



let lvl = 0; // 0 == start screen, -1 == game over
let score = 0;
let attempts = 3; //Not useful yet
let loadingScreen = false; //Determines if a loading screen is active or not
let fact = 0;
let factDisplayed = false;
const charityFacts = [
    'Eight out of ten people without access to improved water sources live in rural areas.',
    'charity: water works with local partners to fund water, sanitation, and hygiene (WASH) programs for rural communities around the world.',
    'water projects are locally-led and community-owned. Charity: water deploys donations to the field, where these partners go to work rehabilitating old water systems, building new ones, or completing sanitation and hygiene training.',
    'When you give to charity: water, 100% of your donation goes directly to funding water solutions in rural communities.',
    'Access to clean water and basic sanitation can save around 16,000 lives every week.',
    '703 million people in the world live without clean water. Thats nearly 1 in 10 people worldwide. Or, twice the population of the United States.',
    'Diseases from dirty water kill more people every year than all forms of violence, including war.',
    'Access to clean water gives communities more time to grow food, earn an income, and go to school -- all of which fight poverty.',
    'Every $1 invested in joint water supply and sanitation provides a $4.30 economic return.'
];

let WATER_BAR_WIDTH = 0;
const WATER_BAR_HEIGHT = 10;
let WATER_BAR_OUTLINE_WIDTH = 110; // Outline width (separate from bar width)
let WATER_BAR_OUTLINE = 3; // Outline thickness

let villageSpawnAmount = 3; // Amount of villages spawned on screen (initial: 3)
let village_water_height = 10;
let village_water_width = 150; //if changed, ctrl-f 90063 to adjust bars center point
let village_Bar_Outline_Width = village_water_width + village_water_height / 2;
let bar_distance_from_village = 80;
let offsetX = (village_Bar_Outline_Width - village_water_width) / 2;
let offsetY = village_water_height / 4;
let village_drain_speed = 3; //intial: 3

let randomImages = null;

let animalSpawnAmount = 0; // initial: 0
let animal_drain_speed = 3;

let refillSpeed = 0.7; //the speed in which players bucket will refill (initial: 0.7)
let drainSpeed = 1.5; //the speed in which players bucket will drain (initial: 1.5)

//delayed spawns that will be used for days greater than 7 to make sure they arent happening daily
let delayed_animal_spawns = 0;
let delayed_village_spawns = 0;

let keydown = false;

const WATER_MAX = 104;

// Timer variables
let MaxSeconds = 60; // (initial: 60(1 minute))
let timerSeconds = MaxSeconds;
let timerInterval = null;
let timeDepletionRate = 1;

// define initial toggle
const modeToggleImg = new Image();
modeToggleImg.src = 'img/normal-mode-toggle-Photoroom.png';
modeToggleScale = 2.1;
const modeToggleWidth = 97 * modeToggleScale;  // Change as needed
const modeToggleHeight = 60 * modeToggleScale; // Change as needed
const toggleX = canvas.width * 0.005;
const toggleY = canvas.height * 0.005;

// Function to start and update the countdown timer
function startTimer() {
    // Clear any existing timer
    if (timerInterval) clearInterval(timerInterval);
    updateTimerDisplay(true);
    timerInterval = setInterval(() => {
        if (timerSeconds > 0) {
            timerSeconds -= timeDepletionRate;
            updateTimerDisplay(true);
        } else {
            clearInterval(timerInterval);
            updateTimerDisplay(false);
            // Optionally, handle timer end (e.g., end game)
        }
    }, 1000);
}

// Function to update or remove the timer display above the canvas
function updateTimerDisplay(running) {
    let timerDiv = document.getElementById('timerDisplay');
    if (!running) {
        if (timerDiv) timerDiv.remove();
        return;
    }
    if (!timerDiv) {
        timerDiv = document.createElement('div');
        timerDiv.id = 'timerDisplay';
        timerDiv.style.position = 'absolute';
        timerDiv.style.top = '24px';
        timerDiv.style.left = '50%';
        timerDiv.style.transform = 'translateX(-50%)';
        timerDiv.style.fontFamily = "'Tribeca', Arial, sans-serif";
        timerDiv.style.fontSize = '2.2rem';
        timerDiv.style.color = 'rgba(255, 255, 255, 0.85)';
        timerDiv.style.background = 'rgba(0, 0, 0, 0.85)';
        timerDiv.style.padding = '8px 32px';
        timerDiv.style.borderRadius = '12px';
        timerDiv.style.zIndex = '3000';
        timerDiv.style.textAlign = 'center';
        document.body.appendChild(timerDiv);
    }
    timerDiv.innerText = `Time: ${Math.max(0, Math.ceil(timerSeconds))}`;
}

function updateDayCounter() {
    let dayDiv = document.getElementById('dayCounter');
    if (!dayDiv) {
        dayDiv = document.createElement('div');
        dayDiv.id = 'dayCounter';
        // Insert after canvas
        const canvasElem = document.getElementById('gameCanvas');
        canvasElem.parentNode.insertBefore(dayDiv, canvasElem.nextSibling);
    }
    // Only show on active levels
    if (lvl > 0 && !loadingScreen && lvl < 1000) {
        dayDiv.style.display = '';
        dayDiv.innerText = `Day: ${lvl}`;
    } else {
        dayDiv.style.display = 'none';
    }
}

function updateScoreCounter() {
    let scoreDiv = document.getElementById('scoreCounter');
    if (!scoreDiv) {
        scoreDiv = document.createElement('div');
        scoreDiv.id = 'scoreCounter';
        // Insert after canvas
        const canvasElem = document.getElementById('gameCanvas');
        canvasElem.parentNode.insertBefore(scoreDiv, canvasElem.nextSibling);
    }
    // Only show on active levels
    if (lvl > 0 && !loadingScreen && lvl < 1000) {
        scoreDiv.style.display = '';
        scoreDiv.innerText = `Score: ${score}`;
    } else {
        scoreDiv.style.display = 'none';
    }
}

function startGame() {
    console.log("startGame() has been run");

    if (lvl > 0 && !loadingScreen) {
        updateDayCounter();
        updateScoreCounter();
        updateTimerDisplay(true);
        startTimer();

        let player = {
            x: canvas.width - canvas.width / 5,
            y: canvas.height - canvas.height / 5,
            radius: 35,
            speed: 5, //initial: 5
            img: new Image(),
            angle: 0,
            water: WATER_MAX,
            maxWater: WATER_MAX,
            draw(ctx) {
                // Drawing the Truck Detection Box
                const rectWidth = 150;
                const rectHeight = 300;
                ctx.save();
                ctx.strokeStyle = 'transparent'; // was 'red'
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
                ctx.strokeStyle = 'transparent'; // was 'red'
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

                    // Draw the blue circle relative to the player's rotation
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(0, -27, 13, 0, Math.PI * 2);
                    // Change color based on WATER_BAR_WIDTH
                    if (WATER_BAR_WIDTH > 0) {
                        ctx.fillStyle = 'rgb(37, 109, 157)';
                    } else {
                        ctx.fillStyle = 'rgba(0,0,0,0)'; // transparent
                    }
                    ctx.fill();
                    ctx.lineWidth = 3;
                    ctx.closePath();
                    ctx.restore();

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

        const spawnImgSrc = 'img/house-village-city-atl-png.webp';

        // Track each village's water bar width
        let villageBars = []; // [{x, y, width}]

        //Village Water Bar
        function addVillageWaterBar(x, y, width) {
            // Draw outline (black)
            ctx.fillStyle = 'black';
            ctx.fillRect(
                x - spawnImg.width / 2.5, //bookmark code: 90063
                y + bar_distance_from_village,
                village_Bar_Outline_Width,
                village_water_height * 1.5
            );

            // Draw water (light blue)
            ctx.fillStyle = '#7ed6ff';
            ctx.fillRect(
                x - spawnImg.width / 2.5 + offsetX, //bookmark code: 90063
                y + bar_distance_from_village + offsetY,
                width,
                village_water_height
            );
        }

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

        // Animal image sources
        const animalImgSources = [
            'img/Screenshot 2025-06-22 194803-Photoroom.png',
            'img/Screenshot 2025-06-22 194837-Photoroom.png',
            'img/Transp_Elephant-Photoroom.png'
        ];

        // Preload animal images
        const animalImgs = animalImgSources.map(src => {
            const img = new Image();
            img.src = src;
            return img;
        });

        // Global animal image and array
        let animals = [];

        function spawnAnimals() {
            animals = [];
            // Wait for all animal images to load
            if (animalImgs.some(img => !img.complete)) {
                animalImgs.forEach(img => { img.onload = spawnAnimals; });
                return;
            }
            let tries = 0;
            for (let i = 0; i < animalSpawnAmount; i++) {
                let animalX, animalY, valid, rotation, imgIdx, animalRadius;
                do {
                    // Only spawn in bottom right two-thirds
                    const minX = canvas.width / 3;
                    const maxX = canvas.width - animalImgs[0].width / 2;
                    const minY = canvas.height / 3;
                    const maxY = canvas.height - animalImgs[0].height / 2;
                    animalX = Math.random() * (maxX - minX) + minX;
                    animalY = Math.random() * (maxY - minY) + minY;
                    rotation = Math.random() * Math.PI * 2;
                    imgIdx = Math.floor(Math.random() * animalImgs.length);
                    // Set radius based on image size
                    const src = animalImgSources[imgIdx];
                    if (src === 'img/Screenshot 2025-06-22 194803-Photoroom.png' || src === 'img/Screenshot 2025-06-22 194837-Photoroom.png') {
                        animalRadius = animalImgs[imgIdx].width * 0.5 / 2; // 1/2 width for smaller collision
                    } else {
                        animalRadius = animalImgs[imgIdx].width / 2;
                    }
                    valid = true;
                    // Prevent overlap with villages
                    if (isAnimalTouchingVillage(animalX, animalY, animalRadius, randomImages)) valid = false;
                    // Prevent overlap with truck
                    const truckX = canvas.width - canvas.width / 18;
                    const truckY = canvas.height - canvas.height / 6;
                    const truckW = 115;
                    const truckH = 230;
                    const truckLeft = truckX - truckW / 2;
                    const truckRight = truckX + truckW / 2;
                    const truckTop = truckY - truckH / 2;
                    const truckBottom = truckY + truckH / 2;
                    const animalLeft = animalX - animalRadius;
                    const animalRight = animalX + animalRadius;
                    const animalTop = animalY - animalRadius;
                    const animalBottom = animalY + animalRadius;
                    if (
                        animalRight > truckLeft &&
                        animalLeft < truckRight &&
                        animalBottom > truckTop &&
                        animalTop < truckBottom
                    ) {
                        valid = false;
                    }
                    // Prevent animals from spawning too close to each other
                    for (const other of animals) {
                        const dx = animalX - other.x;
                        const dy = animalY - other.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < animalRadius + other.radius) {
                            valid = false;
                            break;
                        }
                    }
                    tries++;
                    if (tries > 1000) break;
                } while (!valid);
                animals.push({ x: animalX, y: animalY, radius: animalRadius, rotation, active: true, imgIdx });
            }
        }

        function isAnimalTouchingVillage(animalX, animalY, animalRadius, villages) {
            for (const village of villages) {
                const dx = animalX - village.x;
                const dy = animalY - village.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < animalRadius + (spawnImg.width / 2)) {
                    return true; // Overlaps!
                }
            }
            return false; // No overlap
        }

        spawnImg.onload = function () {
            randomImages = spawnRandomImages(villageSpawnAmount);
            // Calculate max and min distance for normalization
            let distances = randomImages.map(obj => {
                const dx = obj.x - truck.x;
                const dy = obj.y - truck.y;
                return Math.sqrt(dx * dx + dy * dy);
            });
            const minDist = Math.min(...distances);
            const maxDist = Math.max(...distances);
            // Assign per-village drain modifier (further = slower)
            villageBars = randomImages.map((obj, idx) => {
                const dx = obj.x - truck.x;
                const dy = obj.y - truck.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                // Normalize: 0 (closest) to 1 (furthest)
                let norm = (maxDist - minDist) > 0 ? (dist - minDist) / (maxDist - minDist) : 0;
                // Modifier: closer = 1, furthest = 0.7 (tweak as needed)
                let drainMod = 1 - 0.3 * norm;
                return {
                    x: obj.x,
                    y: obj.y,
                    width: village_water_width,
                    distanceToTruck: dist,
                    drainMod: drainMod
                };
            });
            draw();
            spawnAnimals(); // Now spawn animals after villages
            // ...existing code...
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
            };

            // Draw each village and its blue bar using the tracked width
            if (randomImages != null) {
                randomImages.forEach((obj, idx) => {
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
                    ctx.strokeStyle = 'transparent'; // was 'red'
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.closePath();
                    ctx.restore();

                    // Draw the blue bar with the current width
                    addVillageWaterBar(obj.x, obj.y, villageBars[idx]?.width ?? village_water_width);
                });
            }

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

            // Draw animals
            if (animalImgs.every(img => img.complete) && animals.length > 0) {
                animals.forEach(animal => {
                    if (!animal.active) return;
                    ctx.save();
                    ctx.translate(animal.x, animal.y);
                    ctx.rotate(animal.rotation);
                    const img = animalImgs[animal.imgIdx];
                    const src = animalImgSources[animal.imgIdx];
                    if (src === 'img/Screenshot 2025-06-22 194803-Photoroom.png' || src === 'img/Screenshot 2025-06-22 194837-Photoroom.png') {
                        ctx.drawImage(img, -img.width * 2 / 3 / 2, -img.height * 2 / 3 / 2, img.width * 2 / 3, img.height * 2 / 3);
                    } else {
                        ctx.drawImage(img, -img.width / 2, -img.height / 2);
                    }
                    ctx.restore();
                });
            }

            // Draw player on top of animals
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
            keydown = true;
        });

        document.addEventListener('keyup', (e) => {
            keys[e.key.toLowerCase()] = false;
            keydown = false;
        });

        function CollisionCheck() {
            // Player collision circle
            const playerCircle = {
                x: player.x,
                y: player.y,
                r: 36
            }

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

            if (distanceSq <= playerCircle.r * playerCircle.r && WATER_BAR_WIDTH <= WATER_MAX && !keydown) {
                WATER_BAR_WIDTH += refillSpeed;

            }

            // Check collision with each village's red collision circle
            if (spawnImg.complete && randomImages.length > 0) {
                const villageRadius = spawnImg.width / 3;
                randomImages.forEach((village, idx) => {
                    const dx = playerCircle.x - village.x;
                    const dy = playerCircle.y - village.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq <= (playerCircle.r + villageRadius) * (playerCircle.r + villageRadius) && WATER_BAR_WIDTH >= 0 && !keydown && WATER_BAR_WIDTH > 0 && villageBars[idx].width < village_water_width) {
                        WATER_BAR_WIDTH -= drainSpeed;
                        // Decrease the blue bar width for this village
                        if (villageBars[idx]) {
                            villageBars[idx].width = Math.max(0, villageBars[idx].width + 1); // adjust decrement as needed
                        }
                        score++;
                        updateScoreCounter();
                        console.log("score: ", score);
                    }
                });
            }

            // Check collision with animals
            if (animalImgs.every(img => img.complete) && animals.length > 0) {
                animals.forEach(animal => {
                    // Remove the check for !animal.active so animals never despawn
                    const dx = player.x - animal.x;
                    const dy = player.y - animal.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < player.radius + animal.radius) {
                        WATER_BAR_WIDTH = Math.max(0, WATER_BAR_WIDTH - animal_drain_speed); // Decrease water bar
                        score = Math.max(0, score - 1); // Decrease score
                        updateScoreCounter && updateScoreCounter();
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

            // Drain village bars based on time and rate
            if (lvl > 0 && !loadingScreen && timerSeconds > 0) {
                villageBars.forEach(bar => {
                    if (bar.width > 0) {
                        // Use per-village drain modifier
                        bar.width = Math.max(0, bar.width - (village_drain_speed * (bar.drainMod || 1)) / 60);
                    }
                });
            }

            // Always redraw and check for collision, even if not moving
            draw();
            CollisionCheck();

            // Check for game over: any village water bar <= 0
            if (villageBars.some(bar => bar.width <= 0)) {
                lvl = -1;
                startGame();
                return;
            }

            // Show loading screen when timer ends
            if (timerSeconds <= 0 && !loadingScreen) {
                loadingScreen = true;
                factDisplayed = false; // reset for new fact
                setTimeout(() => {
                    startGame();
                }, 0);
                return;
            }

            requestAnimationFrame(update);
        }
    } if (lvl == 0) {
        // Draw the logo image centered above the start screen container, but inside the canvas
        function drawStartScreenLogo() {
            const logoImg = new window.Image();
            logoImg.src = 'img/charity-water-logo-9121D887A9-seeklogo.com.png';
            logoImg.onload = function () {
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Calculate logo size and position
                const logoWidth = 160;
                const logoHeight = 160 * (logoImg.height / logoImg.width);
                const logoX = (canvas.width - logoWidth) / 2;
                const logoY = canvas.height / 2 + 150;
                // Draw white transparent rounded rectangle background behind logo using same radius as CSS
                const padding = 24;
                const bgX = logoX - padding / 2;
                const bgY = logoY - padding / 2;
                const bgW = logoWidth + padding;
                const bgH = logoHeight + padding;
                const radius = 16; // Match with CSS border-radius

                ctx.save();
                ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
                ctx.beginPath();
                // Rounded rectangle path (matches CSS border-radius: 16px)
                ctx.moveTo(bgX + radius, bgY);
                ctx.lineTo(bgX + bgW - radius, bgY);
                ctx.quadraticCurveTo(bgX + bgW, bgY, bgX + bgW, bgY + radius);
                ctx.lineTo(bgX + bgW, bgY + bgH - radius);
                ctx.quadraticCurveTo(bgX + bgW, bgY + bgH, bgX + bgW - radius, bgY + bgH);
                ctx.lineTo(bgX + radius, bgY + bgH);
                ctx.quadraticCurveTo(bgX, bgY + bgH, bgX, bgY + bgH - radius);
                ctx.lineTo(bgX, bgY + radius);
                ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                // Draw logo
                ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
                // Draw modeToggle image below the logo
                if (modeToggleImg.complete) {
                    ctx.drawImage(modeToggleImg, toggleX, toggleY, modeToggleWidth, modeToggleHeight);
                }
            };
        }
        drawStartScreenLogo();

        // Add a textbox and a start button to the screen
        let existingDiv = document.getElementById('startScreenContainer');
        if (!existingDiv) {
            const container = document.createElement('div');
            container.id = 'startScreenContainer';

            // Textbox
            const title = document.createElement('div');
            title.innerText = 'Water Delivery Service';
            title.className = 'title';
            container.appendChild(title);

            // Start button
            const startBtn = document.createElement('button');
            startBtn.innerText = 'Start';
            startBtn.onclick = function () {
                container.remove();
                lvl = 1;
                startGame();
            };
            container.appendChild(startBtn);
            document.body.appendChild(container);
        }
    } else if (loadingScreen) {
        // Hide everything else on the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Remove any existing loading containers
        let existingLoading = document.getElementById('loadingScreenContainer');
        if (existingLoading) existingLoading.remove();
        let existingNextBtn = document.getElementById('nextLevelBtn');
        if (existingNextBtn) existingNextBtn.remove();
        let existingDayComplete = document.getElementById('dayCompleteText');
        if (existingDayComplete) existingDayComplete.remove();

        // Remove all game-related DOM elements except the loading screen and button
        let idsToRemove = [
            'startScreenContainer',
            'gameOverContainer',
            'charityWaterBox'
        ];
        idsToRemove.forEach(id => {
            let el = document.getElementById(id);
            if (el) el.remove();
        });

        // Do NOT define or draw player, truck, or villages while loadingScreen is true

        // Create loading screen container styled like start screen container, but no start button
        setTimeout(() => {
            const loadingContainer = document.createElement('div');
            loadingContainer.id = 'loadingScreenContainer';

            // Day complete text
            let dayComplete = document.createElement('div');
            dayComplete.id = 'dayCompleteText';
            dayComplete.innerText = 'Day ' + lvl + ' complete!';
            loadingContainer.appendChild(dayComplete);

            const factLabel = document.createElement('div');

            // Fact container
            const loadingTitle = document.createElement('div');


            if (!factDisplayed) {
                fact = Math.floor(Math.random() * charityFacts.length);
                factDisplayed = true;
            }
            if (lvl == 7) {
                factLabel.innerText = 'Congratulations!';
                loadingTitle.innerText = "Congratualtions on making it through your first week of volunteering! Feel free to stick around for as long as you'd like. We could really use the help. Keep up the great work!"
                // Changes the loading containers font and background color
                loadingContainer.style.backgroundColor = 'rgba(255, 201, 7, 0.8)';
                dayComplete.style.color = 'white';

            } else {
                factLabel.innerText = 'Fact:';
                loadingTitle.className = 'title';
                loadingTitle.innerText = charityFacts[fact];
            }
            loadingContainer.appendChild(factLabel);
            loadingContainer.appendChild(loadingTitle);

            // Next level button
            let nextLevelBtn = document.createElement('button');
            nextLevelBtn.id = 'nextLevelBtn';
            nextLevelBtn.innerText = 'next day';
            nextLevelBtn.onmouseover = function () {
                nextLevelBtn.style.background = 'rgb(215, 170, 6)';
            };
            nextLevelBtn.onmouseout = function () {
                nextLevelBtn.style.background = 'rgb(0, 0, 0)';
            };
            nextLevelBtn.onclick = function () {
                loadingScreen = false;
                factDisplayed = false;
                WATER_BAR_WIDTH = 0;
                lvl++; // advance to next level
                lvlStats(); //adjust stats for the new level
                timerSeconds = MaxSeconds; // or whatever value you want for each level
                // Remove loading screen and button
                loadingContainer.remove();
                startGame();
            };
            loadingContainer.appendChild(nextLevelBtn);

            document.body.appendChild(loadingContainer);
        }, 0);
    } else if (lvl < 0 && !loadingScreen) {
        // Game Over screen
        // Remove any existing game over containers
        let existingGameOver = document.getElementById('gameOverContainer');
        if (existingGameOver) existingGameOver.remove();
        let existingCharity = document.getElementById('charityWaterBox');
        if (existingCharity) existingCharity.remove();
        let existingRestartBtn = document.getElementById('restartBtn');
        if (existingRestartBtn) existingRestartBtn.remove();

        //Remove time from gameplay
        timerSeconds = 0;

        // Game Over box
        const gameOverDiv = document.createElement('div');
        gameOverDiv.id = 'gameOverContainer';
        gameOverDiv.innerText = 'Game Over';

        // Charity: water box
        const charityDiv = document.createElement('div');
        charityDiv.id = 'charityWaterBox';
        charityDiv.innerHTML = `Be sure to check out charity: water at <a href="https://www.charitywater.org/" target="_blank">charitywater.org</a>`;

        // Restart button
        const restartBtn = document.createElement('button');
        restartBtn.id = 'restartBtn';
        restartBtn.innerText = 'Restart';
        restartBtn.onclick = function () {
            lvl = 1;
            score = 0;
            attempts = 3;
            WATER_BAR_WIDTH = 0;
            villageSpawnAmount = 3;
            village_drain_speed = 3;
            drainSpeed = 1.75;
            refillSpeed = 0.7;
            MaxSeconds = 60;
            timerSeconds = MaxSeconds;
            loadingScreen = false;
            factDisplayed = false;
            // Remove game over and charity boxes
            gameOverDiv.remove();
            charityDiv.remove();
            restartBtn.remove();
            lvlStats();
            startGame();
        };

        document.body.appendChild(gameOverDiv);
        document.body.appendChild(charityDiv);
        document.body.appendChild(restartBtn);
    }
};

function lvlStats() {
    // Only update player properties if player is defined
    if (lvl == 2) {
        drainSpeed = 1.6; //Decreases player bucket size;
        animalSpawnAmount = 3;
    } else if (lvl == 3) {
        villageSpawnAmount = 4; //Add a village
        village_drain_speed = 3.2; //Increase speed villages will drain
    } else if (lvl == 4) {
        if (typeof player !== "undefined") player.speed = 6; //Player Buff (player speed increased)
        village_drain_speed = 3.3; //Increase speed villages will drain
        animalSpawnAmount = 4;
    } else if (lvl == 5) {
        villageSpawnAmount = 5; //Add a village
        if (typeof player !== "undefined") player.speed = 6.5; //Player Buff (player speed increased)
        drainSpeed = 1.7; //Player Nerf (increases bucket size by decreasing drain speed)
    } else if (lvl == 6) {
        if (typeof player !== "undefined") player.speed = 7.5; //Player Buff (player speed increased)
        village_drain_speed = 3; //Decrease speed villages will drain back to initial
    } else if (lvl == 7) {
        villageSpawnAmount = 6; //Add a village
        if (typeof player !== "undefined") player.speed = 8; //Player Buff (player speed increased)
    } else if (lvl > 7) {
        village_drain_speed += 0.1; //Increase speed villages will drain each round
        drainSpeed += 0.01; //Increases players bucket size each round
        if (typeof player !== "undefined") player.speed += 0.05;
        MaxSeconds += 5;
        delayed_animal_spawns++;
        delayed_village_spawns++;

        if (delayed_animal_spawns >= 2) {
            animalSpawnAmount += 1;
            delayed_animal_spawns = 0;
        }
        if (delayed_village_spawns >= 5) {
            villageSpawnAmount += 1;
            delayed_village_spawns = 0;
        }
    }
    console.log("level stats adjusted for day ", lvl);
}


//Initial Start
lvlStats(); //only used for testing -- not required for actual game
startGame();
// alert(
//     'Welcome, Volunteer!\n' +
//     'You\'re part of an important mission with charity: water — bringing clean water to villages in need.\n' +
//     'Your job is to deliver full containers of water to each village safely and efficiently.\n\n' +
//     'Keep an eye out as you travel — if you spot any animals, steer clear! They might be thirsty too, and we need to make sure the water gets to the people who need it most.\n\n' +
//     'Good luck, and thank you for making a difference!'
// );