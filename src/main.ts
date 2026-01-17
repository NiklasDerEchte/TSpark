async function simpleCanvasExample() {
  let sparkImport = await import('./examples/simple-canvas/main');
  sparkImport.default.start();
}

async function simplePlayerExample() {
  let sparkImport = await import('./examples/simple-player/main');
  sparkImport.default.start();
}

async function twglControlledExample() {
  let twglImport = await import('./examples/twgl/main');
  twglImport.default.start();
}

async function twglBoxControlledExample() {
  let twglImport = await import('./examples/twgl/main-box');
  twglImport.default.start();
}

async function twglStressTestExample() {
  let twglImport = await import('./examples/twgl/stress-test');
  twglImport.default.start();
}

//await simpleCanvasExample();
//await simplePlayerExample();
//await twglControlledExample();
//await twglBoxControlledExample();
await twglStressTestExample();