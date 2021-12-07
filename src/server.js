const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { connect } = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const authService = require("./services/auth.service");
const morganBody = require("morgan-body");
const http = require("http");

const users = require("./controller/user.controller");

//Bring in the app constants
const { DB, PORT } = require("./config");
const port = process.env.PORT || PORT;

//intialize the application
const app = express();
const server = http.createServer(app);

var corsOptions = {
  origin: "http://localhost:4200",
  credentials: true,
};

const oneDay = 1000 * 60 * 60 * 24;

app.use(session({ secret: process.env.SESSION_SECRET }));
app.use(cors(corsOptions));

//Middlewares
app.use(express.json());

//Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
    store: MongoStore.create({
      mongoUrl: DB,
      ttl: 14 * 24 * 60 * 60,
      autoRemove: "native",
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    authService.loginService(email, password, done);
  })
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

function logRequest(req, res, next) {
  logger.warn(
    `Request Url: ${req.url} Req Params: ${JSON.stringify(
      req.params
    )} Req Body: ${JSON.stringify(req.body)}`
  );

  res.on("finish", () => {
    logger.info(
      `${res.statusCode} ${res.statusMessage}; ${res.get("Content-Length") || 0
      }b sent `
    );
  });
  next();
}

const loggerStream = {
  write: (message) => {
    logger.info(message);
  },
};

morganBody(app, {
  stream: loggerStream,
});
app.use(logRequest);

//Custom Controller
app.use("/api/users", users);

//simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Node Application." });
});

const startApp = async () => {
  try {
    //Connection with DB
    var connection = await connect(DB, {
      useFindAndModify: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    success({
      message: `Successfully connected with Database \n ${DB}`,
      badge: true,
    });

    //Start listening for the server on PORT
    server.listen(PORT, () =>
      success({
        message: `Server is up and running on PORT ${port}`,
        badge: true,
      })
    );
  } catch (err) {
    error({
      message: `Unable to connect with Database \n ${err}`,
      badge: true,
    });
    startApp();
  }
};

startApp();