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
    `https://www.random.org/integers/?num=${HEIGHT}&min=0&max=2097152&col=1&base=16&format=plain&rnd=new`,
    {
      retry: true,
      maxRetries: 5
    }
  );

  rowsToGenerate[row] = res.getBody('utf8').split('\n').slice(0,-1);

  countFinished++;
  if (countFinished === WIDTH) {
    drawBitmap();
  }
}

function drawBitmap() {
  for (let i = 0; i < WIDTH; i++) {
    for (let j = 0; j < HEIGHT; j++) {
      rowsToGenerate[i][j] = hexRgb(rowsToGenerate[i][j]);
    }
  }

  const bitmapArray = [].concat.apply([], rowsToGenerate);

  let image = new jimp(WIDTH, HEIGHT, (err, image) => {
    if (err) {
      throw err;
    }

    bitmapArray.forEach((row, i) => {
      row.forEach((color, j) => {
        image.setPixelColor(color, j, i);
      });
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
