Knit
====

Knit helps you compile static resources both for serving during development and
for writing to disk for deployment.

The core idea behind Knit is that you define content generators and associate those with URLs which determine where to serve or write the compiled resources.

Installation
------------

Install in your project folder with [npm](http://npmjs.org/):

    npm install git://github.com/cbaatz/knit.git

Example use cases
-----------------

### Develop new styles for a remote blog

### Develop a static website with compiled content

### Create a command-line tool for initialising projects

Recommended Usage
-----------------

Create an executable ./knit file in CoffeeScript or JavaScript in your project
folder that uses optimist to get command line parameters that you can use to
create your own serve and build command using Knit as a library.

Logging
-------

Resource files can use the `log`
[Winston](https://github.com/flatiron/winston) logger with `syslog`
levels.

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

