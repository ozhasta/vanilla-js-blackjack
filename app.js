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
  //handleChipButtons()

  document.getElementById("settings-container").classList.toggle("hidden")
  document.getElementById("betting-container").classList.toggle("hidden")
  document.getElementById("balance").classList.toggle("hidden")

  betting()
}
function betting() {
  const betBtnEl = document.querySelector("#bet-btn")
  betBtnEl.addEventListener("click", () => {
    document.getElementById("betting-container").classList.toggle("hidden")
    document.getElementById("game-container").classList.toggle("hidden")
    document.getElementById("balance").classList.toggle("balance-move")

    startRound()
  })
}

// check balance for disabled chip buttons
function handleChipButtons() {
  chipBtnsEl.forEach((btn) => {
    if (Number(btn.textContent) <= bankBalance) {
      btn.addEventListener("click", (e) => {
        const clickedBtn = e.target
        bankBalanceRestorePoint = bankBalance
        currentBet += Number(clickedBtn.textContent)
        firstBetEl.textContent = currentBet
        bankBalance -= Number(clickedBtn.textContent)
        bankBalanceEl.textContent = bankBalance
      })
      btn.classList.remove("disabled")
    } else if (Number(btn.textContent) > bankBalance) {
      // buraya galiba foreach eklicin
      btn.classList.add("disabled")
      btn.removeEventListener("click")
    }
  })
}

// add event listener to control-chips

// btn.addEventListener("click", (e) => {
//   const clickedBtn = e.target
//   bankBalanceRestorePoint = bankBalance
//   currentBet += Number(clickedBtn.textContent)
//   firstBetEl.textContent = currentBet
//   bankBalance -= Number(clickedBtn.textContent)
//   bankBalanceEl.textContent = bankBalance
// })

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
  console.log("desteler birlestirildi")
  return multipleDecks
}
function shuffle() {
  const arr = multipleDecks(numberOfDecksInput)
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  console.log("deste karistirildi")
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
        console.log("as 1 sayildi")
        cardVal = 1
      } else {
        console.log("as 11 sayildi")
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
      playerBusted()
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
  while (dealerRoundTotal < 18) {
    dealerHand.push(popThenCount())
    if (dealerRoundTotal > 21) {
      return dealerBusted()
    }
  }
}

const standBtnEl = document.querySelector("#stand-btn")
standBtnEl.addEventListener("click", stand)
function stand() {
  disableButtons()

  insertDealerCardToDOM()
  console.log("oyuncu kalkti")
}

const doubleBtnEl = document.querySelector("#double-btn")
doubleBtnEl.addEventListener("click", double)
function double() {
  console.log("oyuncu iki katini istedi")
  disableButtons()
  insertPlayerCardToDOM()
  insertDealerCardToDOM()
}

function playerBusted() {
  disableButtons()
  console.log("oyuncu patladi")
}
function dealerBusted() {
  console.log("dealer patladi")
}
function playerBJ() {
  disableButtons()
  insertDealerCardToDOM()
  console.log("oyuncu elden BlackJack yapti")
}
function player21() {
  disableButtons()
  console.log("oyuncu 21 e ulasti")
}
function dealer17() {
  console.log("dealer 17 ye ulasti")
}
function disableButtons() {
  hitBtnEl.disabled = true
  standBtnEl.disabled = true
  doubleBtnEl.disabled = true
}

function startRound() {
  currentDeck.push(...shuffle())
  console.log("kagitlar dagitildi")
  dealerHand.push(popThenCount())
  dealerHand.push(popThenCount())
  playersTurn = true
  playerHand.push(popThenCount())
  playerHand.push(popThenCount())
}

/****************
computing balance
*****************/
