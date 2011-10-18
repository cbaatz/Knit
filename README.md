Knit
====

Knit makes local web-development convenient by dynamically compiling
and serving content such as
[CoffeeScript](http://jashkenas.github.com/coffee-script/),
[Less](http://lesscss.org/), and
[Jade](http://jade-lang.com/). Requests not matching content known to
Knit are proxied to another server to imitate the deployed
website. Put differently, Knit overlays your normal development
webserver, capturing requests for static content, recompiling it,
serving it, and proxying other requests.

Knit can also write the compiled files to the filesystem for use in
your deployed website.

Knit currently supports compilation and serving of:
[CoffeeScript](http://jade-lang.com/) modules (from
[Alex MacCaw's Hem](https://github.com/maccman/hem)),
[Less](http://lesscss.org/), [Jade](http://lesscss.org/), strings, and
static files.

Installation
------------

Installation requires
[node.js](https://github.com/joyent/node/wiki/Installation) and
[npm](http://npmjs.org/) and can then be accomplished with

    git clone git://github.com/cbaatz/knit.git
    cd knit
    npm install -g

Example usage
-------------

If we have an app structure

    myapp
    |-- backend
    `-- frontend
        |-- .knit.coffee
        |-- html
        |   `-- index.jade
        |-- scripts
        |   `-- app.coffee
        `-- styles
            |-- .knit.coffee
            `-- app.less

with `.knit.coffee` containing

    exports.targets =
      'app.js': ['scripts/app.coffee', 'coffee']
      'app.css': ['styles/app.less', 'less']
      'favicon.ico': ['', 'string']
      'robots.txt': ['User-agent: *\nDisallow: /', 'string']
      'index.html': ['html/index.jade', 'jade']

then the commands

    $ cd myapp/frontend
    $ knit serve

will serve this on `http://localhost:8081/`, proxying everything but the
five specified files to `http://localhost:8080/`.

When we're happy with our work and would like to deploy, we can
compile and write the content to files (defaults to current directory)
with

    $ knit write

Watching files vs. serving dynamically
--------------------------------------

Knit does not listen for events from (or poll for) changes to files on
the filesystem like some utilities. There are two reasons for this:

* When watching files, recompilation of content is asynchronous with
website reloads. Thus, you are not guaranteed to see the latest
version when reloading. Even if this only happens in rare cases, the
uncertainty leaves at least me reloading the page several times just
to be sure (did my change not work or is the content not recompiled?).

* File watching relies on different technologies on Linux, Mac OS X,
and Windows, so your Linux solution might not work for those in your
company working on Mac OS X.

Instead, Knit simply re-reads and compiles the files synchronously on
each request. Does that make reloads incredibly slow? Personally I
don't notice any particular lag as long as uglification (compression)
is turned off. Your milage may vary.

Configuration
-------------

Knit allows us to specify compilation options dependent on whether we
are serving or writing content and, in fact, *any* command-line
parameters we care to invent. Knit config files are normal
CoffeeScript modules and we can make full use of this.

Knit is configured using a `.knit.coffe` (or alternatively `_knit.coffee`)
file in the directory that holds our content. This is a normal node.js
module and can be written in either CoffeScript (preferred) or
JavaScript (then `.knit.js` or `_knit.js`). The config file should export
a target specification and optionally configuration options for the
server, writer, and compilers.

### Example

Let's look at an example to highlight some of the configuration
features:

    exports.targets =
      'app.js': ['scripts/app.coffee', 'coffee']
      'app.css': ['styles/app.less', 'less']

    exports.server =
      port: Number(knit?.port or 8080)
      host: '127.0.0.1'

    exports.coffee =
      compress: if knit.action == 'write' then true else false

    exports.less =
      compress: knit?.obscure ? true

First, we see that `targets` is an exported object whose keys identify
targets and the values are pairs specifying first the source and
second the compiler to use (this is not yet automatically inferred).

Then we specify configurations for the content compilation and serving
and writing by exporting an object with a name corresponding to the
compiler or `server` or `writer`. The available options are listed below.

### Command line parameters

Knit allows us to specify arbitrary command line parameters which we
get access to in config files so we can adjust the configuration
suitably. For example,

    $ knit serve --no-obscure --port=8000

will set the global `knit` variable available in config files to:

    { 'obscure':  true,
      'compress': false,
      'port':     '8000' }

Which we use in the example above to allow specifying the server port
and Less compression from the command line (with `8080` and `true` as
defaults).

It is worth repeating that you make up your own command line options
and use them however you see fit in your config files. Only `--help`,
`--version`, `--action`, and `--config=FILE` are reserved for use by
Knit. `--action` is reserved because `knit.action` is set to `serve`
or `write` depending on the action specified.

### Subdirectories

Content can be structured into subdirectories with their own
`.knit.coffee` files, included from the main `.knit.coffee` file using
the special `knit` compiler. For example:

TODO ...


### `server`

TODO

Options: root, port, host, proxyPort, proxyHost

### `writer`

TODO

Options: root

Compilers
---------

TODO

### `coffee`
### `file`
### `string`
### `less`
### `jade`
