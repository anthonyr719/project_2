require( 'dotenv' ).config();


const express    = require( 'express' );
const app        = express();
const ejsLayouts = require( 'express-ejs-layouts' );
app.set( 'view engine', 'ejs' );
app.use( ejsLayouts );


// For allowing PUT and DELETE requests
var methodOverride = require( 'method-override' );
app.use(methodOverride( '_method' ) );


// Module allows the use of sessions
const session = require( 'express-session' );


// Imports passport local strategy
const passport = require( './config/passportConfig' );


// module for flash messages
const flash      = require( 'connect-flash' );
const isLoggedIn = require( './middleware/isLoggedIn' );
const helmet     = require( 'helmet' );


// This is only used by the session store
const db = require( './models' );

// this line makes the session use sequelize to write session data to a postgres table
const SequelizeStore = require( 'connect-session-sequelize' )( session.Store );

const sessionStore = new SequelizeStore({

  db         : db.sequelize,
  expiration : 1000 * 60 * 30
});



app.use( require( 'morgan' )( 'dev' ) );
app.use( express.urlencoded({

  extended: false
}));
app.use( express.static( __dirname + "/public" ) );
app.use( helmet() );

// Configures express-session middleware
app.use( session({

  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: sessionStore
}));

// use this line once to set up the store table 
sessionStore.sync();

// starts the flash middleware
app.use( flash() );

// Link passport to the express session
// must be below session
app.use( passport.initialize() );
app.use( passport.session() );

app.use( function( req, res, next ) {

  res.locals.alerts      = req.flash();
  res.locals.currentUser = req.user;
  next();
});


// For API requests.. axios is better.. request can probably be deleted
var axios   = require( 'axios' );
var request = require( 'request' );


// Routes

app.get( '/', function( req, res ) {

  // console.log( req.user.dataValues.id );
  res.render( 'index' );
});


app.get( '/profile', isLoggedIn, function( req, res ) {

  db.user.findOne({

    where: { id: req.user.dataValues.id }
  }).then( function( user ) {

    user.getFavorites({

      order: [

        [ 'id', 'ASC' ]
      ]
    }).then( function( favorites ){

      res.render( 'profile', { favorites } );
    });
  });
});

app.use( '/events', isLoggedIn, require( './controllers/events' ) );

app.use( '/auth', require( './controllers/auth' ) );

var server = app.listen( process.env.PORT || 3000 );

module.exports = server;
