const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

//--THIS IS FOR EASIER JSON CLEANUP BY RESTARTING SERVER--/
// initial guest data
const initialGuestData = [
  {
    "id": "1",
    "username": "Pam",
    "country": "Anguilla",
    "date": "Thu Feb 22 2007 22:28:32 GMT+0200 (FLE Standard Time)",
    "message": "How are you guys doing?"
  },
  {
    "id": "2",
    "username": "Sofia",
    "country": "Macau",
    "date": "Mon Apr 05 1993 09:12:01 GMT+0300 (FLE Daylight Time)",
    "message": "Hello world!"
  },
  {
    "id": "3",
    "username": "Ashley",
    "country": "Mauritania",
    "date": "Sat Oct 19 1991 01:31:38 GMT+0300 (FLE Daylight Time)",
    "message": "Greetings from Mauritania!"
  },
  {
    "id": "4",
    "username": "Baxter",
    "country": "Malta",
    "date": "Sat Sep 03 2005 08:52:38 GMT+0300 (FLE Daylight Time)",
    "message": "Very nice!"
  },
  {
    "id": "5",
    "username": "Vickie",
    "country": "Uganda",
    "date": "Tue Jul 22 2003 08:53:21 GMT+0300 (FLE Daylight Time)",
    "message": "Anyone from Africa here?"
  }
];

// overwrite guestData.json on server start
fs.writeFileSync("guestData.json", JSON.stringify(initialGuestData));
console.log("guestData.json overwritten")
//--JSON CLEANUP END--//


const app = express();
const port = 3000;

// JSON load
const guestData = JSON.parse(fs.readFileSync("guestData.json"));

// static files from public directory
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// EJS view engine setup
app.set("view engine", "ejs");
app.set("views", "./views");


// Routes setup //

// "/"-route = home
app.get("/", (req, res) => {
  const pageData = {
    pageTitle: "Home",
    guestData: guestData
  };

  // choose a random guestbook entry to display on the homepage
  const rng = Math.floor(Math.random() * guestData.length);
  pageData.randomEntry = guestData[rng];

  console.log("Rendering home page...");
  res.render("pages/index", pageData);
});

// "/guestbook"-route
app.get("/guestbook", (req, res) => {
  const pageData = {
    pageTitle: "Guestbook",
    guestData: guestData
  };
  console.log("Rendering guestbook page...");
  res.render("pages/guestbook", pageData);
});

// "/newmessage"-route
app.route("/newmessage")
  .get((req, res) => {
    console.log("Rendering newmessage page...");
    res.render("pages/newmessage", { pageTitle: "New Message" });
  })
  .post((req, res) => {
    // get form data from request body
    const { username, country, message } = req.body;

    // check that all fields are filled out
    if (!username || !country || !message) {
      return res.status(400).send("All fields are required.");
    }

    // create a new entry object with the data
    const newEntry = {
      id: guestData.length + 1,
      username: username,
      country: country,
      message: message,
      date: new Date().toISOString(),
    };

    // add the new entry to the guestData array
    guestData.push(newEntry);

    // save the updated guestData array to the JSON file
    fs.writeFileSync("guestData.json", JSON.stringify(guestData));

    // redirect to the guestbook page to see the new entry
    res.redirect("/guestbook");
  });


// "/ajaxmessage"-route
app.route("/ajaxmessage")
  .get((req, res) => {
    const pageData = {
      pageTitle: "Ajax Message",
      guestData: guestData
    };
    console.log("Rendering ajaxmessage page...");
    res.render("pages/ajaxmessage", pageData);
  })
  .post((req, res) => {
    // get form data from request body
    const { username, country, message } = req.body;

    // check that all fields are filled out
    if (!username || !country || !message) {
      return res.status(400).send("All fields are required.");
    }

    // create a new entry object with the data
    const newEntry = {
      id: guestData.length + 1,
      username,
      country,
      message,
      date: new Date().toISOString()
    };

    // add the new entry to the guestData array
    guestData.push(newEntry);

    // save the updated guestData array to the JSON file
    fs.writeFile("guestData.json", JSON.stringify(guestData), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
      }
      res.json(guestData);
    });
  });

app.listen(port, () => {
  console.log("Server is now ON => port " + port);
});