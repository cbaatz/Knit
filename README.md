Knit
====

*DEPRECATED*

*Knit has been deprecated and its use is no longer recommended. The
reasons for this are explained below.*

Knit was written to realise the idea of a local web-server that
compiles and serves local resources and proxies to a remote web-server
for anything else. Web-app assets are often generated -- from LESS to
CSS, CoffeeScript to JavaScript, or Mustache to HTML.

Synchronous (blocking) regeneration of resources by a local web-server
has advantages over traditional file-watching for development:

* In file-watching, compilation starts when the file-system detects a
  change to a source file, but the compilation may be slow and finish
  after the developer requests a page reload. This results in
  uncertainty about whether the change made had not effect or whether
  the compilation had not finished. Not good for developers.

* File-watching tools and technologies differ between operating
  systems. All source files that could affect the result must be
  watched and this list must be kept up to date.

* Loading files straight from disk without a local web-server makes
  testing apps against remote APIs impossible (same origin policy). It
  also means that headers and URLs can't be customised to reflect
  their deployed behaviour.

Why then deprecate Knit? JavaScript. Knit was written in JavaScript
because most development tools where written as node.js
libraries. Thus, it seemed reasonable to use these libraries to write
content compilers and plug these into a node.js proxy server. However,
this JavaScript bias turned out to be a costly a constraint.

In particular, it was awkward to write generators in JavaScript --
whether the underlying tools had good JavaScript APIs or not.  For
non-JavaScript tools like ImageMagick or Jinja2, there was little
benefit to using JavaScript over some other language.

Instead, Knit's successor, Knot, expects resources to be defined with
scripts executed by the shell. These simply use the file-system to
write out content and meta-data for the resources. Knot is agnostic to
what language these scripts are written in -- Bash, Python, node.js,
Ruby, or even a compiled binary.

With a choice of implementation languages for Knot, Haskell came out
on top because of its expressivity and type-safety. More details on
this approach will be given when Knot is published.

CB
