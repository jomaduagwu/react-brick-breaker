import React, { useState, useEffect, useRef } from "react";

const BrickBreaker = () => {
  //   const canvasRef = useRef<HTMLCanvasElement>(null);
  //   const [width, setWidth] = useState<number>(0);
  //   const [height, setHeight] = useState<number>(0);
  //   const [paddleX, setPaddleX] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [x, setX] = useState(200);
  const [y, setY] = useState(150);
  const [dx, setDx] = useState(1);
  const [dy, setDy] = useState(-3);

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [paddleX, setPaddleX] = useState<number>(0);
  const [bricks, setBricks] = useState<boolean[][]>([]);
  //   const [brickWidth, setBrickWidth] = useState<number>(0);
  const paddleH = 10;
  const paddleW = 75;
  const [canvasMinX, setCanvasMinX] = useState<number>(0);
  const [canvasMaxX, setCanvasMaxX] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const nrows = 6;
  const ncols = 6;
  const brickHeight = 15;
  const brickWidth = 75; // or 70
  const padding = 1;

  const ballRadius = 10;

  const brickColors = ["#80CBC4", "#455A64 ", "#FFE0B2", "#A5D6A7", "#D43ED8"];
//   const brickColors = ["grey", "red", "purple", "orange"];
  const paddleColor = "black";
  const ballColor = "black";
  const backColor = "lightgrey";

  const [score, setScore] = useState(0); // store the number of bricks eliminated
  const [paused, setPaused] = useState(false);

  // Initialize an array of bricks to be visible (true)
  const initBricks = () => {
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

  // Clear the screen in between drawing each animation
  const clearCanvas = () => {
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      drawRect(0, 0, width, height);
    }
    //   const clearCanvas = (
    //     context: CanvasRenderingContext2D,
    //     width: number,
    //     height: number,
    //   ) => {
    // context.clearRect(0, 0, width, height);
    // drawRect(context, 0, 0, width, height);
  };

  // Used to draw the ball
  const drawCircle = (x: number, y: number, r: number) => {
    if (ctx) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    }
  };

  // Used to draw each brick & the paddle
  const drawRect = (x: number, y: number, w: number, h: number) => {
    if (ctx) {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.closePath();
      ctx.fill();
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
            brickHeight,
          );
        }
      }
    }
  };

  const updateScoreText = () => {
    setScore((prevScore) => prevScore + 1);
  };

  const startAnimation = () => {
    const id = window.setInterval(draw, 10);
    setIntervalId(id);
  };

  const stopAnimation = () => {
    if (intervalId != null) {
      window.clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  // What to do when the mouse moves within the canvas
  const onMouseMove = (
    evt: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
  ) => {
    if (evt.pageX > canvasMinX && evt.pageX < canvasMaxX) {
      const newPaddleX = Math.max(evt.pageX - canvasMinX - paddleW / 2, 0);
      setPaddleX(Math.min(width - paddleW, newPaddleX));
      //   return Math.min(width - paddleW, newPaddleX);
    }
    // return paddleX;
  };

  const handleKeyDown = (evt: React.KeyboardEvent) => {
    evt.preventDefault();
    pause();
  };

  const pause = () => {
    if (paused) {
      startAnimation();
    } else {
      stopAnimation();
    }
    setPaused(!paused);
  };

  const reload = () => {
    setScore(0); // resets score to 0 if reloaded
    updateScoreText(); // clear the score displayed if reloaded
    setBricks(initBricks()); // initialize the bricks, set all to visible
    setPaused(false);
    setX(200); // starting horizontal position of ball
    setY(150); // starting vertical position of ball
    setDx(1); // amount ball should move horizontally
    setDy(-3); // amount ball should move vertically
    startAnimation(); // start the game animation
  };

  const draw = () => {
    if (!ctx) return;
    // Your draw function logic here

    ctx.fillStyle = backColor;
    clearCanvas();
    ctx.fillStyle = ballColor;
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
    }
    setX((prevX) => prevX + dx);
    setY((prevY) => prevY + dy);
  };

//   const handleKeyDown = (evt: KeyboardEvent) => {
//     if (evt.key === " ") {
//         pause();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//   }

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    const handleKeyDown = (evt: KeyboardEvent) => {
        if (evt.key === " ") {
            pause();
        }
        
    }

    if (canvas && context) {
      setCtx(context);
      setWidth(canvas.offsetWidth);
      setHeight(canvas.offsetHeight);
    //   setWidth(canvas.width);
    //   setHeight(canvas.height);
      setPaddleX(width / 2);
      setCanvasMinX(canvas.offsetLeft);
      setCanvasMaxX(canvas.offsetLeft + width);
      // Initialize other state variables and start the animation
      setBricks(initBricks());
      startAnimation();
    }

    // const handleKeyDown = (evt: KeyboardEvent) => {
    //     if (evt.key === " ") {
    //         pause();
    //     };
    //     window.addEventListener("keydown", handleKeyDown);
    // }
    })

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      stopAnimation();
    };
    //   }, [canvasRef, ncols]);
  }, [canvas, width, height, handleKeyDown, stopAnimation]);

//   const reload = () => {}

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={500}
        height={300}
        onMouseMove={onMouseMove}
        onKeyDown={onKeyDown}
      />
      <p>Mouse moves platform &bull; Press any key to pause</p>
      <button onClick={reload}>Play again</button>
      <div id="score">Score: {score}</div>
    </div>
  );


export default BrickBreaker;
