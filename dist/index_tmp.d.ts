import { CanvasRenderingContext2D, Image } from "canvas";
export interface DrawPngReplaceEmojiParams {
    text: string;
    fillStyle: string;
    font: string;
    x: number;
    y: number;
    emojiW: number;
    emojiH: number;
    length?: number;
    emojiStyle?: string;
}
export declare class CanvasEmoji {
    private canvasCtx;
    constructor(ctx: CanvasRenderingContext2D);
    getEmojiKeys(str: string): string[];
    replaceEmojiToEmojiName(str: string): {
        str: string;
        emojiArr: any;
    };
    findEmojiSrc(emojiName: string): string;
    findEmojiSrcFromKey(key: string): string;
    fun(emojiItem: string, emojiStyle: string): Promise<Image>;
    drawPngReplaceEmoji(data: DrawPngReplaceEmojiParams): {
        x: number;
    };
    drawPngReplaceEmojiWithEmojicdn(data: DrawPngReplaceEmojiParams): Promise<{
        x: number;
    }>;
    private showText;
}
