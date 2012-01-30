Knit
====

Knit is a lightweight and flexible development server and builder for
static resources. The server proxies requests not matching static
resources to some other backend server. Knit is highly configurable
using plain JavaScript or CoffeeScript.

*Please note that Knit does not yet come with any interesting
 handlers. Though these are easy to write, you will have to write them
 yourself for now.*

Example usage
-------------

Simple (not particularly useful) example:

    myapp
    `-- knit.coffee

with `knit.coffee` containing

    exports.routes =
      '/': (put) -> put('This is the data', 'text/plain')
      '/favicon.ico': (put) -> put('This is the data', 'image/vnd.microsoft.icon')
      'robots.txt': (put) -> put('User-agent: *\nDisallow: /', 'text/plain')

then

    $ cd myapp
    $ knit serve

will serve this on `http://localhost:8081/`, proxying everything but
the specified resources to `http://localhost:8080/`.

We can also write the resources to files (for deployment for example):

    $ knit write

which writes the resources (excluding directory resources) to the
current directory (which of course is configurable):

    myapp
    |-- knit.coffee
    |-- favicon.ico
    `-- robots.txt

The `knit.coffee` file is a normal CoffeeScript file that exports a
'routes' object associating resource paths with a handler function:

    handler (callback) {
        // Generate resource data and mimetype
        callback(data, mimetype)
    }

A companion package will be published later providing common handlers
for Jade, Less, and serving directory trees, for example.

Alternative explanation
-----------------------

Put differently, Knit overlays your normal development webserver,
capturing requests for static content, recompiling it, serving it, and
proxying other requests.

Installation
------------

Installation requires
[node.js](https://github.com/joyent/node/wiki/Installation) and
[npm](http://npmjs.org/) and can then be accomplished with

    git clone git://github.com/cbaatz/knit.git
    cd knit
    npm install -g

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
Knit simply re-reads the config synchronously on each request. Does
that make reloads incredibly slow? Personally I don't notice any
particular lag as long as compression of JavaScript resources is
turned off. Your milage may vary.

Configuration
-------------

Knit allows you to specify compilation options dependent on whether we
are serving or writing content. In fact, Knit allows you to *invent
your own* command-line parameters. Knit config files are normal
JavaScript or CoffeeScript that get access to a global `knit` object
containing the parameter values. Thus, you have incredible flexibility
for how to construct the `routes` object that defines your resources.

Knit looks for a JavaScript or CoffeeScript `knit` or `.knit` node.js
module in the base directory (current by default). That is, it looks
for one of `knit.coffee`, `knit.js`, `.knit.coffee`, or `.knit.js`. It
is up to you whether you prefer to write the config file in JavaScript
or CoffeeScript.

### Example

Let's look at an example to highlight some of the configuration
features:

    exports.routes =
      '/': (put) -> put('<h1>Hello, Stranger!</h1>', "text/html")
      'hello.js': (put) -> put('alert("Hello, Knit!")', "application/javascript")

    if knit.action == 'write'
      exports.routes['/index.html'] = exports.routes['/']
      delete exports.routes['/']

    # Server settings
    exports.server =
      port: Number(knit?.port or 8080)
      host: '127.0.0.1'
      proxyPort: 8000
      proxyHost: '127.0.0.1'

    # Writer settings
    exports.writer =
      root: knit?.buildDir ? './build' # Set build folder if not specified
      overwrite: true # Replace existing files
      makeDirs: true # Create intermediate dirs if they don't exist

First, we see that `routes` is an exported object whose keys identify
resources and the values are handler functions that take a callback
that should be passed the data and mime-type for that resource.

We use the global `knit` object with our configuration parameters to
change the index resource from `/` to `/index.html` if we are building
to disk.

We also set server and writer options. The way we have written this
config file, the writer root can be specified with a command-line
parameter:

    $ knit write --buildDir=./lego

When we do this, Knit gives the global `knit` object a field
`buildDir` with the value `./lego`. This is explained in more detail
below.

### Command line parameters

Knit allows you to use (almost) arbitrary command line parameters to
control the behaviour of your config file. For example,

    $ knit serve --no-obscure --port=8000 --compress -a

will set the global `knit` object to:

    { 'action':   'serve',
      'obscure':  false,
      'compress': true,
      'a':        true,
      'port':     '8000' }

It is worth reiterating that there is nothing special about the
command line parameters above. You make use of them as you see fit in
your config file. Only `--help`, `--version`, `--action`, and
`--dir=DIR` are reserved for use by Knit.

`--action` is reserved because `knit.action` is set to `serve` or
`write` depending on the action specified.

`--dir=DIR` is reserved for specifying the directory Knit should use
as its base directory (the directory with your config file).

### Options for `server`

Server options are set by setting properties of `exports.server` in
the config file. The following options are available:

* `port` (`8081`): Knit port
* `host` (`127.0.0.1`): Knit hostname
* `proxyPort` (`8080`): Port of server Knit will proxy to
* `proxyHost` (`127.0.0.1`): Hostname of server Knit will proxy to

### Options for `writer`

Writer options are set by setting properties of `exports.writer` in
the base configuration file. The following options are available:

* `root` (`.`): What directory should we write resources to?
* `overwrite` (`false`): Should we replace existing files?
* `makeDirs` (`true`): Should we create intermediate dirs if they don't exist?
