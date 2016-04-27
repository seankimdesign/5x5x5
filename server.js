var express = require('express')
var app = express()
var adaro = require('adaro')

var dbops = require('./scripts/dbops')
var fsops = require('./scripts/fsops')
var ops = require('./scripts/ops')

var uploadRoute = require('./routes/uploadRoute')
var manageRoute = require('./routes/manageRoute')

var challenge = require('./scripts/challenge')
var configurations = require('./scripts/configurations')

var fourohfour = require('./contents/fourohfour')

var onPort = 8080;

// below three lines set up the rendering engine as dust
app.engine('dust', adaro.dust(
    {
        helpers:
            [
                'dustjs-helpers',
                function(dust){
                    dust.filters.uppercaser = function(val){
                        return val.charAt(0).toUpperCase() + val.slice(1);
                    }
                }
            ]
    }
));
app.set('view engine', 'dust');
app.set('views', __dirname+'/templates');

// static files on public folder
app.use('/public', express.static('public'));
app.use('/uploads', express.static('uploads'));

// routes
app.use('/upload', uploadRoute);
app.use('/manage', manageRoute);

app.get('/', function(req,res){
    //challenge.insertAnyChallenge();

    challenge.organizeChallenges(function(data){
        /*
        challenge.insertAnyEntry(function(updatedData){
            console.log(updatedData);
        });
        */
        res.render('index',configurations({"challenges":data, "page":"home", "colorScheme":ops.dualColor(data.length)}));
    });

});

app.use(function(req,res){
    challenge.length(function(len){
        console.log(fourohfour)
        res.render('index',configurations({"contents":fourohfour, "page":"404", "colorScheme":ops.dualColor(len)}));
    })
})

app.listen(onPort, function(){
	console.log('Listening on Port '+onPort);
});


function twoDigit(int){
	return ((int < 9) ? "0" : "")+int.toString();
}
