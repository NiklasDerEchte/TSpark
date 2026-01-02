async function simpleCanvasExample() {
  let sparkImport = await import('./examples/simple-canvas/main');
  sparkImport.default.start();
}

async function simplePlayerExample() {
  let sparkImport = await import('./examples/simple-player/main');
  sparkImport.default.start();
}

async function muglControlledExample() {
  let muglImport = await import('./examples/mugl/main');
  muglImport.default.start();
}

//await simpleCanvasExample();
//await simplePlayerExample();
await muglControlledExample();