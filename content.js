var currentElement;

// Mouse listener for all links on page
document.addEventListener('mousemove', async function (e) {
  var eventElement = e.target;
  // if the mouse did not move of the link don't fire the event again
  if (eventElement == currentElement){
    return;
  } else {
    try {
      var popups = document.getElementsByClassName("trumpCountPopup");
      popups[0].parentNode.removeChild(popups[0]);
    } catch {}
  }
  currentElement = e.target
  if (!eventElement.href) return;
  // if the mouse is still hovering on the same element after waiting
  await sleep(250);
  if (currentElement == eventElement){
    var trumpCount = await checkLinkForMatches(eventElement.href);
    if (trumpCount <= 0) return;
    var y = window.scrollY + eventElement.getBoundingClientRect().top
    var height = eventElement.getBoundingClientRect().height;
    createPopup(trumpCount, e.pageX, y, e.clientX, e.clientY, height);
  }
});


// check the link for matches
async function checkLinkForMatches(link){
  var url = "https://api.allorigins.win/get?url=" + encodeURIComponent(link) + "&callback=?";
  await $.get(url, function(response) {
    const re = / Trump/g;
    var matches = [...response.matchAll(re)];
    trumpCount = matches.length;
  });
  return trumpCount;
}


function createPopup(trumpCount, pageX, pageY, screenX, screenY, elHeight){
  // remove any remaining popups
  try {
    var popups = document.getElementsByClassName("trumpCountPopup");
    popups[0].parentNode.removeChild(popups[0]);
  } catch {}

  var popup = document.createElement("div");
  popup.setAttribute("class", "trumpCountPopup");
  // default styling
  popup.style.top = pageY - 60 +"px";
  popup.style.left = pageX - 125 + "px";
  // check if popup fits within the screen
  var vertStyle = "";
  // too close to the top
  if (screenY < 170){
    vertStyle = "Down";
    popup.style.top = pageY + elHeight + 6 +"px";
  }
  var horzStyle = "";
  // too far left
  if (screenX < 130){
    horzStyle = "Left";
    popup.style.left = "0px";
    // too far right
  } else if (window.innerWidth - screenX < 130){
    horzStyle = "Right";
    popup.style.left = pageX - 230 + "px";
  }
  // style according to position
  popup.setAttribute("id", "trumpCountPopup"+vertStyle+horzStyle);
  var innerText = document.createElement("div");
  // create div inside with text
  innerText.setAttribute("id", "trumpCountText");
  innerText.innerHTML = `${trumpCount} mentions of Trump`;
  if (trumpCount == 1) innerText.innerHTML = `${trumpCount} mention of Trump`;
  // add image according to count
  var image = document.createElement("img");
  image.setAttribute("id", "trumpCountImage");
  if (trumpCount < 10){
    image.src = chrome.extension.getURL("trump_sad.png");
  } else if (trumpCount < 50){
    image.src = chrome.extension.getURL("trump_neutral.png");
  }else {
    image.src = chrome.extension.getURL("trump_angry.png");
  }
  popup.appendChild(image);
  popup.appendChild(innerText);
  document.body.appendChild(popup);
}

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}
