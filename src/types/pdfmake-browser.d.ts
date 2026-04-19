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
  layout?: string;
  bold?: boolean;
  fontSize?: number;
  color?: string;
  fillColor?: string;
}

interface PdfDocDefinition {
  content: unknown[];
  pageMargins?: Margins;
  styles?: Record<string, Partial<PdfContent>>;
}

declare module 'pdfmake/build/pdfmake' {
  interface PdfMakeBrowser {
    vfs: Record<string, string>;
    createPdf(docDefinition: PdfDocDefinition): { download(fileName?: string): void };
  }
  const pdfMake: PdfMakeBrowser;
  export default pdfMake;
}

declare module 'pdfmake/build/vfs_fonts' {
  export const vfs: Record<string, string>;
}
