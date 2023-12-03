const { PrismaClient } = require("@prisma/client");
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

//create express port listening on 3000
const app = express();
const prisma = new PrismaClient();
const port = 3000;

//create ejx view engine
app.set("view engine", "ejs");
app.set("views", "./views");

//set up multer to store images in the public/images folder
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
//set up multer to store images in the public/images folder
const upload = multer({ storage: fileStorage });

//set up body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//create a route for the root path
app.get("/", async (req, res) => {
  const allUsers = await prisma.user.findMany();
  let user = res.json(allUsers);
});

//takes you to the add page
app.get("/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/HTML/add.html"));
});

//after you submit it adds to the db
app.post("/create", upload.single("image"), async (req, res) => {
  const { name, email, phone } = req.body;
  const image = req.file ? `/images/${req.file.filename}` : null;

  const newUser = await prisma.user.create({
    data: {
      name,
      phone,
      image,
      email,
    },
  });
  res.redirect("/");
});

app.get("/update/:id", async (req, res) => {
  const uid = req.params.id;
  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(uid),
    },
  });
  res.render("update", { user });
});

app.post("/update/:id", upload.single("image"), async (req, res) => {
  const uid = req.params.id;
  const { name, email, phone } = req.body;
  const image = req.file ? `/images/${req.file.filename}` : null;

  const user = await prisma.user.update({
    where: {
      id: parseInt(uid),
    },
    data: {
      name,
      email,
      phone,
      image,
    },
  });
  res.redirect("/");
});

//delete user
app.get("/delete/:id", async (req, res) => {
  const uid = req.params.id;
  const user = await prisma.user.delete({
    where: {
      id: parseInt(uid),
    },
  });
  res.redirect("/");
});

//start the server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
