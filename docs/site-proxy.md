# Site Proxying During Development

When integrating this boilerplate with an existing website, some might need to proxy everything but the bundle files. This allows for testing with a dev or production server even. To achieve that, we can run the dev server, configure this boilerplate proxy and `publicPath` options, and let the dev server proxy all requests to the actual site with the exception of files output by webpack.

To configure the proxy rules, edit `dev.proxyTable` option in `config/index.js`. The dev server is using [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware) for proxying, so you should refer to its docs for detailed usage. But here's a simple example:

``` js
// config/index.js
module.exports = {
  // ...
  dev: {
    // this path should match whichever path your files are hosted on the target server
    assetsPublicPath: '/documents/bundle'
    // proxy all requests to https://mysite.com
    proxyTable: 'https://mysite.com'
  }
}
```

The above example will 'overlay' the generated bundle files at `/documents/bundle` over `https://mysite.com` (by proxying all requests except for bundle files which are served from webpack).
