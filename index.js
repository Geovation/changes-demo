System.config({
    map: {
        'systemjs-babel-build': 'https://unpkg.com/systemjs-plugin-babel@0.0.x/systemjs-babel-browser.js',
        'systemjs-plugin-babel': 'https://unpkg.com/systemjs-plugin-babel@0.0.x/plugin-babel.js',
        'page': 'https://unpkg.com/page@1.8.x/page.js',
        'react': 'https://unpkg.com/react@16.2.x/umd/react.development.js',
        'react-dom': 'https://unpkg.com/react-dom@16.2.x/umd/react-dom.development.js',
        'react-dom-factories': 'https://unpkg.com/react-dom-factories@1.0.x',
        'mapbox-gl': 'https://unpkg.com/mapbox-gl@0.46.x',
        'debounce': 'https://unpkg.com/debounce@1.1.x'
    },
    transpiler: 'systemjs-plugin-babel'
})

System.import('components/routes.js').catch(console.error)
