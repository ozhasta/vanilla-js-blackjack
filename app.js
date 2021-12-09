"use strict"
const dealerHand = []
const playerHand = []
const playerHandEl = document.querySelector(".playerHand .cards")
const dealerHandEl = document.querySelector(".dealerHand .cards")
const playerRoundTotalEl = document.querySelector("#player-round-total")
const dealerRoundTotalEl = document.querySelector("#dealer-round-total")
let playerRoundTotal = 0
let dealerRoundTotal = 0
const remainingCardsCounterEl = document.querySelector(".remaining-cards > span")
let playersTurn = true

// Setting variables >>>
const playButton = document.querySelector("#play-button")
let numberOfDecksInput = 4
let deckUsegeRatioInput = 75
let deckColorInput = "blue"
// >>> Setting variables

const deck = {
  hearts: ["H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "HT", "HJ", "HQ", "HK", "HA"],
  spades: ["S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "ST", "SJ", "SQ", "SK", "SA"],
  clubs: ["C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "CT", "CJ", "CQ", "CK", "CA"],
  diamonds: ["D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "DT", "DJ", "DQ", "DK", "DA"],
  full() {
    return [...this.hearts, ...this.spades, ...this.clubs, ...this.diamonds]
  },
  concatDecks(numOfDecks) {
    let multipleDecks = []
    for (let i = 0; i < numOfDecks; i++) {
      multipleDecks = multipleDecks.concat(deck.full())
    }
    return multipleDecks
  },
  shuffled() {
    return shuffle(this.concatDecks(numberOfDecksInput))
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
const newDeck = deck.shuffled()
{
  // playersTurn 1 kere değiştirilebilir, kagıt dagıtma sırası önemsiz olabilir
  playerHand.push(popThenCount())
  playersTurn = false
  dealerHand.push(popThenCount())
  playersTurn = true
  playerHand.push(popThenCount())
  playersTurn = false
  dealerHand.push(popThenCount())
  playersTurn = true
}

function popThenCount() {
  let poppedCard = newDeck.pop()
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
  remainingCardsCounterEl.textContent = newDeck.length
  return poppedCard
}

const hitBtnEl = document.querySelector("#hit")
hitBtnEl.addEventListener("click", insertPlayerCardToDOM)
// convert to arrow func if not used more
function insertPlayerCardToDOM() {
  playerHand.push(popThenCount())
}
function insertDealerCardToDOM() {
  while (dealerRoundTotal < 18) {
    dealerHand.push(popThenCount())
    if (dealerRoundTotal > 21) {
      return dealerBusted()
    }
  }
}

const standBtnEl = document.querySelector("#stand")
standBtnEl.addEventListener("click", stand)
function stand() {
  standBtnEl.disabled = true
  playersTurn = false
  insertDealerCardToDOM()
  console.log("kactim ben")
}

function playerBusted() {
  // dont forget clear disabled state
  hitBtnEl.disabled = true
  console.log("oyuncu patladi")
}
function dealerBusted() {
  console.log("dealer patladi")
}
function playerBJ() {
  console.log("oyuncu elden BlackJack yapti")
}
function player21() {
  console.log("oyuncu 21 e ulasti")
}
function dealer17() {
  console.log("dealer 17 ye ulasti")
}
