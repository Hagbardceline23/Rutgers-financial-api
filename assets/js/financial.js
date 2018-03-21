/* financial.js */
// **************************************************************************
// GLOBALS
//
// **************************************************************************
//
// ---- CONSTANTS ----
const IEXSuffix = "/company";
const IEXEndpoint = "https://api.iextrading.com/1.0/stock/";
const AlphaAPIKEY = "51J2DL5ZC7RQBE6J";
const AlphaBatch = "https://www.alphavantage.co/query?function=BATCH_STOCK_QUOTES&symbols=";
const AlphaSuffix = "&apikey=" + AlphaAPIKEY;
const AlphaTS = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=";
const AlphaTSSuffix = AlphaSuffix;
const MinPassLength = 7;

// https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=1min&outputsize=full&apikey=demo

//
// ---- VARIABLES ----
// Initialize Firebase
  var config = {
    "apiKey": "AIzaSyBAFhIsrnS798a2VSRGcvbuzSb-woD6z6E",
    "authDomain": "stocks-info-36826.firebaseapp.com",
    "databaseURL": "https://stocks-info-36826.firebaseio.com",
    "projectId": "stocks-info-36826",
    "storageBucket": "stocks-info-36826.appspot.com",
    "messagingSenderId": "799807828291"
  };

  var database;
  var currentWatchRow = {
    "symbol": "",
    "currentPrice": 0,
    "previousPrice": 0,
    "change": 0,
    "pctChange": 0,
    "companyName": "",
    "website": "",
    "description": ""
  };


  firebase.initializeApp(config);

  database = firebase.database();

  // **************************************************************************

$(document).ready(() => {
  var userEmail = "",
      userAuthenticated = false;

  // -----------------------------------------------------------------------------------------
  // initialize database parent objects
  function initdb() {
    console.log("in initdb()");
  }

  // -----------------------------------------------------------------------------
  // addUserToDb() takes in three parameters. If the user node does not already
  //  exist in the database, the node is added based on email.
  //
  function addUserToDb(fname, lname, email) {
    var userRef;

    console.log("in addUserToDb(): " + fname, lname, email);
    // create users reference
    userRef = database.ref().child("users");
    // if users node does not exist create
    database.ref().once("value", (snapshot) => {
      if (snapshot.child("users").exists()) {
          console.log("users child exists under root");
      } else {
          // create users node by pushing
        // database.ref().push("users");
        console.log("users node does not exist under root");
      }
   });

    // if users/email child does not exist create it

    // if users/email/watchlist node does not exist, create it

    // if users/email/portfolio does not exist, create it
  }

  // -----------------------------------------------------------------------------
  // hasAlpha() checks if a string has at least one alphabetic character, lower
  // or upper case
  //
  function hasAlpha(str) {
    return str.match(/[a-z]/i);
  }

  // -----------------------------------------------------------------------------
  // hasNum() checks if a string has at least one numeric character
  //
  function hasNum(str) {
    return str.match(/\d+/g);
  }

  // -----------------------------------------------------------------------------
  // validatePassword() checks for password validity, the password must
  // be greater than MinPassLength, have alpha characters and at least one digit
  //
  function validatePassword(pswd) {
    if (pswd.length >= MinPassLength && hasAlpha(pswd) && hasNum(pswd)) {
      return true;
    }

    return false;
  }

  // -----------------------------------------------------------------------
  // validateEmail() checks if an email is valid
  // source code for regular expression:
  // https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript/1373724#1373724
  //
  function validateEmail(email) {
    var re = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;

    return re.test(email);
  }


  // --------------------------------------------------------------------------
  // buildWatchBtn uses adds watch button
  // to stocks information window
  function buildWatchBtn(stockSym) {
    var watchBtn = $("<button>");

    watchBtn.addClass("ml-2 btn btn-success btn-sm watch-button").
            attr("stock-id", stockSym).
            html("+ Watchlist");
            // html("Add to &#x2605;");

    return watchBtn;
  }

  // --------------------------------------------------------------------------
  // renderWatchTable adds the current stock symbol to the watchlist
  //
  function renderWatchTable(sym) {
    var tRow = $("<tr>"),
        tCellSym = $("<td>"),
        tCellPrice = $("<td>"),
        tCellChange = $("<td>"),
        tCellPct = $("<td>"),
        tCellRmv = $("<td>"),
        delBtn = $("<button>"),
        dbPath = "watchlist/" + sym,
        price, changeInPrice, pctCh,
        dbVal;

    // read current stock price from database
    database.ref(dbPath).on("value", (snapshot) => {
      dbVal = snapshot.val();
      console.log("dbVal: " + JSON.stringify(dbVal));
      console.log("price: " + dbVal.stockPrice);
      price = dbVal.stockPrice;
      changeInPrice = dbVal.change;
      pctCh = dbVal.pctChange;

      console.log("in renderWatchTable: " + price);
      // console.log("converted price: " + numeral(cprice).format("$0,0.00"));
      tCellSym.text(sym);
      tCellPrice.html(numeral(price).format("$0,0.00"));
      tCellChange.html(numeral(changeInPrice).format("+0,0.00"));
      tCellPct.html(numeral(pctCh).format("0.00%"));
      delBtn.attr("id", "btn-" + sym).
            attr("data-name", sym).
            addClass("custom-remove remove-from-watchlist").
            text("x");
      tCellRmv.append(delBtn);
      tRow.attr("id", "wrow-" + sym).
           attr("stock-sym", sym);
      // empty out row so as to not repeat stock symbol on watchlist
      $("#wrow-" + sym).empty();
      tRow = $("#wrow-" + sym).append(tCellSym, tCellPrice, tCellChange, tCellPct, tCellRmv);
    }, (errorObject) => {
      console.log("Errors handled: " + errorObject.code);
    });
    $("#watchlist-caption").show();
    $("#watch-table-header").show();
    $("#watch-table").prepend(tRow);
  }

  // --------------------------------------------------------------------------
  // addToWatchDb adds symbol and price to the database, symbol is the parent
  // and price is the child
  //
  function addToWatchDb(sym, price) {
    var dbPath = "watchlist/" + sym;

    currentWatchRow.currentPrice = price;
    database.ref(dbPath).update({"stockPrice": price});
  }

  // --------------------------------------------------------------------------
  // addRestInfoWatchDb() adds price change, percentage change to the database
  //
  function addRestInfoWatchDb(sym, previousPrice) {
    var dbPath = "watchlist/" + sym,
        change,
        pctChange;

    console.log("in addRestInfoWatchDb()");

    // get current stock price from database and calculate change in price
    database.ref(dbPath).on("value", (snapshot) => {
      change = snapshot.val().stockPrice - previousPrice;
      console.log("change in addRestInfoWatchDB: " + change);
    }, (errorObject) => {
      console.log("Errors handled: " + JSON.stringify(errorObject));
    });
    pctChange = change / previousPrice;
    currentWatchRow.pctChange = pctChange;
    currentWatchRow.previousPrice = previousPrice;
    currentWatchRow.change = change;

    console.log("current watch row: " + JSON.stringify(currentWatchRow));

    database.ref(dbPath).update({
      previousPrice,
      change,
      pctChange
    }, (errorObject) => {
      console.log("Errors handled: " + JSON.stringify(errorObject));
    });
  }

  // --------------------------------------------------------------------------
  // renderStockInfo uses the bootstrap 4 'card' functionality to render
  // the stocks information
  //
  function renderStockInfo(data) {
    var stockDiv = $("<div>").addClass("card-body").
                              attr("id","stock-info"),
        cardh5 = $("<h5>").addClass("card-title"),
        cardBody = $("<p>").addClass("card-text ticker-paragraph"),
        addToWatchBtn = buildWatchBtn(data["1. symbol"]),
        htmlText;

    // empty out any prior content of #stock-ticker-content
    $("#stock-ticker-content").empty();

    cardh5.text(data["1. symbol"]).
           attr("stock-sym", data["1. symbol"]);
    htmlText = "Price: " + numeral(data["2. price"]).format("$0,0.00") + "<br />";
    htmlText += "Volume: " + numeral(data["3. volume"]).format("0,0") + "<br />";
    htmlText += "Company: <a href=" + currentWatchRow.website + " target=\"_blank\">" + currentWatchRow.companyName + "</a><br />";
    htmlText += "About: " + currentWatchRow.description + "<br />";

    cardBody.html(htmlText).
            append(addToWatchBtn);

    stockDiv.append(cardh5, cardBody);
    $("#stock-input").show();
    $("#stock-ticker-content").append(stockDiv);
  }


  // --------------------------------------------------------------------------
  // buildBatchURL calls the alpha batch function with only one stock symbol
  //
  function buildBatchURL(sym, fn) {
    var result,
        queryURL;

    queryURL = AlphaBatch + sym + AlphaSuffix;
    console.log("in buildBatchURL() batch url: " + queryURL);

    // get stock symbol information
    stockInfoURL(sym);

    $.ajax({
      "method": "GET",
      "url": queryURL
    }).
    done((response) => {
      result = response;
      if (result["Stock Quotes"].length === 0) {
        console.log("Stock does not exist");
      } else {
        switch (fn) {
          case "ticker":
            renderStockInfo(result["Stock Quotes"][0]);
            break;
          case "watch":
            console.log("buildBatch watch Price: " + numeral(result["Stock Quotes"][0]["2. price"]).format("$0,0.00"));
            currentWatchRow.symbol = sym;
            currentWatchRow.currentPrice = result["Stock Quotes"][0]["2. price"];
            addToWatchDb(sym, result["Stock Quotes"][0]["2. price"]);
            break;
          default:
            break;
        }
      }
    }).
    fail(() => {
      console.log("Failure from alpha batch function");
    });
  }

  // ---------------------------------------------------------------------
  // stockInfoURL() gets stock information based on stock symbol
  //
  function stockInfoURL(sym) {
    var queryURL;

    queryURL = IEXEndpoint + sym + IEXSuffix;
    console.log("in stockInfoURL -- queryURL: " + queryURL);

    $.ajax({
      "method": "GET",
      "url": queryURL
    }).
    done((response) => {
      console.log("stock info response: " + JSON.stringify(response));
      currentWatchRow.companyName = response.companyName;
      currentWatchRow.website = response.website;
      currentWatchRow.description = response.description;
    }).
    fail(() => {
      console.log("Failure from Alpha Time Series function");
    });
  }

  // ---------------------------------------------------------------------
  // buildTimeSeriesURL() builds time series url
  //
  function buildTimeSeriesURL(sym) {
    var result,
        keys,
        secondObject,
        queryURL;

    // get time-last-refreshed
    queryURL = AlphaTS + sym + AlphaTSSuffix;
    console.log("in buildTimeSeriesURL() url: " + queryURL);

    $.ajax({
      "method": "GET",
      "url": queryURL
    }).
    done((response) => {
      result = response["Time Series (Daily)"];
      // store the keys of result in the variable keys
      keys = Object.keys(result);
      secondObject = keys[0 + 1];
      // get previous Day's object, which is always the second element
      console.log("previous day price: " + result[secondObject]["4. close"]);
      currentWatchRow.previousPrice = result[secondObject]["4. close"];
      addRestInfoWatchDb(sym, result[secondObject]["4. close"]);
    }).
    fail(() => {
      console.log("Failure from Alpha Time Series function");
    });
  }

  // -----------------------------------------------------------------------
  // removeFromWatchList() removes the selected stock from the watchlist
  //
  function removeFromWatchList() {
    var stockSymbol = $(this).attr("data-name");

    console.log("in removeFromWatchList, remove: " + stockSymbol);

    // remove row so as to not repeat stock symbol on watchlist
    $("#wrow-" + stockSymbol).remove();

    // check if watch table is empty
    if ($("#watch-table").children().length === 0) {
      $("#watch-table-header").hide();
      $("#watchlist-caption").hide();
    }
  }

  // -----------------------------------------------------------------------
  // implements "stock-ticker" function
  //
  $("#stock-ticker").on("click", (event) => {
    var stockSymbol = $("#stock-input").val().
                                        trim();

    console.log("in stock-ticker() ");
    $("#financial-text").empty();

    // hide clear stock-input field
    $("#stock-input").hide().
                      val("");

    event.preventDefault();
    buildBatchURL(stockSymbol, "ticker");

  });

  $("#wlist-button").on("click", (event) => {

    console.log("in wlist-button() ");
    $("#financial-text").empty();

    event.preventDefault();

  });

  // -----------------------------------------------------------------------
  // addToWatchList adds selected stock to watch list
  //
  function addToWatchList(event) {
    var stockSymbol = $(this).attr("stock-id");

    console.log("in addToWatchList, currentUser: " + userEmail);

    event.preventDefault();
    // empty out stock-ticker content
    $("#stock-ticker-content").empty();

    console.log("in addToWatchList() ");
    console.log("stock symbol: " + stockSymbol);
    // $("#financial-text").empty();
    // get current price of stock symbol
    buildBatchURL(stockSymbol, "watch");

    // get yesterday's close price of stock symbol
    buildTimeSeriesURL(stockSymbol);

    // add row to watchListTable
    renderWatchTable(stockSymbol);
  }

  // -----------------------------------------------------------------------
  // loginRoutine() records a login attempt
  //
  function loginRoutine(ev) {
    var email = $("#appEmail").val(),
        pswrd = $("#appPassword").val(),
        auth = firebase.auth(),
        loginSuccess = true,
        promise;

    // error check email and password later

    ev.preventDefault();
    console.log("in loginRoutine()");

    // sign in
    promise = auth.signInWithEmailAndPassword(email, pswrd);
    promise.catch((error) => {
      console.log(error.message);
      loginSuccess = false;
      $("#nonExistentUser").addClass("text-info font-weight-normal").
      text("Enter correct info or sign up please.");
    });

    if (loginSuccess) {
      $("#appEmail, #appPassword").val("");
      $("#nonExistentUser").empty();
      $("#pLogin").modal("hide");
    } else {
      $("#pLogin").modal("hide");
    }
  }

  // -----------------------------------------------------------------------
  // signupRoutine() signs up a user to the app
  //
  function signupRoutine(ev) {
    var fname = $("#appFirstName").val(),
        lname = $("#appLastName").val(),
        email = $("#signupEmail").val(),
        pswrd = $("#signupPassword").val(),
        confirmPswrd = $("#confirmPassword").val(),
        auth = firebase.auth(),
        signupSuccess = true,
        validEmail = false,
        validPswd = false,
        pswdsMatch = false,
        htmlText = "",
        promise;

    ev.preventDefault();
    console.log("in signupRoutine()");

    // check email validity
    if (validateEmail(email)) {
      console.log("valid email entered");
      validEmail = true;
    } else {
      console.log("invalid email");
      htmlText = "Please enter valid email.<br />";
      $("#signupEmail, #signupPassword, #confirmPassword").val("");
      $("#signup-error").addClass("text-danger font-weight-bold").
                        html(htmlText);
      $("#signupEmail").val("");
      validEmail = false;
    }

    // check password validity
    if (validatePassword(pswrd)) {
      console.log("valid password entered");
      validPswd = true;
    } else {
      console.log("invalid password");
      $("#signupPassword, #confirmPassword").val("");
      htmlText += "Please enter valid password. Must be at least " +
                  MinPassLength +
                  " characters long and have at least one digit and one alphabetic character.<br />";
      $("#signup-error").addClass("text-danger font-weight-bold").
                        html(htmlText);
      validPswd = false;
    }

    // check if passwords match
    if (pswrd === confirmPswrd) {
      console.log("passwords match");
      pswdsMatch = true;
    } else {
      console.log("passwords do not match");
      $("#signupPassword, #confirmPassword").val("");
      htmlText += "Passwords do not match. Please enter them again.<br />";
      $("#signup-error").addClass("text-danger font-weight-bold").
                        html(htmlText);
      pswdsMatch = false;
    }

    // TODO: check if email already exists in database

    signupSuccess = validEmail && validPswd && pswdsMatch
                    ? true
                    : false;

    if (signupSuccess) {
      promise = auth.createUserWithEmailAndPassword(email, pswrd);
      promise.catch((error) => console.log(error.message));
      $("#signup-error").removeClass("text-danger font-weight-bold").
                        empty();
      $("#appFirstName, #appLastName, #signupEmail, #signupPassword, #confirmPassword").val("");
      $("#nonExistentUser").empty();
      $("#pSignup").modal("hide");
      addUserToDb(fname, lname, email);
    } else {
      $("#pSignup").modal("show");
    }
  }

  // ----------------------------------------------------------------------
  // add event listener for logout
  //
  $("#btnLogout").on("click", () => {
    console.log("in btnLogout()");
    firebase.auth().signOut();
  });

  // ----------------------------------------------------------------------
  // add authentication listener state using firebase
  //
  firebase.auth().onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      // console.log("Logged in User is: " + JSON.stringify(firebaseUser));
      $("#btnLogout").removeClass("d-none");
      $("#modalLogin").addClass("d-none");
      $("#modalSignup").addClass("d-none");
      $("#loggedInUser").addClass("font-weight-bold text-primary mr-1").
                        html("Welcome, " + firebaseUser.email);
      userEmail = firebaseUser.email;
      userAuthenticated = true;
    } else {
      console.log("Not logged in.");
      $("#btnLogout").addClass("d-none");
      $("#modalLogin").removeClass("d-none");
      $("#modalSignup").removeClass("d-none");
      $("#loggedInUser").removeClass("font-weight-bold text-primary mr-1").
                        empty();
      userEmail = "";
      userAuthenticated = false;
    }
  });

  initdb();
  $("#watch-table-header").hide();
  $("#watchlist-caption").hide();

  // adds the selected stock to watch list
  $(document).on("click", ".watch-button", addToWatchList);

  // remove the selected stock from watch list
  $(document).on("click", ".remove-from-watchlist", removeFromWatchList);

  // login button
  $(document).on("click", "#btnLogin", loginRoutine);

  // signup routine
  $(document).on("click", "#btnSignup", signupRoutine);

  // End of document.ready()
});