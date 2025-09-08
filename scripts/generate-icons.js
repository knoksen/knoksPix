import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateIcons() {
    const svgBuffer = fs.readFileSync('public/icon.svg');
    
    // Generate ICO with proper sizes
    const sizes = [16, 24, 32, 48, 64, 128, 256];
    const icoBuffers = await Promise.all(
        sizes.map(async size => {
            const buffer = await sharp(svgBuffer)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .png()
                .toBuffer();
            
            // Add size information
            const sizeHeader = Buffer.alloc(8);
            sizeHeader.writeUInt8(size, 0); // width
            sizeHeader.writeUInt8(size, 1); // height
            sizeHeader.writeUInt8(0, 2); // color palette
            sizeHeader.writeUInt8(0, 3); // reserved
            sizeHeader.writeUInt16LE(1, 4); // color planes
            sizeHeader.writeUInt16LE(32, 6); // bits per pixel
            
            return Buffer.concat([sizeHeader, buffer]);
        })
    );
    
    // Write ICO file with header
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // reserved
    header.writeUInt16LE(1, 2); // type (1 = ICO)
    header.writeUInt16LE(sizes.length, 4); // number of images
    
    fs.writeFileSync('public/icon.ico', Buffer.concat([header, ...icoBuffers]));

    // Generate Android icons
    const androidDir = 'android/app/src/main/res';
    const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
    
    for (let i = 0; i < sizes.android.length; i++) {
        const size = sizes.android[i];
        const density = densities[i] || densities[densities.length - 1];
        const dir = `${androidDir}/mipmap-${density}`;
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(`${dir}/ic_launcher.png`);
    }
}

generateIcons().catch(console.error);
