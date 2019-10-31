const getScrollElement = () => document.querySelector('.scroll-container').children[0]
const getScrollableHeight = () => getScrollElement().scrollHeight

export { getScrollElement, getScrollableHeight }
