# Rutgers-financial-api

#### Authors 

Dan Klinga, Robert Prince, Fabian Flores

#### Description

The Rutgers Financial App is an application that allows a user to track financial news and create a watchlist of stocks. It is a fully functional platform which provides users up to the minute financial news and stock information allowing them to customize their experience and track market trends that are important to them.   The app contains the following features:

* Top Financial News. News search interface.  

* Signup / login / logout feature. 

* Personalized watchlist and stored contacts list, using firebase.

* A stock information ticker feature. 

* A contact page for potential users to send us a message.

 
#### Technical Details

Our news/financial platform leverages the New York Times, AlphaVantage and IEX APIs to present the users of this 
site real time information and stock data. For the layout of the app, we used the bootstrap 4 library and made use 
of its navbar, card deck and grid layout features to provide mobile responsiveness as well as an intuitive interface.

The New York Times API requests are included in the `nys.js` and `nystop.js` files. Through a form with various input selections, such as search term and date range, the app dyanmically returns a list of relevant news articles. 

The financial data API requests and dynamic watchlist table build are made in `financial.js`. In addition to displaying stock market information, `financial.js` is also responsible for the signup/login/logout features.  To enable authentication, we leveraged the firebase `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, and `onAuthStateChanged` library functions. Each time a user logs in, the firebase database 'listens' for watchlist data on his or her 'branch'. The app saves the user's preferred stocks into the watchlist.

Another component is a Contacts page, handled by `form.js`, which provides a way for a user to contact the site maintainers. The form filled out in this page feeds data into a firebase database.

Our app footer contains basic links to the various APIs utilized as well as to major financial news sites. 


#### Comments

The Rutgers Financial App was added to the following github portfolio:
[hagbardceline23 portfolio](https://hagbardceline23.github.io/Rutgers-financial-api).