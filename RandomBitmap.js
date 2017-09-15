// This is a simple node program created for the UnifyID tech challenge
// It generates a random bitmap from the Random.org API

const asyn = require('async');
const req = require('sync-request');
const hexRgb = require('hex-rgb');
const jimp = require('jimp');

// Adjustable constants
const WIDTH = 128;
const HEIGHT = 128;

console.log('Running');

// Fills an array to be used by async
const rowsToGenerate = [];
for (let i = 0; i < WIDTH; i++) {
  rowsToGenerate.push(i);
}

function requestRandom(row) {
  const res = req(
    'GET',
    `https://www.random.org/integers/?num=${HEIGHT}&min=0&max=4294967295&col=1&base=10&format=plain&rnd=new`,
    {
      retry: true,
      maxRetries: 5
    }
  );

  const newRow = [];
  res.getBody('utf8').split('\n').slice(0,-1).forEach(num => {
    newRow.push(parseInt(num.toString(16), 16));
  });
  rowsToGenerate[row] = newRow;

  countFinished++;
  if (countFinished === WIDTH) {
    drawBitmap();
  }
}

// This function was used for testing because I ran over my alloted quota (oops)
// Taken from the MDN page on Math.random()
function getRandomInt(row) {
  min = Math.ceil(0);
  max = Math.floor(4294967295);


  const newRow = []
  let base10;
  for (let i = 0; i < HEIGHT; i++) {
    base10 = Math.floor(Math.random() * (max - min)) + min;
    newRow.push(parseInt(base10.toString(16), 16));
  }

  rowsToGenerate[row] = newRow;

  countFinished++;
  if (countFinished === WIDTH) {
    drawBitmap();
  }
}

function drawBitmap() {


  const bitmapArray = [].concat.apply([], rowsToGenerate);

  let image = new jimp(WIDTH, HEIGHT, (err, image) => {
    if (err) {
      throw err;
    }

    bitmapArray.forEach((color, index) => {
      image.setPixelColor(color, index % HEIGHT, index / HEIGHT);
    });

    image.write('output.png', (err) => {
      if (err) {
        throw err;
      }

      console.log('Finished!');
      console.log('Wrote random bitmap to output.png');
    });
  });

}

console.log('Requesting randoms for bitmap');

let countFinished = 0;
asyn.eachOf(rowsToGenerate, requestRandom);
