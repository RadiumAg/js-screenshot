import { canvasElement, sourceCanvasElement } from '../Canvas';

class CutoutBox {
  constructor(
    private context = canvasElement.getContext('2d'),
    private sourceContext = sourceCanvasElement.getContext('2d'),
  ) {}

  private x = 0;
  private y = 0;
  private width = 0;
  private height = 0;

  initCutoutBox() {
    if (this.context === null || this.sourceContext === null) return;

    this.context.fillStyle = 'rgba(0,0,0,0.5)';
    this.context.fillRect(0, 0, canvasElement.width, canvasElement.height);

    this.context.globalCompositeOperation = 'destination-over';
    const imgData = this.sourceContext.getImageData(0, 0, 100, 100);

    this.context.putImageData(imgData, 0, 0);
  }
}

export default CutoutBox;
