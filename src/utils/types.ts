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
}

interface ToolsConfig {
  pen?: PenToolConfig
  arrow?: ArrowToolConfig
  textBox?: TextBoxToolConfig
  mosaic?: MosaicToolConfig
}

interface ScreenShotOptions {
  mode?: 'media'
  afterFinished?: () => void
  tools?: ToolsConfig
}

export type { AnyFun, ScreenShotOptions, ToolsConfig };
