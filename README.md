# top5000

This source code probably won't be useful as it requires a local mySQL install and a matching database setup. However, I feel it serves as a good way to work around some problems I've had with await/sync, while I attempt to use try/then syntax. 

## Setup

The setup is simple: create a CLI node.js app using Inquirer as a primitive interface to query a mySQL db called _top_songsdb_ containing a table called _top5000_ with the following schema

* id      smallint      PK
* artist  varchar(100)
* name    varchar(100)
* year    smallint
* ... (some other fields that won't be queried)

## Program Layout

Program consist of one main loop: choose among four functions:

```
Get songs by a particular artist
Get songs by a particular name (with wildcards)
See artists with multiple top 5000 hits
See hits between specified ID range
````

With database of 5000 songs the results can be long. But this is mainly a learning tool for interface between node.js and MySQL, so UI is not a high priority. 

To get songs by a particular artist, simply enter artist's name, such as "lionel richie" or "adele". Capitalization doesn't actually matter. If you enter _Adele_ this would be the output.

```
getSongsByArtist \[Adele\]
---5 records found---
Adele | Rolling In The Deep | 2011
Adele | Someone Like You | 2011
Adele | Skyfall | 2012
Adele | Set Fire To The Rain | 2011
Adele | Chasing Pavements | 2008
---5 records sown---
```

To get songs by name, with wildcards, simply enter a word that is in the title, or even a partial word. I entered _hello_, and I got... 

```
getSongsByName \[hello\]
---8 records found---
The Beatles | Hello, Goodbye | 1967
Lionel Richie | Hello | 1984
Ricky Nelson | Hello Mary Lou | 1961
Louis Armstrong | Hello Dolly | 1964
The Doors | Hello, I Love You, Won't You Tell Me Your Name? | 1968
Todd Rundgren | Hello It's Me | 1973
Mouth & MacNeal | Hello-A | 1972
Allan Sherman | Hello Muddah Hello Faddah | 1963
---8 records shown---
```

Third choice is a bit long, but it's EVERY artist who had more than one song on the top5000 db. Turns out, there are almost 800 of them, so I won't show you the whole result set, just the last few lines. 

```
...
Muddy Waters | 2
Paramore | 2
The Delfonics | 2
The Dovells | 2
New Edition | 2
Junior Walker & The All-Stars | 2
Jack Scott | 2
---783 records shown---
```

A bit before my time, I think. But really, who knew that *Madonna* tops the chart of most songs in Top 5000 at 49? Even *the Beatles* only have 44...  

Finally, the final choice simply lets you see a range, from x to y. If you were to ask for 1000 to 1020, you'd get...

```
getSongsByIdRange \[1000,1020\]
---21 records found---
Rihanna | Diamonds | 2012
Les Paul & Mary Ford | Mockin' Bird Hill | 1951
Chris Brown | Forever | 2008
Eddy Grant | Electric Avenue | 1983
The Sugababes | Push the Button | 2005
Mariah Carey | All I Want For Christmas is You | 1995
Colbie Caillat | Bubbly | 2007
Desmond Dekker | Israelites | 1969
The Temptations | Papa Was a Rolling Stone | 1972
The Pretenders | Brass In Pocket (I'm Special) | 1980
Kay Kyser | On a Slow Boat to China | 1948
Maroon 5 | Makes Me Wonder | 2007
Hall & Oates | I Can't Go For That (No Can Do) | 1982
The Police | Every Little Thing She Does is Magic | 1981
The New Radicals | You Get What You Give | 1999
The Turtles | Happy Together | 1967
Mr Mister | Broken Wings | 1985
Bessie Smith | Down Hearted Blues | 1923
Jefferson Starship | We Built This City | 1985
Olivia Newton-John | Hopelessly Devoted to You | 1978
Britney Spears | Gimme More | 2007
---21 records shown---
```


## SQL Connection Problem

I originally had a single connection declare at the beginning, then close the connection at the end of run. However, I was getting some weird error like "query after end" or something like that. After reading up the error, it really made no sense, as I never tried to close the connection. I searched the entire length of code, and there was only one open connection, and one _connection.end()_

In the end, I chose to rewrite the program and made it easier to open a new connection, open as close to use as possible, and immediately close it after I get the result. I put the SQL connection in a separate function called _getSQLConnection()_ (lines 4-13). I call it when I need it (ex: line 37), run a query on line 40, display the results, and close the connection on line 47. I never saw the error again, so I conclude this may be the better/best practice to use MySQL connections, unless I want to look deper into connection pooling. 

## Technical Minutiae

For simplicity, I did not use async/await here. Instead, a .then() syntax is used which helps keep the logic blocks together. A function calls inquirer with the prompt block, then proceeds to run the matching query function. 

For example, in the function _enterSongName()_, after the prompt, the .then() block calls _getSongsByName()_ with the answer from the prompt block. 

The query function, such as _getSongsByName()_ then opens the connection, runs the query, displays the results, and close the connection. 

```
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
```

doMainLoop() just jumps back into the mainLoop to ask the main menu again. There's a choice there to exit the program peacefully. 

## Author

👤 **Kasey Chang**

* Website: https://www.linkedin.com/in/kasey-chang-0932b332/
* Github: [@kschang77](https://github.com/kschang77)

## Show your support

Give a ⭐️ if this project helped you!
