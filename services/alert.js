$("#loginAlert").hide();
const urlParams = new URLSearchParams(window.location.search);
const myParam = urlParams.get("error");

if (myParam) {
  // Set the text content of the <p> element to the value of myParam
  $("#loginAlert p").text(myParam);
  $("#loginAlert").show();
}
