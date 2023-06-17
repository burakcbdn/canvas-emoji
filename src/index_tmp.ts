import { CanvasRenderingContext2D, Image, loadImage } from "canvas";
// @ts-ignore
import * as emoji from "node-emoji";
import * as fs from "fs";
import * as path from "path";
import emojis from "./icon_data";

const twemoji = require("twemoji");

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

export class CanvasEmoji {
    private canvasCtx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.canvasCtx = ctx;
    }

    /**
     * 获取字符串中所有的emoji表情的名称
     * @param str
     */
    getEmojiKeys(str: string) {
        const emojiArr: string[] = [];
        emoji.replace(str, (item: any) => {
            emojiArr.push(`${item.key}`);
        });
        return emojiArr;
    }

    /**
     * 替换全部的表情变为名称并用
     * @param str
     */
    replaceEmojiToEmojiName(str: string) {
        const emojiArr: any = [];
        str = emoji.replace(str, (item: any) => {
            emojiArr.push(`{${item.key}}`);
            return `{${item.key}}`;
        });
        return {
            str,
            emojiArr,
        };
    }

    findEmojiSrc(emojiName: string) {
        // replace all _ with - on emoji name

        const emojiNameNew = emojiName.replace(/_/g, "-");

        console.log("emojiNameNew", emojiNameNew);

        const srcData = emojis.find((item: any) => {
            if (item.href === emojiName.replace(/_/g, "-")) {
                return true;
            }
        });

        if (srcData) {
            return srcData.src;
        }
    }
    findEmojiSrcFromKey(key: string) {
        // replace all _ with - on emoji name

        const srcData = emojis.find((item: any) => {
            if (item.key === key) {
                return true;
            }
        });

        if (srcData) {
            return srcData.src;
        }
    }

    async fun(emojiItem: string, emojiStyle: string) {
        const emojiName = emojiItem.replace("{", "").replace("}", "");

        // replace all _ with -

        const emojiID = emojiItem
            .replace("{", "")
            .replace("}", "")
            .replace(/_/g, "-");

        let emojiSrc = `https://emojicdn.elk.sh/${emojiID}?style=${emojiStyle}`;

        const url = encodeURI(emojiSrc);

        console.log("url", url);

        const image = await loadImage(url);

        image.onload = () => {
            console.log("image loaded");
        };
        return image;
    }

    /**
     *
     * @param data
     */
    drawPngReplaceEmoji(data: DrawPngReplaceEmojiParams) {
        const { canvasCtx } = this;
        const { fillStyle, font, y, emojiW, emojiH } = data;
        let { text, x, length } = data;
        canvasCtx.fillStyle = fillStyle;
        canvasCtx.font = font;
        const emojiArr: string[] = [];
        text = emoji.replace(text, (item: any) => {
            emojiArr.push(`{${item.key}}`);
            return `{${item.key}}`;
        });
        let ctxText;
        let i = 0;
        const emojiMap = new Map();
        for (const emojiItem of emojiArr) {
            const index = text.indexOf(emojiItem);
            if (
                length !== -1 &&
                length - text.substring(0, index).length <= 0
            ) {
                canvasCtx.fillText(`${text.substring(0, length)}...`, x, y);
                ctxText = this.canvasCtx.measureText(
                    `${text.substring(0, length)}...`
                );
                x += ctxText.width;
                break;
            }
            canvasCtx.fillText(text.substring(0, index), x, y);
            ctxText = canvasCtx.measureText(text.substring(0, index));
            x += ctxText.width;
            const emojiImg = new Image();
            const emojiName = emojiItem.replace("{", "").replace("}", "");
            let src = emojiMap.get(emojiName);
            if (!src) {
                src = fs.readFileSync(
                    path.join(__dirname, `../emoji_pngs/${emojiName}.png`)
                );
                emojiMap.set(emojiName, src);
            }
            emojiImg.src = src;
            canvasCtx.drawImage(
                emojiImg,
                x,
                y - (5 / 6) * emojiH,
                emojiW,
                emojiH
            );
            x += emojiW;
            text = text.substr(index + emojiItem.length);
            i++;
            if (i === emojiArr.length) {
                canvasCtx.fillText(text, x, y);
                ctxText = canvasCtx.measureText(text);
                x += ctxText.width;
            }
            if (length !== -1) {
                length -= text.substring(0, index).length + 1;
                if (length === 0) {
                    canvasCtx.fillText("...", x, y);
                    ctxText = canvasCtx.measureText("...");
                    x += ctxText.width;
                    break;
                }
            }
        }
        if (emojiArr.length === 0) {
            if (length) {
                text = this.showText(text, length);
            }
            canvasCtx.fillText(text, x, y);
            const ctxText = canvasCtx.measureText(text);
            x += ctxText.width;
        }
        return { x };
    }

    async drawPngReplaceEmojiWithEmojicdn(data: DrawPngReplaceEmojiParams) {
        const {
            fillStyle,
            font,
            y,
            emojiW,
            emojiH,
            emojiStyle = "google",
        } = data;
        const { canvasCtx } = this;
        canvasCtx.fillStyle = fillStyle;
        canvasCtx.font = font;
        let { text, x, length } = data;
        const emojiArr: string[] = [];
        const emojiData: any = {};
        text = emoji.replace(text, (item: any) => {
            emojiData[item.key] = twemoji.convert.toCodePoint(item.emoji);

            emojiArr.push(`{${item.key}}`);
            return `{${item.key}}`;
        });
        const loadImages = [];
        const emojiSet = new Set();
        const emojiMap = new Map();

        for (const emojiItem of emojiArr) {
            if (emojiSet.has(emojiItem)) {
                continue;
            }
            emojiSet.add(emojiItem);
            //await fun(emojiItem)
        }

        for (let i = 0; i < emojiArr.length; i++) {
            const emojiItem = emojiArr[i];
            console.log("emojiItem", emojiItem);
            const index = text.indexOf(emojiItem);
            if (
                length !== -1 &&
                length - text.substring(0, index).length <= 0
            ) {
                canvasCtx.fillText(`${text.substring(0, length)}...`, x, y);
                x += canvasCtx.measureText(
                    `${text.substring(0, length)}...`
                ).width;
                break;
            }
            canvasCtx.fillText(text.substring(0, index), x, y);
            const ctxText = canvasCtx.measureText(text.substring(0, index));
            x += ctxText.width;

            const emojiID = emojiItem
            .replace("{", "")
            .replace("}", "")
            .replace(/_/g, "-");

            let emojiSrc = `https://emojicdn.elk.sh/${emojiID}?style=${emojiStyle}`;

            console.log("emojiSrc: ", emojiSrc);

            let emojiImg: Image = await loadImage(encodeURI(emojiSrc));

            emojiImg.src = emojiSrc;

            console.log("Complete: ", emojiImg.complete);
            console.log("src: ", emojiImg.src);
            console.log("width: ", emojiImg.width);
            console.log("height: ", emojiImg.height);
            console.log("naturalWidth: ", emojiImg.naturalWidth);
            console.log("naturalHeight: ", emojiImg.naturalHeight);
            console.log(emojiImg.dataMode);

            console.log("X: ", x, "Y: ", y, "emojiW: ", emojiW, "emojiH: ", emojiH);
            
    

            canvasCtx.drawImage(
                emojiImg ,
                x,
                y - (5 / 6) * emojiH,
                emojiW,
                emojiH
            );
            x += emojiW;

            text = text.substring(index + emojiItem.length);

            if (i === emojiArr.length - 1) {
                canvasCtx.fillText(text, x, y);
                x += canvasCtx.measureText(text).width;
            }

            if (length !== -1) {
                length -= text.substring(0, index).length + 1;
                if (length === 0) {
                    canvasCtx.fillText("...", x, y);
                    x += canvasCtx.measureText("...").width;
                    break;
                }
            }
        }
        if (emojiArr.length === 0) {
            if (length) {
                text = this.showText(text, length);
            }
            canvasCtx.fillText(text, x, y);
            const ctxText = canvasCtx.measureText(text);
            x += ctxText.width;
        }
        return { x };
    }

    private showText(text: string, length: number = 10) {
        if (text.length > length) {
            return text.slice(0, length) + "...";
        } else {
            return text;
        }
    }
}
