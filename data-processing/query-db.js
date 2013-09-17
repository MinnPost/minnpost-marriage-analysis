/**
 * Some querying of the data
 */
 
// Packages
var pg = require('pg');
var celeri = require('celeri');

// Config
var connection = 'postgres://postgres:@localhost/mn_marriage';

function queries(done) {
  var client = new pg.Client(connection);
  var tableResults = [];
  var loading = celeri.loading('Running queries: ');
  var queryFragments = {};
  var queries = {};
  var results = {};
  var queriesFinished = 0;
  
  /*
  SELECT
  EXTRACT(YEAR FROM m.certificate_date) AS year,
  EXTRACT(YEAR FROM m.certificate_date) || '-01-01' AS year_date,
  COUNT(m.*) AS stat,
  t.stat AS total,
  (COUNT(m.*)::float / t.stat::float) AS percent_dec,
  (COUNT(m.*)::float / t.stat::float) * 100 AS percent
FROM 
  marriages AS m
  JOIN (
    SELECT
      EXTRACT(YEAR FROM certificate_date) AS year,
      COUNT(*) AS stat
    FROM 
      marriages
    WHERE
      EXTRACT(YEAR FROM certificate_date) > 0
    GROUP BY 
      year
    ORDER BY
      year
  ) AS T
  ON EXTRACT(YEAR FROM m.certificate_date) = t.year
WHERE 
  m.bride_last_before <> m.bride_last_after
  AND m.groom_last_before <> m.bride_last_before
  AND year > 0
GROUP BY 
  EXTRACT(YEAR FROM m.certificate_date),
  t.stat
ORDER BY
  year
	
	*/
  
  // Queries
  queries.total = "SELECT COUNT(*) AS stat FROM marriages";
  queries.stats = [];
  queries.stats.push({
    name: 'Groom change last name',
    query: "SELECT COUNT(*) AS stat FROM marriages WHERE groom_last_before <> groom_last_after"
  });
  queries.stats.push({
    name: 'Bride change last name',
    query: "SELECT COUNT(*) AS stat FROM marriages WHERE bride_last_before <> bride_last_after"
  });
  
  // Connect to DB
  client.connect(function(err) {
    if (err) {
      loading.done('Error on connection.', false);
      return console.error('Could not connect to postgres.', err);
    }
    
    // Get total first
    query(client, queries.total, loading, function(err, result) {
      results.total = result.rows[0].stat;
      tableResults.push({
        metric: 'Total', 
        value: results.total,
        percent: 100 + '%'
      });
      
      // Run through other queries
      queries.stats.forEach(function(q) {
        query(client, q.query, loading, function(err, result) {
          queriesFinished++;
          tableResults.push({
            metric: q.name, 
            value: result.rows[0].stat,
            percent: (result.rows[0].stat / results.total * 100).toFixed(2) + '%'
          });
      
          if (queriesFinished === queries.stats.length) {
            done(client, loading, tableResults);
          }
        });
      });
    });
  });
}

// A little abstraction around running queries
function query(client, query, loading, done) {
  client.query(query, function(err, result) {
    if (err) {
      if (loading) {
        loading.done('Query error.', false);
      }
      return console.error('Error running query: ' + query, err);
    }
    done(err, result);
  });
}

queries(function(client, loading, tableResults) {
  client.end();
  loading.done('Done.', true);
  console.log('===========================');
  celeri.drawTable(tableResults.reverse(), {
    columns: ['metric', 'value', 'percent']
  });
  console.log('===========================');
});