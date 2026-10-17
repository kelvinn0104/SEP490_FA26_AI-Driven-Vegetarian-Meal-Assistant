const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (file.endsWith('.tsx')) {
            const newPath = filePath.replace(/\.tsx$/, '.jsx');
            fs.renameSync(filePath, newPath);
            console.log(`Renamed ${filePath} to ${newPath}`);
        } else if (file.endsWith('.ts')) {
            const newPath = filePath.replace(/\.ts$/, '.js');
            fs.renameSync(filePath, newPath);
            console.log(`Renamed ${filePath} to ${newPath}`);
        }
    }
}

walkDir(path.join(__dirname, 'src'));
const viteConfig = path.join(__dirname, 'vite.config.ts');
if (fs.existsSync(viteConfig)) {
    fs.renameSync(viteConfig, path.join(__dirname, 'vite.config.js'));
    console.log('Renamed vite.config.ts to vite.config.js');
}
