import { updateClass, removeAllChildren, delay } from "./helperFunctions.js"

const dealerHandArr = []
const playerHandArr = []
const currentDeckArr = []
const playerHandEl = document.querySelector(".playerHand .cards")
const dealerHandEl = document.querySelector(".dealerHand .cards")
const playerScoreEl = document.getElementById("player-score")
const dealerScoreEl = document.getElementById("dealer-score")
const remainingCardsCounterEl = document.querySelector(".remaining-cards > span")
const playerNameOutputEl = document.getElementById("player-name-output")
const bankBalanceEl = document.getElementById("bank-balance")
const firstBetPlaceholderEl = document.getElementById("first-bet-placeholder")
const controlChipsEl = document.querySelector(".control-chips")
const chipBtnsEl = document.querySelectorAll(".control-chips > .chip")
const roundBetEl = document.getElementById("round-bet")
const clearBetBtnEl = document.getElementById("clear-btn")
const allInBtnEl = document.getElementById("all-in-btn")
const dealerRibbonEl = document.getElementById("dealer-ribbon")
const playerRibbonEl = document.getElementById("player-ribbon")
const playerNameInputEl = document.getElementById("player-name-input")
const hitBtnEl = document.getElementById("hit-btn")
const betBtnEl = document.getElementById("bet-btn")
const standBtnEl = document.getElementById("stand-btn")
const doubleBtnEl = document.getElementById("double-btn")
const playBtnEl = document.getElementById("play-btn")

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
  isRoundCompleted

function initVariables() {
  dealerScore = 0
  playerScore = 0
  playersTurn = false
  currentBet = 0
  doubleBet = false
  isRoundCompleted = false
  dealerHasBJ = false
  playerHasBJ = false
}
initVariables()

hitBtnEl.addEventListener("click", drawCardForPlayer)
standBtnEl.addEventListener("click", stand)
doubleBtnEl.addEventListener("click", double)
playBtnEl.addEventListener("click", saveSettings)

function createHiddenCardBackImg() {
  hiddenCardBackImg = document.createElement("img")
  hiddenCardBackImg.id = "hiddenCardBack"
}

function saveSettings(e) {
  e.preventDefault()
  amountOfDecks = document.getElementById("amountOfDecksInput").value || amountOfDecks
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

function initEventHandlers() {
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
}
initEventHandlers()

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
  clubs: ["C2", "C3", "C4", "C3", "C2", "CA", "C4", "C3", "C2", "CA", "C4", "C3", "C2"],
  diamonds: ["HA", "H4", "H3", "H2", "HA"], // player bj
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

  return arr
}

function decideCardValue(currentCard) {
  const score = playersTurn ? playerScore : dealerScore
  const hand = playersTurn ? playerHandArr : dealerHandArr
  const hasAce = hand.some((card) => card.includes("A"))
  const cardFace = currentCard.slice(-1)
  const KQJT = /(K|Q|J|T)/.test(cardFace) // true or false
  let cardValue

  if (cardFace === "A") {
    if (hasAce && score + 11 < 21) {
      cardValue = 11
    } else {
      cardValue = 1
    }
    cardValue = 1
  } else if (KQJT) {
    cardValue = 10
  } else {
    cardValue = parseInt(cardFace)
  }

  return cardValue
}

function drawCard() {
  const card = currentDeckArr.pop()
  remainingCardsCounterEl.textContent = currentDeckArr.length

  return card
}

function checkDealerStatus() {
  dealerHasBJ = dealerScore === 21 && dealerHandArr.length === 2

  if (dealerHasBJ) {
    handleBlackJack()
    return
  }
}

function checkPlayerStatus() {
  playerHasBJ = playerScore === 21 && playerHandArr.length === 2
  if (playerHasBJ) {
    handleBlackJack()
    console.log("player have blackjack")
    return
  }

  if (playerScore === 21 || doubleBet) {
    stand()
    return
  }

  if (playerScore > 21) {
    disableRoundButtons()
    decideWinner()
    return
  }
}

function drawCardForPlayer() {
  playersTurn = true
  const card = drawCard()
  playerHandArr.push(card)
  updateScoreForPlayer(card)
  renderPlayerCard(card)
  checkPlayerStatus()
}

function drawCardForDealer() {
  playersTurn = false
  const card = drawCard()
  dealerHandArr.push(card)
  updateScoreForDealer(card)
  renderDealerCard(card)
  checkDealerStatus()
}

function updateScoreForPlayer(card) {
  // const cardValue = decideCardValue(card)

  // if (cardValue === 1 && playerScore + 11 > 21) {
  //   playerScore += 1
  // } else {
  //   playerScore += cardValue
  // }

  playerScoreEl.textContent = playerScore
}

function updateScoreForDealer(card) {
  const cardValue = decideCardValue(card)
  const isFirstCard = dealerHandArr.length === 1

  // if (cardValue === 1 && dealerScore + 11 < 21) {
  //   dealerScore += 11
  // } else {
  //   dealerScore += cardValue
  // }

  if (!isFirstCard) {
    dealerScoreEl.textContent = dealerScore - decideCardValue(dealerHandArr[0])
  }
}

function createCardElement(card) {
  const cardDiv = document.createElement("div")
  cardDiv.classList.add("card")
  const cardImg = document.createElement("img")
  cardImg.src = `deck/${card}.png`
  cardDiv.append(cardImg)

  return cardDiv
}

function renderDealerCard(card) {
  const cardDiv = createCardElement(card)
  const isFirstCard = dealerHandArr.length === 1

  if (isFirstCard) {
    cardDiv.append(hiddenCardBackImg)
  }

  dealerHandEl.append(cardDiv)
}

function renderPlayerCard(card) {
  const cardDiv = createCardElement(card)
  playerHandEl.append(cardDiv)
}

function revealHiddenCard() {
  // dealerScore += decideCardValue(dealerHiddenCard)
  dealerScoreEl.textContent = dealerScore
  updateClass("hiddenCardBack", "add", "reveal")
}

function insertDealerCard() {
  while (dealerScore < 17) {
    drawCardForDealer()
  }

  return decideWinner()
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
  drawCardForPlayer()

  const playerBusted = playerScore > 21

  return playerBusted ? decideWinner() : insertDealerCard()
}

function startRound() {
  // if balance is not enough for doubling the bet then disable doubleBtnEl
  doubleBtnEl.disabled = bankBalance < currentBet

  // When the deck reaches below 52 cards, new decks are added and
  // the cards are shuffled, making it more difficult to count the cards.
  if (currentDeckArr.length <= 52) {
    currentDeckArr.length = 0
    currentDeckArr.push(...shuffleDeck())
  }

  drawCardForDealer()
  drawCardForDealer()
  drawCardForPlayer()
  drawCardForPlayer()
}

function handleBlackJack() {
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
  revealHiddenCard()
  await delay(2500)
  let paymentEvent

  if ((dealerHasBJ && playerHasBJ) || playerScore === dealerScore) {
    paymentEvent = "tie"
  } else if (dealerHasBJ) {
    paymentEvent = "lose"
  } else if (playerHasBJ) {
    paymentEvent = "bj"
  } else if (dealerScore > 21) {
    paymentEvent = "win"
  } else if (playerScore > 21) {
    paymentEvent = "lose"
  } else if (playerScore === dealerScore) {
    paymentEvent = "tie"
  } else if (playerScore < dealerScore) {
    paymentEvent = "lose"
  } else if (playerScore > dealerScore) {
    paymentEvent = "win"
  } else {
    console.error("Invalid paymentEvent:", paymentEvent) // debug
  }

  return handlePayment(paymentEvent)
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
  dealerRibbonEl.className = "ribbon hidden"
  playerRibbonEl.className = "ribbon hidden"
  dealerScoreEl.textContent = 0
  playerScoreEl.textContent = 0
  dealerHandArr.length = 0
  playerHandArr.length = 0
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
    const restartBtnEl = document.getElementById("restart-btn")
    restartBtnEl.addEventListener("click", () => location.reload())
    document.getElementById("betting-container").classList.toggle("hidden")
    document.getElementById("game-over").classList.toggle("hidden")
    await delay(9000)
    location.reload()
  }
}

function handlePayment(payment) {
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

  handleRibbon(payment)
  resetRound()
  return
}

function handleRibbon(playerMsg) {
  const playerName = playerNameOutputEl.textContent
  let dealerMsg = "tie"

  if (playerMsg === "lose") dealerMsg = "win"

  if (playerMsg === "win" || playerMsg === "bj") dealerMsg = "lose"

  dealerRibbonEl.textContent = dealerMsg === "tie" ? "Tie - Push!" : `Dealer ${dealerMsg}!`
  playerRibbonEl.textContent =
    playerMsg === "tie" ? "Tie - Push!" : `${playerName} ${playerMsg === "bj" ? "win" : playerMsg}!`
  dealerRibbonEl.classList.add(`ribbon-${dealerMsg}`)
  playerRibbonEl.classList.add(`ribbon-${playerMsg === "bj" ? "win" : playerMsg}`)

  updateClass("dealer-ribbon", "remove", "hidden")
  updateClass("player-ribbon", "remove", "hidden")

  bankBalanceEl.textContent = bankBalance
}
