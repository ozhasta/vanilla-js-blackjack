"use strict"
const dealerHand = []
const playerHand = []
const currentDeck = []
const playerHandEl = document.querySelector(".playerHand .cards")
const dealerHandEl = document.querySelector(".dealerHand .cards")
const playerScoreEl = document.querySelector("#player-score")
const dealerScoreEl = document.querySelector("#dealer-score")
const remainingCardsCounterEl = document.querySelector(".remaining-cards > span")
const playerNameOutputEl = document.querySelector("#player-name-output")
const bankBalanceEl = document.querySelector("#bank-balance")
const firstBetPlaceholderEl = document.querySelector("#first-bet-placeholder")
const controlChipsEl = document.querySelector(".control-chips")
const chipBtnsEl = document.querySelectorAll(".control-chips > .chip")
const roundBetEl = document.querySelector("#round-bet")
const clearBetBtnEl = document.querySelector("#clear-btn")
const allInBtnEl = document.querySelector("#all-in-btn")
const dealerRibbonEl = document.querySelector("#dealer-ribbon")
const playerRibbonEl = document.querySelector("#player-ribbon")
const playerNameInputEl = document.querySelector("#player-name-input")
const hitBtnEl = document.querySelector("#hit-btn")
const betBtnEl = document.querySelector("#bet-btn")
const standBtnEl = document.querySelector("#stand-btn")
const doubleBtnEl = document.querySelector("#double-btn")
const playBtnEl = document.querySelector("#play-btn")

let bankBalance = 1000
let amountOfDecks = 4
let bankBalanceRestorePoint,
  hiddenCardBackImg,
  playersTurn,
  currentBet,
  doubleBet,
  dealerScore,
  playerScore,
  dealerHasBJ,
  playerHasBJ,
  dealerHiddenCard,
  isRoundCompleted

function initVariables() {
  dealerScore = 0
  playerScore = 0
  playersTurn = false
  currentBet = 0
  doubleBet = false
  dealerHiddenCard = null
  isRoundCompleted = false
  dealerHasBJ = false
  playerHasBJ = false
}
initVariables()

hitBtnEl.addEventListener("click", insertPlayerCard)
standBtnEl.addEventListener("click", stand)
doubleBtnEl.addEventListener("click", double)
playBtnEl.addEventListener("click", saveSettings)

function createHiddenCardBackImg() {
  hiddenCardBackImg = document.createElement("img")
  hiddenCardBackImg.id = "hiddenCardBack"
}

function saveSettings(e) {
  e.preventDefault()
  amountOfDecks = document.getElementById("amountOfDecksInput").value
  const deckColorInputEl = document.getElementsByName("deck-color")
  createHiddenCardBackImg()

  deckColorInputEl.forEach((item) => {
    if (item.checked) {
      hiddenCardBackImg.src = `others/${item.value}_back.png`
    }
  })

  playerNameOutputEl.textContent = playerNameInputEl.value.substring(0, 12) || "Player"
  bankBalanceEl.textContent = bankBalance
  bankBalanceRestorePoint = bankBalance
  updateClass("settings-container", "toggle", "hidden")
  updateClass("betting-container", "toggle", "hidden")
  updateClass("balance", "toggle", "hidden")
  updateClass("betting-fixed-bottom", "toggle", "hidden")
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
    updateClass("round-fixed-bottom", "toggle", "hidden")
    updateClass("betting-fixed-bottom", "toggle", "hidden")
    updateClass("betting-container", "toggle", "hidden")
    updateClass("round-container", "toggle", "hidden")
    updateClass("balance", "toggle", "balance-move")
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

    firstBetPlaceholderEl.textContent = currentBet
    bankBalance -= parseInt(clickedBtn.textContent)
    bankBalanceEl.textContent = bankBalance
    checkBalanceForButtons()
  }
}

clearBetBtnEl.addEventListener("click", () => {
  currentBet = 0
  firstBetPlaceholderEl.textContent = currentBet
  bankBalance = bankBalanceRestorePoint
  bankBalanceEl.textContent = bankBalanceRestorePoint
  checkBalanceForButtons()
})

allInBtnEl.addEventListener("click", () => {
  currentBet += bankBalance
  firstBetPlaceholderEl.textContent = currentBet
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
  diamonds: ["H8", "CA", "SK", "HA", "D2"], // player bj
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
  return arr

  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }

  // return arr
}

function decideCardValue(currentCard) {
  // console.log("currentCard " + currentCard)
  const score = playersTurn ? playerScore : dealerScore
  const hand = playersTurn ? playerHand : dealerHand
  const hasAce = hand.some((card) => card.includes("A"))
  const cardFace = currentCard.slice(-1)
  const KQJT = /(K|Q|J|T)/.test(cardFace) // true or false
  let cardValue = 0
  //TODO: test this
  if (hasAce && cardValue + score > 21) {
    console.log(`${playersTurn ? "player" : "dealer"} için -10 çalıştı`)
    cardValue -= 10
  } else if (cardFace === "A") {
    cardValue = 11 + score > 21 ? 1 : 11
  } else if (KQJT) {
    cardValue = 10
  } else {
    cardValue = parseInt(cardFace)
  }

  return cardValue
}

function drawCard() {
  const card = currentDeck.pop()
  remainingCardsCounterEl.textContent = currentDeck.length

  playersTurn ? updateScoreForPlayer(card) : updateScoreForDealer(card)

  return card
}

function drawCardForPlayer() {
  playersTurn = true
  const card = drawCard()
  playerHand.push(card)
  // updateScoreForPlayer(card)
}

function drawCardForDealer() {
  playersTurn = false
  const card = drawCard()
  dealerHand.push(card)
  updateScoreForDealer(card)
}

function updateScoreForPlayer(card) {
  const cardDiv = createCardElement(card)
  const cardValue = decideCardValue(card)

  playerHandEl.append(cardDiv)
  playerScore += cardValue
  playerScoreEl.textContent = playerScore

  // if player requested double bet, we don't need stand (again)

  console.log("playerScore", playerScore, "playerHand", playerHand)
  if (playerScore === 21 && !doubleBet) {
    stand()
    return
  }

  if (playerScore > 21) {
    disableRoundButtons()
    decideWinner()
    return
  }
}

function updateScoreForDealer(card) {
  const cardDiv = createCardElement(card)
  const cardValue = decideCardValue(card)
  const isFirstCard = dealerHand.length === 0

  dealerScore += cardValue

  if (isFirstCard) {
    cardDiv.append(hiddenCardBackImg)
  } else {
    dealerScoreEl.textContent = dealerScore - decideCardValue(dealerHand[0])
  }

  dealerHandEl.append(cardDiv)
}

function createCardElement(card) {
  const cardDiv = document.createElement("div")
  cardDiv.classList.add("card")
  const cardImg = document.createElement("img")
  cardImg.src = `deck/${card}.png`
  cardDiv.append(cardImg)

  return cardDiv
}

function insertPlayerCard() {
  playersTurn = true
  doubleBtnEl.disabled = true
  playerHand.push(drawCard())
}

function handleHiddenCard() {
  // dealerScore += decideCardValue(dealerHiddenCard)
  dealerScoreEl.textContent = dealerScore
  updateClass("hiddenCardBack", "add", "reveal")
}

function insertDealerCard() {
  if (playerScore > 21 || playerHasBJ) return

  playersTurn = false

  while (dealerScore < 17) {
    dealerHand.push(drawCard())
  }

  decideWinner()
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

  const playerBusted = playerScore > 21

  if (!playerBusted) insertDealerCard()
}

function startRound() {
  // if balance is not enough for doubling the bet then disable doubleBtnEl
  doubleBtnEl.disabled = bankBalance < currentBet

  if (currentDeck.length <= 52) {
    currentDeck.length = 0
    currentDeck.push(...shuffleDeck())
  }

  // dealerHand.push(drawCard())
  // dealerHand.push(drawCard())
  drawCardForDealer()
  drawCardForDealer()
  // playersTurn = true
  // playerHand.push(drawCard())
  // playerHand.push(drawCard())
  drawCardForPlayer()
  drawCardForPlayer()

  handleBlackJack()
}

function handleBlackJack() {
  dealerHasBJ = dealerScore === 21 && dealerHand.length === 2
  playerHasBJ = playerScore === 21 && playerHand.length === 2

  if (!playerHasBJ || !dealerHasBJ) return

  disableRoundButtons()

  if (dealerHasBJ) {
    updateClass("dealer-score", "add", "bj-glow")
    dealerScoreEl.textContent = "BJ"
  }

  if (playerHasBJ) {
    updateClass("player-score", "add", "bj-glow")
    playerScoreEl.textContent = "BJ"
  }

  decideWinner()
}

async function decideWinner() {
  if (isRoundCompleted) return

  isRoundCompleted = true
  handleHiddenCard()
  await delay(2500)
  let paymentEvent

  if (dealerHasBJ && playerHasBJ) {
    paymentEvent = ["tie", "tie", "tie"]
  } else if (dealerHasBJ) {
    paymentEvent = ["lose", "lose", "bj"]
  } else if (playerHasBJ) {
    paymentEvent = ["bj", "bj", "lose"]
  } else if (playerScore > 21) {
    paymentEvent = ["lose", "bust", "win"]
  } else if (dealerScore > 21) {
    paymentEvent = ["win", "win", "bust"]
  } else if (playerScore === dealerScore) {
    paymentEvent = ["tie", "tie", "tie"]
  } else if (playerScore > dealerScore) {
    paymentEvent = ["win", "win", "lose"]
  } else if (playerScore < dealerScore) {
    paymentEvent = ["lose", "lose", "win"]
  } else {
    console.error("Error: check events in decideWinner") // debug
  }
  console.log("playerHasBJ➡️", playerHasBJ)
  console.log("dealerHasBJ➡️", dealerHasBJ)
  console.log(paymentEvent)
  return handlePayment(...paymentEvent)
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

async function resetRound() {
  bankBalanceRestorePoint = bankBalance
  updateClass("dark-gradient-splash", "remove", "hidden")
  await delay(6000)
  updateClass("round-container", "add", "hidden")
  updateClass("round-fixed-bottom", "add", "hidden")
  updateClass("balance", "toggle", "balance-move")
  updateClass("betting-container", "remove", "hidden")
  updateClass("betting-fixed-bottom", "remove", "hidden")
  updateClass("dark-gradient-splash", "add", "hidden")
  updateClass("dealer-score", "remove", "bj-glow")
  updateClass("player-score", "remove", "bj-glow")
  updateClass("hiddenCardBack", "remove", "reveal")
  dealerRibbonEl.className = "hidden"
  playerRibbonEl.className = "hidden"
  dealerScoreEl.textContent = 0
  playerScoreEl.textContent = 0
  dealerHand.length = 0
  playerHand.length = 0
  firstBetPlaceholderEl.textContent = 0
  removeAllChildren(dealerHandEl)
  removeAllChildren(playerHandEl)
  initVariables()
  checkBalanceForButtons()
  enableRoundButtons()
  checkGameOver()
}

async function checkGameOver() {
  // if balance is not enough for bet then game over :(
  if (bankBalance === 0 && currentBet === 0 && bankBalanceRestorePoint === 0) {
    const restartBtnEl = document.querySelector("#restart-btn")
    restartBtnEl.addEventListener("click", () => location.reload())
    document.querySelector("#betting-container").classList.toggle("hidden")
    document.querySelector("#game-over").classList.toggle("hidden")
    await delay(9000)
    location.reload()
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

  handleRibbon(playerEvent, dealerEvent, payment)
  resetRound()
  return
}

function handleRibbon(playerEvent, dealerEvent, payment) {
  playerRibbonEl.textContent =
    playerEvent === "tie"
      ? "Tie - Push!"
      : `${playerNameOutputEl.textContent} ${playerEvent.toUpperCase()}!`

  dealerRibbonEl.textContent =
    dealerEvent === "tie" ? "Tie - Push!" : `Dealer ${dealerEvent.toUpperCase()}!`

  playerRibbonEl.classList.add("ribbon", `ribbon-${playerEvent}`)
  dealerRibbonEl.classList.add("ribbon", `ribbon-${dealerEvent}`)

  updateClass("player-ribbon", "remove", "hidden")
  updateClass("dealer-ribbon", "remove", "hidden")

  bankBalanceEl.textContent = bankBalance
  // console.log(`Payment: ${payment}, playerEvent: ${playerEvent}, dealerEvent: ${dealerEvent}`)
}

/****************
helper functions
*****************/
function updateClass(elementId, action, className) {
  const element = document.getElementById(elementId)

  if (!element) {
    console.error(`Invalid element id: "${elementId}"`)
    return
  }

  switch (action) {
    case "add":
      element.classList.add(className)
      break

    case "remove":
      element.classList.remove(className)
      break

    case "toggle":
      element.classList.toggle(className)
      break

    default:
      console.error(`Invalid action: "${action}"`)
  }
}

function removeAllChildren(element) {
  while (element.firstChild) element.removeChild(element.firstChild)
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
