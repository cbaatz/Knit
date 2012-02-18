Knit
====

Knit helps you serve static resources during development and build
them for deployment. It can also help you download third-party
libraries and initialise projects.

You define the resources in a file that associates resource names with
handlers that produces the content. A handler is a function that gets
a [Writable
Stream](http://nodejs.org/docs/latest/api/streams.html#writable_Stream)
to write its content to.

Put differently, Knit can overlay your normal development web server,
capture requests for static content, recompile it, and serve it. If
the request is for another resource, Knit will proxy to your dynamic
server.

Knit provides an HTTP server that serves the defined resources and
otherwise acts as a proxy for another server (e.g. local development
server for your dynamic content).

Knit can also write the defined resources to disk. This allows you to
define resources to be deployed and have Knit build the files for
you. Your resource definitions can be conditional on whether Knit is
servign or writing.

Knit is highly configurable using plain JavaScript or CoffeeScript.

[`knit-common`](https://github.com/cbaatz/knit-common) provides a set
of standard handlers like serving a file or directory. It is highly
recommended that you also install `knit-common` if you use Knit.

Example usage
-------------

Simple (not particularly useful) example:

    myapp
    `-- knit.coffee

with `knit.coffee` containing (`s` is short for "stream")

    exports.resources = (action, knit, log) ->
      resources =
        '/': (s) -> s.endWithMime('This is the data', 'text/plain')
        '/favicon.ico': (s) ->
          s.setHeader('Content-Type', 'image/vnd.microsoft.icon')
          s.end('This is the data')
        'robots.txt': (s) -> s.end('User-agent: *\nDisallow: /')
        '/static/': {'hello.txt': (s) -> s.end('Hello, World!')}
      resources

then

    $ cd myapp
    $ knit serve

will serve this on `http://localhost:8081/`, proxying everything but
the specified resources to `http://localhost:8080/`.

We can write the resources to disk with:

    $ knit write

This writes the files to the current directory by default (ignoring
the `/` resource):

    myapp
    |-- knit.coffee
    |-- favicon.ico
    |-- robots.txt
    `-- static/hello.js

The `knit.coffee` file is a normal CoffeeScript file that exports a
'resources' function, taking an `action`, `knit` parameter object, and
a `log`, to produce an object associating resource paths with a
handler function. The resource/handler specification can be nested as
seen above.

The stream passed to the handler is either a slightly modified version
of either the
[http.ServerResponse](http://nodejs.org/docs/latest/api/http.html#http.ServerResponse)
or a
[fs.WriteStream](http://nodejs.org/docs/latest/api/fs.html#fs.WriteStream). They
are extended with the convenience functions: `setMime(<mimetype>)` and
`endWithMime(<data>, <mimetype>)` and also with the `log` object.

Installation
------------

Installation requires
[node.js](https://github.com/joyent/node/wiki/Installation) and
[npm](http://npmjs.org/) and can then be accomplished with

    git clone git://github.com/cbaatz/knit.git
    cd knit
    npm install -g

Knit as a library downloader or template writer
-----------------------------------------------

If you tell Knit to perform an action other than `write` or `serve`,
say `knit requirejs`, Knit will assume you mean `knit write
requirejs`. This allows you to use Knit as a library downloader by
writing your resource files appropriately. `knit-common` ships with
`httpget`, `httpsget`, and `github` handlers for downloading
files. Knit ships with a small set of resource files that use these to
download common libraries. For example:

    knit requirejs 1.0.4 text domReady

would download require.js, text.js, and domReady.js to the current
folder (where text and domReady are RequireJS plugins). Knit ships
with the below resource files by default. Use them without argument to
get usage help (e.g. `knit jquery`):

* `requirejs`
* `jquery`
* `backbone-amd`
* `underscore-amd`

This approach can of course be used to create nested file
structures. You might want to create a resource file for a *AMD
Backbone project template* that would download the libraries and write
required files with appropriate content (`index.html`, `main.js`,
`knit.coffee`, and so on) to a new project folder.

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

Knit expects handlers to perform this compilation as appropriate.
Knit simply re-reads the resources file synchronously on each
request. Does that make reloads incredibly slow? Personally I don't
notice any particular lag as long as compression of JavaScript
resources is turned off. Your milage may vary.

Resources
---------

Knit allows you to specify your resources conditional on whether you
are serving or writing content and any command line parameter you want
to use. That is, Knit allows you to invent your own command-line
parameters. Knit resource files are standard JavaScript or
CoffeeScript node.js modules that export a `resources(action, knit,
log)` function which returns the resources object. The `knit` object
passed to the function contains the parameter values. Thus, you have
full control over how you construct your resources and handlers.

You can optionally specify a resource definition module name on the
command line; if you don't (`knit write` for example), Knit defaults
to look for a `knit` or `.knit` module in the current and then parent
directories. If a resource name is specified (`knit write myresources`
for example), Knit will look for a module with that name in the
following locations (in order):

1. The current directory (`.`)
2. `$HOME/.knit/` if the `HOME` environment variable is defined
3. The paths specified in the environment variable `KNIT_PATHS`
4. The `contrib` folder of the Knit distribution (allowing Knit to
   ship useful resource files by default).

### Resource file example

Let's look at an example of how you might construct a resources file
(in CoffeeScript for brevity):

    exports.resources = (action, knit, log) ->
      resources =
        '/': (s) -> s.endWithMime('<h1>Hello, Stranger!</h1>', "text/html")
        'hello.txt': (s) -> s.end('Hello, Knit!')

      if action == 'write'
        resources['/index.html'] = resources['/']
        delete resources['/']

    # Server settings
    exports.server = (action, knit, log) ->
      config =
        port: Number(knit?.port or 8080)
        host: '127.0.0.1'
        proxyPort: 8000
        proxyHost: '127.0.0.1'
      config

    # Writer settings
    exports.writer = (action, knit, log) ->
      config =
        root: knit?.buildDir ? './build' # Set build folder if not specified
        overwrite: true # Replace existing files
        makeDirs: true # Create intermediate dirs if they don't exist
      config

First, we see that you should export your resources function as
`exports.resources`. We can then change the paths depending on whether
we are writing or serving the resources by looking at `action`. In
addition, we can set options for the server and writer. In this case
we can set the writer root on the command-line with:

    $ knit write --buildDir=./lego

### Command line parameters

Knit allows you to use (almost) arbitrary command line parameters to
control the behaviour of your resource file. For example,

    $ knit serve myresources hello --no-obscure --port=8000 --compress -a

will set the global `knit` object to:

    { 'args':     ['hello'],
      'obscure':  false,
      'compress': true,
      'a':        true,
      'port':     '8000' }

It is worth reiterating that there is nothing special about the
command line parameters above. You make use of them as you see fit in
your resource file. `--help`, `--version`, `--args`, and are reserved
for use by Knit.

`--args` is reserved for making positional arguments available to
resource files. Note that the first positional argument after the
command is interpreted as a resource module name so positional
arguments only make sense when explicitly specifying a resource module
name.

### Logging

Resource files can use the `log`
[Winston](https://github.com/flatiron/winston) logger with `syslog`
levels.

### Options for `server`

Override standard server options by returning them from the
`exports.server` function in the resource file. The following options
are available:

* `port` (`8081`): Knit port
* `host` (`127.0.0.1`): Knit hostname
* `proxyPort` (`8080`): Port of server Knit will proxy to
* `proxyHost` (`127.0.0.1`): Hostname of server Knit will proxy to

### Options for `writer`

Override standard writer options by returning them from the
`exports.writer` function in the resource file. The following options
are available:

* `root` (`.`): What directory should we write resources to?
* `overwrite` (`false`): Should we replace existing files?
* `makeDirs` (`true`): Should we create intermediate dirs if they don't exist?
