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

const selectedNodeInfoSpan = document.getElementById('selected-node-info');

document.onclick = () => {
  if (selectedNodeInfoSpan && figma.currentPage.selection.length > 0) {
    selectedNodeInfoSpan.innerText = figma.currentPage.selection[0].id
  }
}