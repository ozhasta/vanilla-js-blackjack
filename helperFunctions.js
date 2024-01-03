/**
 * Updates the class of an element based on the specified action.
 *
 * @param {string} elementId - The id of the element to update.
 * @param {string} action - The action to perform on the element's class.
 * @param {string} className - The name of the class to add, remove, or toggle.
 * @return {undefined} Returns undefined.
 */
function updateClass(elementId, action, className) {
  const element = document.getElementById(elementId)

  if (!element) {
    console.error(`Invalid element id: "${elementId}"`)
    return
  }

  switch (action) {
    case "add":
      element.classList.add(className)
      break

    case "remove":
      element.classList.remove(className)
      break

    case "toggle":
      element.classList.toggle(className)
      break

    default:
      console.error(`Invalid action: "${action}"`)
  }
}
/**
 * Removes all children of the given element.
 *
 * @param {Element} element - The element whose children will be removed.
 */
function removeAllChildren(element) {
  while (element.firstChild) element.removeChild(element.firstChild)
}

/**
 * Delays the execution of the code for the specified number of milliseconds.
 *
 * @param {number} ms - The number of milliseconds to delay the execution.
 * @return {Promise} A Promise that resolves after the specified number of milliseconds.
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export { updateClass, removeAllChildren, delay }
