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

let playerRoundTotal = 0
let dealerRoundTotal = 0
let playersTurn = false
let bankBalance = 1000
let currentBet = 0
let bankBalanceRestorePoint

// >>> Setting variables
const playBtnEl = document.querySelector("#play-btn")
const playerNameInputEl = document.querySelector("#player-name-input")
let numberOfDecksInput = 4
let deckUsegeRatioInput = 100
let deckColorInput = "blue"
let playerName = "Player"
// Setting variables <<<

/****************
settings section
*****************/
playBtnEl.addEventListener("click", saveSettings)
function saveSettings() {
  numberOfDecksInput = document.getElementById("numberOfDecksInput").value
  const deckUsegeRatioInputElement = document.getElementsByName("prevent-card-counting")
  deckUsegeRatioInputElement.forEach((item) => {
    if (item.checked) {
      deckUsegeRatioInput = item.value
    }
  })
  const deckColorInputElement = document.getElementsByName("deck-color")
  deckColorInputElement.forEach((item) => {
    if (item.checked) {
      deckColorInput = item.value
    }
  })
  playerName = playerNameInputEl.value
  playerNameOutputEl.textContent = playerName

  bankBalanceEl.textContent = bankBalance
  bankBalanceRestorePoint = bankBalance

  document.getElementById("settings-container").classList.toggle("hidden")
  document.getElementById("betting-container").classList.toggle("hidden")
  document.getElementById("balance").classList.toggle("hidden")
  document.getElementById("fixed-bottom-betting").classList.toggle("hidden")

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
    document.getElementById("betting-container").classList.toggle("hidden")
    document.getElementById("round-container").classList.toggle("hidden")
    document.getElementById("balance").classList.toggle("balance-move")
    document.getElementById("fixed-bottom-betting").classList.toggle("hidden")
    document.getElementById("fixed-bottom-round").classList.toggle("hidden")
    roundBetEl.textContent = currentBet
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
  hearts: ["HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA"],
  spades: ["HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA"],
  clubs: ["HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA"],
  diamonds: ["HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA", "HA"]
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

function popThenCount() {
  let poppedCard = currentDeck.pop()
  let cardFace = poppedCard.slice(-1)
  let cardVal = 0
  // gecerli kartin dosya isminde bu karakterler var mi, regex
  const face = /(K|Q|J|T)/.test(cardFace) // true or false

  function decideCardValue() {
    if (cardFace === "A") {
      let roundTotal
      /* hesaplama yaparken kimin kartlarini saydigini, degisken_(roundTotal)
      vasitasi ile oyuncu sirasina_(playersTurn) gore belirle */
      roundTotal = playersTurn ? playerRoundTotal : dealerRoundTotal
      if (roundTotal >= 11) {
        //  console.log("as 1 sayildi")
        cardVal = 1
      } else {
        //  console.log("as 11 sayildi")
        cardVal = 11
      }
      // gecerli kartin dosya isminde bu karakterler var mi, if ve regex ile test
    } else if (face) {
      cardVal = 10
    } else {
      cardVal = parseInt(cardFace)
    }
  }

  if (playersTurn) {
    playerHandEl.innerHTML += `<div class="card"><img src="deck/${poppedCard}.png" /></div>`
    decideCardValue()
    playerRoundTotal += cardVal
    playerRoundTotalEl.textContent = playerRoundTotal
    // oyuncu BJ mi yapti yoksa kagit cekerek mi 21 e ulasti
    if (playerRoundTotal === 21) {
      if (playerHand.length < 3) {
        playerBJ()
      } else {
        player21()
      }
    }
    if (playerRoundTotal > 21) {
      playerBust()
    }
  } else {
    dealerHandEl.innerHTML += `<div class="card"><img src="deck/${poppedCard}.png" /></div>`
    decideCardValue()
    dealerRoundTotal += cardVal
    dealerRoundTotalEl.textContent = dealerRoundTotal
  }
  remainingCardsCounterEl.textContent = currentDeck.length
  return poppedCard
}

const hitBtnEl = document.querySelector("#hit-btn")
hitBtnEl.addEventListener("click", insertPlayerCardToDOM)
// TODO convert to arrow func if not used more
function insertPlayerCardToDOM() {
  doubleBtnEl.disabled = true
  playerHand.push(popThenCount())
}
function insertDealerCardToDOM() {
  playersTurn = false
  // if (playerRoundTotal < 22 && dealerRoundTotal < 22 && dealerRoundTotal > playerRoundTotal) {
  //   decideWinner()
  // } else if (playerRoundTotal < 22 && dealerRoundTotal < 22 && playerRoundTotal > dealerRoundTotal) {
  //   decideWinner()
  // } else if (playerRoundTotal === dealerRoundTotal) {
  //   decideWinner()
  // }
  while (dealerRoundTotal < 17) {
    dealerHand.push(popThenCount())
    if (dealerRoundTotal > 21) {
      return dealerBust()
    }
    // else if (dealerRoundTotal < 21 && dealerRoundTotal > 16) {
    //   return decideWinner()
    // }
  }
  decideWinner()
}

const standBtnEl = document.querySelector("#stand-btn")
standBtnEl.addEventListener("click", stand)
function stand() {
  disableRoundButtons()
  insertDealerCardToDOM()
  // console.log("oyuncu kalkti")
}

const doubleBtnEl = document.querySelector("#double-btn")
doubleBtnEl.addEventListener("click", double)
function double() {
  if (currentBet < bankBalance) {
    // console.log("oyuncu iki katini istedi")
    bankBalance = bankBalance - currentBet
    bankBalanceEl.textContent = bankBalance
    currentBet = currentBet * 2
    roundBetEl.textContent = currentBet

    disableRoundButtons()
    insertPlayerCardToDOM()
    insertDealerCardToDOM()
  }
}

function playerBust() {
  disableRoundButtons()
  playerRibbonEl.textContent = "Bust"
  playerRibbonEl.classList.toggle("ribbon-lose")
  togglePlayerRibbon()
  // console.log("oyuncu patladi")

  resetRound()
}
function dealerBust() {
  dealerRibbonEl.textContent = "Bust"
  dealerRibbonEl.classList.toggle("ribbon")
  dealerRibbonEl.classList.toggle("ribbon-lose")
  dealerRibbonEl.classList.toggle("hidden")
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

function playerBJ() {
  disableRoundButtons()
  insertDealerCardToDOM()
  //  console.log("oyuncu elden BlackJack yapti")
}
function player21() {
  disableRoundButtons()
  insertDealerCardToDOM()
  // console.log("oyuncu 21 e ulasti")
}
function decideWinner() {
  if (playerRoundTotal > dealerRoundTotal) {
    // console.log("dealer 17 ye ulasti - win")
    playerWinRibbon()
    handlePayment("win")
  } else if (playerRoundTotal < dealerRoundTotal) {
    // console.log("dealer 17 ye ulasti - lose")
    dealerWinRibbon()
    resetRound()
  } else {
    let playerHasBJ = playerRoundTotal === 21 && playerHand.length < 3
    console.log("playerHasBJ➡️", playerHasBJ)
    let dealerHasBJ = dealerRoundTotal === 21 && dealerHand.length < 3
    console.log("dealerHasBJ➡️", dealerHasBJ)
    let player21ButNotBJ = playerRoundTotal === 21 && playerHand.length > 2
    console.log("player21ButNotBJ➡️", player21ButNotBJ)
    let dealer21ButNotBJ = dealerRoundTotal === 21 && dealerHand.length > 2
    console.log("dealer21ButNotBJ➡️", dealer21ButNotBJ)
    console.log("decide winner calisti")

    if (playerHasBJ && dealer21ButNotBJ) {
      console.log("player blackjack win")
    }
    if (dealerHasBJ && player21ButNotBJ) {
      console.log("dealer blackjack win")
    }
    if (playerHasBJ && dealerHasBJ) {
      console.log("blackjack tie")
    }
    // console.log("dealer 17 ye ulasti - tie")
    // tieRibbon()
    // handlePayment("tie")
  }
}
function disableRoundButtons() {
  hitBtnEl.disabled = true
  standBtnEl.disabled = true
  doubleBtnEl.disabled = true
}
function resetRoundButtons() {
  hitBtnEl.disabled = false
  standBtnEl.disabled = false
  doubleBtnEl.disabled = false
}

function startRound() {
  // if balance is not enougth for doubling bet disable doubleBtn
  doubleBtnEl.disabled = bankBalance < currentBet ? true : false
  if (currentDeck.length === 0) {
    currentDeck.push(...shuffle())
  }
  //  console.log("kagitlar dagitildi")
  dealerHand.push(popThenCount())
  dealerHand.push(popThenCount())
  playersTurn = true
  playerHand.push(popThenCount())
  playerHand.push(popThenCount())
}

function resetRound() {
  document.getElementById("splash-screen").classList.toggle("hidden") // buraya dikkat
  setTimeout(function () {
    document.getElementById("betting-container").classList.toggle("hidden")
    document.getElementById("round-container").classList.toggle("hidden")
    document.getElementById("balance").classList.toggle("balance-move")
    document.getElementById("fixed-bottom-betting").classList.toggle("hidden")
    document.getElementById("fixed-bottom-round").classList.toggle("hidden")
    document.getElementById("splash-screen").classList.toggle("hidden") // buraya dikkat
    playersTurn = false
    dealerHand.length = 0
    dealerHandEl.innerHTML = `<div class="cards"></div>`
    playerHand.length = 0
    playerHandEl.innerHTML = `<div class="cards"></div>`
    dealerRoundTotal = 0
    dealerRoundTotalEl.textContent = 0
    playerRoundTotal = 0
    playerRoundTotalEl.textContent = 0
    currentBet = 0
    firstBetEl.textContent = 0
    // reset ribbon classes
    dealerRibbonEl.className = "hidden"
    playerRibbonEl.className = "hidden"
    resetRoundButtons()
  }, 4000)
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
      break
    default:
      console.log("switch - case hatali")
      break
  }
  resetRound()
}
