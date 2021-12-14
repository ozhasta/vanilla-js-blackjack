"use strict"
const currentScreenResult = document.querySelector("#current-screen-result")
const previousScreenResult = document.querySelector("#previous-screen-result")
const previousScreenOperation = document.querySelector("#previous-screen-operation")
const btnContainer = document.querySelector(".btn-container")
let currentOperation, previousOperation, result

function operInit() {
  // nokta(".") karakteri tek basina girdi olmasin
  if (currentScreenResult.innerText !== ".") {
    // ust ekran dolu ama alt ekran bos ise
    if (!currentScreenResult.innerText && previousScreenResult.innerText) {
      previousOperation = currentOperation
      previousScreenOperation.innerText = currentOperation
      // alt ekran bos ise
    } else {
      previousOperation = currentOperation
      previousScreenOperation.innerText = currentOperation
      previousScreenResult.innerText = currentScreenResult.innerText
      currentScreenResult.innerText = ""
    }
  }
}

function compute(num1, oper, num2) {
  oper = previousOperation
  // which is same as "return num1 + num2" or "return num1 - num2"
  result = Function("return " + Number(num1) + oper + Number(num2))()
  result = parseFloat(result.toFixed(6))
  // result = result.toLocaleString()
  currentScreenResult.innerText = result
}

function equals() {
  // sadece tum girdiler dolu ve gecerli ise hesaplama yapilsin
  if (currentScreenResult.innerText && previousScreenResult.innerText && previousOperation && currentScreenResult.innerText !== ".") {
    compute(Number(previousScreenResult.innerText), previousOperation, Number(currentScreenResult.innerText))
    previousScreenResult.innerText = ""
    previousScreenOperation.innerText = ""
  }
  return
}

// add event listener to btn-container only
btnContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("calc-btn")) {
    const btn = e.target
    currentOperation = btn.dataset.operator
    handleInput()
  }
})

// add event listener for keydown
document.addEventListener(
  "keydown",
  (e) => {
    currentOperation = e.key
    handleInput()
  },
  false
)

function handleInput() {
  switch (currentOperation) {
    case "/":
    case "*":
    case "-":
    case "+":
      equals()
      operInit()
      break

    case "Enter": // for keyboard
    case "=":
      equals()
      break

    case "Delete": // for keyboard
    case "C":
      previousOperation = null
      currentOperation = null
      currentScreenResult.innerText = 0
      previousScreenResult.innerText = ""
      previousScreenOperation.innerText = ""
      break

    case "Backspace": // for keyboard
    case "←":
      currentScreenResult.innerText = currentScreenResult.innerText.substring(0, currentScreenResult.innerText.length - 1)
      break

    case ".": // for keyboard
    case ",":
      if (currentScreenResult.innerText.includes(".")) {
      } else {
        currentScreenResult.innerText = currentScreenResult.innerText + "."
      }
      break

    default:
      // default section is only for numbers
      if (!isNaN(currentOperation)) {
        if (currentScreenResult.innerText === "0") {
          currentScreenResult.innerText = currentOperation
        } else {
          if (currentScreenResult.innerText.length === 12) {
            return // max input length
          }
          currentScreenResult.innerText += currentOperation
        }
      }
  }
}
