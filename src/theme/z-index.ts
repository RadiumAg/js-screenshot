/**
 * Centralized z-index scale.
 * Lower number = further back, higher number = closer to front.
 */
export const Z_INDEX = {
  sourceCanvas: -1,
  toolbar: 100,
  colorPicker: 200,
  textBox: 300,
  cutoutBox: 500,
  optionsPanel: 600,
  tooltip: 700,
  popup: 800,
  dotController: 800,
  loading: 900,
  shapeEditor: 1000,
} as const;
