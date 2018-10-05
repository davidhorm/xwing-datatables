/* Copy external library files to the public folder */
var fs = require('fs');
console.log("\n *START COPY FILES TO PUBLIC* \n");

fs.createReadStream('./submodules/excel-bootstrap-table-filter/dist/excel-bootstrap-table-filter-bundle.min.js')
.pipe(fs.createWriteStream('./public/lib/excel-bootstrap-table-filter-bundle.min.js'));

fs.createReadStream('./submodules/excel-bootstrap-table-filter/dist/excel-bootstrap-table-filter-style.css')
.pipe(fs.createWriteStream('./public/lib/excel-bootstrap-table-filter-style.css'));

fs.createReadStream('./src/favicon.ico')
.pipe(fs.createWriteStream('./public/favicon.ico'));

console.log("\n *END COPY FILES TO PUBLIC* \n");