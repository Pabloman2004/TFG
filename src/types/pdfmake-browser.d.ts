// @linked docs/informes-y-exportacion.md
// Si cambias los tipos de pdfmake (PdfDocDefinition, PdfContent, PdfFontSpec), actualiza el doc enlazado.
type Margins = number | [number, number] | [number, number, number, number];

interface PdfContent {
  text?: string;
  style?: string;
  margin?: Margins;
  ul?: string[];
  table?: {
    widths?: (string | number)[];
    headerRows?: number;
    body: unknown[][];
  };
  columns?: unknown[];
  stack?: unknown[];
  canvas?: unknown[];
  image?: string;
  width?: number | string;
  height?: number;
  layout?: string;
  bold?: boolean;
  fontSize?: number;
  color?: string;
  fillColor?: string;
  alignment?: 'left' | 'center' | 'right';
  italics?: boolean;
  columnGap?: number;
  colSpan?: number;
  fontFeatures?: Record<string, boolean>;
}

type PdfFontSpec = { normal: string; bold?: string; italics?: string; bolditalics?: string };

interface PdfDocDefinition {
  content: unknown[];
  pageMargins?: Margins;
  styles?: Record<string, Partial<PdfContent>>;
  defaultStyle?: Partial<PdfContent> & { font?: string };
  footer?: (currentPage: number, pageCount: number) => unknown;
}

declare module 'pdfmake/build/pdfmake' {
  interface PdfMakeBrowser {
    vfs: Record<string, string>;
    fonts: Record<string, PdfFontSpec>;
    createPdf(
      docDefinition: PdfDocDefinition,
      tableLayouts?: unknown,
      fonts?: Record<string, PdfFontSpec>,
    ): { download(fileName?: string): void };
  }
  const pdfMake: PdfMakeBrowser;
  export default pdfMake;
}

declare module 'pdfmake/build/vfs_fonts' {
  export const vfs: Record<string, string>;
}
