Knit
====

*Knit 0.8 introduced significant changes to the API and usage
 philosophy. Detailed documentation to come.*

Knit helps you define and generate structured static content for
building or serving. For example, use it to serve single-page
applications during development, build static websites, create
parameterised documents, or generate config files.

Knit tries to do little more than define resources in order to give
you flexibility.  That is, we value transparency and do not try to
hide every conceivable use-case behind a pretty interface.  Instead,
you should use Knit together with relevant libraries
([http-proxy](https://github.com/nodejitsu/node-http-proxy) and
[optimist](https://github.com/substack/node-optimist) for example).

Example usage
-------------

The below defines two simple resources
    var knit = require('knit'),
        less = require('knit-less'),
        string = require('knit-string'),
        httpProxy = require('http-proxy'),
        url = require('url'),
        structure, resources;

    structure = knit.tree({
        '/styles.css':  less('./styles/main.less', { paths: ['./styles'] }),
        '/robots.txt':  string('User-agent: *\nDisallow:', 'text/plain')
    });
    resources = structure.build();

    httpProxy.createServer(function (req, res, proxy) {
        var generator = resources[url.parse(req.url).pathname];
        if (generator) generator(res);
        else proxy.proxyRequest(req, res, {
                target: {host: 'example.com', port: 443, https: true}});
    }).listen(8000);

Installation
------------

Install in your project folder with [npm](http://npmjs.org/):

    npm install git://github.com/cbaatz/knit.git

Design
------

Knit has two key concepts: structures and generators. A structure is
an object with a `build()` function that returns a resource map
(object) from paths to generators. A generator is a function that when
given an HTTP response stream (or extended file stream) writes its
content and headers to it.

Neither structure or generator have special parent prototypes in order
to not require third-party extension libraries to depend on Knit (this
would be an issue in particular when `node_modules` is checked in to
the repo).

API
---

### Structures

- `knit.tree({ <prefix>: <generatorOrStructure> })`
- `knit.files(<path>)`

### Functions

- `knit.createServer(<resourcesOrStructure>)`
- `knit.write(<resourcesOrStructure>, <buildPath>, <config>)`
  (`config.overwrite` is the only option).

- generator.mode will be used when writing a file

Watching files vs. serving dynamically
--------------------------------------

Knit supports the view that it is better to dynamically recompile
files than to watch (or poll) the filesystem for changes. There are
two reasons for this:

* When watching files, recompilation of content is asynchronous with
website reloads. Thus, you are not guaranteed to see the latest
version when reloading. Even if this only happens in rare cases, the
uncertainty leaves at least me reloading the page several times just
to be sure (did my change have no effect or is the content not
recompiled?).

* File watching relies on different technologies on Linux, Mac OS X,
and Windows, so your Linux solution might not work for those in your
company working on Mac OS X.

Does that make reloads slow? It makes them slower, but nothing that I
have found annoying during development *as long as JavaScript
compression (e.g. UglifyJS) is turned off.* You should turn JavaScript
compression on or off depending on whether you build or serve the
resource. Your milage may vary.
