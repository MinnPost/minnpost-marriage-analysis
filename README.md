# MN Marriage Analysis

A look at marriages in Minnesota, specifically given the new same-sex marriage laws.

## Data

Data for this project was gathered through Data Practices Act request from individual counties, including:

* Hennepin County
    * The following was noted about the data from Hennepin County: "Thanks for your patience as we’ve reviewed your question.  We do not believe the data file we provided should have included any data about names after marriage prior to August, 1975.  Specifically, we believe that the County did not include a “name after marriage” field on its marriage license application until August 1, 1975.  Accordingly, we did not start collecting data about names after marriage until that time.  We are unable to explain why the electronic file we provided to you includes names after marriage before that date.  That file was extracted from a mainframe computer which is no longer in use.  It is possible that those names appear as a result of an error or limitation in entering data into the old mainframe; we simply cannot be sure.  However, we believe any data prior to 1975 about names after marriage is not valid."
* Ramsey County

### MOMS

The [Minnesota Association of County Officers](http://www.mncounty.org/) (MACO) runs the Minnesota [Official Marriage System](http://www.mncounty.com/) (MOMS) which collects basic information on all marriage certificates across the state.  Their [terms](http://www.mncounty.com/Modules/Certificates/Marriage/terms.htm) specifically disallow web scraping.  It is also unknown if the organization is supposed to follow the DPA laws as it is not a government agency, and attempts to contact them have not been answered.

## Data processing

The following describes how the data was processed and is not necessarily needed to run or install the application, but more included for reference, transparency, and development.

1. Get datasets.  These could be large.
    * `mkdir -p data/hennepin-county/ && mkdir -p data/ramsey-county/`
    * `wget -c -O data/hennepin-county/orig-hennepin-18500101-20111115.txt https://s3.amazonaws.com/data.minnpost/projects/minnpost-marriage-analysis/original_data/hennepin-county/MARRIAGP.TXT`
    * `wget -c -O data/ramsey-county/orig-marriages.csv https://s3.amazonaws.com/data.minnpost/projects/minnpost-marriage-analysis/original_data/ramsey-county/marriage.csv`
    * `wget -c -O data/ramsey-county/orig-officiators.csv https://s3.amazonaws.com/data.minnpost/projects/minnpost-marriage-analysis/original_data/ramsey-county/officiator2.csv`
    * `wget -c -O data/ramsey-county/orig-witnesseses.csv https://s3.amazonaws.com/data.minnpost/projects/minnpost-marriage-analysis/original_data/ramsey-county/witnesses.csv`
    * `wget -c -O data/orig-open-gender-tracking-us-names.csv https://raw.github.com/OpenGenderTracking/globalnamedata/master/assets/usprocessed.csv`
1. Setup a Postgres database named `mn_marriage`.
1. Run `node data-processing/import-db.js`.  You may need to update the connection string in this file.

## Development and running locally

### Prerequisites

All commands are assumed to on the [command line](http://en.wikipedia.org/wiki/Command-line_interface), often called the Terminal, unless otherwise noted.  The following will install technologies needed for the other steps and will only needed to be run once on your computer so there is a good chance you already have these technologies on your computer.

1. Install [Git](http://git-scm.com/).
   * On a Mac, install [Homebrew](http://brew.sh/), then do: `brew install git`.
1. Install [NodeJS](http://nodejs.org/).
   * On a Mac, do: `brew install node`.
1. Install [Grunt](http://gruntjs.com/): `npm install -g grunt-cli`
1. Install [Bower](http://bower.io/): `npm install -g bower` 
1. Install [Ruby](http://www.ruby-lang.org/en/downloads/), though it is probably already installed on your system.
1. Install [Bundler](http://gembundler.com/): `gem install bundler` 
1. Install [Sass](http://sass-lang.com/): `gem install sass`

### Get code and install packages

Get the code for this project and install the necessary dependency libraries and packages.

1. Check out this code with [Git](http://git-scm.com/): `git clone https://github.com/MinnPost/minnpost-marriage-analysis.git`
1. Go into the template directory: `cd minnpost-marriage-analysis`
1. Install NodeJS packages: `npm install`
1. Install Bower components: `bower install`

### Running

* Run: `grunt server`
   * This will run a local webserver for development and you can view the application in your web browser at [http://localhost:8899](http://localhost:8899).
    * Utilize `index.html` for development, while `index-deploy.html` is used for the deployed version, and `index-build.html` is used to test the build before deployment.
    * The server runs `grunt watch` which will watch for linting JS files and compiling SASS.  If you have your own webserver, feel free to use that with just this command.

### Build

To build or compile all the assets together for easy and efficient deployment, do the following.  It will create all the files in the `dist/` folder.

1. Run: `grunt`

### Deploy

Deploying will push the relevant files up to Amazon's AWS S3 so that they can be easily referenced on the MinnPost site.  This is specific to MinnPost, and your deployment might be different.

1. Run: `grunt mp-deploy`


