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
const allInBtnEl = document.querySelector("#all-in-btn")
const dealerRibbonEl = document.querySelector("#dealer-msg")
const playerRibbonEl = document.querySelector("#player-msg")
const playerNameInputEl = document.querySelector("#player-name-input")
const hitBtnEl = document.querySelector("#hit-btn")
const betBtnEl = document.querySelector("#bet-btn")
const standBtnEl = document.querySelector("#stand-btn")
const doubleBtnEl = document.querySelector("#double-btn")
const playBtnEl = document.querySelector("#play-btn")

let bankBalance = 1000
let amountOfDecks = 4
let bankBalanceRestorePoint,
  dealerHasBJ,
  playerHasBJ,
  playersTurn,
  playerBusted,
  currentBet,
  doubleBet,
  dealerRoundTotal,
  playerRoundTotal,
  dealerHiddenCard

// TODO: put variables in the functions if possible
// FIXME: dealer eksiye gidiyor ve deste sayısını kontrol et

function initVariables() {
  dealerHasBJ = false
  dealerRoundTotal = 0
  playerHasBJ = false
  playerRoundTotal = 0
  playersTurn = false
  playerBusted = false
  currentBet = 0
  doubleBet = false
}

initVariables()

/****************
event listeners
*****************/
hitBtnEl.addEventListener("click", insertPlayerCard)
standBtnEl.addEventListener("click", stand)
doubleBtnEl.addEventListener("click", double)
playBtnEl.addEventListener("click", saveSettings)

const hiddenCardBackImg = document.createElement("img")
hiddenCardBackImg.id = "hiddenCardBack"

function saveSettings() {
  amountOfDecks = document.getElementById("amountOfDecksInput").value
  const deckColorInputEl = document.getElementsByName("deck-color")

  deckColorInputEl.forEach((item) => {
    if (item.checked) {
      hiddenCardBackImg.src = `others/${item.value}_back.png`
    }
  })

  playerNameOutputEl.textContent = playerNameInputEl.value.substring(0, 12) || "Player"
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
function betting() {
  betBtnEl.addEventListener("click", () => {
    if (currentBet === 0) return

    roundBetEl.textContent = currentBet
    document.getElementById("round-fixed-bottom").classList.toggle("hidden")
    document.getElementById("betting-fixed-bottom").classList.toggle("hidden")
    document.getElementById("betting-container").classList.toggle("hidden")
    document.getElementById("round-container").classList.toggle("hidden")
    document.getElementById("balance").classList.toggle("balance-move")
    startRound()
  })
}

// check balance for disabled chip buttons
function checkBalanceForButtons() {
  chipBtnsEl.forEach((btn) => {
    // if target chip's bet value bigger then bankBalance disable that chip
    btn.disabled = parseInt(btn.textContent) > bankBalance
  })

  // Disable the "clearBet" button if the current bet is zero.
  clearBetBtnEl.disabled = currentBet === 0
  // Disable the "allIn" button if the bank balance is zero.
  allInBtnEl.disabled = bankBalance === 0
}

// add event listener to control-chips div
controlChipsEl.addEventListener("click", handleChipClick)

function handleChipClick(e) {
  const clickedBtn = e.target

  if (clickedBtn.classList.contains("chip")) {
    bankBalanceRestorePoint = bankBalanceRestorePoint || bankBalance

    if (bankBalanceRestorePoint) currentBet += parseInt(clickedBtn.textContent)

    firstBetEl.textContent = currentBet
    bankBalance -= parseInt(clickedBtn.textContent)
    bankBalanceEl.textContent = bankBalance
    checkBalanceForButtons()
  }
}

clearBetBtnEl.addEventListener("click", () => {
  currentBet = 0
  firstBetEl.textContent = currentBet
  bankBalance = bankBalanceRestorePoint
  bankBalanceEl.textContent = bankBalanceRestorePoint
  checkBalanceForButtons()
})

allInBtnEl.addEventListener("click", () => {
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
  diamonds: ["D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "DT", "DJ", "DQ", "DK", "DA"]
  // diamonds: ["H6", "H8", "HK", "H9", "H2", "H7"] // dbl test
  // diamonds: ["H8", "HA", "HK", "HA", "HK"] // both bj
  // diamonds: ["H8", "H2", "HA", "HA", "HK"] // dealer bj
  // diamonds: ["H8", "HA", "HK", "HA", "H2"] // player bj
*/
const deck = {
  hearts: ["H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "HT", "HJ", "HQ", "HK", "HA"],
  spades: ["S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "ST", "SJ", "SQ", "SK", "SA"],
  clubs: ["C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "CT", "CJ", "CQ", "CK", "CA"],
  diamonds: ["D2", "D3", "D4", "D5", "D6", "D7", "DA", "D2", "D3", "D4", "D5", "DK", "DA"],
}

function generateCombinedDecks(amountOfDecks) {
  const completeDeck = [...deck.hearts, ...deck.spades, ...deck.clubs, ...deck.diamonds]
  const combinedDecks = []

  for (let i = 0; i < amountOfDecks; i++) {
    combinedDecks.push(...completeDeck)
  }

  return combinedDecks
}

function shuffleDeck() {
  const arr = generateCombinedDecks(amountOfDecks)

  // for (let i = arr.length - 1; i > 0; i--) {
  //   let j = Math.floor(Math.random() * (i + 1))
  //   ;[arr[i], arr[j]] = [arr[j], arr[i]]
  // }

  return arr
}

function decideCardValue(currentCard) {
  // console.log("currentCard " + currentCard)
  const roundTotal = playersTurn ? playerRoundTotal : dealerRoundTotal
  const hand = playersTurn ? playerHand : dealerHand
  const hasAce = hand.some((card) => card.includes("A"))
  const cardFace = currentCard.slice(-1)
  const KQJT = /(K|Q|J|T)/.test(cardFace) // true or false
  let cardValue = null

  if (cardFace === "A") {
    cardValue = 11 + roundTotal > 21 ? 1 : 11
  } else if (KQJT) {
    cardValue = 10
  } else {
    cardValue = parseInt(cardFace)
  }

  if (hasAce && cardValue + roundTotal > 21) {
    console.log(`${playersTurn ? "player" : "dealer"} için -10 çalıştı`)
    cardValue -= 10
  }

  return cardValue
}

function drawCard() {
  const drawnCard = currentDeck.pop()
  remainingCardsCounterEl.textContent = currentDeck.length

  if (playersTurn) {
    roundTotalForPlayer(drawnCard)
  } else {
    roundTotalForDealer(drawnCard)
  }
  return drawnCard
}

function roundTotalForPlayer(drawnCard) {
  const cardDiv = createCardElement(drawnCard)
  const cardValue = decideCardValue(drawnCard)
  playerHandEl.append(cardDiv)
  playerRoundTotal += cardValue
  playerRoundTotalEl.textContent = playerRoundTotal

  // if player requested double bet, we don't need stand (again)
  if (playerRoundTotal === 21 && !doubleBet) {
    stand()
  }

  if (playerRoundTotal > 21) {
    handlePlayerBust()
  }
}

function roundTotalForDealer(drawnCard) {
  const cardDiv = createCardElement(drawnCard)
  const cardValue = decideCardValue(drawnCard)

  if (dealerHand.length === 0) {
    cardDiv.append(hiddenCardBackImg)
    dealerHandEl.append(cardDiv)
    dealerHiddenCard = drawnCard
  } else {
    dealerHandEl.append(cardDiv)
    dealerRoundTotal += cardValue
    dealerRoundTotalEl.textContent = dealerRoundTotal
  }
}

function createCardElement(drawnCard) {
  const cardDiv = document.createElement("div")
  cardDiv.classList.add("card")
  const cardImg = document.createElement("img")
  cardImg.src = `deck/${drawnCard}.png`
  cardDiv.append(cardImg)
  return cardDiv
}

function insertPlayerCard() {
  playersTurn = true
  doubleBtnEl.disabled = true
  playerHand.push(drawCard())
}

function handleHiddenCard() {
  dealerRoundTotal += decideCardValue(dealerHiddenCard)
  dealerRoundTotalEl.textContent = dealerRoundTotal

  if (!hiddenCardBackImg.classList.contains("reveal")) {
    hiddenCardBackImg.classList.add("reveal")
  }

  if (dealerRoundTotal === 21 && dealerHand.length === 2) {
    dealerHasBJ = true
    dealerRoundTotalEl.classList.add("bj-glow")
    dealerRoundTotalEl.textContent = "BJ"
  }

  dealerHiddenCard = null
}

function insertDealerCard() {
  handleHiddenCard()
  setTimeout(() => {
    hiddenCardBackImg.remove()
    if (playerRoundTotal > 21) return

    if (playerRoundTotal === 21 && playerHand.length === 2) {
      playerHasBJ = true
      playerRoundTotalEl.classList.add("bj-glow")
      playerRoundTotalEl.textContent = "BJ"
    }

    if (playerHasBJ && !dealerHasBJ) {
      handlePayment("bj", "win", "lose")
      return
    }

    playersTurn = false

    while (dealerRoundTotal < 17) {
      dealerHand.push(drawCard())

      if (dealerRoundTotal > 21) {
        handleDealerBust()
        return
      }
    }

    decideWinner()
  }, 2500)
}

function stand() {
  disableRoundButtons()
  insertDealerCard()
}

function double() {
  doubleBet = true
  bankBalance = bankBalance - currentBet
  bankBalanceEl.textContent = bankBalance
  currentBet = currentBet * 2
  roundBetEl.textContent = currentBet
  disableRoundButtons()
  insertPlayerCard()

  if (!playerBusted) insertDealerCard()
}

function handlePlayerBust() {
  playerBusted = true
  disableRoundButtons()
  handleHiddenCard()
  handlePayment("lose", "bust", "win")
}

function handleDealerBust() {
  handlePayment("win", "win", "bust")
}

function startRound() {
  // if balance is not enough for doubling the bet then disable doubleBtn
  doubleBtnEl.disabled = bankBalance < currentBet
  if (currentDeck.length <= 52) {
    currentDeck.length = 0
    currentDeck.push(...shuffleDeck())
  }

  dealerHand.push(drawCard())
  dealerHand.push(drawCard())
  playersTurn = true
  playerHand.push(drawCard())
  playerHand.push(drawCard())
}

function decideWinner() {
  //TODO: think about this
  if (playerRoundTotal === dealerRoundTotal && dealerHasBJ && !playerHasBJ) {
    handlePayment("lose", "lose", "win")
  } else if (playerRoundTotal > dealerRoundTotal && playerRoundTotal <= 21) {
    handlePayment("win", "win", "lose")
  } else if (playerRoundTotal < dealerRoundTotal && dealerRoundTotal <= 21) {
    handlePayment("lose", "lose", "win")
  } else {
    handlePayment("tie", "tie", "tie")
  }
}

function disableRoundButtons() {
  hitBtnEl.disabled = true
  standBtnEl.disabled = true
  doubleBtnEl.disabled = true
}

function enableRoundButtons() {
  hitBtnEl.disabled = false
  standBtnEl.disabled = false
  doubleBtnEl.disabled = false
}

function resetRound() {
  bankBalanceRestorePoint = bankBalance
  document.getElementById("splash-screen").classList.remove("hidden")
  setTimeout(() => {
    document.getElementById("round-container").classList.add("hidden")
    document.getElementById("round-fixed-bottom").classList.add("hidden")
    document.getElementById("balance").classList.toggle("balance-move")
    document.getElementById("betting-container").classList.remove("hidden")
    document.getElementById("betting-fixed-bottom").classList.remove("hidden")
    document.getElementById("splash-screen").classList.add("hidden")
    hiddenCardBackImg.classList.remove("reveal")
    dealerRoundTotalEl.classList.remove("bj-glow")
    playerRoundTotalEl.classList.remove("bj-glow")
    // reset ribbon classes
    dealerRibbonEl.className = "hidden"
    playerRibbonEl.className = "hidden"
    dealerHand.length = 0
    dealerRoundTotalEl.textContent = 0
    playerHand.length = 0
    playerRoundTotalEl.textContent = 0
    firstBetEl.textContent = 0
    removeAllChildren(dealerHandEl)
    removeAllChildren(playerHandEl)
    initVariables()
    checkBalanceForButtons()
    enableRoundButtons()
    checkGameOver()
  }, 6000)
}

function checkGameOver() {
  // if balance is not enough for bet then game over :(
  if (bankBalance === 0 && currentBet === 0 && bankBalanceRestorePoint === 0) {
    const restartBtnEl = document.querySelector("#restart-btn")
    restartBtnEl.addEventListener("click", () => location.reload())
    document.querySelector("#betting-container").classList.toggle("hidden")
    document.querySelector("#game-over").classList.toggle("hidden")
    setTimeout(() => location.reload(), 9000)
  }
}

/****************
computing balance
*****************/
function handlePayment(payment, playerEvent, dealerEvent) {
  switch (payment) {
    case "tie":
      bankBalance += currentBet
      break
    case "win":
      bankBalance += currentBet * 2
      break
    case "bj":
      bankBalance += currentBet * 2.5 // BJ pays 1.5x
      break
  }

  handleRibbon(playerEvent, dealerEvent)
  resetRound()
}

function handleRibbon(playerEvent, dealerEvent) {
  playerRibbonEl.textContent =
    playerEvent === "bust"
      ? "Bust!"
      : playerEvent === "tie"
      ? "Tie - Push!"
      : `${playerNameOutputEl.textContent} ${playerEvent}!`

  dealerRibbonEl.textContent =
    dealerEvent === "bust"
      ? "Bust!"
      : dealerEvent === "tie"
      ? "Tie - Push!"
      : `Dealer ${dealerEvent}!`

  playerRibbonEl.classList.add("ribbon", `ribbon-${playerEvent}`)
  dealerRibbonEl.classList.add("ribbon", `ribbon-${dealerEvent}`)

  playerRibbonEl.classList.remove("hidden")
  dealerRibbonEl.classList.remove("hidden")

  bankBalanceEl.textContent = bankBalance
}

/****************
helper functions
*****************/
// Removes all children of the element.
function removeAllChildren(element) {
  while (element.firstChild) element.removeChild(element.firstChild)
}
