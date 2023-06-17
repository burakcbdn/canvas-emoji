"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const icon_data_1 = require("./icon_data");
const newEmojis = [];
for (let emoji of icon_data_1.default) {
    console.log(emoji);
    let key = emoji.key.split("_")[0];
    newEmojis.push({
        key,
        src: emoji.src,
        href: emoji.href,
    });
}
const fs = require("fs");
fs.writeFileSync("./icon_data_new.ts", JSON.stringify(newEmojis, null, 4));
//# sourceMappingURL=extract.js.map