import html_prettify from 'html-prettify';
import fs from 'fs';

const pages = fs.readdirSync('../pages')
    .filter(file =>
        /\.html$/.test(file),
    );

for (const page of pages) {
    const html =
        fs.readFileSync(
            `../pages/${page}`,
            'utf8',
        );

    const prettified =
        html_prettify(html, {
            char: ' ',
            count: '4',
        });

    fs.writeFileSync(
        `../pages/${page}`,
        prettified,
    );
}
