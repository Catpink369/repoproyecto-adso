module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../..',
  testRegex: 'test/PruebasIntegracion/.*\\.e2e-spec\\.ts$',
  setupFiles: ['<rootDir>/test/jest-e2e.setup.ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './reportes',
        filename: 'reporte-integracion.html',
        pageTitle: 'Reporte Pruebas de Integración - Gurama',
        openReport: false,
      },
    ],
  ],
};