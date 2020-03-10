const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const Sentiment = require("sentiment");
const sentiment = new Sentiment();

const spawn = require("child_process").spawn;
const fs = require("fs");
require("./db/mongoose");
const User = require("./models/user");

// console.log(scoref);
// console.log(typeof [1, 2, 3]);

// });
// pythonProcess.stderr.pipe(process.stderr);

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

const app = express();

const publicDirectoryPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../views");

app.set("view engine", "hbs");
app.set("views", viewsPath);

app.use(express.static(publicDirectoryPath));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/signin", (req, res) => {
  res.render("signin");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  console.log(req.body);
  const user = new User(req.body);
  try {
    await user.save();
    console.log(user);
    res.render("sentiment", {
      noUser: "",
      firstName: "Welcome, " + req.body.firstName + "!"
    });
  } catch (e) {
    console.log(e);
    res.render("signupWrong");
  }
});

app.post("/signin", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    res.render("sentiment", {
      noUser: "",
      firstName: "Welcome, " + user.firstName + "!"
    });
  } catch (e) {
    console.log(e);
    res.render("signinWrong");
  }
});
app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/features", (req, res) => {
  res.render("features");
});

app.post("/keyword", (req, res) => {
  try {
    const keyword = req.body.key;
    console.log(keyword);
    // setTimeout(() => {
    if (!fs.existsSync("uploads/" + keyword + ".txt")) {
      console.log("hello");
      const pythonProcess = spawn("python", [
        "E:/Class/Mini-Project/sentiment-analysis/py/Sentiment.py",
        keyword
      ]);
      pythonProcess.stdout.on("data", async data => {
        let dataArray = JSON.stringify(data.toString());
        console.log(dataArray);
      });
      pythonProcess.stderr.pipe(process.stderr);
    }
    // }, 3000);

    // }, 3000);

    // const analysis = require("./sentimentAnalysis");

    let scoref = 0;
    let count = 0;
    let negCount = 0;
    let posCount = 0;
    let neuCount = 0;
    setTimeout(() => {
      try {
        let lineReader = require("readline").createInterface({
          input: require("fs").createReadStream("uploads/" + keyword + ".txt")
        });
        lineReader.on("line", line => {
          console.log(line);
          // console.log("Line from file:", line);
          let result = sentiment.analyze(line);
          scoref += result.score;
          if (result.score < 0) {
            negCount++;
          } else if (result.score > 0) {
            posCount++;
          } else {
            neuCount++;
          }
          count++;
          // await console.log(scoref);
        });
      } catch (e) {
        console.log(e);
        res.render("error");
      }

      setTimeout(() => {
        console.log(`Score: ${scoref}`);
        scoref = `Score: ${scoref}`;
        let negPercentage = `Negative: ${(negCount / count) * 100}%`;
        console.log(`Percentage: ${negPercentage}% Negative`);
        let posPercentage = `Positive: ${(posCount / count) * 100}%`;
        console.log(`Percentage: ${posPercentage}% Positive`);
        let neuPercentage = `Neutral: ${(neuCount / count) * 100}%`;
        console.log(`Percentage: ${neuPercentage}% Neutral`);
        res.render("sentiment", {
          scoref,
          negPercentage,
          posPercentage,
          neuPercentage
        });
      }, 6000);
    }, 7000);
  } catch (e) {
    console.log(e);
    res.render("error");
  }
});
app.post("/file", upload.single("tweets"), (req, res) => {
  console.log(req.file);
  const fileName = req.file.filename;
  let scoref = 0;
  let count = 0;
  let negCount = 0;
  let posCount = 0;
  let neuCount = 0;
  setTimeout(() => {
    try {
      let lineReader = require("readline").createInterface({
        input: require("fs").createReadStream("uploads/" + fileName)
      });
      lineReader.on("line", line => {
        console.log(line);
        // console.log("Line from file:", line);
        let result = sentiment.analyze(line);
        scoref += result.score;
        if (result.score < 0) {
          negCount++;
        } else if (result.score > 0) {
          posCount++;
        } else {
          neuCount++;
        }
        count++;
        // await console.log(scoref);
      });
    } catch (e) {
      console.log(e);
      res.render("error");
    }

    setTimeout(() => {
      console.log(`Score: ${scoref}`);
      scoref = `Score: ${scoref}`;
      let negPercentage = `Negative: ${(negCount / count) * 100}%`;
      console.log(`Percentage: ${negPercentage}% Negative`);
      let posPercentage = `Positive: ${(posCount / count) * 100}%`;
      console.log(`Percentage: ${posPercentage}% Positive`);
      let neuPercentage = `Neutral: ${(neuCount / count) * 100}%`;
      console.log(`Percentage: ${neuPercentage}% Neutral`);
      res.render("sentiment", {
        scoref,
        negPercentage,
        posPercentage,
        neuPercentage
      });
    }, 6000);
  }, 7000);
});
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
