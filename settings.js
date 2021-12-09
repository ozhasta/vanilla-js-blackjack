playButton.addEventListener("click", saveSettings)
function saveSettings() {
  numberOfDecksInput = document.getElementById("numOfDecksInput").value
  console.log(numberOfDecksInput)
  const deckUsegeRatioInputElement = document.getElementsByName("prevent-card-counting")
  deckUsegeRatioInputElement.forEach((item) => {
    if (item.checked) {
      console.log(item.value)
      deckUsegeRatioInput = item.value
    }
  })
  const deckColorInputElement = document.getElementsByName("deck-color")
  deckColorInputElement.forEach((item) => {
    if (item.checked) {
      console.log(item.value)
      deckColorInput = item.value
    }
  })
  startGame()
}
function startGame() {
  console.log("game ready to start")
}
// todo enter player name
// function displayRadioValue() {
//   const ele = document.getElementsByName("gender")

//   for (let i = 0; i < ele.length; i++) {
//     if (ele[i].checked) document.getElementById("result").innerHTML = "Gender: " + ele[i].value
//   }
// }
