/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: 'no-direct-sqlite-in-routes',
            comment:
                'Routes must not import sqlite3 directly. Use the repository interface instead.',
            severity: 'error',
            from: { path: '^src/routes/' },
            to: { dependencyTypes: ['npm'], path: 'sqlite3' },
        },
        {
            name: 'no-direct-mysql-in-routes',
            comment:
                'Routes must not import mysql2 directly. Use the repository interface instead.',
            severity: 'error',
            from: { path: '^src/routes/' },
            to: { dependencyTypes: ['npm'], path: 'mysql2' },
        },
        {
            name: 'no-sqlite-impl-in-routes',
            comment:
                'Routes must not import persistence/sqlite directly. Use dependency injection.',
            severity: 'error',
            from: { path: '^src/routes/' },
            to: { path: 'persistence/sqlite' },
        },
        {
            name: 'no-mysql-impl-in-routes',
            comment:
                'Routes must not import persistence/mysql directly. Use dependency injection.',
            severity: 'error',
            from: { path: '^src/routes/' },
            to: { path: 'persistence/mysql' },
        },
    ],
    options: {
        doNotFollow: {
            path: 'node_modules',
        },
        tsPreCompilationDeps: true,
        tsConfig: {
            fileName: './tsconfig.json',
        },
    },
};
