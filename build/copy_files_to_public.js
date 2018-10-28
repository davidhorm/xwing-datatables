/* Copy external library files to the public folder */
var mkdirp = require('mkdirp');
var fs = require('fs');
var glob = require("glob");
var path = require("path");

console.log("\n *START COPY FILES TO PUBLIC* \n");

//copy static files from src
mkdirp('./public/img', function (err) {
    if (err) {
        console.error(err);
    }
    else {
        fs.createReadStream('./src/favicon.ico')
        .pipe(fs.createWriteStream('./public/favicon.ico'));

        var imageFiles = './src/**/*.png';
        glob(imageFiles, null, function (err, files) {
            files.forEach(srcFile => {
                var destFile = srcFile.replace("/src/", "/public/");

                fs.createReadStream(srcFile)
                .pipe(fs.createWriteStream(destFile));
            });
        });
    }
});

//copy submodules and node module files
mkdirp('./public/lib/@material/button/dist', function (err) {
    if (err) {
        console.error(err);
    }
    else {
        fs.createReadStream('./node_modules/@material/button/dist/mdc.button.min.css')
        .pipe(fs.createWriteStream('./public/lib/@material/button/dist/mdc.button.min.css'));
    }
});

//copy @material/tab* files
var materialFiles = './node_modules/@material/tab*/dist/*.min.*';
glob(materialFiles, null, function (err, files) {
    files.forEach(srcFile => {
        var destFile = srcFile.replace("/node_modules/", "/public/lib/");

        var destPath = path.dirname(destFile);
        mkdirp(destPath, function (err) {
            if (err) {
                console.error(err);
            }
            else {
                fs.createReadStream(srcFile)
                .pipe(fs.createWriteStream(destFile));
            }
        });
    });
});

console.log("\n *END COPY FILES TO PUBLIC* \n");