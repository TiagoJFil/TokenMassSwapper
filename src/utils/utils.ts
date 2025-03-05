
export function selectItemBasedOnProbability(table: { [key: number]: number }): number {
  const totalWeight = Object.values(table).reduce((sum, weight) => sum + weight, 0);
  const randomValue = Math.random() * totalWeight;
  let cumulativeWeight = 0;

  for (const [probability, weight] of Object.entries(table)) {
    cumulativeWeight += weight;
    if (randomValue < cumulativeWeight) {
      return weight;
    }
  }

  throw new Error('Failed to select an item based on probability');
}


export function cutTableOutcomeHigherThan(
  table: { [key: number]: number },
  value: number,
): { [key: number]: number } {
  return Object.fromEntries(
    Object.entries(table).filter(([key, weight]) => weight <= value),
  );
}