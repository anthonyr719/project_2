var express = require( 'express' );
var router  = express.Router();
var axios = require( 'axios' );

const db = require( '../models' );

router.get( '/all', function( req, res ) {

    let headers = {

        headers: {

            'Authorization' : 'Bearer ' + process.env.APITOKEN
        }
    };

    let location = null;
    if( req.query.cityname ){

        location = req.query.cityname;
        req.session.location = location;
    } else if( req.session.location ){

        location = req.session.location;
    }

    // console.log( `location is ${location}` );

    db.user.findOne({

        where: { id: req.user.dataValues.id }
    }).then( function( user ) {

        user.getFavorites().then( function( favorites ){

            // console.log( 'found favorites: ', favorites );
            const myFavorites = favorites.map( eachOne => eachOne.eventid );

            axios.get( `https://www.eventbriteapi.com/v3/events/search?location.address=${location}`, headers )
            .then( function( result ) {

                // console.log( result.data.events );
                res.render( 'events/all', { events: result.data.events, city: location, error: null, myFavorites } );
            })
            .catch( function( err ){

                res.render( 'events/all', { events: [], city: location, error: 'somethings wrong with your request', myFavorites } );
            });
        });
    });
});

router.post( '/add', function( req, res ) {

    console.log( req.body );

    db.user.findOne({

        where: { id: req.user.dataValues.id }
    }).then( function( user ) {

        user.createFavorite({

            title   : req.body.eventname,
            url     : req.body.eventlink,
            eventid : req.body.eventid,
            notes   : '',
            img     : req.body.eventimg || 'https://via.placeholder.com/64'
        }).then( function( favorite ){

            console.log( 'added favorite: ', favorite.get() );
        });
    });

    res.redirect( '/events/all' );
});

router.delete( '/:idx', function( req, res ){

    db.favorite.destroy({

        where: { eventid : req.params.idx }
    }).then( function() {

        res.redirect( req.query.redirect );
    });
});

router.put( '/:idx', function( req, res ){

    db.favorite.update({

        notes: req.body.notes
    }, {

        where: {

            eventid: req.params.idx
        }
    }).then( function( favorite ) {

        res.redirect( '/profile' );
    });

});

module.exports = router;