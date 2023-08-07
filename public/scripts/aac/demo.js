var tiles;
var msgs = [];

window.onload = () => {
    for (var i = 0; i < 20; i++) {
        var row = document.getElementsByClassName("row")[0];
        var g = "gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg";
        row.innerHTML += "<div class=\"col\"><div id=\"msg\">this is super long" + g + "</div></div>";
    }

    tiles = document.querySelectorAll(".col");
    var msgDivs = document.querySelectorAll("#msg");
    for (var i = 0; i < tiles.length; i++) {
        msgs[i] = msgDivs[i].innerHTML;
        tiles[i].onclick = () => {
            textToSpeech(msgs[i]);
        }
    }
}