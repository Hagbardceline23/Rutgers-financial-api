/* financial.js */
// --------------------------------------------------------------------------
//
// File name: financial.js
// Date: March, 2018
// Author: Fabian Flores
// Description: This file is a module that makes api requests to populate
//  a watchlist. It makes use of the alphaVantage and IEx apis. financial.js
//  also leverages google's firebase to implement login/logout features and
//  add a customized watchlist branch for users of the site, which is hosted
//  on https://hagbardceline23.github.io/Rutgers-financial-api/
//
// --------------------------------------------------------------------------

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
const InitialCashAvailable = 5000;

var Reloaded = false;

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
    "description": "",
    reset() {
      this.symbol = "";
      this.currentPrice = 0;
      this.previousPrice = 0;
      this.change = 0;
      this.pctChange = 0;
      this.companyName = "";
      this.website = "";
      this.description = "";
    }
  };

  firebase.initializeApp(config);

  database = firebase.database();

// *************** END OF GLOBALS *******************************************************

$(document).ready(() => {
  var appUser = {
    "firstName": "",
    "lastName": "",
    "email": "",
    "uid": "",
    "authenticated": false,
    addToWatch(sym) {
      var firedbPath = "/users/" + this.uid + "/watchlist/" + sym;

      database.ref(firedbPath).update(
        {sym},
        (errorObject) => {
          console.log("Errors handled: " + JSON.stringify(errorObject));
        }
      );

      return true;
    },
    removeFromWatch(sym) {
      var firedbPath = "/users/" + this.uid + "/watchlist/" + sym;

      database.ref(firedbPath).remove().
        then(() => {
            console.log("Removal of " + firedbPath + " succeeded.");
          }).
        catch((errorObject) => {
            console.log("Remove failed: " + errorObject.message);
      });

      return true;
    },
    getWatchPath() {
      return "/users/" + this.uid + "/watchlist/";
    },
    getBuyPath() {
      return "/users/" + this.uid + "/portfolio/";
    },
    reset() {
      this.email = "";
      this.firstName = "";
      this.lastName = "";
      this.uid = "";
      this.authenticated = false;

      return true;
    }
  };


  // -----------------------------------------------------------------------------------------
  // initialize database parent objects
  function initdb() {
    console.log("in initdb()");
  }

  // -----------------------------------------------------------------------------
  // addUserToDb() takes in three parameters. If the user node does not already
  //  exist in the database, the node is added based on email.
  //
  function addUserToDb() {
    var dbPath;

    console.log("in addUserToDb(): " + JSON.stringify(appUser));
    dbPath = "/users/" + appUser.uid;

    // if users node does not exist, create path
    database.ref(dbPath).update({
      "email": appUser.email,
      "firstName": appUser.firstName,
      "lastName": appUser.lastName,
      "dateAdded": firebase.database.ServerValue.TIMESTAMP
    });

    // portfolio node
    dbPath += "/portfolio";
    database.ref(dbPath).update({"cashAvailable": InitialCashAvailable});

  }

  // -----------------------------------------------------------------------------
  // hideWatchlistTable() hides headers of watchlist table
  //
  function hideWatchlistTable() {
    $("#watch-table-header").hide();
    $("#watchlist-caption").hide();
  }

  // -----------------------------------------------------------------------------
  // eraseCurrentPortfolio() emptys out portfolio table and hides headers
  //
  // function eraseCurrentPortfolio() {
  //  $("#portfolio-table-header").hide();
  //  $("#portfolio-caption").hide();
  //  $("#portfolio-table").empty();
  // }

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

    return watchBtn;
  }

  // --------------------------------------------------------------------------
  // buildBuyBtn uses adds a buy button if a logged in user opts
  // to buy the stock in the window
  function buildBuyBtn(stockSym) {
    var buyBtn = $("<button>");

    buyBtn.addClass("ml-2 btn btn-sm btn-primary buy-button").
            attr("buy-id", stockSym).
            html("&#x2605; Buy");

    return buyBtn;
  }

  // --------------------------------------------------------------------------
  // buyChoices presents a buy dialog
  function buyChoices() {
    var stockToPurchase = $(this).attr("buy-id");

    console.log("in buyChoices(), buy-id: " + stockToPurchase);
    // Shares you want to purchase:
    // <input type="number" required="required" name="nshares" min="0" value="0"max="<shares * price < cashAvailbl>" />
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
        dbPath = "/watchlist/" + sym,
        price, changeInPrice, pctCh,
        dbVal;

    // read current stock price from database
    database.ref(dbPath).on("value", (snapshot) => {
      dbVal = snapshot.val();
      console.log("in renderWatchTable dbVal: " + JSON.stringify(dbVal));
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
    var dbPath = "/watchlist/" + sym;

    currentWatchRow.currentPrice = price;
    console.log("in addToWatchDb() appUser.authenticated = " + appUser.authenticated);
    if (appUser.authenticated) {
      appUser.addToWatch(sym);
    }
    database.ref(dbPath).update({"stockPrice": price});
  }

  // --------------------------------------------------------------------------
  // addRestInfoWatchDb() adds price change, percentage change to the database
  //
  function addRestInfoWatchDb(sym, previousPrice) {
    var dbPath = "/watchlist/" + sym,
        change,
        pctChange;

    console.log("in addRestInfoWatchDb() dbPath: " + dbPath);

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
        buyBtn,
        htmlText;

    // empty out any prior content of #stock-ticker-content
    $("#stock-ticker-content").empty();

    cardh5.text(data["1. symbol"]).
           attr("stock-sym", data["1. symbol"]);
    htmlText = "<strong>Price: </strong>" + numeral(data["2. price"]).format("$0,0.00") + "<br />";
    htmlText += "<strong>Volume: </strong>" + numeral(data["3. volume"]).format("0,0") + "<br />";
    htmlText += "<strong>Company: </strong><a href=" + currentWatchRow.website + " target=\"_blank\">" + currentWatchRow.companyName + "</a><br />";
    htmlText += "<strong>About: </strong>" + currentWatchRow.description + "<br />";

    cardBody.html(htmlText).
            append(addToWatchBtn);

    // add buy option if user is logged in
    if (appUser.authenticated) {
      buyBtn = buildBuyBtn(data["1. symbol"]);
      cardBody.append(buyBtn);
    }

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
            currentWatchRow.symbol = sym;
            renderStockInfo(result["Stock Quotes"][0]);
            break;
          case "watch":
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
    then((response) => {
      console.log("stock info response: " + JSON.stringify(response));
      currentWatchRow.companyName = response.companyName;
      currentWatchRow.website = response.website;
      currentWatchRow.description = response.description;
      $("#stock-input").show();
    }).
    fail(() => {
      console.log("Failure from IEX endpoint stock info function");
      $("#stock-input").show();
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
    appUser.removeFromWatch(stockSymbol);

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


  // -----------------------------------------------------------------------
  // renderUserWatchlist() renders the logged in user's watch list
  //
  function renderUserWatchlist() {
    var dbPath = appUser.getWatchPath();

    // empty out stock-ticker content
    $("#stock-ticker-content").empty();

    console.log("in renderUserWatchList() appUser.getWatchPath: " + appUser.getWatchPath());

    database.ref(dbPath).once("value", (snapshot) => {
      snapshot.forEach((data) => {
        console.log("The " + data.key + " is " + data.val());
        // get current price of stock symbol
        buildBatchURL(data.key, "watch");

        // get yesterday's close price of stock symbol
        buildTimeSeriesURL(data.key);

        // add row to watchListTable
        renderWatchTable(data.key);
      });
    }, (errorObject) => {
      console.log("Errors handled in renderWatchTable: " + JSON.stringify(errorObject));
    });

  }

  // -----------------------------------------------------------------------
  // addToWatchList adds selected stock to watch list
  //
  function addToWatchList(event) {
    var stockSymbol = $(this).attr("stock-id");

    console.log("in addToWatchList, currentUser: " + appUser.email);

    event.preventDefault();
    // empty out stock-ticker content
    $("#stock-ticker-content").empty();
    $("#my-watch-table").show();

    console.log("in addToWatchList() ");
    console.log("stock symbol: " + stockSymbol);

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
      appUser.email = email;
      appUser.authenticated = false;
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
        validName = false,
        validEmail = false,
        validPswd = false,
        pswdsMatch = false,
        htmlText = "",
        promise;

    ev.preventDefault();
    console.log("in signupRoutine()");
    // check name validity
    if (hasAlpha(fname) && hasAlpha(lname)) {
      validName = true;
    } else {
      htmlText = "Please enter valid name.<br />";
      $("#appFirstName, #appLastName, #signupPassword, #confirmPassword").val("");
      $("#signup-error").addClass("text-danger font-weight-bold").
                        html(htmlText);
      validName = false;
    }

    // check email validity
    if (validateEmail(email)) {
      validEmail = true;
    } else {
      htmlText = "Please enter valid email.<br />";
      $("#signupEmail, #signupPassword, #confirmPassword").val("");
      $("#signup-error").addClass("text-danger font-weight-bold").
                        html(htmlText);
      validEmail = false;
    }

    // check password validity
    if (validatePassword(pswrd)) {
      validPswd = true;
    } else {
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
      pswdsMatch = true;
    } else {
      $("#signupPassword, #confirmPassword").val("");
      htmlText += "Passwords do not match. Please enter them again.<br />";
      $("#signup-error").addClass("text-danger font-weight-bold").
                        html(htmlText);
      pswdsMatch = false;
    }

    // TODO: check if email already exists in database

    signupSuccess = validName && validEmail && validPswd && pswdsMatch
                    ? true
                    : false;

    if (signupSuccess) {
      promise = auth.createUserWithEmailAndPassword(email, pswrd);
      promise.catch((error) => console.log(error.message));
      // console.log("in signupSuccess: uid: " + firebaseUser.uid);
      $("#signup-error").removeClass("text-danger font-weight-bold").
                        empty();
      $("#appFirstName, #appLastName, #signupEmail, #signupPassword, #confirmPassword").val("");
      $("#nonExistentUser").empty();
      $("#pSignup").modal("hide");
      appUser.firstName = fname;
      appUser.lastName = lname;
      appUser.authenticated = true;
    } else {
      $("#pSignup").modal("show");
    }
  }

  // ----------------------------------------------------------------------
  // Event listener for logout button
  //
  $("#btnLogout").on("click", () => {

    console.log("in btnLogout()");
    firebase.auth().signOut();
    database.ref("users/" + appUser.uid).off();
    hideWatchlistTable();
    $("#stock-input").show();

    if (!Reloaded) {
      location.reload();
      Reloaded = true;
    }
  });

  // -----------------------------------------------------------------------
  // doWhenLoggedIn() performs series of functions once a user is logged in
  //  one of them is to call render the current user's customized watch list
  //
  function doWhenLoggedIn() {
    console.log("in doWhenLoggedIn appUser: " + JSON.stringify(appUser));
    if (appUser.firstName !== "" && appUser.lastName !== "") {
      addUserToDb();
    }

    // empty current stock ticker
    $("#stock-input").val("");

    // check user watchlist
    renderUserWatchlist();
  }

  // -----------------------------------------------------------------------
  // doWhenLoggedOut() performs series of functions once a user has
  // loggedout
  //
  function doWhenLoggedOut() {
    appUser.reset();

    // reset current row
    currentWatchRow.reset();
  }

  // ----------------------------------------------------------------------
  // add authentication listener state using firebase
  //
  firebase.auth().onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      console.log("Logged in User is: " + JSON.stringify(firebaseUser));
      $("#btnLogout").removeClass("d-none");
      $("#modalLogin").addClass("d-none");
      $("#modalSignup").addClass("d-none");
      $("#loggedInUser").addClass("font-weight-bold text-primary mr-1").
                        html("Welcome, " + firebaseUser.email);
      appUser.email = firebaseUser.email;
      appUser.uid = firebaseUser.uid;
      appUser.authenticated = true;
     // database.ref("users/" + appUser.uid).on("child_added", (childSnapshot) => {
        // do stuff with snapshot
      //  console.log("childSnapshot: " + JSON.stringify(childSnapshot));
      // });

      doWhenLoggedIn();
    } else {
      console.log("Not logged in.");
      // database.ref("users/" + appUser.uid).off();
      $("#btnLogout").addClass("d-none");
      $("#modalLogin").removeClass("d-none");
      $("#modalSignup").removeClass("d-none");
      $("#loggedInUser").removeClass("font-weight-bold text-primary mr-1").
                        empty();
      doWhenLoggedOut();
    }
  });

  initdb();
  hideWatchlistTable();
  // eraseCurrentPortfolio();

  // adds the selected stock to watch list
  $(document).on("click", ".watch-button", addToWatchList);

  // presents buy options to user
  $(document).on("click", ".buy-button", buyChoices);

  // remove the selected stock from watch list
  $(document).on("click", ".remove-from-watchlist", removeFromWatchList);

  // login button
  $(document).on("click", "#btnLogin", loginRoutine);

  // signup routine
  $(document).on("click", "#btnSignup", signupRoutine);

  // End of document.ready()
});