document.addEventListener('DOMContentLoaded', (event) => {
    const canvas = document.getElementById('flappyBirdCanvas');
    const context = canvas.getContext('2d');
    const gameOverMenu = document.getElementById('gameOverMenu');
    const finalScore = document.getElementById('finalScore');
    const highScoreDisplay = document.getElementById('highScoreDisplay');
    const restartButton = document.getElementById('restartButton');
    const resetHighScoreButton = document.getElementById('resetHighScoreButton');

    const planeImage = new Image();
    planeImage.src = flappyBirdVars.pluginUrl + 'images/flappyplane0.png'; // Use the plugin URL

    planeImage.onload = function () {
        console.log('Plane image loaded successfully');
        draw();
    };

    planeImage.onerror = function () {
        console.error('Failed to load the plane image. Check the path:', planeImage.src);
    };

    const plane = {
        x: 50,
        y: canvas.height / 2 - 24, // Start in the middle of the screen
        width: 68, // Adjusted width (twice the original size)
        height: 48, // Adjusted height (twice the original size)
        gravity: 0.25, // Adjusted gravity for smoother falling
        lift: -6, // Adjusted lift for smoother jumps
        velocity: 0,
        show() {
            context.drawImage(planeImage, this.x, this.y, this.width, this.height);
        },
        update() {
            this.velocity += this.gravity;
            this.y += this.velocity;
            if (this.y + this.height > canvas.height) { // Adjusted ground height
                gameOver(); // Game over if the plane hits the ground
            }
            if (this.y < 0) {
                this.y = 0;
                this.velocity = 0;
            }
        },
        up() {
            this.velocity = this.lift; // Set the velocity directly to ensure consistent jumps
        },
        getBounds() {
            // Define a more accurate bounding box inside the plane image
            return {
                left: this.x + 10, // Adjust these values based on the plane image
                right: this.x + this.width - 10,
                top: this.y + 5,
                bottom: this.y + this.height - 5
            };
        }
    };

    let pipes = [];
    const pipeWidth = 20;
    let frameCount = 0;
    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0; // Get high score from localStorage
    let animationFrameId; // Track the animation frame ID
    let isGameOver = false; // Track if the game is over

    function draw() {
        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#87CEEB'; // Sky blue background color
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the ground
        context.fillStyle = 'green'; // Green color for the ground
        context.fillRect(0, canvas.height - 20, canvas.width, 20); // 20 pixels high ground

        // Draw and update plane
        plane.show();
        plane.update();

        // Handle pipes
        if (frameCount % 100 === 0) { // Increased the distance between pipes
            const pipeGap = Math.random() * (200 - 150) + 150; // Random gap between 150 and 200
            const pipeHeight = Math.random() * (canvas.height - pipeGap - 20); // Adjusted to consider the ground height
            pipes.push({ x: canvas.width, y: 0, height: pipeHeight, gap: pipeGap, scored: false });
            pipes.push({ x: canvas.width, y: pipeHeight + pipeGap, height: canvas.height - pipeHeight - pipeGap - 20, scored: false }); // Adjusted to consider the ground height
        }

        pipes.forEach((pipe, index) => {
            context.fillStyle = 'green';
            context.fillRect(pipe.x, pipe.y, pipeWidth, pipe.height);
            pipe.x -= 2;

            // Check for collision with the plane
            const planeBounds = plane.getBounds();
            if (planeBounds.right > pipe.x && planeBounds.left < pipe.x + pipeWidth) {
                if (index % 2 === 0) {
                    if (planeBounds.top < pipe.height - 10) {
                        gameOver();
                        return;
                    }
                } else {
                    if (planeBounds.bottom > pipe.y + 20) {
                        gameOver();
                        return;
                    }
                }
            }

            // Increment score when the plane passes the first pipe of the pair
            if (!pipe.scored && pipe.x + pipeWidth < plane.x) {
                if (index % 2 === 0) { // Score only on the first pipe of each pair
                    score++;
                }
                pipe.scored = true;
            }
        });

        // Remove off-screen pipes
        pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);

        // Update high score
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }

        // Display score
        context.fillStyle = 'black';
        context.font = '16px Arial';
        context.fillText(`High Score: ${highScore}`, 10, 20); // High score
        context.fillText(`Score: ${score}`, 10, 40); // Current score

        frameCount++;
        if (!isGameOver) {
            animationFrameId = requestAnimationFrame(draw);
        }
    }

    function gameOver() {
        isGameOver = true; // Set game over flag
        cancelAnimationFrame(animationFrameId);

        // Display the game over menu
        finalScore.textContent = `Score: ${score}`;
        highScoreDisplay.textContent = `High Score: ${highScore}`;
        gameOverMenu.style.display = 'flex';
    }

    function resetGame() {
        isGameOver = false; // Reset game over flag
        plane.y = canvas.height / 2 - 24; // Reset plane to middle of the screen
        plane.velocity = 0;
        pipes = [];
        score = 0;
        frameCount = 0;
        gameOverMenu.style.display = 'none';
        draw();
    }

    function resetHighScore() {
        highScore = 0;
        localStorage.setItem('highScore', highScore);
        drawHighScore();
    }

    function drawHighScore() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'black';
        context.font = '16px Arial';
        context.fillText(`High Score: ${highScore}`, 10, 20); // Update displayed high score
        context.fillText(`Score: ${score}`, 10, 40); // Update displayed score
    }

    restartButton.addEventListener('click', resetGame);

    resetHighScoreButton.addEventListener('click', resetHighScore);

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            event.preventDefault(); // Prevent the default action of scrolling the page
            if (!isGameOver) {
                plane.up();
            } else {
                resetGame(); // Restart the game on spacebar press if it is over
            }
        }
    });

    // Add touch event support
    canvas.addEventListener('touchstart', (event) => {
        event.preventDefault();
        if (!isGameOver) {
            plane.up();
        } else {
            resetGame(); // Restart the game on touch if it is over
        }
    });
});
