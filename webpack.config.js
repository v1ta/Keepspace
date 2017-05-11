var path = require('path'),
    PATHS = {
    app: path.join(__dirname, 'client/js'),
    build: path.join(__dirname, 'client/build')
}

module.exports = {
    entry: {
        path: PATHS.app
    },
    output: {
        path: PATHS.build,
        filename: 'main.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx*$/,
                loaders: ["babel-loader"],
                include: PATHS.app
            }
        ]
    }
};
