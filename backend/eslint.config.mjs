// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        files: ['src/**/*.ts', 'spec/**/*.ts'],
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_' },
            ],
            // TODO(step-7): re-enable once migrated to ES imports
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        ignores: ['dist/', 'node_modules/'],
    },
);
