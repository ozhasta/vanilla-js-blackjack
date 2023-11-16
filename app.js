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

let bankBalance = 1000
let dealerHiddenCard = null
let amountOfDecksInput = 4
let bankBalanceRestorePoint,
  dealerHasBJ,
  dealerHasAce,
  dealerSoft,
  playerHasBJ,
  playerHasAce,
  playerSoft,
  playersTurn,
  playerBusted,
  currentBet,
  doubleBet,
  dealerRoundTotal,
  playerRoundTotal

// TODO: put variables in the functions if possible

function initVariables() {
  dealerHasBJ = false
  dealerHasAce = false
  dealerSoft = true
  dealerRoundTotal = 0
  playerHasBJ = false
  playerHasAce = false
  playerSoft = true
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

/****************
settings section
*****************/
const hiddenCardBackImg = document.createElement("img")
hiddenCardBackImg.id = "hiddenCardBack"
const playBtnEl = document.querySelector("#play-btn")
playBtnEl.addEventListener("click", saveSettings)

function saveSettings() {
  amountOfDecksInput = document.getElementById("amountOfDecksInput").value
  const deckColorInputEl = document.getElementsByName("deck-color")
  deckColorInputEl.forEach((item) => {
    if (item.checked) {
      hiddenCardBackImg.src = `others/${item.value}_back.png`
    }
  })
  playerNameOutputEl.textContent = playerNameInputEl.value.substring(0, 12)
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
    btn.disabled = Number(btn.textContent) > bankBalance ? true : false
  })

  // if current bet equals to 0 then disable clearBet button
  clearBetBtnEl.disabled = currentBet === 0 ? true : false
  // if bank balance equals to 0 then disable all-in button
  allInBtnEl.disabled = bankBalance === 0 ? true : false
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
  diamonds: ["D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "DT", "DJ", "DQ", "DK", "DA"],
}

function generateCombinedDecks(amountOfDecks) {
  const completeDeck = [...deck.hearts, ...deck.spades, ...deck.clubs, ...deck.diamonds]
  const combinedDecks = []

  for (let i = 0; i < amountOfDecks; i++) {
    combinedDecks.push(...completeDeck)
  }

  // console.log("desteler birlestirildi")
  return combinedDecks
}

function shuffleDeck() {
  const arr = generateCombinedDecks(amountOfDecksInput)

  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }

  // console.log("deste karistirildi")
  return arr
}

function decideCardValue(currentCard) {
  let cardFace = currentCard.slice(-1)
  // ozel kartlar, regex
  const KQJT = /(K|Q|J|T)/.test(cardFace) // true or false
  if (cardFace === "A") {
    return 1
    // gecerli kartin dosya isminde bu karakterler var mi? regex ile test
  } else if (KQJT) {
    return 10
  } else {
    return parseInt(cardFace)
  }
}

function drawCard() {
  const drawnCard = currentDeck.pop()
  remainingCardsCounterEl.textContent = currentDeck.length
  const cardDiv = document.createElement("div")
  cardDiv.classList.add("card")
  const cardImg = document.createElement("img")
  cardImg.src = `deck/${drawnCard}.png`
  cardDiv.append(cardImg)
  let cardValue = decideCardValue(drawnCard)
  // if player's turn
  if (playersTurn) {
    playerHandEl.append(cardDiv)
    if (drawnCard.slice(-1) === "A" && !playerHasAce) {
      playerRoundTotal += 11
      playerHasAce = true
    } else if (playerSoft && playerHasAce && playerRoundTotal + cardValue > 21) {
      playerRoundTotal += cardValue - 10
      console.log("player -10 calisti")
      playerSoft = false
    } else {
      playerRoundTotal += cardValue
    }

    playerRoundTotalEl.textContent = playerRoundTotal
    // if player requested double bet, we don't need stand (again)
    if (playerRoundTotal === 21 && !doubleBet) {
      stand()
    }

    if (playerRoundTotal > 21) {
      handlePlayerBust()
    }
  }

  // if dealer's turn
  if (!playersTurn) {
    if (dealerHand.length === 0) {
      // TODO: slowdown dealer's cards for better animation and feels
      cardDiv.append(hiddenCardBackImg)
      dealerHandEl.append(cardDiv)
      dealerHiddenCard = drawnCard
    } else {
      dealerHandEl.append(cardDiv)
      if (drawnCard.slice(-1) === "A" && !dealerHasAce) {
        dealerRoundTotal += 11
        dealerHasAce = true
      } else if (dealerSoft && dealerHasAce && dealerRoundTotal + cardValue > 21) {
        dealerRoundTotal += cardValue - 10
        // console.log("dealer -10 calisti")
        dealerSoft = false
      } else {
        dealerRoundTotal += cardValue
      }
      dealerRoundTotalEl.textContent = dealerRoundTotal
    }
  }

  return drawnCard
}

function insertPlayerCard() {
  playersTurn = true
  doubleBtnEl.disabled = true
  playerHand.push(drawCard())
}

function handleHiddenCard() {
  // playersTurn = false
  if (dealerHiddenCard.slice(-1) === "A" && !dealerHasAce) {
    dealerRoundTotal += 11
    dealerHasAce = true
  } else {
    dealerRoundTotal += decideCardValue(dealerHiddenCard)
  }

  dealerRoundTotalEl.textContent = dealerRoundTotal
  if (!hiddenCardBackImg.classList.contains("reveal")) {
    hiddenCardBackImg.classList.add("reveal")
    if (dealerRoundTotal === 21 && dealerHand.length === 2) {
      dealerHasBJ = true
      dealerRoundTotalEl.classList.add("bj-glow")
      dealerRoundTotalEl.textContent = "BJ"
    }
  }

  dealerHiddenCard = null
  // console.log("handle hidden card calisti")
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
      console.log("playerHasBJ", playerHasBJ)
      console.log("player blackjack win")
      handlePayment("bj", "win", "lose")
      return
    }

    playersTurn = false
    while (dealerRoundTotal < 17) {
      // console.log("while loop calisti")
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
  // console.log("oyuncu kalkti")
}

function double() {
  doubleBet = true
  // console.log("oyuncu iki katini istedi")
  bankBalance = bankBalance - currentBet
  bankBalanceEl.textContent = bankBalance
  currentBet = currentBet * 2
  roundBetEl.textContent = currentBet
  disableRoundButtons()
  insertPlayerCard()

  if (!playerBusted) {
    insertDealerCard()
  }
}

function handlePlayerBust() {
  playerBusted = true
  disableRoundButtons()
  handleHiddenCard()
  handlePayment("lose", "bust", "win")
  // console.log("oyuncu patladi")
}

function handleDealerBust() {
  handlePayment("win", "win", "bust")
  // console.log("dealer patladi")
}

function startRound() {
  // if balance is not enough for doubling bet disable doubleBtn
  doubleBtnEl.disabled = bankBalance < currentBet ? true : false
  if (currentDeck.length < 52) {
    currentDeck.length = 0
    currentDeck.push(...shuffleDeck())
  }

  //  console.log("kagitlar dagitildi")
  dealerHand.push(drawCard())
  dealerHand.push(drawCard())
  playersTurn = true
  playerHand.push(drawCard())
  playerHand.push(drawCard())
}

function decideWinner() {
  if (playerRoundTotal === dealerRoundTotal) {
    if (dealerHasBJ && !playerHasBJ) {
      console.log("dealerHasBJ", dealerHasBJ)
      console.log("dealer blackjack win")
      handlePayment("lose", "lose", "win")
    } else {
      handlePayment("tie", "tie", "tie")
    }
  }
  if (playerRoundTotal > dealerRoundTotal && playerRoundTotal <= 21) {
    handlePayment("win", "win", "lose")
  } else if (playerRoundTotal < dealerRoundTotal && dealerRoundTotal <= 21) {
    handlePayment("lose", "lose", "win")
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
    // console.log("game over")
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

  playerRibbonEl.textContent =
    playerEvent === "bust" ? "Bust!" : playerEvent === "tie" ? "Tie - Push!" : `You ${playerEvent}!`
  playerRibbonEl.classList.add("ribbon", `ribbon-${playerEvent}`)
  dealerRibbonEl.textContent =
    dealerEvent === "bust"
      ? "Bust!"
      : dealerEvent === "tie"
      ? "Tie - Push!"
      : `Dealer ${dealerEvent}!`
  dealerRibbonEl.classList.add("ribbon", `ribbon-${dealerEvent}`)
  playerRibbonEl.classList.remove("hidden")
  dealerRibbonEl.classList.remove("hidden")
  bankBalanceEl.textContent = bankBalance
  resetRound()
  // console.log("handle payment calisti")
}

/****************
helper functions
*****************/
// Removes all children of the element.
function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}
