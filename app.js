"use strict"
const dealerHand = []
const playerHand = []
const currentDeck = []
const playerHandEl = document.querySelector(".playerHand .cards")
const dealerHandEl = document.querySelector(".dealerHand .cards")
const playerRoundTotalEl = document.querySelector("#player-round-total")
const dealerRoundTotalEl = document.querySelector("#dealer-round-total")
const remainingCardsCounterEl = document.querySelector(".remaining-cards > span")
const playerNameOutputEl = document.querySelector("#player-name-output")
const bankBalanceEl = document.querySelector("#bank-balance")
const firstBetEl = document.querySelector("#first-bet")
const controlChipsEl = document.querySelector(".control-chips")
const chipBtnsEl = document.querySelectorAll(".control-chips > .chip")
const roundBetEl = document.querySelector("#round-bet")
const clearBetBtnEl = document.querySelector("#clear-btn")
const allinBtnEl = document.querySelector("#allin-btn")
const dealerRibbonEl = document.querySelector("#dealer-msg")
const playerRibbonEl = document.querySelector("#player-msg")

let dealerHasBJ = false
let playerHasBJ = false
let dealerRoundTotal = 0
let playerRoundTotal = 0
let playersTurn = false
let bankBalance = 1000
let currentBet = 0
let bankBalanceRestorePoint
let dealerHiddenCardValue = 0
let lastCard

// >>> Setting variables
const playBtnEl = document.querySelector("#play-btn")
const playerNameInputEl = document.querySelector("#player-name-input")
let numberOfDecksInput = 4
let deckUsegeRatioInput = 100
let deckColorInput
let playerName = "Player"
// Setting variables <<<

/****************
settings section
*****************/
const hiddenCardBackImg = document.createElement("img")
hiddenCardBackImg.id = "hiddenCardBack"

playBtnEl.addEventListener("click", saveSettings)
function saveSettings() {
  numberOfDecksInput = document.getElementById("numberOfDecksInput").value
  const deckUsegeRatioInputEl = document.getElementsByName("prevent-card-counting")
  deckUsegeRatioInputEl.forEach((item) => {
    if (item.checked) {
      deckUsegeRatioInput = item.value
    }
  })
  const deckColorInputEl = document.getElementsByName("deck-color")
  deckColorInputEl.forEach((item) => {
    if (item.checked) {
      deckColorInput = item.value
    }
  })

  hiddenCardBackImg.src = `others/${deckColorInput}_back.png`

  playerName = playerNameInputEl.value
  playerNameOutputEl.textContent = playerName

  bankBalanceEl.textContent = bankBalance
  bankBalanceRestorePoint = bankBalance

  document.getElementById("settings-container").classList.toggle("hidden")
  document.getElementById("betting-container").classList.toggle("hidden")
  document.getElementById("balance").classList.toggle("hidden")
  document.getElementById("betting-fixed-bottom").classList.toggle("hidden")

  checkBalanceForButtons()
  betting()
}

/****************
betting section
*****************/
const betBtnEl = document.querySelector("#bet-btn")
function betting() {
  betBtnEl.addEventListener("click", () => {
    if (currentBet === 0) {
      return
    }
    roundBetEl.textContent = currentBet
    document.getElementById("betting-container").classList.toggle("hidden")
    document.getElementById("round-container").classList.toggle("hidden")
    document.getElementById("balance").classList.toggle("balance-move")
    document.getElementById("betting-fixed-bottom").classList.toggle("hidden")
    document.getElementById("round-fixed-bottom").classList.toggle("hidden")
    startRound()
  })
}

// check balance for disabled chip buttons
function checkBalanceForButtons() {
  chipBtnsEl.forEach((btn) => {
    // if target chip's bet value bigger then bankBalance disable that chip
    btn.disabled = Number(btn.textContent) > bankBalance ? true : false
  })
  // if current bet equals to 0 then disable clearBet button
  clearBetBtnEl.disabled = currentBet === 0 ? true : false
  // if bank balance equals to 0 then disable allin button
  allinBtnEl.disabled = bankBalance === 0 ? true : false
}

// add event listener to control-chips div
controlChipsEl.addEventListener("click", (e) => {
  const clickedBtn = e.target
  if (clickedBtn.classList.contains("chip")) {
    bankBalanceRestorePoint = bankBalanceRestorePoint ? bankBalanceRestorePoint : bankBalance
    if (bankBalanceRestorePoint) currentBet += Number(clickedBtn.textContent)
    firstBetEl.textContent = currentBet
    bankBalance -= Number(clickedBtn.textContent)
    bankBalanceEl.textContent = bankBalance
    checkBalanceForButtons()
  }
})

clearBetBtnEl.addEventListener("click", () => {
  currentBet = 0
  firstBetEl.textContent = currentBet
  bankBalance = bankBalanceRestorePoint
  bankBalanceEl.textContent = bankBalanceRestorePoint
  checkBalanceForButtons()
})

allinBtnEl.addEventListener("click", () => {
  currentBet += bankBalance
  firstBetEl.textContent = currentBet
  bankBalance = 0
  bankBalanceEl.textContent = bankBalance
  checkBalanceForButtons()
})

/****************
game section
*****************/
/* deck copy for debugging
  hearts: ["H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "HT", "HJ", "HQ", "HK", "HA"],
  spades: ["S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "ST", "SJ", "SQ", "SK", "SA"],
  clubs: ["C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "CT", "CJ", "CQ", "CK", "CA"],
  diamonds: ["D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "DT", "DJ", "DQ", "DK", "DA"],
*/
const deck = {
  // hearts: ["HK", "H2", "HA", "HK", "H9"],
  // spades: ["HA", "HA", "HA", "HA"],
  // clubs: ["HA", "HA", "HA", "HA"],
  // diamonds: ["H8", "HK", "HA", "HK", "HA"] // both bj
  // diamonds: ["H8", "H2", "HA", "HK", "HA"] // dealer bj
  // diamonds: ["H8", "HK", "HA", "H2", "HA"] // player bj
  hearts: ["H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "HT", "HJ", "HQ", "HK", "HA"],
  spades: ["S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "ST", "SJ", "SQ", "SK", "SA"],
  clubs: ["C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "CT", "CJ", "CQ", "CK", "CA"],
  diamonds: ["D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "DT", "DJ", "DQ", "DK", "DA"]
}
const fullDeck = [...deck.hearts, ...deck.spades, ...deck.clubs, ...deck.diamonds]

function multipleDecks(numOfDeck) {
  let multipleDecks = []
  for (let i = 0; i < numOfDeck; i++) {
    multipleDecks.push(...fullDeck)
  }
  // console.log("desteler birlestirildi")
  return multipleDecks
}

function shuffle() {
  const arr = multipleDecks(numberOfDecksInput)
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  // console.log("deste karistirildi")
  return arr
}

function decideCardValue(currentCard) {
  let cardFace = currentCard.slice(-1)
  // gecerli kartin dosya isminde bu karakterler var mi, regex
  const KQJT = /(K|Q|J|T)/.test(cardFace) // true or false
  if (cardFace === "A") {
    /* hesaplama yaparken kimin kartlarini saydigini, degisken_(roundTotal)
    vasitasi ile oyuncu sirasina_(playersTurn) gore belirle */
    let roundTotal = playersTurn ? playerRoundTotal : dealerRoundTotal
    if (roundTotal >= 11) {
      //  console.log("as 1 sayildi")
      return 1
    } else {
      //  console.log("as 11 sayildi")
      return 11
    }
    // gecerli kartin dosya isminde bu karakterler var mi, if ve regex ile test
  } else if (KQJT) {
    return 10
  } else {
    return parseInt(cardFace)
  }
}

function drawACard() {
  lastCard = currentDeck.pop()
  const cardDiv = document.createElement("div")
  cardDiv.classList.add("card")
  const cardImg = document.createElement("img")
  cardImg.src = `deck/${lastCard}.png`
  cardDiv.append(cardImg)

  if (playersTurn) {
    playerHandEl.append(cardDiv)
    playerRoundTotal += decideCardValue(lastCard)
    playerRoundTotalEl.textContent = playerRoundTotal
    if (playerRoundTotal === 21) {
      stand()
    }
    if (playerRoundTotal > 21) {
      playerBust()
    }
  } else {
    if (dealerHand.length === 0) {
      cardDiv.append(hiddenCardBackImg)
      dealerHandEl.append(cardDiv)
      dealerHiddenCardValue = decideCardValue(lastCard)
    } else {
      dealerHandEl.append(cardDiv)
      dealerRoundTotal += decideCardValue(lastCard)
      dealerRoundTotalEl.textContent = dealerRoundTotal
    }
  }
  remainingCardsCounterEl.textContent = currentDeck.length
  return lastCard
}

const hitBtnEl = document.querySelector("#hit-btn")
hitBtnEl.addEventListener("click", insertPlayerCardToDOM)
function insertPlayerCardToDOM() {
  playersTurn = true
  doubleBtnEl.disabled = true
  playerHand.push(drawACard())
}

function insertDealerCardToDOM() {
  dealerRoundTotal += dealerHiddenCardValue
  dealerRoundTotalEl.textContent = dealerRoundTotal
  hiddenCardBackImg.classList.toggle("reveal")

  sleep(2000).then(() => {
    hiddenCardBackImg.remove()
    if (playerRoundTotal === 21 && playerHand.length === 2) {
      playerHasBJ = true
      playerRoundTotalEl.classList.add("bj-glow")
      playerRoundTotalEl.textContent = "BJ"
    }
    if (dealerRoundTotal === 21 && dealerHand.length === 2) {
      dealerHasBJ = true
      dealerRoundTotalEl.classList.add("bj-glow")
      dealerRoundTotalEl.textContent = "BJ"
    }
    if (playerHasBJ && !dealerHasBJ) {
      console.log("playerHasBJ", playerHasBJ)
      console.log("player blackjack win")
      handlePayment("bj")
      playerWinRibbon()
      return
    }
    playersTurn = false
    while (dealerRoundTotal < 17) {
      // console.log("while loop calisti")
      dealerHand.push(drawACard())
      if (dealerRoundTotal > 21) {
        return dealerBust()
      }
    }
    decideWinner()
  })
}

const standBtnEl = document.querySelector("#stand-btn")
standBtnEl.addEventListener("click", stand)
function stand() {
  toggleRoundButtons()
  insertDealerCardToDOM()
  // console.log("oyuncu kalkti")
}

const doubleBtnEl = document.querySelector("#double-btn")
doubleBtnEl.addEventListener("click", double)
function double() {
  // console.log("oyuncu iki katini istedi")
  bankBalance = bankBalance - currentBet
  bankBalanceEl.textContent = bankBalance
  currentBet = currentBet * 2
  roundBetEl.textContent = currentBet
  toggleRoundButtons()
  insertPlayerCardToDOM()
  insertDealerCardToDOM()
}

/****************
ribbon management
*****************/
function playerBust() {
  toggleRoundButtons()
  playerRibbonEl.textContent = "Bust"
  playerRibbonEl.classList.toggle("ribbon-lose")
  togglePlayerRibbon()
  // console.log("oyuncu patladi")
  resetRound()
}
function dealerBust() {
  dealerRibbonEl.textContent = "Bust"
  dealerRibbonEl.classList.toggle("ribbon-lose")
  toggleDealerRibbon()
  playerWinRibbon()
  // console.log("dealer patladi")
  handlePayment("win")
}
function togglePlayerRibbon() {
  playerRibbonEl.classList.toggle("ribbon")
  playerRibbonEl.classList.toggle("hidden")
}
function toggleDealerRibbon() {
  dealerRibbonEl.classList.toggle("ribbon")
  dealerRibbonEl.classList.toggle("hidden")
}
function playerWinRibbon() {
  playerRibbonEl.textContent = "You win!"
  playerRibbonEl.classList.toggle("ribbon-win")
  togglePlayerRibbon()
}
function dealerWinRibbon() {
  dealerRibbonEl.textContent = "Dealer win!"
  dealerRibbonEl.classList.toggle("ribbon-win")
  toggleDealerRibbon()
  playerRibbonEl.textContent = "You lose!"
  playerRibbonEl.classList.toggle("ribbon-lose")
  togglePlayerRibbon()
}
function tieRibbon() {
  dealerRibbonEl.textContent = "Tie - Push"
  dealerRibbonEl.classList.toggle("ribbon-tie")
  toggleDealerRibbon()
  playerRibbonEl.textContent = "Tie - Push"
  playerRibbonEl.classList.toggle("ribbon-tie")
  togglePlayerRibbon()
}

function startRound() {
  // if balance is not enougth for doubling bet disable doubleBtn
  doubleBtnEl.disabled = bankBalance < currentBet ? true : false
  if (currentDeck.length === 0) {
    currentDeck.push(...shuffle())
  }
  //  console.log("kagitlar dagitildi")
  dealerHand.push(drawACard())
  dealerHand.push(drawACard())

  playersTurn = true
  playerHand.push(drawACard())
  playerHand.push(drawACard())
}

function decideWinner() {
  if (playerRoundTotal === dealerRoundTotal) {
    if (dealerHasBJ && !playerHasBJ) {
      console.log("dealerHasBJ", dealerHasBJ)
      console.log("dealer blackjack win")
      dealerWinRibbon()
      resetRound()
    } else {
      tieRibbon()
      handlePayment("tie")
    }
  }
  if (playerRoundTotal > dealerRoundTotal && playerRoundTotal <= 21) {
    playerWinRibbon()
    handlePayment("win")
  } else if (playerRoundTotal < dealerRoundTotal && dealerRoundTotal <= 21) {
    dealerWinRibbon()
    resetRound()
  }
}

function toggleRoundButtons() {
  hitBtnEl.disabled = !hitBtnEl.disabled
  standBtnEl.disabled = !standBtnEl.disabled
  doubleBtnEl.disabled = !doubleBtnEl.disabled
}

function resetRound() {
  bankBalanceRestorePoint = bankBalance
  document.getElementById("splash-screen").classList.remove("hidden")
  sleep(5000).then(() => {
    document.getElementById("betting-container").classList.remove("hidden")
    document.getElementById("betting-fixed-bottom").classList.remove("hidden")
    document.getElementById("round-container").classList.add("hidden")
    document.getElementById("round-fixed-bottom").classList.add("hidden")
    document.getElementById("balance").classList.toggle("balance-move")
    document.getElementById("splash-screen").classList.add("hidden")
    playersTurn = false
    dealerHand.length = 0
    // dealerHandEl.innerHTML = `<div class="cards"></div>`
    removeAllChildren(dealerHandEl)
    playerHand.length = 0
    // playerHandEl.innerHTML = `<div class="cards"></div>`
    removeAllChildren(playerHandEl)
    dealerRoundTotal = 0
    dealerRoundTotalEl.textContent = 0
    playerRoundTotal = 0
    playerRoundTotalEl.textContent = 0
    currentBet = 0
    dealerHiddenCardValue = 0
    firstBetEl.textContent = 0
    dealerHasBJ = false
    playerHasBJ = false
    hiddenCardBackImg.classList.remove("reveal")
    dealerRoundTotalEl.classList.remove("bj-glow")
    playerRoundTotalEl.classList.remove("bj-glow")
    // reset ribbon classes
    dealerRibbonEl.className = "hidden"
    playerRibbonEl.className = "hidden"
    checkBalanceForButtons()
    toggleRoundButtons()
  })
}

/****************
computing balance
*****************/
function handlePayment(status) {
  switch (status) {
    case "tie":
      bankBalance += currentBet
      bankBalanceEl.textContent = bankBalance
      break
    case "win":
      bankBalance += currentBet * 2
      bankBalanceEl.textContent = bankBalance
      break
    case "bj":
      bankBalance += currentBet * 2.5 // BJ pays 3:2
      bankBalanceEl.textContent = bankBalance
      break
    default:
      console.log("switch - case hatali")
      break
  }
  resetRound()
}

/****************
helper functions
*****************/
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}
