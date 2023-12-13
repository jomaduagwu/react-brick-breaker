import { useEffect, useRef, useState } from "react";

const BrickBreaker: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // state of ball - position, speed and radius
  const ballRef = useRef({ x: 200, y: 150, dx: 1, dy: -3, radius: 10 });

  // variables set in init()
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [width, setWidth] = useState<number | null>(null); // canvas width
  const [height, setHeight] = useState<number | null>(null); // canvas height
  const [paddleX, setPaddleX] = useState<number | null>(null); // paddle position
  const [bricks, setBricks] = useState<boolean[][]>([]); // array representing the state of bricks
  //   const [brickWidth, setBrickWidth] = useState<number | null>(null);

  const paddleH = 10; // paddle height
  const paddleW = 75; // paddle width
  const nrows = 6; // number of rows of bricks
  const ncols = 6; // number of columns of bricks
  const brickHeight = 15; // height of each brick
  const brickWidth = 75; // width of each brick
  const padding = 1; // spacing between each brick

  const [canvasMinX, setCanvasMinX] = useState<number>(0); // minimum canvas x bounds
  const [canvasMaxX, setCanvasMaxX] = useState<number>(0); // maximum canvas x bounds
  const [intervalId, setIntervalId] = useState<number | null>(null);

  const [score, setScore] = useState(0); // store the number of bricks eliminated
  const [paused, setPaused] = useState(false); // keep track of whether the game is paused or not
  const [gameReloaded, setGameReloaded] = useState(false); // added to take care of game reload

  const brickColors = ["#80CBC4", "#455A64 ", "#FFE0B2", "#A5D6A7", "#D43ED8"];
  const paddleColor = "black";
  const ballColor = "black";
  const backColor = "grey";

  // setup canvas and mousemove event listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    setCtx(context);
    setWidth(canvas.width); // changed back to width to fix canvas size
    setHeight(canvas.height);
    setPaddleX(canvas.width / 2);
    setCanvasMinX(canvas.getBoundingClientRect().left);
    setCanvasMaxX(canvas.getBoundingClientRect().right);

    const bricks = initBricks();
    setBricks(bricks);

    const handleMouseMove = (evt: MouseEvent) => {
        const mouseX = evt.clientX - canvas.getBoundingClientRect().left;
        setPaddleX(mouseX - paddleW / 2);
        };
        canvas.addEventListener("mousemove", handleMouseMove);

        return () => {
            canvas.removeEventListener("mousemove", handleMouseMove);
        };

  }, [paddleW]);

  const draw = () => {
    if (paused || !ctx || !canvasRef.current) return;
    drawBackground();    
    ctx.fillStyle = ballColor;
    // draw the ball
    drawCircle(ballRef.current.x, ballRef.current.y, ballRef.current.radius);
    ctx.fillStyle = paddleColor;
    // draw the paddle
    drawRect(paddleX, canvasRef.current.height - paddleH, paddleW, paddleH);

    // update ball positionx
    ballRef.current.x += ballRef.current.dx;
    ballRef.current.y += ballRef.current.dy;

    drawBricks();

    handleBrickCollision();

    handleWallCollision();

    if (!gameReloaded) {
      requestAnimationFrame(draw);
    }
  };

  const drawBackground = () => {
    if (ctx) {
        ctx.fillStyle = backColor;
        ctx.fillRect(0, 0, canvasRef.current?.width, canvasRef.current.height);
    }
};


  const drawRect = (x: number, y: number, width: number, height: number) => {
    if (ctx) {
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.closePath();
      ctx.fill();
    }
  };

  const drawCircle = (x: number, y: number, radius: number) => {
    if (ctx) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    }
  };

  const handleBrickCollision = () => {
    const rowHeight = brickHeight + padding;
    const colWidth = brickWidth + padding;
    const row = Math.floor(ballRef.current.y / rowHeight);
    const col = Math.floor(ballRef.current.x / colWidth);
    //if so reverse the ball and mark the brick as broken
    if (
      ballRef.current.y < nrows * rowHeight &&
      row >= 0 &&
      col >= 0 &&
      bricks[row][col]
    ) {
      ballRef.current.dy = -ballRef.current.dy;
      bricks[row][col] = false;
      setScore((prevScore) => prevScore + 1); // add a point every time a brick is broken
    }
  };

  const handleWallCollision = () => {
    //contain the ball by rebounding it off the walls of the canvas
    if (!width || !height || !paddleX || !ballRef.current) {
      // added null checks
      return;
    }

    if (
      ballRef.current.x + ballRef.current.dx > width ||
      ballRef.current.x + ballRef.current.dx < 0
    ) {
      ballRef.current.dx = -ballRef.current.dx;
    }

    if (ballRef.current.y + ballRef.current.dy < 0) {
      ballRef.current.dy = -ballRef.current.dy;
    } else if (ballRef.current.y + ballRef.current.dy > height - paddleH) {
      // check if the ball is hitting the paddle and if it is rebound it
      if (
        ballRef.current.x > paddleX &&
        ballRef.current.x < paddleX + paddleW
      ) {
        ballRef.current.dy = -ballRef.current.dy;
      }
    }
    
    if (ballRef.current.y + ballRef.current.dy > height) {
      //game over, so stop the animation
      stopAnimation();
    }
  };

  // game animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ctx) return;


    const id = requestAnimationFrame(draw);
    setIntervalId(id);

    return () => stopAnimation();
  }, [ctx, paused, paddleX, gameReloaded]);


  // draw bricks
  const drawBricks = () => {
    for (let i = 0; i < nrows; i++) {
      for (let j = 0; j < ncols; j++) {
        // calculate brick position
        const brickX = j * (brickWidth + padding) + padding;
        const brickY = i * (brickHeight + padding) + padding;

        // set the colors to alternate through all colors in brick colors array
        if (ctx) {
          ctx.fillStyle = brickColors[(i + j) % brickColors.length];
        }
        if (bricks[i][j]) {
          drawRect(brickX, brickY, brickWidth, brickHeight);
        }
      }
    }
  };

  const startAnimation = () => {
    const id = window.requestAnimationFrame(draw);
    setIntervalId(id);
  };

  const stopAnimation = () => {
    if (intervalId) {
      window.cancelAnimationFrame(intervalId);
      setIntervalId(null);
    }
  };

  // Initialize array of bricks to be visible (true)
  const initBricks = (): boolean[][] => {
    const bricksArray: boolean[][] = new Array(nrows);

    for (let i = 0; i < nrows; i++) {
      // for each row of bricks
      bricksArray[i] = new Array(ncols);
      for (let j = 0; j < ncols; j++) {
        bricksArray[i][j] = true;
      }
    }
    return bricksArray;
  };

  const clear = () => {
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
    }
  };

  const reload = () => {
    stopAnimation(); // stop the existing animation before reloading
    ballRef.current = { x: 200, y: 150, dx: 1, dy: -3, radius: 10 }; // reset the ball position
    setScore(0); // set score to 0
    setPaused(false); // set paused to false
    setBricks(initBricks()); // initialize the bricks, set all to visible
    setGameReloaded(true); // reset the gameReloaded flag

  };
  useEffect(() => {
    if (gameReloaded) {
        startAnimation();
        setGameReloaded(false); // reset the gameReloaded flag
    }
  }, [gameReloaded]);

  const updateScoreText = () => {
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
      scoreElement.textContent = `Score: ${score}`;
    }
  };

  useEffect(() => {
    const handleKeyDown = (evt: KeyboardEvent) => {
      if (evt.key === " ") {
        evt.preventDefault();
        setPaused((prevPaused) => !prevPaused);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [paused]);

  return (
    <div>
      <h1>Brick Breaker</h1>
      <canvas ref={canvasRef} width="500" height="300"></canvas>
      <p>Mouse moves platform &bull; Press any key to pause</p>
      <button onClick={reload}>Play again</button>
      <div id="score">Score: {score} </div>
    </div>
  );
};

export default BrickBreaker;
