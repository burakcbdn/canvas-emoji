import emojis from "./icon_data";

const newEmojis = [];

for (let emoji of emojis) {
    console.log(emoji);

    let key = emoji.key.split("_")[0];


    newEmojis.push({
        key,
        src: emoji.src,
        href: emoji.href,
    });
}

// write to file
const fs = require("fs");

fs.writeFileSync("./icon_data_new.ts", JSON.stringify(newEmojis, null, 4));