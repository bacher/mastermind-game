import { useState } from 'react';
import times from 'lodash/times';
import last from 'lodash/last';

import styles from './App.module.css';

const CELLS_COUNT = 5;
const VARIANTS_COUNT = 8;

type Guess = {
  cypher: number[];
  exactPosition: number;
  invalidPosition: number;
};

export function App() {
  const [cypher, setCypher] = useState<number[] | undefined>();
  const [currentValue, setCurrentValue] = useState('');

  const [guesses, setGuesses] = useState<Guess[]>([]);

  const lastGuess = last(guesses);

  return (
    <div className={styles.root}>
      <div className={styles.content}>
        {cypher ? (
          <div>
            <h1>Game</h1>
            <div className={styles.guessesBlock}>
              <div>Guesses:</div>
              {guesses.length
                ? guesses.map((guess, index) => (
                    <div key={index} className={styles.guessVariant}>
                      <span className={styles.guessIndex}>{index + 1}</span>
                      <input value={guess.cypher.join('')} readOnly />
                      Exact: {guess.exactPosition}, Some:{' '}
                      {guess.invalidPosition}
                    </div>
                  ))
                : '---'}
            </div>
            {lastGuess && lastGuess.exactPosition === CELLS_COUNT ? (
              <div>You are won</div>
            ) : (
              <div className={styles.inputBlock}>
                <span>Your guess:</span>
                <input
                  value={currentValue}
                  onChange={(event) => {
                    setCurrentValue(event.target.value.replace(/\D+/g, ''));
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const chars = currentValue.trim().split('');

                    const values = chars.map((char) => {
                      const val = Number.parseInt(char, 10);

                      if (!val || val > VARIANTS_COUNT + 1) {
                        window.alert(
                          `Only numbers allowed 1-${VARIANTS_COUNT + 1}`,
                        );
                        throw new Error();
                      }

                      return val;
                    });

                    if (values.length !== CELLS_COUNT) {
                      window.alert(`Should be exact ${CELLS_COUNT} symbols`);
                      throw new Error();
                    }

                    setGuesses([...guesses, checkGuess(cypher, values)]);
                    setCurrentValue('');
                  }}
                >
                  Check
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              const cypher = times(
                CELLS_COUNT,
                () => Math.floor(Math.random() * VARIANTS_COUNT) + 1,
              );

              // console.log('Cypher:', cypher.join(''));
              (window as any).cypher = cypher.join('');

              setCypher(cypher);
            }}
          >
            Generate Cypher
          </button>
        )}
      </div>
    </div>
  );
}

function checkGuess(cypher: number[], guess: number[]): Guess {
  const exactPositions = new Set<number>();

  for (let i = 0; i < CELLS_COUNT; i += 1) {
    const value = guess[i];

    if (value === cypher[i]) {
      exactPositions.add(i);
    }
  }

  const otherValues = times(VARIANTS_COUNT, () => 0);
  const guessValues = times(VARIANTS_COUNT, () => 0);

  for (let i = 0; i < CELLS_COUNT; i += 1) {
    if (!exactPositions.has(i)) {
      const index = cypher[i] - 1;
      otherValues[index] = (otherValues[index] ?? 0) + 1;

      const index2 = guess[i] - 1;
      guessValues[index2] = (guessValues[index2] ?? 0) + 1;
    }
  }

  let invalidPosition = 0;

  for (let index = 0; index < VARIANTS_COUNT; index += 1) {
    invalidPosition += Math.min(otherValues[index], guessValues[index]);
  }

  return {
    cypher: guess,
    exactPosition: exactPositions.size,
    invalidPosition,
  };
}
