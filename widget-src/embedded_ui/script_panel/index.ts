enum elementId {
    userInput="userInput",
    submit="submit"
  }
  
  const submitButton = document.getElementById(elementId.submit);

if (submitButton) {
    submitButton.onclick = () => {
      console.log("submit click");
    };
}

addEventListener("message", (event) => {
    console.log(event);
});
