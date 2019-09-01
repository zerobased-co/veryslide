const tests = require.context('.', true, /\.spec\.js$/);
tests.keys().forEach(tests);

const components = require.context('../src/', true, /\.js$/);
components.keys().forEach(components);
