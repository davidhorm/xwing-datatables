/* Copy external library files to the public folder */
var mkdirp = require('mkdirp');
var fs = require('fs');
var glob = require("glob");
var path = require("path");

console.log("\n *START COPY FILES TO PUBLIC* \n");

//copy favicon.ico and ./submodules/excel-bootstrap-table-filter files
mkdirp('./public/lib', function (err) {
    if (err) {
        console.error(err);
    }
    else {
        fs.createReadStream('./submodules/excel-bootstrap-table-filter/dist/excel-bootstrap-table-filter-bundle.min.js')
        .pipe(fs.createWriteStream('./public/lib/excel-bootstrap-table-filter-bundle.min.js'));
        
        fs.createReadStream('./submodules/excel-bootstrap-table-filter/dist/excel-bootstrap-table-filter-style.css')
        .pipe(fs.createWriteStream('./public/lib/excel-bootstrap-table-filter-style.css'));

        fs.createReadStream('./src/favicon.ico')
        .pipe(fs.createWriteStream('./public/favicon.ico'));
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