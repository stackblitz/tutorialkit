import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cloudflareConfigRaw from './hosting-config/_headers.txt?raw';
import netlifyConfigRaw from './hosting-config/netlify_toml.txt?raw';
import vercelConfigRaw from './hosting-config/vercel.json?raw';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateHostingConfig(dest: string, provider: string) {
  const resolvedDest = path.resolve(dest);

  if (!fs.existsSync(resolvedDest)) {
    console.log(`Directory does not exist. Creating directory: ${resolvedDest}`);
    fs.mkdirSync(resolvedDest, { recursive: true });
  } else {
    console.log(`Directory already exists: ${resolvedDest}`);
  }

  if (provider.includes('Vercel')) {
    const vercelConfigPath = path.join(resolvedDest, 'vercel.json');
    console.log('Writing Vercel config file to:', vercelConfigPath);

    try {
      const vercelConfig = typeof vercelConfigRaw === 'string' ? JSON.parse(vercelConfigRaw) : vercelConfigRaw;
      fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
    } catch (error) {
      console.error('Failed to write Vercel config file:', error);
    }
  }

  if (provider.includes('Netlify')) {
    const netlifyConfigPath = path.join(resolvedDest, 'netlify.toml');
    console.log('Writing Netlify config file to:', netlifyConfigPath);

    try {
      if (typeof netlifyConfigRaw !== 'string') {
        throw new Error('Netlify config must be a string.');
      }

      fs.writeFileSync(netlifyConfigPath, netlifyConfigRaw);
    } catch (error) {
      console.error('Failed to write Netlify config file:', error);
    }
  }

  if (provider.includes('Cloudflare')) {
    const cloudflareConfigPath = path.join(resolvedDest, '_headers');
    console.log('Writing Cloudflare config file to:', cloudflareConfigPath);

    try {
      if (typeof cloudflareConfigRaw !== 'string') {
        throw new Error('Cloudflare config must be a string.');
      }

      fs.writeFileSync(cloudflareConfigPath, cloudflareConfigRaw);
    } catch (error) {
      console.error('Failed to write Cloudflare config file:', error);
    }
  }

  const templateDir = path.resolve(__dirname, '_template');
  console.log('Looking for template directory at:', templateDir);

  if (fs.existsSync(templateDir)) {
    const gitignoreTemplatePath = path.join(templateDir, '.gitignore');

    if (fs.existsSync(gitignoreTemplatePath)) {
      const gitignoreDestPath = path.join(resolvedDest, '.gitignore');
      console.log('Copying .gitignore to:', gitignoreDestPath);
      fs.copyFileSync(gitignoreTemplatePath, gitignoreDestPath);
    } else {
      console.warn('No .gitignore file found in template directory, skipping copy.');
    }
  } else {
    console.warn('Template directory does not exist, skipping .gitignore copy.');
  }
}
