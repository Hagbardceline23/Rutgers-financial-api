var url = "https://api.nytimes.com/svc/topstories/v2/business.json";
url += '?' + $.param({
    'api-key': "2118d3827b3d449e94e71783ba06ee1a"
});
$.ajax({
    url: url,
    method: 'GET',
}).done(function (result) {
    console.log(result);
    document.getElementById("headline").innerHTML = result.results["0"].title;
    document.getElementById("headline1").innerHTML = result.results["1"].title;
    document.getElementById("headline2").innerHTML = result.results["2"].title;
    document.getElementById("headline3").innerHTML = result.results["3"].title;
    document.getElementById("headline4").innerHTML = result.results["4"].title;
    document.getElementById("headline5").innerHTML = result.results["5"].title;


    document.getElementById("abstract").innerHTML = result.results["0"].abstract;
    document.getElementById("abstract1").innerHTML = result.results["1"].abstract;
    document.getElementById("abstract2").innerHTML = result.results["3"].abstract;
    document.getElementById("abstract3").innerHTML = result.results["4"].abstract;
    document.getElementById("abstract4").innerHTML = result.results["5"].abstract;
    document.getElementById("abstract5").innerHTML = result.results["6"].abstract;


    document.getElementById("byline").innerHTML = result.results["0"].byline;
    document.getElementById("byline1").innerHTML = result.results["1"].byline;
    document.getElementById("byline2").innerHTML = result.results["2"].byline;
    document.getElementById("byline3").innerHTML = result.results["3"].byline;
    document.getElementById("byline4").innerHTML = result.results["4"].byline;
    document.getElementById("byline5").innerHTML = result.results["5"].byline;



    $("#url").append("<a href=" + result.results["0"].url + ">" +
        result.results["0"].url + "</a>");
    $("#url1").append("<a href=" + result.results["1"].url + ">" +
        result.results["1"].url + "</a>");
    $("#url2").append("<a href=" + result.results["2"].url + ">" +
        result.results["2"].url + "</a>");
    $("#url3").append("<a href=" + result.results["3"].url + ">" +
        result.results["3"].url + "</a>");
    $("#url4").append("<a href=" + result.results["4"].url + ">" +
        result.results["4"].url + "</a>");
    $("#url5").append("<a href=" + result.results["5"].url + ">" +
        result.results["5"].url + "</a>");

}).fail(function (err) {
    throw err;
});



