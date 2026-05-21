type AnyFun = (...args: any[]) => any;

interface ToolConfig {
  color?: string
  size?: number
}

interface PenToolConfig extends ToolConfig {
  lineWidth?: number
}

interface ArrowToolConfig extends ToolConfig {
  lineWidth?: number
  arrowSize?: number
  lineType?: 'arrow' | 'line'
}

interface TextBoxToolConfig extends ToolConfig {
  fontSize?: number
  fontFamily?: string
}

interface MosaicToolConfig extends ToolConfig {
  blockSize?: number
  brushSize?: number
}

interface RectToolConfig extends ToolConfig {
  lineWidth?: number
}

interface EllipseToolConfig extends ToolConfig {
  lineWidth?: number
}

interface LineToolConfig extends ToolConfig {
  lineWidth?: number
}

type ExportFormat = 'image/png' | 'image/jpeg' | 'image/webp';

interface ToolsConfig {
  pen?: PenToolConfig
  arrow?: ArrowToolConfig
  textBox?: TextBoxToolConfig
  mosaic?: MosaicToolConfig
  rect?: RectToolConfig
  ellipse?: EllipseToolConfig
  line?: LineToolConfig
}

type ScreenShotTheme = 'dark' | 'light' | 'auto';

interface ScreenShotOptions {
  /** 截图模式：snapdom（默认，DOM 截图）| media（屏幕录制）| htmlInCanvas（Chrome 148+） */
  mode?: 'snapdom' | 'media' | 'htmlInCanvas'
  theme?: ScreenShotTheme
  afterFinished?: () => void
  tools?: ToolsConfig
  exportFormat?: ExportFormat
  quality?: number
  filename?: string
}

export type { AnyFun, EllipseToolConfig, ExportFormat, LineToolConfig, RectToolConfig, ScreenShotOptions, ScreenShotTheme, ToolsConfig };
