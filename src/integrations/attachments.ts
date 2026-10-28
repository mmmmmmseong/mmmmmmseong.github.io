// content/attachments 폴더(Obsidian 첨부 폴더)를 사이트의 /attachments/ 경로로 제공한다.
// 개발 서버에서는 바로 읽어서 보내고, 빌드할 때는 dist/attachments 로 복사한다.
import fs from 'node:fs';
import path from 'node:path';
import { lookup } from 'mrmime';
import type { AstroIntegration } from 'astro';
import { ATTACHMENTS_DIR } from '../lib/vault.ts';

export default function attachments(): AstroIntegration {
  return {
    name: 'vault-attachments',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'vault-attachments',
                configureServer(server) {
                  server.middlewares.use('/attachments', (req, res, next) => {
                    const rel = decodeURIComponent((req.url ?? '/').split('?')[0]);
                    const file = path.join(ATTACHMENTS_DIR, rel);
                    if (!file.startsWith(ATTACHMENTS_DIR + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
                      return next();
                    }
                    res.setHeader('Content-Type', lookup(file) ?? 'application/octet-stream');
                    fs.createReadStream(file).pipe(res);
                  });
                },
              },
            ],
          },
        });
      },
      'astro:build:done': async ({ dir }) => {
        if (!fs.existsSync(ATTACHMENTS_DIR)) return;
        await fs.promises.cp(ATTACHMENTS_DIR, new URL('attachments/', dir), {
          recursive: true,
          filter: (src) => path.basename(src) !== '.gitkeep',
        });
      },
    },
  };
}
