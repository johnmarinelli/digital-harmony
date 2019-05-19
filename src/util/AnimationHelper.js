export const fadeInThenOut = (now, startTime, animationTime) => {
  const timeSinceLastNote = startTime === 0.0 ? 0.0 : now - startTime + 0.5
  let factor = 0.0
  if (timeSinceLastNote <= animationTime * 2.0) {
    const isPastHalfwayPoint = timeSinceLastNote - animationTime >= 0.0
    factor = isPastHalfwayPoint ? animationTime - (timeSinceLastNote - animationTime) : timeSinceLastNote
  }

  return factor
}
