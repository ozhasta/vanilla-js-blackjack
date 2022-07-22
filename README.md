
# BlackJack game
## Written in vanilla JavaScript, HTML, CSS. 
All the rules of the game have been applied (some of rules complicated) and are in working condition. (According myself :) )
I implemented a few CSS animations for better visuals & feels.

Due to the weakness of the JavaScript built-in random generator, during development I found different shuffling algorithm that working much better, and that's the *only part I've used code from the outside* (internet). See, below.


```javascript
    for (let i = arr.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
```

**The special thing about this project for me, is that: I wrote it on my own without reading any other BlackJack code or without watching the tutorial.**

![bjack](https://user-images.githubusercontent.com/6636688/180058872-33f37d62-3921-4041-8a0d-b9f02a229afa.png)
