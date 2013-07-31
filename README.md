# MN Marriage Analysis

A look at marriages in Minnesota, specifically given the new same-sex marriage laws.

## Data

*Describe the data sources here.  Use links and URLs to show where the data came from.  Put small sized originals or modified data sources in the ```data``` folder*

*For larger data sources that may need to be processed, provide instructions on how to download.  For instance:  ```cd data && wget blah.txt```.  Also, make sure to put an entry in the ```.gitignore```.*

## Data Processing

The following describes how the data was processed and is not necessarily needed to run or install the application, but more included for reference, transparency, and development.

*Describe data processing here, include commands.  Put data processing scripts or configurations in the ```data-processing``` folder.*

## Prerequisites

1. Install [Git](http://git-scm.com/).
1. Install [NodeJS](http://nodejs.org/).
1. Optionally, for development, install [Grunt](http://gruntjs.com/): `npm install -g grunt-cli`
1. Install [Bower](http://bower.io/): `npm install -g bower` 
1. Install [Ruby](http://www.ruby-lang.org/en/downloads/), though it is probably already installed on your system.
1. Install [Bundler](http://gembundler.com/): `gem install bundler` 

1. Install [Sass](http://sass-lang.com/): `gem install sass`


## Install

1. Check out this code with [Git](http://git-scm.com/): `git clone https://github.com/MinnPost/minnpost-marriage-analysis.git`
1. Go into the template directory: `cd minnpost-marriage-analysis`
1. Install NodeJS packages: `npm install`
1. Install Bower components: `bower install` 


1. View `index.html` in your browser.

## Development

* Run: `grunt server`
   * This will run a local webserver for development and you can view the application in your web browser at [http://localhost:8899](http://localhost:8899).
    * Utilize `index.html` for development, while `index-deploy.html` is used for the deployed version, and `index-build.html` is used to test the build before deployment.
    * The server runs `grunt watch` which will watch for linting JS files and compiling SASS.  If you have your own webserver, feel free to use that with just this command.

## Build

1. Run: `grunt`

## Deploy

1. Run: `grunt mp-deploy`


