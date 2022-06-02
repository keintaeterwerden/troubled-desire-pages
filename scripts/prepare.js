import fs from 'fs';

const mimes =
    new Map(
        JSON.parse(
            fs
                .readFileSync('./mimes.json')
                .toString(),
        ),
    );

const images =
    fs.readdirSync('../images')
        .filter(file =>
            /\.(png|jpe?g|gif|apng|tiff|webp|heif|bmp)$/.test(file),
        );

const image_manifest = [];

for (const image of images) {
    image_manifest.push(
        {
            path: image,
            size: fs.statSync(`../images/${image}`).size,
            mime: mimes.get(image.split('.').pop()),
        },
    );
}

const pages = fs.readdirSync('../pages')
    .filter(file =>
        /\.html$/.test(file),
    );

const pages_manifest = {
    all: [],
    lang: new Map(),
};

for (const page of pages) {
    const page_parts = page.match(/([a-z]{2,}(?:-[a-z]{2})?)-(.*).html$/);

    const lang = page_parts[1];
    const title = page_parts[2];

    if (!lang) {
        console.log(
            'WARNING: page %s has bad format -- needs be in "<lang>-<page>.html" format',
            page,
        );
    }

    pages_manifest.all.push(
        {
            path: page,
            size: fs.statSync(`../pages/${page}`).size,
            title,
            lang,
        },
    );

    pages_manifest
        .lang
        .set(
            lang,
            [
                ...pages_manifest
                    .lang
                    .get(lang) || [],
                {
                    path: page,
                    size: fs.statSync(`../pages/${page}`).size,
                    title,
                },
            ],
        );
}

fs.writeFileSync(
    '../manifest/images.json',
    JSON.stringify(image_manifest, null, 4),
);

fs.writeFileSync(
    '../manifest/pages.json',
    JSON.stringify({
        ...pages_manifest,
        lang: Array.from(pages_manifest.lang),
    }, null, 4),
);

// a list of all titles and the languages they appear in

const titles = new Map();

for (const [lang, lang_pages] of pages_manifest.lang.entries()) {
    for (const page of lang_pages) {
        titles.set(
            page.title,
            [
                ...titles.get(page.title) || [],
                lang,
            ],
        );
    }
}

const all_langs = Array.from(pages_manifest.lang.keys());

// check if each title in titles has all langs of all_langs

for (const [title, langs] of titles.entries()) {
    for (const lang of all_langs) {
        if (!langs.includes(lang)) {
            console.log('page %s is missing in %s', title, lang);
        }
    }
}
