var mysql = require("mysql");
var inquirer = require("inquirer")

function getSQLConnection() {
  var params = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "top_songsdb"
  }
  return mysql.createConnection(params);
}

doMainLoop();


function validateNonBlank(str) {
  if (str == '') {
    return "This cannot be blank!"
  } else {
    return true
  }
}

function validateInteger(int) {
  if (Number.isInteger(Number(int))) {
    return true
  } else {
    return "That is not an integer!"
  }
}


function getSongsByArtist(artist) {

  var connection = getSQLConnection()
  console.log("getSongsByArtist [" + artist + "]");
  queryString = "SELECT artist,name,year FROM top5000 where ?"
  connection.query(queryString, { artist: `${artist}` }, function (err, res) {
    if (err) throw err;
    console.log("---" + res.length + " records found---")
    res.forEach((row) => {
      console.log(`${row.artist} | ${row.name} | ${row.year}`);
    });
    console.log("---" + res.length + " records shown---")
    connection.end()
    doMainLoop();
  });
}

function getSongsByName(songName) {
  // console.log("Getting all songs matching name [" + songName + "]");
  console.log("getSongsByName [" + songName + "]");
  var connection = getSQLConnection()
  songName2 = "%" + songName + "%"
  connection.query(`SELECT artist,name,year FROM top5000 where name like ?`, songName2, function (err, res) {
    if (err) throw err;
    console.log("---" + res.length + " records found---")
    res.forEach((row) => {
      console.log(`${row.artist} | ${row.name} | ${row.year}`);
    });
    console.log("---" + res.length + " records shown---")
    connection.end()
    doMainLoop();
  });
}


function getRepeaters() {
  // console.log("Getting all artists with more than 10 hits");
  var connection = getSQLConnection()
  connection.query("select artist, count(*) as hits from top5000 group by artist having hits > 1 order by hits desc", function (err, res) {
    if (err) throw err;
    // console.log(res)
    console.log("---" + res.length + " records found---")
    res.forEach((row) => {
      console.log(`${row.artist} | ${row.hits} `);
    });
    console.log("---" + res.length + " records shown---")
    connection.end()
    doMainLoop();
    // console.log("---")
  });
}

function getSongsbyIdRange(id1, id2) {
  // console.log("Getting top 5000 songs between id " + id1 + " and id " + id2);
  var connection = getSQLConnection()
  console.log("getSongsByIdRange [" + id1 + "," + id2 + "]");
  connection.query("select artist, name, year from top5000 where id between ? and ?",
    [id1, id2], function (err, res) {
      if (err) throw err;
      console.log("---" + res.length + " records found---")
      res.forEach((row) => {
        console.log(`${row.artist} | ${row.name} | ${row.year}`);
      });
      console.log("---" + res.length + " records shown---")
      connection.end()
      doMainLoop();
      // console.log("---")
    });
}

function doMainLoop() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'Choose ',
        choices: ["Get songs by a particular artist",
          "Get songs by a particular name (with wildcards)",
          "See artists with multiple top 5000 hits",
          "See hits between specified ID range",
          "End Program"]
      }
    ])
    .then(function (answer) {
      switch (answer.choice) {
        case 'Get songs by a particular artist':
          enterArtist();
          break;
        case 'Get songs by a particular name (with wildcards)':
          enterSongName();
          break;
        case 'See artists with multiple top 5000 hits':
          getRepeaters();
          break;
        case 'See hits between specified ID range':
          enterRange();
          break;
        case 'End Program':
          keepGoing = false;
          process.exit(0);
      }
    });
}

function enterArtist() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "artist",
        message: "What artist are you looking for? ",
        validate: validateNonBlank
      }
    ])
    .then(function (answer) {
      // var connection = getSQLConnection();
      getSongsByArtist(answer.artist);

      // connection.end()
      return true;
    })
}

function enterRange() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "id1",
        message: "Starting position? ",
        validate: validateInteger
      },
      {
        type: "input",
        name: "id2",
        message: "Ending position? ",
        validate: validateInteger
      }
    ])
    .then(function (answer) {
      // var connection = getSQLConnection();
      getSongsbyIdRange(answer.id1, answer.id2);
      // console.log("Range query complete");
      // connection.end();
      return true;
    })
}


function enterSongName() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "songName",
        message: "What is the name of song you are looking for? ",
        validate: validateNonBlank
      }
    ])
    .then(function (answer) {
      getSongsByName(answer.songName);
      // console.log("SongName query complete");
      return true;
    })
}
