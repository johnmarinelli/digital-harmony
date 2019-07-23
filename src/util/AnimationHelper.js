export const fadeInThenOut = (now, startTime, animationTime) => {
  const timeDiff = startTime === 0.0 ? 0.0 : now - startTime + 0.5
  let factor = 0.0
  if (timeDiff <= animationTime * 2.0) {
    const isPastHalfwayPoint = timeDiff - animationTime >= 0.0
    factor = isPastHalfwayPoint ? animationTime - (timeDiff - animationTime) : timeDiff
  }

  return factor
}

export const fadeInThenOutNonPositive = (now, startTime, animationTime) => {
  const timeDiff = startTime === 0.0 ? 0.0 : now - startTime
  let factor = 0.0
  if (timeDiff <= animationTime * 2.0) {
    const isPastHalfwayPoint = timeDiff - animationTime >= 0.0
    factor = isPastHalfwayPoint ? animationTime - (timeDiff - animationTime) : timeDiff
  }

  return factor
}
