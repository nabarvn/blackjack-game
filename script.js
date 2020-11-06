let blackjackGame = {
  /*
  This is an Object.

  What's happenning here is k-v pairs are being created in a way such that the keys
  represent a code word for a specific element, making it easier to access them.
  */

  'you': {'scoreSpan': '#your-blackjack-result', 'div': '#your-box', 'score': 0},
  'dealer': {'scoreSpan': '#dealer-blackjack-result', 'div': '#dealer-box', 'score': 0},
  'cards': ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'K', 'J', 'Q', 'A'],  // This array is used to generate random cards
  'cardsMap': {'2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'K': 10, 'J': 10, 'Q': 10, 'A': [1, 11]},  // These k-v pairs help in mapping integers to the cards so that it's possible to keep a count of the score 
  'wins': 0,
  'losses': 0,
  'draws': 0,
  'isStand': false,   // Keeps track of whether the 'Stand' button has been pressed
  'turnsOver': false, // Keeps track of all the turns; meaning - to check whether 'Hit' and 'Deal' buttons have been pressed
};

// The below two constants help in easier retrieval of keys
const YOU = blackjackGame['you'];
const DEALER = blackjackGame['dealer'];

const hitSound = new Audio('sounds/swish.m4a');
const winSound = new Audio('sounds/cash.mp3');
const lossSound = new Audio('sounds/aww.mp3');

/*
'querySelector' is better than 'getElementById' and it is more convenient
 
'addEventlistener' determines what happens after a particular event occurs
and it is more convenient than using attributes like 'onclick' in HTML
*/

document.querySelector('#blackjack-hit-button').addEventListener('click', blackjackHit);

document.querySelector('#blackjack-stand-button').addEventListener('click', dealerLogic);

document.querySelector('#blackjack-deal-button').addEventListener('click', blackjackDeal);

// This function determines what happens when 'Hit' button is pressed
function blackjackHit() {
  if (blackjackGame['isStand'] === false) {
    //This code works if the 'Stand' button has not been pressed
    let card = randomCard();
    showCard(card, YOU);
    updateScore(card, YOU);
    showScore(YOU);
  }
}

function randomCard() {
  let randomIndex = Math.floor(Math.random() * 13);  // Multiplied by 13 since there are 13 possibilities
  return blackjackGame['cards'][randomIndex];
}

function showCard(card, activePlayer) {
  if (activePlayer['score'] <= 21) {
    // Show cards only if the total score is less than or equal to 21
    let cardImage = document.createElement('img');
    cardImage.src = `images/${card}.png`;  // String template
    document.querySelector(activePlayer['div']).appendChild(cardImage);
    hitSound.play();
  }
}

// This function determines what happens when 'Deal' button is pressed
function blackjackDeal() {
  if (blackjackGame['turnsOver'] === true) {
    /*
    'Deal' button can only be pressed when all the turns are over.
    And after pressing the 'Deal' button, we should be able to press
    the 'Stand' button again; hence 'isStand' is set to false.
    */
    blackjackGame['isStand'] = false;
    
    let yourImages = document.querySelector('#your-box').querySelectorAll('img'); //It's an Array of all the images inside '#your-box'
    let dealerImages = document.querySelector('#dealer-box').querySelectorAll('img'); //It's an Array of all the images inside '#dealer-box'

    for (i=0; i<yourImages.length; i++) {
      // It's removing all the images at one go
      yourImages[i].remove();
    }

    for (i=0; i<dealerImages.length; i++) {
      // It's removing all the images at one go
      dealerImages[i].remove();
    }

    // Sets the score to 0 when the 'Deal' button is pressed
    YOU['score'] = 0;
    DEALER['score'] = 0;

    document.querySelector('#your-blackjack-result').textContent = 0;
    document.querySelector('#dealer-blackjack-result').textContent = 0;
    
    document.querySelector('#your-blackjack-result').style.color = '#ffffff';
    document.querySelector('#dealer-blackjack-result').style.color = '#ffffff';
    
    // Changing the text content to "Let's Play!" when the 'Deal' button is pressed
    document.querySelector('#blackjack-result').textContent = "Let's Play!";
    document.querySelector('#blackjack-result').style.color = 'black';
    
    // It's important to set 'turnsOver' to true so that we can show the results
    blackjackGame['turnsOver'] = true;
  }
}

// This function helps to update score
function updateScore(card, activePlayer) {
  if (card === 'A') {
    //If adding 11 keeps you below 21, add 11. Otherwise, add 1.
    if(activePlayer['score'] + blackjackGame['cardsMap'][card][1] <= 21) {
      activePlayer['score'] += blackjackGame['cardsMap'][card][1];  // Choose the second element from the array (check the key 'cardsMap')
    } else {
      activePlayer['score'] += blackjackGame['cardsMap'][card][0];  // Choose the first element from the array (check the key 'cardsMap')
    }
  } else {
    // If the card is not 'A'
    activePlayer['score'] += blackjackGame['cardsMap'][card];
  }  
}

function showScore(activePlayer) {
  if(activePlayer['score'] > 21) {
    document.querySelector(activePlayer['scoreSpan']).textContent = 'BUST!';
    document.querySelector(activePlayer['scoreSpan']).style.color = 'red';
  } else {
    document.querySelector(activePlayer['scoreSpan']).textContent = activePlayer['score'];
  }
}

// Defining sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// This function determines what happens when 'Stand' button is pressed
async function dealerLogic() {
  /*
  As soon as the 'Stand' button is pressed,
  the dealerLogic function runs and it activates the
  'Stand' mode.
  */
  blackjackGame['isStand'] = true;

  while (DEALER['score'] < 16 && blackjackGame['isStand'] === true) {
    let card = randomCard();
    showCard(card, DEALER);
    updateScore(card, DEALER);
    showScore(DEALER);
    
    // Calling sleep function
    // Delaying appearance of the random card by 1000ms
    await sleep(1000); 
  }
  
  blackjackGame['turnsOver'] = true;
  let winner = computeWinner();
  showResult(winner);
}

//Compute winner and return who just won
//Update the wins, losses, and draws
function computeWinner() {
  let winner;

  if (YOU['score'] <= 21) {
    //Condition: Higher score than dealer or when dealer busts but you are 21 or under
    if (YOU['score'] > DEALER['score'] || DEALER['score'] > 21){
      blackjackGame['wins']++;
      winner = YOU;
    
    } else if (YOU['score'] < DEALER['score']) {
      blackjackGame['losses']++;
      winner = DEALER;
    
    } else if (YOU['score'] === DEALER['score']) {
      blackjackGame['draws']++;
    
    }
    //Condition: When user busts but dealer does not
  } else if (YOU['score'] > 21 && DEALER['score'] <= 21) {
    blackjackGame['losses']++;
    winner = DEALER;
  
    //Condition: When you and the dealer bust together
  } else if(YOU['score'] > 21 && DEALER['score'] >21) {
    blackjackGame['draws']++;

  } 
  
  return winner;
}

function showResult(winner) {
  let message, messageColor;

  if (blackjackGame['turnsOver'] === true) {
    // Code executes when all turns are over
    if (winner === YOU) {
      document.querySelector('#wins').textContent = blackjackGame['wins'];
      message = 'You Won!';
      messageColor = 'green';
      winSound.play();

    } else if (winner === DEALER) {
      document.querySelector('#losses').textContent = blackjackGame['losses'];
      message = 'You Lost!';
      messageColor = 'red';
      lossSound.play();

    } else {
      document.querySelector('#draws').textContent = blackjackGame['draws'];
      message = 'You Drew!';
      messageColor = 'black';

    }

    document.querySelector('#blackjack-result').textContent = message;
    document.querySelector('#blackjack-result').style.color = messageColor;
  }
}