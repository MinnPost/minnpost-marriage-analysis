/**
 * Imports data into Postgres DB for further analysis.
 */
 
// Packages
var path = require('path');
var fs = require('fs');
var events = require('events');
var sys = require('sys');
var exec = require('child_process').exec;
var pg = require('pg');
var celeri = require('celeri');

// Config
var dbName = 'mn_marriage';
var dbHost = 'localhost';
var dbUser = 'postgres';
var dbPass = '';
var connection = 'postgres://' + dbUser + ':' + dbPass + '@' + dbHost + '/' + dbName;
var imports = {};

// Make the tables
function makeTables(done) {
  var client = new pg.Client(connection);
  var loading = celeri.loading('Creating and resetting Marriage table: ');
  
  var query = " \
    DROP TABLE IF EXISTS marriages; CREATE TABLE IF NOT EXISTS marriages ( \
      id SERIAL, \
      county VARCHAR(128), \
      groom_last_before VARCHAR(256), \
      groom_first_before VARCHAR(256), \
      groom_middle_before VARCHAR(256), \
      groom_suffix_before VARCHAR(256), \
      bride_last_before VARCHAR(256), \
      bride_first_before VARCHAR(256), \
      bride_middle_before VARCHAR(256), \
      groom_last_after VARCHAR(256), \
      groom_first_after VARCHAR(256), \
      groom_middle_after VARCHAR(256), \
      groom_suffix_after VARCHAR(256), \
      bride_last_after VARCHAR(256), \
      bride_first_after VARCHAR(256), \
      bride_middle_after VARCHAR(256), \
      certificate_date DATE, \
      application_date DATE, \
      file_date DATE, \
      external_id VARCHAR(512), \
      notes TEXT, \
      CONSTRAINT marriages_primary_key PRIMARY KEY (id) \
    ); \
    DROP TABLE IF EXISTS usnames; CREATE TABLE IF NOT EXISTS usnames ( \
      id SERIAL, \
      name VARCHAR(256), \
      years INT, \
      female_count INT, \
      male_count INT, \
      male_probablity FLOAT, \
      probably_gender VARCHAR(56), \
      estimated_male FLOAT, \
      upper FLOAT, \
      lower FLOAT, \
      CONSTRAINT usnames_primary_key PRIMARY KEY (id) \
    ); \
    ";
  
  client.connect(function(err) {
    if (err) {
      loading.done('Error.', false);
      return console.error('Could not connect to postgres.', err);
    }
    client.query(query, function(err, result) {
      if (err) {
        loading.done('Error.', false);
        return console.error('Error running table query.', err);
      }
      
      loading.done('Done.', true);
      client.end();
      done();
    });
  });
}

// Imports

/**
 * Import US Names with command line since
 * its already in the right format.
 */
imports.usNames = function(done) {
  var file = path.join(__dirname, '../data/orig-open-gender-tracking-us-names.csv');
  var loading = celeri.loading('Importing US Names file: ');
  var command = 'psql';
  
  command += ' -U ' + dbUser;
  command += ' -h ' + dbHost;
  command += (dbPass) ? ' -p ' : '';
  command += ' ' + dbName;
  command += ' -c "COPY usnames (name, years, female_count, male_count, male_probablity, probably_gender, estimated_male, upper, lower) FROM \'' + file + '\' CSV HEADER"';
  
  exec(command, function(error, stdout, stderr) {
    if (error) {
      loading.done('Error with US Names import.', false);
      return;
    }
    
    loading.done('Done.', true);
    done();
  });
};


/**
 * Hennepin imports.  The following was sent with data
 *
 * G (System) (this column can be ignored)
 * Groom Last Before
 * Groom First Before
 * Groom Middle Before
 * Bride Last Before
 * Bride First Before
 * Bride Middle Before
 * Groom Last After
 * Groom First After
 * Groom Middle After
 * Bride Last After
 * Bride First After
 * Bride Middle After
 * Certificate Date
 * Application Date
 * File Date
 * Internal Use (three columns)
 * 
 * There should be 829147 rows in the file.
 */
imports.hennepin = function(done) {
  var client = new pg.Client(connection);
  var file = path.join(__dirname, '../data/orig-hennepin-18500101-20111115.txt');
  var stream;
  var columnsWidths = [1, 39, 15, 15, 39, 15, 15, 39, 15, 15, 39, 15, 15, 10, 10, 10, 33, 1, 26];
  var readCount = 0;
  var writeCount = 0;
  var multiQuery = '';
  
  // Mark progress
  celeri.progress('Reading Hennepin file: ', 0);
  
  // DB connect
  client.connect(function(err) {
    if (err) {
      fileLoading.done('Error.', false);
      return console.error('Could not connect to postgres.', err);
    }
    
    // Start reading in the data
    stream = lineifyStream(fs.createReadStream(file));
    stream.on('line', function(line) {
      var fields = [];
      var c = 0;
      var query, parts;
    
      // Fixed width file.  Each line should be 369 characters wide
      // and each field is variable fixed width.  :(
      if (line.length != 367) {
        console.log('Line length is off (' + line.length + '): ' + line);
        return;
      }
      
      columnsWidths.forEach(function(w) {
        fields.push(line.substring(c, c + w).trim());
        c = c + w;
      });
      
      // Muck up array so that it easier to write query
      fields.shift();
      fields[16] = fields[16] + '||' + fields[17];
      fields.pop();
      
      // Suffixes :(
      [0, 6].forEach(function(f) {
        parts = fields[f].split(' ');
        if (parts.length > 1 && ['JR', 'SR', 'II', 'III'].indexOf(parts[parts.length - 1]) >= 0) {
          fields.push(parts[parts.length - 1]);
          parts.pop();
          fields[f] = parts.join(' ');
        }
        else {
          fields.push('');
        }
      });
      
      // Format array for query
      fields = fields.map(function(f) {
        return "'" + f.replace("'", "''") + "'";
      });
      fields[12] = "to_date(" + fields[12] + ", 'MM/DD/YYYY')";
      fields[13] = "to_date(" + fields[13] + ", 'MM/DD/YYYY')";
      fields[14] = "to_date(" + fields[14] + ", 'MM/DD/YYYY')";
      
      // Great array
      query = "INSERT INTO marriages (county, \
        groom_last_before, groom_first_before, groom_middle_before, \
        bride_last_before, bride_first_before, bride_middle_before, \
        groom_last_after, groom_first_after, groom_middle_after, \
        bride_last_after, bride_first_after, bride_middle_after, \
        certificate_date, application_date, file_date, \
        external_id, notes, groom_suffix_before, groom_suffix_after \
        ) VALUES ('hennepin', " + fields.join(', ') + ")";
      
      // We only want to do a bulk insert every so often
      multiQuery += query + '; ';
      readCount++;
      
      if (readCount % 100 === 0) {
        // Mark progress
        celeri.progress('Reading Hennepin file: ', (readCount / 829100 * 100).toFixed(2));
      
        (function(readCount) {
          client.query(multiQuery, function(err, result) {
            if (err) {
              // Try again.  For some reason things fail out and give
              // syntax error even those there are none, occasionally.
              client.query(multiQuery, function(err, result) {
                if (err) {
                  console.error('Error inserting data with query: ' + multiQuery, err);
                }
              });
            }
            writeCount = readCount;
          });
          multiQuery = '';
        })(readCount);
      }
    });
    
    stream.on('end', function() {
      var interval;
      var pastWriteCount = 0;
      celeri.progress('Reading Hennepin file: ', 100);
      celeri.progress('Writing Hennepin data to DB: ', (writeCount / readCount * 100).toFixed(2));
    
      // More than likely the output into the DB will take much
      // longer than the file reading, so we just pool to see
      // when its done as there does not seem to be
      if (writeCount != readCount) {
        interval = setInterval(function() {
          if (writeCount >= readCount || writeCount === pastWriteCount) {
            // Need to write out the last query
            client.query(multiQuery, function(err, result) {
              if (err) {
                return console.error('Error inserting data with query: ' + multiQuery, err);
              }
            
              celeri.progress('Writing Hennepin data to DB: ', 100);
              done();
              client.end();
            });
            clearInterval(interval);
          }
          
          pastWriteCount = writeCount;
          celeri.progress('Writing Hennepin data to DB: ', (writeCount / readCount * 100).toFixed(2));
        }, 1000);
      }
    });
  });
};

// Make read streams handle by line
function lineifyStream(stream) {
  stream.lineBuffer = '';
  //stream.liner = new events.EventEmitter();
  
  stream.on('data', function(chunk) {
    var lines, l;
    chunk = stream.lineBuffer + chunk.toString();
    lines = chunk.split(/\r\n|\r|\n/g);
    
    // Just add to buffer 
    if (lines.length === 1) {
      stream.lineBuffer += lines[0];
    }
    else {
      for (l = 0; l < lines.length - 1; l ++) {
        if (lines[l] !== '' && lines[l].length != 0) {
          stream.emit('line', lines[l]);
        }
      };
      
      // Make the last line the new buffer
      stream.lineBuffer = lines[lines.length - 1];
    }
  });
  stream.on('end', function() {
    // Output the last of the buffer
    stream.emit('line', stream.lineBuffer);
  });
  
  return stream;
}

// Run app
makeTables(function() {
  imports.usNames(function() {
    imports.hennepin(function() {
      console.log('Done.');
    });
  });
});