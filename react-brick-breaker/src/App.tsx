// import React from 'react';
// import BrickBreaker from "./components/BrickBreaker";
import BrickBreaker from "./components/BrickBreakerGame";


const App = () => {
  
  return (
    <div className="App">
      {/* <canvas id="canvas" width={width} height={height}></canvas> */}
      <BrickBreaker />
      {/* <p>Mouse moves platform &bull; Press any key to pause</p>
      <button onClick={reload}>Play again</button>
      <div id="score"></div> */}
    </div>
  );
}

export default App;
