/* eslint-disable prettier/prettier */
import fs from 'node:fs';
import path from 'node:path';
import cloudflareConfigFile from './hosting-config/_headers?raw';
import netlifyConfigFile from './hosting-config/netlify.toml?raw';
import vercelConfigFile from './hosting-config/vercel.json?raw';

export async function generateHostingConfig(dest: string, providers: string[]) {
    const resolvedDest = path.resolve(dest);
  
    if (!fs.existsSync(resolvedDest)) {
      console.log(`Directory does not exist. Creating directory: ${resolvedDest}`);
      fs.mkdirSync(resolvedDest, { recursive: true });
    } else {
      console.log(`Directory already exists: ${resolvedDest}`);
    }
  
    if (providers.includes('Vercel')) {
      const vercelConfigPath = path.join(resolvedDest, 'vercel.json');
      console.log('Writing Vercel config file to:', vercelConfigPath);
      fs.writeFileSync(vercelConfigPath, vercelConfigFile);
    }
  
    if (providers.includes('Netlify')) {
      const netlifyConfigPath = path.join(resolvedDest, 'netlify.toml');
      console.log('Writing Netlify config file to:', netlifyConfigPath);
      fs.writeFileSync(netlifyConfigPath, netlifyConfigFile);
    }
  
    if (providers.includes('Cloudflare')) {
      const cloudflareConfigPath = path.join(resolvedDest, '_headers');
      console.log('Writing Cloudflare config file to:', cloudflareConfigPath);
      fs.writeFileSync(cloudflareConfigPath, cloudflareConfigFile);
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