var stars = [];
var numStars = 0;

function handleStarClick(star) {
    for (var i = 0; i < star; i++) 
        stars[i].checked = true;
    for (var i = star; i < stars.length; i++)
        stars[i].checked = false;

    numStars = star;
}

function setEvents() {
    stars[0].onchange = () => { handleStarClick(1); }
    stars[1].onchange = () => { handleStarClick(2); }
    stars[2].onchange = () => { handleStarClick(3); }
    stars[3].onchange = () => { handleStarClick(4); }
    stars[4].onchange = () => { handleStarClick(5); }
}

window.onload = () => {
    for (var i = 1; i <= 5; i++)
        stars.push(document.querySelector(`#star${i}`));
    
    setEvents();
}