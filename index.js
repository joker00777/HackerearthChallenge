const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}
const ejsMate = require("ejs-mate")
const app = express();
const Images = require("./models/image");
const catchAsync = require("./catchAsync");
const methodOverride = require("method-override");
const dbUrl=process.env.DB_URL;
const port = process.env.PORT || 3000;

//'mongodb://localhost/images'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("DataBase Connected");
    })
    .catch((err) => {
        console.log(err);
    })


app.engine('ejs',ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');    
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get("/", (req, res) => {
    res.redirect("/home/0");
})

app.post("/", catchAsync(async (req, res) => {
    const i = new Images(req.body.image);
    await i.save();
    res.redirect(`/show/${i.id}`);
}))

app.get("/new", (req, res) => {
    res.render("newEntry.ejs");
})

app.get("/home/:start", catchAsync(async (req, res) => {
    var { start } = req.params;
    const images = await Images.find({});
    start = 9 * start;
    if(start>images.length){
        return next();
    }
    var total = Math.floor(images.length / 9);
    var remainder = images.length % 9;
    if (remainder > 0) {
        total += 1;
    }
    const index = path.join(__dirname, 'views', 'home');
    res.render(index, { images, start, total });
}))


app.get("/search/:name", catchAsync(async (req, res) => {
    const { name } = req.params;
    const images = await Images.find({ name: { $regex: name, $options: "i" } });
    res.render("searchResult", { images });
}))

app.post("/search", catchAsync(async (req, res) => {
    const name = req.body.name;
    res.redirect(`/search/${name}`)
}))

app.get("/show/:id", catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next();
    }
    const image = await Images.findById(id);
    if (!image) {
        return next();
    }
    res.render("show", { image });
}))

app.get("/:id/edit", catchAsync(async (req, res) => {
    const { id } = req.params;
    const image = await Images.findById(id);
    res.render("edit", { image });
}))

app.put("/:id/edit", catchAsync(async (req, res) => {
    const { id } = req.params;
    const i = req.body.image;
    await Images.findByIdAndUpdate(id, {
        url: i.url,
        name: i.name,
        details: i.details
    });
    res.redirect(`/show/${id}`);
}))

app.delete("/:id/delete", catchAsync(async (req, res) => {
    const { id } = req.params;
    await Images.findByIdAndRemove(id);
    res.redirect("/");
}))

//ERRORS HANDLING

app.use("*", (req, res, next) => {
    res.redirect('/');
})

app.use((err, req, res, next) => {
    const { message = "something went wrong", statusCode = 500 } = err;
    res.status(statusCode);
    const stack = err.stack;
    res.render("error", { message, statusCode, stack });
}) 

//PORT Listening....
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})