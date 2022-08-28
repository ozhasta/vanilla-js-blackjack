# BlackJack game

> Simple BlackJack game, play against dealer.

---

![BlackJack](https://user-images.githubusercontent.com/6636688/186956631-9e4d6c32-845a-4fbd-8392-a3397b1c5a72.png)

---

## Live Demo

Live demo here: :arrow_right: [BlackJack](https://vanilla-js-blackjack.netlify.app/)

## Description

Written in vanilla JavaScript, HTML, CSS. 
**The special thing about this project for me, is that: I wrote it on my own without reading any other BlackJack code or without watching the tutorial.**

All the necessary rules have been added to the game and are operational.
I implemented my own CSS animations for better visuals & feels.

## 🙏 Acknowledgments

Fisher–Yates shuffle algorithm: Due to the weakness of the JavaScript's built-in shuffling while sorting, during development I found different shuffling algorithm that working much better, and that's the *only part I've used code from the outside (internet)*. See, below.

```javascript
    for (let i = arr.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
```


[Compare Naive Swap / Fisher–Yates](https://bost.ocks.org/mike/shuffle/compare.html)
