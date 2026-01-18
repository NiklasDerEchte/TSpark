async function simpleCanvasExample() {
  let sparkImport = await import('./examples/simple-canvas/main');
  await sparkImport.default.start();
}

async function simplePlayerExample() {
  let sparkImport = await import('./examples/simple-player/main');
  await sparkImport.default.start();
}

async function twglControlledExample() {
  let twglImport = await import('./examples/twgl/main');
  await twglImport.default.start();
}

async function twglBoxControlledExample() {
  let twglImport = await import('./examples/twgl/main-box');
  await twglImport.default.start();
}

async function twglStressTestExample() {
  let twglImport = await import('./examples/twgl/stress-test');
  await twglImport.default.start();
}

async function twglUiHtmlTestExample() {
  let twglImport = await import('./examples/twgl/ui/html/main');
  await twglImport.default.start();
}

//await simpleCanvasExample();
//await simplePlayerExample();
//await twglControlledExample();
//await twglBoxControlledExample();
//await twglStressTestExample();
await twglUiHtmlTestExample();