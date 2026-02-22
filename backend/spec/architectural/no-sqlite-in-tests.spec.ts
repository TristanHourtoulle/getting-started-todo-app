import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const backendRoot = path.resolve(__dirname, '..', '..');
const routesDir = path.join(backendRoot, 'src', 'routes');

describe('Architectural rules', () => {
  test('routes do not import persistence or infrastructure directly', () => {
    const result = execSync('npm run lint:deps 2>&1', {
      cwd: backendRoot,
      encoding: 'utf-8',
    });
    expect(result).toContain('no dependency violations found');
  });

  test('route files do not import sqlite3 or mysql2 directly', () => {
    const files = fs.readdirSync(routesDir);

    for (const file of files) {
      const content = fs.readFileSync(path.join(routesDir, file), 'utf-8');
      expect(content).not.toMatch(/import.*from\s+['"]sqlite3['"]/);
      expect(content).not.toMatch(/import.*from\s+['"]mysql2['"]/);
      expect(content).not.toMatch(/require\s*\(\s*['"]sqlite3['"]\s*\)/);
      expect(content).not.toMatch(/require\s*\(\s*['"]mysql2['"]\s*\)/);
    }
  });

  test('route files only depend on domain layer, not infrastructure', () => {
    const files = fs.readdirSync(routesDir);

    for (const file of files) {
      const content = fs.readFileSync(path.join(routesDir, file), 'utf-8');
      expect(content).not.toMatch(/from\s+['"]\.\.\/infrastructure/);
      expect(content).not.toMatch(/from\s+['"]\.\.\/persistence/);
    }
  });
});
