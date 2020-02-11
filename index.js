var express = require('express');
var app = express();
var alexa = require("alexa-app");
var rp = require("request-promise");

var tag; // Keyword for
var listCounter;  // Counts the current quote for the quote array concerning a tag.



//----------------Auto-generated-------------------
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//----------------Auto-generated-------------------

var alexaApp = new alexa.app("test");

alexaApp.express({
    expressApp: app
});


// starting the skill
alexaApp.launch(function (request, response) {
    tag = "";
    response.say("Hello. You can ask for a random Donald Trump quote or a quote concerning a specific tag. " +
        "For a list of all tags say: Give me a list of all Tags");
    response.shouldEndSession(false);

});


// Tells a random quote
alexaApp.intent("RandomTrump", {
        "slots": {},
        "utterances": ["Tell me a quote", "Tell me a Donald Trump quote", "Give me a quote", "Tell me a random quote"]
    },
    function(request, response) {

        response.shouldEndSession(false);

        return rp('https://api.tronalddump.io/random/quote')
            .then(function (body) {
                var obj = JSON.parse(body);
                var message = obj.value;
                console.log(message);
                response.say(message);
        });

    }
);



// Searches for quotes concerning a specific tag
alexaApp.intent("TrumpKeyword", {
        "slots": {"keyword": "keyword"},
        "utterances": ["What did Trump said about {keyword}", "Quotes about {keyword}", "Tell me a quote about {keyword}",
        "Give me quotes about {keyword}"]
    },
    function(request, response) {

        response.shouldEndSession(false);
        var keyword = request.slot("keyword");

        return rp('https://api.tronalddump.io/search/quote?query='+keyword)
            .then(function (body) {

                //console.log(keyword);

                var obj = JSON.parse(body);

                // proof if quote concerning the keyword are existing
                if(obj.count == 0){
                    message = "I could not find a quote concerning your tag "+keyword;
                }
                else {
                    var count = obj._embedded.quotes.length; // number of quotes
                    tag = keyword;   // set keyword to global tag variable
                    message = "I found "+count+ " quotes about" +keyword+ " Do you want to hear a random quote, or all quotes?"

                }

                response.say(message);

        });

    }
);




// Tells a random Donald Trump quote for a specific keyword
alexaApp.intent("RandomTrumpKeyword", {
        "slots": {},
        "utterances": ["A random one", "random", "random quote"]
    },
    function(request, response) {

        response.shouldEndSession(false);
        var keyword = tag;      // set keyword parameter with global tag
        console.log("keyword "+tag);

        return rp('https://api.tronalddump.io/search/quote?query='+keyword)
            .then(function (body) {

                var obj = JSON.parse(body);
                var count = obj._embedded.quotes.length - 1; // number of quotes existing for keyword
                console.log("count "+count);
                var randomNumber = parseInt((Math.random() * (count - 0)) + 0); // create random Number
                console.log("randomNumber "+randomNumber);
                var message = obj._embedded.quotes[randomNumber].value; // set message as random quote
                console.log("message "+message);

                response.say(message);


            });

    }
);






// Gives first quote of the quotes-array concerning the global keyword
alexaApp.intent("TrumpKeywordList", {
        "slots": {},
        "utterances": ["All quotes", "Give me all quotes", "Tell me all quotes", "Tell me all"]
    },
    function(request, response) {

        response.shouldEndSession(false);
        var keyword = tag;
        console.log("keyword "+tag);

        return rp('https://api.tronalddump.io/search/quote?query='+keyword)
            .then(function (body) {

                var obj = JSON.parse(body);
                listCounter = 1;

                var message = obj._embedded.quotes[0].value;
                response.say(message +" Do you want to hear the next one?");


            });

    }
);




// Tells next quote of quotes-array
alexaApp.intent("NextQuote", {
        "slots": {},
        "utterances": ["Next one", "Yes", " Give me next one", "Another one"]
    },
    function(request, response) {

        response.shouldEndSession(false);
        var keyword = tag;
        console.log("keyword "+tag);

        return rp('https://api.tronalddump.io/search/quote?query='+keyword)
            .then(function (body) {

                var obj = JSON.parse(body);
                var count = obj._embedded.quotes.length - 1;
                var message;

                console.log("listCounter "+listCounter);

                // Check if the last array index is reached
                if(listCounter < count){
                    message = obj._embedded.quotes[listCounter].value +" Do you want to hear the next one?";
                    listCounter++;
                }
                else if(listCounter==count){
                    message = obj._embedded.quotes[listCounter].value;
                }

                response.say(message);

            });

    }
);




// Gives all Keywords the user can ask for
alexaApp.intent("Tags", {
        "slots": {},
        "utterances": ["Give me a list of all tags", "Tell me all tags", "All tags", "Which tags are possible"]
    },
    function(request, response) {

        response.shouldEndSession(false);

        return rp('https://api.tronalddump.io/tags')
            .then(function (body) {

                var msgString = "";
                var obj = JSON.parse(body);

                for(var i=0; i<obj._embedded.length; i++){
                    msgString = msgString.concat(obj._embedded[i],", ");
                }

                console.log(msgString);

                response.say(msgString);
            });

    }
);




alexaApp.intent("QuotesDenied", {
        "slots": {},
        "utterances": ["No", "I don't want to hear another one", "No thanks"]
    },
    function(request, response) {

        response.shouldEndSession(false);
        response.say("Ok");
        listCounter = 1;

    }
);



alexaApp.intent("AMAZON.StopIntent", {
        "slots": {},
        "utterances": []
    },
    function(request, response) {

        response.say("Goodbye covfefe");
        response.shouldEndSession(true);

    }
);


// get this message for unknown intent
alexaApp.messages.NO_INTENT_FOUND = "Sorry but I cannot help you with your request";



app.get('/hello', function (request, response) {
    response.send("Hallo Alexa");
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


