import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

async function addDirectoryToZip(zip, dirPath, rootPath = '') {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    const relativePath = path.join(rootPath, file);
    
    if (stats.isDirectory()) {
      const folder = zip.folder(file);
      await addDirectoryToZip(folder, filePath, '');
    } else {
      const content = fs.readFileSync(filePath);
      zip.file(file, content);
    }
  }
}

async function createZip() {
  console.log('🚀 Building ShopZone Zip Package...');
  const distPath = path.join(process.cwd(), 'dist');
  const zipOutputPath = path.join(process.cwd(), 'dist.zip');

  if (!fs.existsSync(distPath)) {
    console.error('❌ Error: "dist" folder not found. Run "yarn build" first.');
    process.exit(1);
  }

  try {
    const zip = new JSZip();
    await addDirectoryToZip(zip, distPath);
    
    const content = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    fs.writeFileSync(zipOutputPath, content);
    console.log('✅ Successfully created dist.zip');
    console.log('📂 You can now download dist.zip from the file explorer.');
  } catch (error) {
    console.error('❌ Zip Error:', error.message);
    process.exit(1);
  }
}

createZip();
