const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(srcDir);
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace standard const BACKEND_URL = "http://localhost:5000/api";
    content = content.replace(/"http:\/\/localhost:5000\/api"/g, '`http://${window.location.hostname}:5000/api`');

    // Replace fetch("http://localhost:5000/api/pay/...");
    content = content.replace(/"http:\/\/localhost:5000\/api\/([^"]+)"/g, '`http://${window.location.hostname}:5000/api/$1`');

    // Replace template literals `http://localhost:5000/api/courses`
    content = content.replace(/`http:\/\/localhost:5000\/api\/([^`]+)`/g, '`http://${window.location.hostname}:5000/api/$1`');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file.replace(__dirname, ''));
    }
});
