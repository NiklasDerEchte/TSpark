import '@luma.gl/webgl';
async function simpleCanvasExample() {
  let sparkImport = await import('./examples/simple-canvas/main');
  sparkImport.default.start();
}

async function simplePlayerExample() {
  let sparkImport = await import('./examples/simple-player/main');
  sparkImport.default.start();
}

async function lumaControlledExample() {
  let sparkImport = await import('./examples/luma-controlled/main');
  sparkImport.default.start();
}


//await simpleCanvasExample();
//await simplePlayerExample();
await lumaControlledExample();