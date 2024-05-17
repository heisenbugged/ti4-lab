export const calcScale = (radius: number) => {
  // 70 is where 3 planets  no longer fit so we start scaling down.
  if (radius <= 80) return Math.min(1, radius / 70);
  return radius / 80;
};
