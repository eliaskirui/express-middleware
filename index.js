const express = require("express");
const router = express.Router();
const path = require("path");
const logger = require("morgan");
const multer = require("multer");
const upload = multer({ dest: "./public/uploads" });

const app = express();

const port = 5001;

// 4. Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "public")))

// 1. Application-level middleware
const loggerMiddleware = (req, res, next) => {
    console.log(`${new Date()} --- Request [${req.method}] [${req.url}]`);
    next();
};

app.use(loggerMiddleware);

// 5. Third-party middleware
app.use(logger("combined"));


// 2. Router-level middleware
app.use("/api/users", router);

const fakeAuth = (req, res, next) => {
    const authStatus = true;
    if (authStatus) {
        console.log("User authStatus : ", authStatus);
        next();
    } else {
        res.status(401);
        throw new Error("User is not authorized to access this resource.")
    }
}
const getUsers = (req, res) => {
    res.json({ message: "Get all users" })
}

const createUser = (req, res) => {
    console.log("This is the request body received from client : ", req.body);
    res.json({ message: "Create new user" })

}

router.use(fakeAuth);
router.route("/").get(getUsers).post(createUser);


// 3. Error-handling middleware
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode);
    switch (statusCode) {
        case 401:
            res.json({
                title: "Unauthorized",
                message: err.message,
            });
            break;
        case 404:
            res.json({
                title: "Not Found",
                message: err.message,
            });
            break;
        case 500:
            res.json({
                title: "Internal Server Error",
                message: err.message,
            });
            break;
        default:
            break;
        
    }
}

app.post("/upload", upload.single("image"),
    (req, res, next) => {
    console.log(req.file, req.body);
    res.send(req.file);
    },
    (err, req, res, next) => {
        res.status(400).send({ err: err.message });
    }
)

app.all("*", (req, res) => {
    res.status(404);
    throw new Error("Route not found")
});

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})