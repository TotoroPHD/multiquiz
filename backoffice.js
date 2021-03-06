const obs = new OBSWebSocket();
var OBSconnected = false
var testmode = false;

var scoreManche = [];
var scoreTotel = [];

// ------------------------------------------------------
//         GESTION AFFICHAGE PAGE BACKOFFICE
// ------------------------------------------------------

function changeText(element, text) {
    document.getElementById(element).innerHTML = text;
}

function sendToOBS(obj) {
    obs.send("BroadcastCustomMessage", { "realm": "test", "data": obj });
}

var curGame = 0;
var curQuestion = 0;
changeText("btnGameTitle", games[curGame].title)
redrawQuestion()

var allBrowserSources = ["scoreTotal", "scoreManche", "programme", "maps", "pixel", "rightscreen", "simple", "double"]
var allVideos = ["VLC", "reprises", "racontemal", "cineplus", "Redactle", "Balthazar Pixel", "GeoGuessr Inversé"]


// ------------------------------------------------------
//         EVENEMENTS DE LA PAGE (CLICS, ETC)
// ------------------------------------------------------


document.getElementById('btnCam').addEventListener('click', function () {
    obs.send("GetSceneItemProperties", { "item": "cam" }).then(data => {
        if (data.visible) { document.getElementById('btnCam').innerHTML = "Camera is OFF" }
        else { document.getElementById('btnCam').innerHTML = "Camera is ON" }
        display("cam", !data.visible)
    })
});

document.getElementById('btnScore').addEventListener('click', function () {
    obs.send("GetSceneItemProperties", { "item": "scoreManche" }).then(data => {
        display("scoreManche", !data.visible)
    })
    obs.send("GetSceneItemProperties", { "item": "scoreTotal" }).then(data => {
        if (data.visible) display("scoreTotal", false)
    })
});

document.getElementById('btnTotal').addEventListener('click', function () {
    obs.send("GetSceneItemProperties", { "item": "scoreTotal" }).then(data => {
        display("scoreTotal", !data.visible)
    })
    obs.send("GetSceneItemProperties", { "item": "scoreManche" }).then(data => {
        if (data.visible) display("scoreManche", false)
    })
});

document.getElementById('btnNavigateur').addEventListener('click', function () {
    obs.send("GetSceneItemProperties", { "item": "rightscreen" }).then(data => {
        display("rightscreen", !data.visible)
        display("titre", data.visible)
    })
});

document.getElementById('btnProgramme').addEventListener('click', function () {
    obs.send("GetSceneItemProperties", { "item": "programme" }).then(data => {
        var programme = new Object();
        programme.games = [];
        programme.what = "programme"
        for (var i = 0; i < games.length; i++) {
            programme.games.push({ "title": games[i].title, "done": games[i].done })
        }
        sendToOBS(programme);
        display("programme", !data.visible)
    })
});

document.getElementById('btnPrevGame').addEventListener('click', function () {
    if (curGame > 0) { curGame--; changeText("btnGameTitle", games[curGame].title) }
    curQuestion = 0;
    redrawQuestion()
});

document.getElementById('btnNextGame').addEventListener('click', function () {
    if (curGame < games.length - 1) { curGame++; changeText("btnGameTitle", games[curGame].title) }
    curQuestion = 0;
    redrawQuestion()
});

document.getElementById('btnGameTitle').addEventListener('click', function () {
    display("titre", false);

    var titre = new Object();
    titre.what = "titre";
    titre.titre = games[curGame].title;
    sendToOBS(titre);

    display("titre", true);
});

document.getElementById('testMode').addEventListener('change', function () {
    if (this.checked) { testmode = true; } else { testmode = false; }
});

document.getElementById('darkmode').addEventListener('change', function () {
    if (this.checked) { document.getElementById("displayQuestions").style.backgroundColor = "black"; }
    else { document.getElementById("displayQuestions").style.backgroundColor = "white"; }
});

document.getElementById('btnPrevQuestion').addEventListener('click', function () {
    if (curQuestion > 0) { curQuestion--; redrawQuestion() }
});

document.getElementById('btnStartQuestion').addEventListener('click', function () {

    if (games[curGame].type == "simple") {
        var simple = new Object();
        simple.what = "simple"
        simple.answer = games[curGame].questions[curQuestion].name;
        simple.fullname = games[curGame].questions[curQuestion].fullname;

        sendToOBS(simple)

        games[curGame].questions[curQuestion].done = true;
    }

    if (games[curGame].type == "double") {
        var simple = new Object();
        simple.what = "simple"
        simple.answer = games[curGame].questions[curQuestion][0].name;
        simple.fullname = games[curGame].questions[curQuestion][0].fullname;
        sendToOBS(simple)

        var double = new Object();
        double.what = "double"
        double.answer = games[curGame].questions[curQuestion][1].name;
        double.fullname = games[curGame].questions[curQuestion][1].fullname;
        sendToOBS(double)
    }

    if (games[curGame].subtype == "pixel") {
        if (games[curGame].questions[curQuestion].url != null) {

            display("pixel", true);
            var pixel = new Object();
            pixel.what = "pixel";
            pixel.url = games[curGame].questions[curQuestion].url
            sendToOBS(pixel);
        }
    }

    if (games[curGame].subtype == "geoguessr") {
        if (games[curGame].questions[curQuestion].url != null) {
            var geoguessr = new Object();
            geoguessr.what = "geoguessr";
            geoguessr.url = games[curGame].questions[curQuestion].url
            sendToOBS(geoguessr);
        }
    }


});

document.getElementById('btnNextQuestion').addEventListener('click', function () {
    if (curQuestion < games[curGame].questions.length - 1) { curQuestion++; redrawQuestion() }
});

// ------------------------------------------------------
//                ENVOI VIDEOS TRANSITION
// ------------------------------------------------------


document.getElementById('btnGeoGuessr').addEventListener('click', function () {
    obs.send("GetSceneItemProperties", { "item": "GeoGuessr Inversé" }).then(data => {
        if (!data.visible) display("GeoGuessr Inversé", true)
    })
    obs.send("RestartMedia", { "sourceName": "GeoGuessr Inversé" })
});

document.getElementById('btnPixel').addEventListener('click', function () {
    obs.send("GetSceneItemProperties", { "item": "Balthazar Pixel" }).then(data => {
        if (!data.visible) display("Balthazar Pixel", true)
    })
    obs.send("RestartMedia", { "sourceName": "Balthazar Pixel" })
});

document.getElementById('btnRedactle').addEventListener('click', function () {
    obs.send("GetSceneItemProperties", { "item": "Redactle" }).then(data => {
        if (!data.visible) display("Redactle", true)
    })
    obs.send("RestartMedia", { "sourceName": "Redactle" })
});

document.getElementById('btnCineplus').addEventListener('click', function () {
    obs.send("GetSceneItemProperties", { "item": "cineplus" }).then(data => {
        if (!data.visible) display("cineplus", true)
    })
    obs.send("RestartMedia", { "sourceName": "cineplus" })
});

document.getElementById('btnRaconteMal').addEventListener('click', function () {
    obs.send("GetSceneItemProperties", { "item": "racontemal" }).then(data => {
        if (!data.visible) display("racontemal", true)
    })
    obs.send("RestartMedia", { "sourceName": "racontemal" })
});

document.getElementById('btnReprises').addEventListener('click', function () {
    obs.send("GetSceneItemProperties", { "item": "reprises" }).then(data => {
        if (!data.visible) display("reprises", true)
    })
    obs.send("RestartMedia", { "sourceName": "reprises" })
});


document.getElementById('btnHideVideos').addEventListener('click', function () {
    for (var i = 0; i < allVideos.length; i++) {
        display(allVideos[i], false)
    }
});

document.getElementById('btnHideBrowser').addEventListener('click', function () {
    for (var i = 0; i < allBrowserSources.length; i++) {
        display(allBrowserSources[i], false)
    }
});

document.getElementById('btnRefreshBrowser').addEventListener('click', function () {
    for (var i = 0; i < allBrowserSources.length; i++) {
        obs.send("RefreshBrowserSource", { "sourceName": allBrowserSources[i] })
    }
});

// ------------------------------------------------------
//                FONCTIONS UTILITAIRES 
// ------------------------------------------------------

function redrawQuestion() {
    if (games[curGame].questions.length > 0) {
        changeText("displayQuestions", displayQuestionFromJSON(games[curGame].questions[curQuestion]));
        if (games[curGame].questions[curQuestion].done) {
            document.getElementById("displayQuestions").style.backgroundColor = "green";
        }
        else {
            if (document.getElementById("darkmode").checked) {
                document.getElementById("displayQuestions").style.backgroundColor = "black";
            }
            else
                document.getElementById("displayQuestions").style.backgroundColor = "white";
        }

    }
    else {
        changeText("displayQuestions", "")
    }
    var curQ = curQuestion + 1
    document.getElementById('btnStartQuestion').innerHTML = "Start Question " + curQ + "/" + games[curGame].questions.length
}

function displayQuestionFromJSON(json) {
    var texte = JSON.stringify(json);
    texte = texte.replaceAll("{", "")
    texte = texte.replaceAll("}", "")
    texte = texte.replaceAll("\"", "")
    texte = texte.replaceAll(":", " : ")
    texte = texte.replaceAll(",", "<br>")
    console.log(texte)
    return texte
}

function connect() {
    obs.connect({ address: 'localhost:4444', password: OBSwsPassword })
}

function display(name, show) {
    obs.send("SetSceneItemRender", { "source": name, "render": show })
}

obs.addListener("BroadcastCustomMessage", function (event) {
    if (event.data.what == "pointsManche") {
        for (var i =0; i < event.data.winners.length; i++)
        {
            addPoints(event.data.winners[i].points, event.data.winners[i].user)
        }
    }

    scoreManche.users.sort(function (a, b) { return b.points - a.points; })

    var updateScoreManche = new Object();
    updateScoreManche.what = "updateScoreManche"
    updateScoreManche.scoreManche = scoreManche
    sendToOBS(updateScoreManche);
})

function addPoints(amount, user, print=false) {
    if (scoreManche.users.find(x => x.user === user) != undefined) {
        scoreManche.users.find(x => x.user === user).points = scoreManche.users.find(x => x.user === user).points + amount;
    }
    else {
        scoreManche.users.push({ 'user': user, 'points': amount });
    }

    if (print)
    {
        console.log("coucou");
    }
}

function changePointsForTotal()
{

}

function addPointsToTotal()
{
    
}

function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase().latinise();
    s2 = s2.toLowerCase().latinise();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

var Latinise = {}; Latinise.latin_map = { "Á": "A", "Ă": "A", "Ắ": "A", "Ặ": "A", "Ằ": "A", "Ẳ": "A", "Ẵ": "A", "Ǎ": "A", "Â": "A", "Ấ": "A", "Ậ": "A", "Ầ": "A", "Ẩ": "A", "Ẫ": "A", "Ä": "A", "Ǟ": "A", "Ȧ": "A", "Ǡ": "A", "Ạ": "A", "Ȁ": "A", "À": "A", "Ả": "A", "Ȃ": "A", "Ā": "A", "Ą": "A", "Å": "A", "Ǻ": "A", "Ḁ": "A", "Ⱥ": "A", "Ã": "A", "Ꜳ": "AA", "Æ": "AE", "Ǽ": "AE", "Ǣ": "AE", "Ꜵ": "AO", "Ꜷ": "AU", "Ꜹ": "AV", "Ꜻ": "AV", "Ꜽ": "AY", "Ḃ": "B", "Ḅ": "B", "Ɓ": "B", "Ḇ": "B", "Ƀ": "B", "Ƃ": "B", "Ć": "C", "Č": "C", "Ç": "C", "Ḉ": "C", "Ĉ": "C", "Ċ": "C", "Ƈ": "C", "Ȼ": "C", "Ď": "D", "Ḑ": "D", "Ḓ": "D", "Ḋ": "D", "Ḍ": "D", "Ɗ": "D", "Ḏ": "D", "ǲ": "D", "ǅ": "D", "Đ": "D", "Ƌ": "D", "Ǳ": "DZ", "Ǆ": "DZ", "É": "E", "Ĕ": "E", "Ě": "E", "Ȩ": "E", "Ḝ": "E", "Ê": "E", "Ế": "E", "Ệ": "E", "Ề": "E", "Ể": "E", "Ễ": "E", "Ḙ": "E", "Ë": "E", "Ė": "E", "Ẹ": "E", "Ȅ": "E", "È": "E", "Ẻ": "E", "Ȇ": "E", "Ē": "E", "Ḗ": "E", "Ḕ": "E", "Ę": "E", "Ɇ": "E", "Ẽ": "E", "Ḛ": "E", "Ꝫ": "ET", "Ḟ": "F", "Ƒ": "F", "Ǵ": "G", "Ğ": "G", "Ǧ": "G", "Ģ": "G", "Ĝ": "G", "Ġ": "G", "Ɠ": "G", "Ḡ": "G", "Ǥ": "G", "Ḫ": "H", "Ȟ": "H", "Ḩ": "H", "Ĥ": "H", "Ⱨ": "H", "Ḧ": "H", "Ḣ": "H", "Ḥ": "H", "Ħ": "H", "Í": "I", "Ĭ": "I", "Ǐ": "I", "Î": "I", "Ï": "I", "Ḯ": "I", "İ": "I", "Ị": "I", "Ȉ": "I", "Ì": "I", "Ỉ": "I", "Ȋ": "I", "Ī": "I", "Į": "I", "Ɨ": "I", "Ĩ": "I", "Ḭ": "I", "Ꝺ": "D", "Ꝼ": "F", "Ᵹ": "G", "Ꞃ": "R", "Ꞅ": "S", "Ꞇ": "T", "Ꝭ": "IS", "Ĵ": "J", "Ɉ": "J", "Ḱ": "K", "Ǩ": "K", "Ķ": "K", "Ⱪ": "K", "Ꝃ": "K", "Ḳ": "K", "Ƙ": "K", "Ḵ": "K", "Ꝁ": "K", "Ꝅ": "K", "Ĺ": "L", "Ƚ": "L", "Ľ": "L", "Ļ": "L", "Ḽ": "L", "Ḷ": "L", "Ḹ": "L", "Ⱡ": "L", "Ꝉ": "L", "Ḻ": "L", "Ŀ": "L", "Ɫ": "L", "ǈ": "L", "Ł": "L", "Ǉ": "LJ", "Ḿ": "M", "Ṁ": "M", "Ṃ": "M", "Ɱ": "M", "Ń": "N", "Ň": "N", "Ņ": "N", "Ṋ": "N", "Ṅ": "N", "Ṇ": "N", "Ǹ": "N", "Ɲ": "N", "Ṉ": "N", "Ƞ": "N", "ǋ": "N", "Ñ": "N", "Ǌ": "NJ", "Ó": "O", "Ŏ": "O", "Ǒ": "O", "Ô": "O", "Ố": "O", "Ộ": "O", "Ồ": "O", "Ổ": "O", "Ỗ": "O", "Ö": "O", "Ȫ": "O", "Ȯ": "O", "Ȱ": "O", "Ọ": "O", "Ő": "O", "Ȍ": "O", "Ò": "O", "Ỏ": "O", "Ơ": "O", "Ớ": "O", "Ợ": "O", "Ờ": "O", "Ở": "O", "Ỡ": "O", "Ȏ": "O", "Ꝋ": "O", "Ꝍ": "O", "Ō": "O", "Ṓ": "O", "Ṑ": "O", "Ɵ": "O", "Ǫ": "O", "Ǭ": "O", "Ø": "O", "Ǿ": "O", "Õ": "O", "Ṍ": "O", "Ṏ": "O", "Ȭ": "O", "Ƣ": "OI", "Ꝏ": "OO", "Ɛ": "E", "Ɔ": "O", "Ȣ": "OU", "Ṕ": "P", "Ṗ": "P", "Ꝓ": "P", "Ƥ": "P", "Ꝕ": "P", "Ᵽ": "P", "Ꝑ": "P", "Ꝙ": "Q", "Ꝗ": "Q", "Ŕ": "R", "Ř": "R", "Ŗ": "R", "Ṙ": "R", "Ṛ": "R", "Ṝ": "R", "Ȑ": "R", "Ȓ": "R", "Ṟ": "R", "Ɍ": "R", "Ɽ": "R", "Ꜿ": "C", "Ǝ": "E", "Ś": "S", "Ṥ": "S", "Š": "S", "Ṧ": "S", "Ş": "S", "Ŝ": "S", "Ș": "S", "Ṡ": "S", "Ṣ": "S", "Ṩ": "S", "Ť": "T", "Ţ": "T", "Ṱ": "T", "Ț": "T", "Ⱦ": "T", "Ṫ": "T", "Ṭ": "T", "Ƭ": "T", "Ṯ": "T", "Ʈ": "T", "Ŧ": "T", "Ɐ": "A", "Ꞁ": "L", "Ɯ": "M", "Ʌ": "V", "Ꜩ": "TZ", "Ú": "U", "Ŭ": "U", "Ǔ": "U", "Û": "U", "Ṷ": "U", "Ü": "U", "Ǘ": "U", "Ǚ": "U", "Ǜ": "U", "Ǖ": "U", "Ṳ": "U", "Ụ": "U", "Ű": "U", "Ȕ": "U", "Ù": "U", "Ủ": "U", "Ư": "U", "Ứ": "U", "Ự": "U", "Ừ": "U", "Ử": "U", "Ữ": "U", "Ȗ": "U", "Ū": "U", "Ṻ": "U", "Ų": "U", "Ů": "U", "Ũ": "U", "Ṹ": "U", "Ṵ": "U", "Ꝟ": "V", "Ṿ": "V", "Ʋ": "V", "Ṽ": "V", "Ꝡ": "VY", "Ẃ": "W", "Ŵ": "W", "Ẅ": "W", "Ẇ": "W", "Ẉ": "W", "Ẁ": "W", "Ⱳ": "W", "Ẍ": "X", "Ẋ": "X", "Ý": "Y", "Ŷ": "Y", "Ÿ": "Y", "Ẏ": "Y", "Ỵ": "Y", "Ỳ": "Y", "Ƴ": "Y", "Ỷ": "Y", "Ỿ": "Y", "Ȳ": "Y", "Ɏ": "Y", "Ỹ": "Y", "Ź": "Z", "Ž": "Z", "Ẑ": "Z", "Ⱬ": "Z", "Ż": "Z", "Ẓ": "Z", "Ȥ": "Z", "Ẕ": "Z", "Ƶ": "Z", "Ĳ": "IJ", "Œ": "OE", "ᴀ": "A", "ᴁ": "AE", "ʙ": "B", "ᴃ": "B", "ᴄ": "C", "ᴅ": "D", "ᴇ": "E", "ꜰ": "F", "ɢ": "G", "ʛ": "G", "ʜ": "H", "ɪ": "I", "ʁ": "R", "ᴊ": "J", "ᴋ": "K", "ʟ": "L", "ᴌ": "L", "ᴍ": "M", "ɴ": "N", "ᴏ": "O", "ɶ": "OE", "ᴐ": "O", "ᴕ": "OU", "ᴘ": "P", "ʀ": "R", "ᴎ": "N", "ᴙ": "R", "ꜱ": "S", "ᴛ": "T", "ⱻ": "E", "ᴚ": "R", "ᴜ": "U", "ᴠ": "V", "ᴡ": "W", "ʏ": "Y", "ᴢ": "Z", "á": "a", "ă": "a", "ắ": "a", "ặ": "a", "ằ": "a", "ẳ": "a", "ẵ": "a", "ǎ": "a", "â": "a", "ấ": "a", "ậ": "a", "ầ": "a", "ẩ": "a", "ẫ": "a", "ä": "a", "ǟ": "a", "ȧ": "a", "ǡ": "a", "ạ": "a", "ȁ": "a", "à": "a", "ả": "a", "ȃ": "a", "ā": "a", "ą": "a", "ᶏ": "a", "ẚ": "a", "å": "a", "ǻ": "a", "ḁ": "a", "ⱥ": "a", "ã": "a", "ꜳ": "aa", "æ": "ae", "ǽ": "ae", "ǣ": "ae", "ꜵ": "ao", "ꜷ": "au", "ꜹ": "av", "ꜻ": "av", "ꜽ": "ay", "ḃ": "b", "ḅ": "b", "ɓ": "b", "ḇ": "b", "ᵬ": "b", "ᶀ": "b", "ƀ": "b", "ƃ": "b", "ɵ": "o", "ć": "c", "č": "c", "ç": "c", "ḉ": "c", "ĉ": "c", "ɕ": "c", "ċ": "c", "ƈ": "c", "ȼ": "c", "ď": "d", "ḑ": "d", "ḓ": "d", "ȡ": "d", "ḋ": "d", "ḍ": "d", "ɗ": "d", "ᶑ": "d", "ḏ": "d", "ᵭ": "d", "ᶁ": "d", "đ": "d", "ɖ": "d", "ƌ": "d", "ı": "i", "ȷ": "j", "ɟ": "j", "ʄ": "j", "ǳ": "dz", "ǆ": "dz", "é": "e", "ĕ": "e", "ě": "e", "ȩ": "e", "ḝ": "e", "ê": "e", "ế": "e", "ệ": "e", "ề": "e", "ể": "e", "ễ": "e", "ḙ": "e", "ë": "e", "ė": "e", "ẹ": "e", "ȅ": "e", "è": "e", "ẻ": "e", "ȇ": "e", "ē": "e", "ḗ": "e", "ḕ": "e", "ⱸ": "e", "ę": "e", "ᶒ": "e", "ɇ": "e", "ẽ": "e", "ḛ": "e", "ꝫ": "et", "ḟ": "f", "ƒ": "f", "ᵮ": "f", "ᶂ": "f", "ǵ": "g", "ğ": "g", "ǧ": "g", "ģ": "g", "ĝ": "g", "ġ": "g", "ɠ": "g", "ḡ": "g", "ᶃ": "g", "ǥ": "g", "ḫ": "h", "ȟ": "h", "ḩ": "h", "ĥ": "h", "ⱨ": "h", "ḧ": "h", "ḣ": "h", "ḥ": "h", "ɦ": "h", "ẖ": "h", "ħ": "h", "ƕ": "hv", "í": "i", "ĭ": "i", "ǐ": "i", "î": "i", "ï": "i", "ḯ": "i", "ị": "i", "ȉ": "i", "ì": "i", "ỉ": "i", "ȋ": "i", "ī": "i", "į": "i", "ᶖ": "i", "ɨ": "i", "ĩ": "i", "ḭ": "i", "ꝺ": "d", "ꝼ": "f", "ᵹ": "g", "ꞃ": "r", "ꞅ": "s", "ꞇ": "t", "ꝭ": "is", "ǰ": "j", "ĵ": "j", "ʝ": "j", "ɉ": "j", "ḱ": "k", "ǩ": "k", "ķ": "k", "ⱪ": "k", "ꝃ": "k", "ḳ": "k", "ƙ": "k", "ḵ": "k", "ᶄ": "k", "ꝁ": "k", "ꝅ": "k", "ĺ": "l", "ƚ": "l", "ɬ": "l", "ľ": "l", "ļ": "l", "ḽ": "l", "ȴ": "l", "ḷ": "l", "ḹ": "l", "ⱡ": "l", "ꝉ": "l", "ḻ": "l", "ŀ": "l", "ɫ": "l", "ᶅ": "l", "ɭ": "l", "ł": "l", "ǉ": "lj", "ſ": "s", "ẜ": "s", "ẛ": "s", "ẝ": "s", "ḿ": "m", "ṁ": "m", "ṃ": "m", "ɱ": "m", "ᵯ": "m", "ᶆ": "m", "ń": "n", "ň": "n", "ņ": "n", "ṋ": "n", "ȵ": "n", "ṅ": "n", "ṇ": "n", "ǹ": "n", "ɲ": "n", "ṉ": "n", "ƞ": "n", "ᵰ": "n", "ᶇ": "n", "ɳ": "n", "ñ": "n", "ǌ": "nj", "ó": "o", "ŏ": "o", "ǒ": "o", "ô": "o", "ố": "o", "ộ": "o", "ồ": "o", "ổ": "o", "ỗ": "o", "ö": "o", "ȫ": "o", "ȯ": "o", "ȱ": "o", "ọ": "o", "ő": "o", "ȍ": "o", "ò": "o", "ỏ": "o", "ơ": "o", "ớ": "o", "ợ": "o", "ờ": "o", "ở": "o", "ỡ": "o", "ȏ": "o", "ꝋ": "o", "ꝍ": "o", "ⱺ": "o", "ō": "o", "ṓ": "o", "ṑ": "o", "ǫ": "o", "ǭ": "o", "ø": "o", "ǿ": "o", "õ": "o", "ṍ": "o", "ṏ": "o", "ȭ": "o", "ƣ": "oi", "ꝏ": "oo", "ɛ": "e", "ᶓ": "e", "ɔ": "o", "ᶗ": "o", "ȣ": "ou", "ṕ": "p", "ṗ": "p", "ꝓ": "p", "ƥ": "p", "ᵱ": "p", "ᶈ": "p", "ꝕ": "p", "ᵽ": "p", "ꝑ": "p", "ꝙ": "q", "ʠ": "q", "ɋ": "q", "ꝗ": "q", "ŕ": "r", "ř": "r", "ŗ": "r", "ṙ": "r", "ṛ": "r", "ṝ": "r", "ȑ": "r", "ɾ": "r", "ᵳ": "r", "ȓ": "r", "ṟ": "r", "ɼ": "r", "ᵲ": "r", "ᶉ": "r", "ɍ": "r", "ɽ": "r", "ↄ": "c", "ꜿ": "c", "ɘ": "e", "ɿ": "r", "ś": "s", "ṥ": "s", "š": "s", "ṧ": "s", "ş": "s", "ŝ": "s", "ș": "s", "ṡ": "s", "ṣ": "s", "ṩ": "s", "ʂ": "s", "ᵴ": "s", "ᶊ": "s", "ȿ": "s", "ɡ": "g", "ᴑ": "o", "ᴓ": "o", "ᴝ": "u", "ť": "t", "ţ": "t", "ṱ": "t", "ț": "t", "ȶ": "t", "ẗ": "t", "ⱦ": "t", "ṫ": "t", "ṭ": "t", "ƭ": "t", "ṯ": "t", "ᵵ": "t", "ƫ": "t", "ʈ": "t", "ŧ": "t", "ᵺ": "th", "ɐ": "a", "ᴂ": "ae", "ǝ": "e", "ᵷ": "g", "ɥ": "h", "ʮ": "h", "ʯ": "h", "ᴉ": "i", "ʞ": "k", "ꞁ": "l", "ɯ": "m", "ɰ": "m", "ᴔ": "oe", "ɹ": "r", "ɻ": "r", "ɺ": "r", "ⱹ": "r", "ʇ": "t", "ʌ": "v", "ʍ": "w", "ʎ": "y", "ꜩ": "tz", "ú": "u", "ŭ": "u", "ǔ": "u", "û": "u", "ṷ": "u", "ü": "u", "ǘ": "u", "ǚ": "u", "ǜ": "u", "ǖ": "u", "ṳ": "u", "ụ": "u", "ű": "u", "ȕ": "u", "ù": "u", "ủ": "u", "ư": "u", "ứ": "u", "ự": "u", "ừ": "u", "ử": "u", "ữ": "u", "ȗ": "u", "ū": "u", "ṻ": "u", "ų": "u", "ᶙ": "u", "ů": "u", "ũ": "u", "ṹ": "u", "ṵ": "u", "ᵫ": "ue", "ꝸ": "um", "ⱴ": "v", "ꝟ": "v", "ṿ": "v", "ʋ": "v", "ᶌ": "v", "ⱱ": "v", "ṽ": "v", "ꝡ": "vy", "ẃ": "w", "ŵ": "w", "ẅ": "w", "ẇ": "w", "ẉ": "w", "ẁ": "w", "ⱳ": "w", "ẘ": "w", "ẍ": "x", "ẋ": "x", "ᶍ": "x", "ý": "y", "ŷ": "y", "ÿ": "y", "ẏ": "y", "ỵ": "y", "ỳ": "y", "ƴ": "y", "ỷ": "y", "ỿ": "y", "ȳ": "y", "ẙ": "y", "ɏ": "y", "ỹ": "y", "ź": "z", "ž": "z", "ẑ": "z", "ʑ": "z", "ⱬ": "z", "ż": "z", "ẓ": "z", "ȥ": "z", "ẕ": "z", "ᵶ": "z", "ᶎ": "z", "ʐ": "z", "ƶ": "z", "ɀ": "z", "ﬀ": "ff", "ﬃ": "ffi", "ﬄ": "ffl", "ﬁ": "fi", "ﬂ": "fl", "ĳ": "ij", "œ": "oe", "ﬆ": "st", "ₐ": "a", "ₑ": "e", "ᵢ": "i", "ⱼ": "j", "ₒ": "o", "ᵣ": "r", "ᵤ": "u", "ᵥ": "v", "ₓ": "x" };
String.prototype.latinise = function () { return this.replace(/[^A-Za-z0-9\[\] ]/g, function (a) { return Latinise.latin_map[a] || a }) };
String.prototype.latinize = String.prototype.latinise;
String.prototype.isLatin = function () { return this == this.latinise() }

// ------------------------------------------------------
//               GESTION COMPTE A REBOURS
// ------------------------------------------------------

setInterval(function () {
    if (obs._connected) {
        if (!OBSconnected) {
            OBSconnected = true;
            changeText('OBScoLabel', "<span style=\"color:green\">Connecté à OBS Websocket</span>");
        }
    }
    else {
        if (OBSconnected) {
            OBSconnected = false;
            changeText('OBScoLabel', "<span style=\"color:red\">Non connecté à OBS Websocket</span>");
        }
    }
}, 1000);

// ------------------------------------------------------
//                    GESTION DU CHAT 
// ------------------------------------------------------

ComfyJS.onChat = (user, message, flags, self, extra) => {
    console.log(user, message, extra);



}
ComfyJS.Init(twitchAccount, OAuth);