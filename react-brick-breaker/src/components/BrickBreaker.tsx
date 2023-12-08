import React, { useState, useEffect, useRef, useCallback } from "react";

const BrickBreaker = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [x, setX] = useState(200); // starting horizontal position of ball
  const [y, setY] = useState(150); // starting vertical position of ball
  const [dx, setDx] = useState(1); // amount ball should move horizontally
  const [dy, setDy] = useState(-3); // amount ball should move vertically

  // variables set in init()
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [width, setWidth] = useState<number | null>(null); // canvas width
  const [height, setHeight] = useState<number | null>(null); // canvas height
  const [paddleX, setPaddleX] = useState<number | null>(null); // paddle position
  const [bricks, setBricks] = useState<boolean[][]>([]); // array representing the state of bricks
  //   const [brickWidth, setBrickWidth] = useState<number | null>(null);

  const paddleH = 10; // paddle height
  const paddleW = 75; // paddle width
  const [canvasMinX, setCanvasMinX] = useState<number>(0); // minimum canvas x bounds
  const [canvasMaxX, setCanvasMaxX] = useState<number>(0); // maximum canvas x bounds
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const nrows = 6; // number of rows of bricks
  const ncols = 6; // number of columns of bricks
  const brickHeight = 15; // height of each brick
  const brickWidth = 75; // width of each brick
  const padding = 1; // spacing between each brick

  const ballRadius = 10; // size of ball (pixels)

  const brickColors = ["#80CBC4", "#455A64 ", "#FFE0B2", "#A5D6A7", "#D43ED8"];
  const paddleColor = "black";
  const ballColor = "black";
  const backColor = "lightgrey";

  const [score, setScore] = useState(0); // store the number of bricks eliminated
  const [paused, setPaused] = useState(false); // keep track of whether the game is paused or not

  // Initialize an array of bricks to be visible (true)
  const initBricks = () => {
    // no update needed
    //   const initBricks = (nrows: number, ncols: number) => {
    const bricks: boolean[][] = [];
    for (let i = 0; i < nrows; i++) {
      const row: boolean[] = [];
      for (let j = 0; j < ncols; j++) {
        row.push(true);
      }
      bricks.push(row);
    }
    return bricks;
  };

  // Used to draw the ball
  const drawCircle = (x: number, y: number, r: number) => {
    // no update needed
    if (ctx) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    }
  };

  // Used to draw each brick & the paddle
  const drawRect = (x: number, y: number, w: number, h: number) => {
    // no update needed
    if (ctx) {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.closePath();
      ctx.fill();
    }
  };

  // Clear the screen in between drawing each animation
  const clearCanvas = () => {
    if (ctx && width && height) {
      ctx.clearRect(0, 0, width, height);
      drawRect(0, 0, width, height);
    }
  };

  const drawBricks = () => {
    for (let i = 0; i < nrows; i++) {
      for (let j = 0; j < ncols; j++) {
        if (ctx) {
          ctx.fillStyle = brickColors[(i + j) % brickColors.length];
        }
        if (bricks[i][j]) {
          drawRect(
            j * (brickWidth + padding) + padding,
            i * (brickHeight + padding) + padding,
            brickWidth,
            brickHeight
          );
        }
      }
    }
  };

  const updateScoreText = () => {
    setScore((prevScore) => prevScore + 1);
  };

  const startAnimation = useCallback(() => {
    console.log("Start Animation");
    const id = window.setInterval(draw, 10);
    setIntervalId(id);
  }, []);
  x;
  const stopAnimation = () => {
    // no update needed
    console.log("Stop animation");
    if (intervalId != null) {
      window.clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  // What to do when the mouse moves within the canvas
  const onMouseMove = (
    evt: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (width && canvasMinX && canvasMaxX) {
      if (evt.pageX > canvasMinX && evt.pageX < canvasMaxX) {
        const newPaddleX = Math.max(evt.pageX - canvasMinX - paddleW / 2, 0);
        setPaddleX(Math.min(width - paddleW, newPaddleX));
      }
    }
  };

  const handleKeyDown = (evt: React.KeyboardEvent) => {
    evt.preventDefault();
    pause();
  };

  const pause = () => {
    // no update needed
    if (paused) {
      startAnimation();
    } else {
      stopAnimation();
    }
    setPaused(!paused);
  };

  const reload = () => {
    setScore(0); // resets score to 0 if reloaded
    // updateScoreText(); // clear the score displayed if reloaded
    setBricks(initBricks()); // initialize the bricks, set all to visible
    setPaused(false); // set paused to false
    setX(200); // starting horizontal position of ball
    setY(150); // starting vertical position of ball
    setDx(1); // amount ball should move horizontally
    setDy(-3); // amount ball should move vertically
    startAnimation(); // start the game animation
  };

  const draw = useCallback(() => {
    console.log("Drawing...");
    console.log("CTX:", ctx);
    console.log("Width:", width);
    console.log("Height:", height);
    console.log("Paddle X:", paddleX);
    console.log("Ball position (x, y):", x, y);
    console.log("Ball speed (dx, dy):", dx, dy);

    if (!ctx || !width || !height || !paddleX) return;
    // Your draw function logic here

    ctx.fillStyle = backColor;
    clearCanvas();
    ctx.fillStyle = ballColor;
    x;
    //draw the ball
    drawCircle(x, y, ballRadius);
    ctx.fillStyle = paddleColor;
    //draw the paddle
    drawRect(paddleX, height - paddleH, paddleW, paddleH);
    drawBricks();

    //check if we have hit a brick
    const rowHeight = brickHeight + padding;
    const colWidth = brickWidth + padding;
    const row = Math.floor(y / rowHeight);
    const col = Math.floor(x / colWidth);
    //if so reverse the ball and mark the brick as broken
    if (y < nrows * rowHeight && row >= 0 && col >= 0 && bricks[row][col]) {
      setDy(-dy);
      setBricks((prevBricks) => {
        const newBricks = [...prevBricks];
        newBricks[row][col] = false;
        return newBricks;
      });
      //   score++; // add a point every time a brick is broken
      updateScoreText(); // show the current score
    }

    //contain the ball by rebouding it off the walls of the canvas
    if (x + dx > width || x + dx < 0) setDx(-dx);

    if (y + dy < 0) {
      setDy(-dy);
    } else if (y + dy > height - paddleH) {
      // check if the ball is hitting the
      // paddle and if it is rebound it
      if (x > paddleX && x < paddleX + paddleW) {
        setDy(-dy);
      }
    }
    if (y + dy > height) {
      //game over, so stop the animation
      stopAnimation();
      //   alert("Game Over! Your score is: " + score);
      document.location.reload();
    }
    setX((prevX) => prevX + dx);
    setY((prevY) => prevY + dy);
  }, [bricks, paddleX]);

  useEffect(() => {
    console.log("useEffect triggered");
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    console.log("Canvas:", canvas);
    console.log("Context:", context);
    console.log("Width:", width);

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      pause();
    };

    if (canvas && context) {
      setCtx(context);
      setWidth(canvas.offsetWidth);
      setHeight(canvas.offsetHeight);
      setPaddleX(canvas.offsetWidth / 2); // updated to use canvas.offsetWidth
      setCanvasMinX(canvas.offsetLeft);
      setCanvasMaxX(canvas.offsetLeft + canvas.offsetWidth);
      setBricks(initBricks());
      draw();
      startAnimation();
    }

    // attach event listener
    document.addEventListener("keydown", handleKeyDown);
    // const animationFrame = requestAnimationFrame(draw);

    return () => {
      //   cancelAnimationFrame(animationFrame);
      document.removeEventListener("keydown", handleKeyDown);
      stopAnimation();
      ``;
    };
  }, [canvasRef.current, draw, startAnimation, stopAnimation]);

  //   }, [width, height, paddleX, startAnimation, handleKeyDown, draw, stopAnimation]);

  return (
    <div>
      <h1>Brick Breaker</h1>
      <canvas
        ref={canvasRef}
        width={width || 500}
        height={height || 300}
        onMouseMove={onMouseMove}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      />
      <p>Mouse moves platform &bull; Press any key to pause</p>
      <button onClick={reload}>Play again</button>
      <div id="score">Score: {score}</div>
    </div>
  );
};

export default BrickBreaker;

// function useCallback(arg0: () => void) {
//     throw new Error("Function not implemented.");
// }
