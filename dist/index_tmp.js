"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasEmoji = void 0;
const canvas_1 = require("canvas");
const emoji = require("node-emoji");
const fs = require("fs");
const path = require("path");
const icon_data_1 = require("./icon_data");
const twemoji = require("twemoji");
class CanvasEmoji {
    constructor(ctx) {
        this.canvasCtx = ctx;
    }
    getEmojiKeys(str) {
        const emojiArr = [];
        emoji.replace(str, (item) => {
            emojiArr.push(`${item.key}`);
        });
        return emojiArr;
    }
    replaceEmojiToEmojiName(str) {
        const emojiArr = [];
        str = emoji.replace(str, (item) => {
            emojiArr.push(`{${item.key}}`);
            return `{${item.key}}`;
        });
        return {
            str,
            emojiArr,
        };
    }
    findEmojiSrc(emojiName) {
        const emojiNameNew = emojiName.replace(/_/g, "-");
        console.log("emojiNameNew", emojiNameNew);
        const srcData = icon_data_1.default.find((item) => {
            if (item.href === emojiName.replace(/_/g, "-")) {
                return true;
            }
        });
        if (srcData) {
            return srcData.src;
        }
    }
    findEmojiSrcFromKey(key) {
        const srcData = icon_data_1.default.find((item) => {
            if (item.key === key) {
                return true;
            }
        });
        if (srcData) {
            return srcData.src;
        }
    }
    async fun(emojiItem, emojiStyle) {
        const emojiName = emojiItem.replace("{", "").replace("}", "");
        const emojiID = emojiItem
            .replace("{", "")
            .replace("}", "")
            .replace(/_/g, "-");
        let emojiSrc = `https://emojicdn.elk.sh/${emojiID}?style=${emojiStyle}`;
        const key = twemoji.convert.toCodePoint(emojiName);
        console.log("key", key);
        if (key) {
            const src = this.findEmojiSrcFromKey(key);
            console.log("src", src);
            if (src) {
                emojiSrc = src;
            }
        }
        const url = encodeURI(emojiSrc);
        console.log("url", url);
        const image = await (0, canvas_1.loadImage)(url);
        image.onload = () => {
            console.log("image loaded");
        };
        return image;
    }
    drawPngReplaceEmoji(data) {
        const { canvasCtx } = this;
        const { fillStyle, font, y, emojiW, emojiH } = data;
        let { text, x, length } = data;
        canvasCtx.fillStyle = fillStyle;
        canvasCtx.font = font;
        const emojiArr = [];
        text = emoji.replace(text, (item) => {
            emojiArr.push(`{${item.key}}`);
            return `{${item.key}}`;
        });
        let ctxText;
        let i = 0;
        const emojiMap = new Map();
        for (const emojiItem of emojiArr) {
            const index = text.indexOf(emojiItem);
            if (length !== -1 &&
                length - text.substring(0, index).length <= 0) {
                canvasCtx.fillText(`${text.substring(0, length)}...`, x, y);
                ctxText = this.canvasCtx.measureText(`${text.substring(0, length)}...`);
                x += ctxText.width;
                break;
            }
            canvasCtx.fillText(text.substring(0, index), x, y);
            ctxText = canvasCtx.measureText(text.substring(0, index));
            x += ctxText.width;
            const emojiImg = new canvas_1.Image();
            const emojiName = emojiItem.replace("{", "").replace("}", "");
            let src = emojiMap.get(emojiName);
            if (!src) {
                src = fs.readFileSync(path.join(__dirname, `../emoji_pngs/${emojiName}.png`));
                emojiMap.set(emojiName, src);
            }
            emojiImg.src = src;
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
    async drawPngReplaceEmojiWithEmojicdn(data) {
        const { fillStyle, font, y, emojiW, emojiH, emojiStyle = "google", } = data;
        const { canvasCtx } = this;
        canvasCtx.fillStyle = fillStyle;
        canvasCtx.font = font;
        let { text, x, length } = data;
        const emojiArr = [];
        const emojiData = {};
        text = emoji.replace(text, (item) => {
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
        }
        for (let i = 0; i < emojiArr.length; i++) {
            const emojiItem = emojiArr[i];
            console.log("emojiItem", emojiItem);
            const index = text.indexOf(emojiItem);
            if (length !== -1 &&
                length - text.substring(0, index).length <= 0) {
                canvasCtx.fillText(`${text.substring(0, length)}...`, x, y);
                x += canvasCtx.measureText(`${text.substring(0, length)}...`).width;
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
            let emojiImg = await (0, canvas_1.loadImage)(encodeURI(emojiSrc));
            emojiImg.src = emojiSrc;
            console.log("Complete: ", emojiImg.complete);
            console.log("src: ", emojiImg.src);
            console.log("width: ", emojiImg.width);
            console.log("height: ", emojiImg.height);
            console.log("naturalWidth: ", emojiImg.naturalWidth);
            console.log("naturalHeight: ", emojiImg.naturalHeight);
            console.log(emojiImg.dataMode);
            console.log("X: ", x, "Y: ", y, "emojiW: ", emojiW, "emojiH: ", emojiH);
            canvasCtx.drawImage(emojiImg, x, y - (5 / 6) * emojiH, emojiW, emojiH);
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
    showText(text, length = 10) {
        if (text.length > length) {
            return text.slice(0, length) + "...";
        }
        else {
            return text;
        }
    }
}
exports.CanvasEmoji = CanvasEmoji;
//# sourceMappingURL=index_tmp.js.map