const fs = require("fs");

const filenames = ["Senal1.html"];

const CATEGORY_TITLE = "CONVENCION CONSTITUCIONAL";
const CATEGORY_SLUG = "CONVENCION_CONSTITUCIONAL";

const matches = [];
for (let i = 1; i <= 13; i++) {
  const filename = `Senal${i}.html`;
  const file = fs.readFileSync(`./${filename}`, "utf8");
  const match = file.match(/file:\"(.*)\",/);
  const m3u8Url = match[1];
  const elementTitle = `${i}`;
  const elementSlug = `${i}`;
  const newSlug = `${CATEGORY_SLUG}_${elementSlug}`;
  matches.push(`${newSlug} : {
    slug: "${newSlug} ",
    titleIcons: ['<img style="height: 20px; width:auto:" src="imagenes/Logo_CC.svg"></img>'],
    listTitle: "${CATEGORY_TITLE} ${elementTitle}",
    m3u8Url: "${m3u8Url}"
  },`);
}
for (const match of matches) {
  console.log(match);
}
