export class AssetManager {
  async prepare(renderer, scene, camera, loading) {
    loading.progress(0.2);
    await document.fonts.ready;
    loading.progress(0.6);
    if (renderer.compileAsync) await renderer.compileAsync(scene, camera);
    else renderer.compile(scene, camera);
    loading.progress(0.95);
    renderer.render(scene, camera);
  }
}
