# MN Marriage Analysis

A look at marriages in Minnesota, specifically given the new same-sex marriage laws.

## Data

Data for this project was gathered through Data Practices Act request from individual counties, including:

* Hennepin County

### MOMS

The [Minnesota Association of County Officers](http://www.mncounty.org/) (MACO) runs the Minnesota [Official Marriage System](http://www.mncounty.com/) (MOMS) which collects basic information on all marriage certificates across the state.  Their [terms](http://www.mncounty.com/Modules/Certificates/Marriage/terms.htm) specifically disallow web scraping.  It is also unknown if the organization is supposed to follow the DPA laws as it is not a government agency, and attempts to contact them have not been answered.

## Data Processing

The following describes how the data was processed and is not necessarily needed to run or install the application, but more included for reference, transparency, and development.

(coming soon)

## PrerequisitesAll commands are assumed to on the [command line](http://en.wikipedia.org/wiki/Command-line_interface), often called the Terminal, unless otherwise noted.

1. Install [Git](http://git-scm.com/).
   * On a Mac, install [Homebrew](http://brew.sh/), then do: `brew install git`.
1. Install [NodeJS](http://nodejs.org/).
   * On a Mac, do: `brew install node`.
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

## Development and Running Locally

* Run: `grunt server`
   * This will run a local webserver for development and you can view the application in your web browser at [http://localhost:8899](http://localhost:8899).
    * Utilize `index.html` for development, while `index-deploy.html` is used for the deployed version, and `index-build.html` is used to test the build before deployment.
    * The server runs `grunt watch` which will watch for linting JS files and compiling SASS.  If you have your own webserver, feel free to use that with just this command.

## Build

1. Run: `grunt`

## Deploy

1. Run: `grunt mp-deploy`


