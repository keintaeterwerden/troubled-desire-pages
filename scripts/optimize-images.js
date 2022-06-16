import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';
import imageminAvif from 'imagemin-avif';
import imageminWebp from 'imagemin-webp';
import imageminSvgo from 'imagemin-svgo';
import imageminGifsicle from 'imagemin-gifsicle';
import { readFileSync } from 'fs';

(async () => {
    const files =
        await imagemin(['../images/*.{jpg,jpeg,png,avif,webp,svg,gif}'], {
            destination: '../images-live',
            plugins: [
                imageminJpegtran(),
                imageminPngquant({
                    quality: [0.6, 0.8],
                }),
                (mw => buf => buf.slice(8, 12).equals(Buffer.from('avif')) ? mw(buf) : buf)(imageminAvif()),
                imageminWebp(),
                imageminSvgo({
                    multipass: true,
                }),
                imageminGifsicle(),
            ],
        });

    for (const file of files) {
        const orig_file =
            readFileSync(
                file.sourcePath,
            );

        console.log(
            '%s (%s bytes) -> %s (%s bytes): %s% saved',
            file.sourcePath,
            orig_file.length,
            file.destinationPath,
            file.data.length,
            ((1 - orig_file.length / file.data.length) * 100).toPrecision(2),
        );
    }
})();
