declare module "excalidraw-to-svg" {
  interface ExcalidrawData {
    type: string;
    version: number;
    elements: any[];
    appState?: any;
    files?: any;
  }

  function excalidrawToSvg(data: ExcalidrawData): Promise<SVGSVGElement>;

  export default excalidrawToSvg;
}
