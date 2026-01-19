async function simplePlayerExample() {
  let i = await import('./examples/simple-player/main');
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

// await simplePlayerExample();
await twglUiHtmlExample();
// await twgl3DStressTestExample();