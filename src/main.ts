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

//await simpleCanvasExample();
//await simplePlayerExample();
await twglControlledExample();