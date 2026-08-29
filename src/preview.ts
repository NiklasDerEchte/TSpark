async function simplePlayerExample() {
  let i = await import('./examples/simple-player/main');
  await i.default.start();
}

async function editorRendererExample() {
  let i = await import('./examples/editor-world/main');
  await i.default.start();
}

async function twglUiHtmlExample() {
  let i = await import('./examples/twgl/ui/html/main');
  await i.default.start();
}

async function twgl3DStressTestExample() {
  let i = await import('./examples/twgl/3d/stress-test');
  await i.default.start();
}

async function powderSimulationExample() {
  let i = await import('./examples/powder-simulation/main');
  await i.default.start();
}

async function powderPlayerExample() {
  let i = await import('./examples/powder-player/main');
  await i.default.start();
}
//await editorRendererExample();
await powderPlayerExample();
// await powderSimulationExample();
// await simplePlayerExample();
// await twglUiHtmlExample();
// await twgl3DStressTestExample();