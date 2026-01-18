// Wird für den sdf file reader benötigt
declare module 'parse-bmfont-ascii' {
  interface BMFont {
    pages: string[];
    chars: any[];
    kernings: any[];
    common: {
      lineHeight: number;
      base: number;
      scaleW: number;
      scaleH: number;
    };
  }

  export default function parseBmfontAscii(input: string): BMFont;
}
