const FOCUS_CLASS = 'remote-key-focused'
const REMOTE_ATTR = 'data-remote-key'
const REMOTE_SELECTOR = [
  `[${REMOTE_ATTR}="true"]`,
  'button:not([disabled])',
  '.el-button:not(.is-disabled)',
  '.el-checkbox:not(.is-disabled)',
  '[role="button"]:not([aria-disabled="true"])'
].join(',')
const MODAL_SELECTOR = [
  '.el-dialog__wrapper',
  '.del-dialog',
  '.add-dialog',
  '.hardware-dialog',
  '.tab-settings-dialog'
].join(',')

let currentEl = null
let currentScope = null
let lastPageEl = null
let installed = false
let focusSyncTimer = null
let modalObserver = null

function markRemoteElement(el) {
  if (!el || el.nodeType !== 1) {
    return
  }

  el.setAttribute(REMOTE_ATTR, 'true')

  if (!el.hasAttribute('tabindex')) {
    el.setAttribute('tabindex', '0')
  }
}

function isEditableElement(el) {
  if (!el) {
    return false
  }

  const tagName = el.tagName ? el.tagName.toLowerCase() : ''

  if (tagName === 'input') {
    const inputType = String(el.type || '').toLowerCase()

    return inputType !== 'checkbox' &&
      inputType !== 'radio' &&
      inputType !== 'button' &&
      inputType !== 'submit' &&
      inputType !== 'reset'
  }

  return tagName === 'textarea' ||
    tagName === 'select' ||
    el.isContentEditable
}

function isVisible(el) {
  if (!el || !el.isConnected) {
    return false
  }

  const style = window.getComputedStyle(el)

  if (style.display === 'none' || style.visibility === 'hidden' || style.pointerEvents === 'none') {
    return false
  }

  if (el.disabled || el.getAttribute('aria-disabled') === 'true') {
    return false
  }

  return el.getClientRects().length > 0
}

function getVisibleModals() {
  return Array.from(document.querySelectorAll(MODAL_SELECTOR)).filter(isVisible)
}

function getScope() {
  const modals = getVisibleModals()

  if (modals.length) {
    return modals[modals.length - 1]
  }

  return document.querySelector('#index') || document.body
}

function getRemoteElements() {
  const scope = getScope()

  return Array.from(scope.querySelectorAll(REMOTE_SELECTOR))
    .filter(isVisible)
    .filter(el => !el.closest('.mask'))
}

function getGroupedElements() {
  if (!currentEl || !currentEl.classList) {
    return null
  }

  if (currentEl.classList.contains('item')) {
    const softwareListEl = currentEl.closest('.left-content')

    if (softwareListEl) {
      const elements = Array.from(softwareListEl.querySelectorAll('.item'))
        .filter(isVisible)

      return elements.length > 1 ? elements : null
    }
  }

  const rightMenuEl = currentEl.closest('.right')

  if (rightMenuEl) {
    const elements = Array.from(rightMenuEl.querySelectorAll(REMOTE_SELECTOR))
      .filter(isVisible)

    return elements.length > 1 ? elements : null
  }

  const configActionsEl = currentEl.closest('.config-actions')

  if (configActionsEl) {
    const elements = Array.from(configActionsEl.querySelectorAll(REMOTE_SELECTOR))
      .filter(isVisible)

    return elements.length > 1 ? elements : null
  }

  return null
}

function getIndexBackDownTarget() {
  const tabElements = getTopTabElements()

  if (tabElements.length) {
    return getActiveTopTabTarget()
  }

  return getAddButton()
}

function isIndexScopeActive() {
  const scope = getScope()

  return Boolean(scope && scope.id === 'index')
}

function getTopTabElements() {
  const scope = getScope()

  return Array.from(scope.querySelectorAll('.top-type-tabs .top-type-tab'))
    .filter(isVisible)
}

function getActiveTopTabTarget() {
  const tabElements = getTopTabElements()

  if (tabElements.length) {
    return tabElements.find(el => el.classList.contains('active')) || tabElements[0]
  }

  return null
}

function getLastTopTabTarget() {
  const tabElements = getTopTabElements()

  return tabElements[tabElements.length - 1] || null
}

function getAddButton() {
  const scope = getScope()

  return Array.from(scope.querySelectorAll(`.left-top [${REMOTE_ATTR}="true"]`))
    .filter(isVisible)[0] || null
}

function getIndexBackButton() {
  const scope = getScope()

  return Array.from(scope.querySelectorAll('.index-back-button'))
    .filter(isVisible)[0] || null
}

function getFirstRightMenuTarget() {
  const scope = getScope()

  return Array.from(scope.querySelectorAll(`.right [${REMOTE_ATTR}="true"]`))
    .filter(isVisible)[0] || null
}

function getRightMenuTarget() {
  const scope = getScope()
  const elements = Array.from(scope.querySelectorAll(`.right [${REMOTE_ATTR}="true"]`))
    .filter(isVisible)

  if (!elements.length) {
    return null
  }

  return elements.find(el => el.classList.contains('active')) || sortElements(elements)[0]
}

function getDeviceMenuTarget() {
  const scope = getScope()

  return Array.from(scope.querySelectorAll('.right-button-SB'))
    .filter(isVisible)[0] || null
}

function getConfigActionElements() {
  const scope = getScope()

  return Array.from(scope.querySelectorAll('.config-actions .config-action'))
    .filter(isVisible)
}

function getSoftwareItems() {
  const scope = getScope()

  return Array.from(scope.querySelectorAll('.left-content .item'))
    .filter(isVisible)
}

function isIndexBackButton(el) {
  if (!el || !el.classList) {
    return false
  }

  return el.classList.contains('index-back-button')
}

function isTopTab(el) {
  return Boolean(el && el.closest && el.closest('.top-type-tabs'))
}

function isAddButton(el) {
  return Boolean(el && el.closest && el.closest('.left-top'))
}

function isRightMenuButton(el) {
  return Boolean(el && el.closest && el.closest('.right'))
}

function isDeviceMenuButton(el) {
  return Boolean(el && el.classList && el.classList.contains('right-button-SB'))
}

function isConfigAction(el) {
  return Boolean(el && el.closest && el.closest('.config-actions'))
}

function sortElements(elements) {
  return elements.slice().sort((a, b) => {
    const rectA = a.getBoundingClientRect()
    const rectB = b.getBoundingClientRect()
    const topDiff = rectA.top - rectB.top

    if (Math.abs(topDiff) > 8) {
      return topDiff
    }

    return rectA.left - rectB.left
  })
}

function isInsideModal(el) {
  return Boolean(el && el.closest && el.closest(MODAL_SELECTOR))
}

function rememberPageElement(el) {
  if (el && !isInsideModal(el) && isVisible(el)) {
    lastPageEl = el
  }
}

function setCurrent(el) {
  if (currentEl === el) {
    if (currentEl && !currentEl.classList.contains(FOCUS_CLASS)) {
      currentEl.classList.add(FOCUS_CLASS)
    }
    return
  }

  if (currentEl) {
    rememberPageElement(currentEl)
    currentEl.classList.remove(FOCUS_CLASS)
  }

  currentEl = el || null

  if (currentEl) {
    rememberPageElement(currentEl)
    currentEl.classList.add(FOCUS_CLASS)
    currentEl.focus({ preventScroll: true })
  }
}

function getFirstElement(elements) {
  return sortElements(elements)[0] || null
}

function isModalScope(scope) {
  return Boolean(scope && scope.matches && scope.matches(MODAL_SELECTOR))
}

function getPageRestoreTarget(elements) {
  if (lastPageEl && elements.indexOf(lastPageEl) !== -1 && isVisible(lastPageEl)) {
    return lastPageEl
  }

  if (isIndexScopeActive()) {
    return getRightMenuTarget() ||
      getActiveTopTabTarget() ||
      getAddButton() ||
      getFirstElement(elements)
  }

  return getFirstElement(elements)
}

function syncCurrentToScope() {
  const scope = getScope()
  const elements = getRemoteElements()

  currentScope = scope

  if (!elements.length) {
    setCurrent(null)
    return
  }

  if (currentEl && elements.indexOf(currentEl) !== -1 && isVisible(currentEl)) {
    setCurrent(currentEl)
    return
  }

  if (!isModalScope(scope)) {
    setCurrent(getPageRestoreTarget(elements))
    return
  }

  setCurrent(getFirstElement(elements))
}

function scheduleSyncCurrent() {
  if (focusSyncTimer) {
    window.clearTimeout(focusSyncTimer)
  }

  focusSyncTimer = window.setTimeout(() => {
    focusSyncTimer = null
    window.requestAnimationFrame(syncCurrentToScope)
  }, 0)
}

function isModalMutation(mutation) {
  const target = mutation.target

  if (target && target.matches && target.matches(MODAL_SELECTOR)) {
    return true
  }

  if (target && target.closest && target.closest(MODAL_SELECTOR)) {
    return true
  }

  return Array.from(mutation.addedNodes || []).some(node => {
    return node.nodeType === 1 &&
      ((node.matches && node.matches(MODAL_SELECTOR)) ||
        (node.querySelector && node.querySelector(MODAL_SELECTOR)))
  })
}

function observeModalVisibility() {
  if (modalObserver || !document.body || typeof MutationObserver === 'undefined') {
    return
  }

  modalObserver = new MutationObserver(mutations => {
    const nextScope = getScope()
    const scopeChanged = nextScope !== currentScope
    const shouldSync = scopeChanged || mutations.some(isModalMutation)

    if (shouldSync) {
      scheduleSyncCurrent()
    }
  })

  modalObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['style', 'class', 'aria-hidden'],
    childList: true,
    subtree: true
  })
}

function ensureCurrent(elements) {
  if (currentEl && elements.indexOf(currentEl) !== -1 && isVisible(currentEl)) {
    return currentEl
  }

  const firstEl = getFirstElement(elements)
  setCurrent(firstEl)
  return firstEl
}

function getCenter(rect) {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  }
}

function getSameSoftwareRowItems(fromEl) {
  const fromRect = fromEl.getBoundingClientRect()
  const fromCenter = getCenter(fromRect)
  const rowTolerance = Math.min(fromRect.height / 2, 80)

  return getSoftwareItems()
    .filter(el => {
      const center = getCenter(el.getBoundingClientRect())

      return Math.abs(center.y - fromCenter.y) <= rowTolerance
    })
    .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)
}

function isFirstSoftwareRowItem(el) {
  const softwareItems = getSoftwareItems()
  const firstItem = sortElements(softwareItems)[0]

  if (!firstItem) {
    return false
  }

  return getSameSoftwareRowItems(firstItem).indexOf(el) !== -1
}

function getSoftwareTargetFromRightMenu(fromEl) {
  const softwareItems = getSoftwareItems()

  if (!softwareItems.length) {
    return null
  }

  const fromCenter = getCenter(fromEl.getBoundingClientRect())
  const closestItem = softwareItems.slice().sort((a, b) => {
    const rectA = a.getBoundingClientRect()
    const rectB = b.getBoundingClientRect()
    const centerA = getCenter(rectA)
    const centerB = getCenter(rectB)
    const yDiff = Math.abs(centerA.y - fromCenter.y) - Math.abs(centerB.y - fromCenter.y)

    if (Math.abs(yDiff) > 1) {
      return yDiff
    }

    return rectB.left - rectA.left
  })[0]

  if (!closestItem) {
    return null
  }

  const rowItems = getSameSoftwareRowItems(closestItem)

  return rowItems[rowItems.length - 1] || closestItem
}

function getConfigActionMove(direction) {
  const configActions = getConfigActionElements()
  const currentIndex = configActions.indexOf(currentEl)

  if (currentIndex === -1) {
    return {
      handled: false,
      target: null
    }
  }

  if (direction === 'up') {
    return {
      handled: true,
      target: getDeviceMenuTarget() || getRightMenuTarget()
    }
  }

  if (direction === 'right') {
    return {
      handled: true,
      target: configActions[currentIndex + 1] || null
    }
  }

  if (direction === 'left') {
    return {
      handled: true,
      target: configActions[currentIndex - 1] || null
    }
  }

  return {
    handled: true,
    target: null
  }
}

function getIndexDirectionalMove(direction) {
  if (!isIndexScopeActive()) {
    return {
      handled: false,
      target: null
    }
  }

  if (isIndexBackButton(currentEl)) {
    return {
      handled: true,
      target: direction === 'down' ? getIndexBackDownTarget() : null
    }
  }

  if (isTopTab(currentEl)) {
    if (direction === 'left') {
      const tabElements = getTopTabElements()
      const currentIndex = tabElements.indexOf(currentEl)

      return {
        handled: true,
        target: currentIndex > 0 ? tabElements[currentIndex - 1] : null
      }
    }

    if (direction === 'right') {
      const tabElements = getTopTabElements()
      const currentIndex = tabElements.indexOf(currentEl)
      const nextTab = currentIndex !== -1 ? tabElements[currentIndex + 1] : null

      return {
        handled: true,
        target: nextTab || getAddButton() || getRightMenuTarget()
      }
    }

    if (direction === 'down') {
      return {
        handled: true,
        target: getSoftwareItems()[0] || null
      }
    }
  }

  if (isRightMenuButton(currentEl)) {
    if (direction === 'right') {
      return {
        handled: true,
        target: null
      }
    }

    if (direction === 'left') {
      return {
        handled: true,
        target: getSoftwareTargetFromRightMenu(currentEl) || getAddButton()
      }
    }

    if (isDeviceMenuButton(currentEl) && direction === 'down') {
      return {
        handled: true,
        target: getConfigActionElements()[0] || null
      }
    }
  }

  if (isConfigAction(currentEl)) {
    return getConfigActionMove(direction)
  }

  if (isAddButton(currentEl)) {
    if (direction === 'left') {
      return {
        handled: true,
        target: getLastTopTabTarget()
      }
    }

    if (direction === 'up') {
      return {
        handled: true,
        target: getIndexBackButton()
      }
    }

    if (direction === 'right') {
      return {
        handled: true,
        target: getFirstRightMenuTarget()
      }
    }

    if (direction === 'down') {
      return {
        handled: true,
        target: getSoftwareItems()[0] || getFirstRightMenuTarget()
      }
    }

    return {
      handled: true,
      target: null
    }
  }

  if (currentEl && currentEl.classList && currentEl.classList.contains('item')) {
    if (direction === 'up' && isFirstSoftwareRowItem(currentEl)) {
      return {
        handled: true,
        target: getActiveTopTabTarget()
      }
    }

    if (direction === 'right') {
      const rowItems = getSameSoftwareRowItems(currentEl)
      const currentIndex = rowItems.indexOf(currentEl)

      return {
        handled: true,
        target: currentIndex !== -1 && rowItems[currentIndex + 1]
          ? rowItems[currentIndex + 1]
          : getRightMenuTarget()
      }
    }
  }

  return {
    handled: false,
    target: null
  }
}

function getNextByDirection(elements, direction, options = {}) {
  const allowWrap = options.allowWrap !== false
  const fromEl = ensureCurrent(elements)

  if (!fromEl) {
    return null
  }

  const fromRect = fromEl.getBoundingClientRect()
  const fromCenter = getCenter(fromRect)
  const candidates = elements
    .filter(el => el !== fromEl)
    .map(el => {
      const rect = el.getBoundingClientRect()
      const center = getCenter(rect)
      const dx = center.x - fromCenter.x
      const dy = center.y - fromCenter.y
      let primary = 0
      let secondary = 0

      if (direction === 'left') {
        primary = -dx
        secondary = Math.abs(dy)
      } else if (direction === 'right') {
        primary = dx
        secondary = Math.abs(dy)
      } else if (direction === 'up') {
        primary = -dy
        secondary = Math.abs(dx)
      } else {
        primary = dy
        secondary = Math.abs(dx)
      }

      return {
        el,
        primary,
        secondary,
        score: primary * 1000 + secondary
      }
    })
    .filter(item => item.primary > 6)
    .sort((a, b) => a.score - b.score)

  if (candidates.length) {
    return candidates[0].el
  }

  if (!allowWrap) {
    return null
  }

  const sortedElements = sortElements(elements)
  const currentIndex = sortedElements.indexOf(fromEl)

  if (direction === 'left' || direction === 'up') {
    return sortedElements[currentIndex - 1] || sortedElements[sortedElements.length - 1] || null
  }

  return sortedElements[currentIndex + 1] || sortedElements[0] || null
}

function move(direction) {
  const indexMove = getIndexDirectionalMove(direction)

  if (indexMove.handled) {
    if (indexMove.target) {
      setCurrent(indexMove.target)
    }
    return
  }

  const groupedElements = getGroupedElements()

  if (groupedElements) {
    const groupedNextEl = getNextByDirection(groupedElements, direction, { allowWrap: false })

    if (groupedNextEl) {
      setCurrent(groupedNextEl)
      return
    }
  }

  const elements = getRemoteElements()

  if (!elements.length) {
    setCurrent(null)
    return
  }

  setCurrent(getNextByDirection(elements, direction))
}

function triggerCurrent() {
  const elements = getRemoteElements()
  const target = ensureCurrent(elements)

  if (!target) {
    return
  }

  target.click()
}

function handleKeydown(event) {
  if (isEditableElement(event.target)) {
    return
  }

  const keyMap = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down'
  }

  if (keyMap[event.key]) {
    event.preventDefault()
    move(keyMap[event.key])
    scheduleSyncCurrent()
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    triggerCurrent()
    scheduleSyncCurrent()
  }
}

function syncCurrentFromPointer(event) {
  const target = event.target && event.target.closest
    ? event.target.closest(REMOTE_SELECTOR)
    : null

  if (target && isVisible(target)) {
    setCurrent(target)
  }
}

export function registerRemoteKeyElement(el) {
  markRemoteElement(el)
}

export default {
  install(Vue) {
    Vue.directive('remote-key', {
      inserted(el) {
        markRemoteElement(el)
        scheduleSyncCurrent()
      },
      componentUpdated(el) {
        markRemoteElement(el)
        scheduleSyncCurrent()
      }
    })

    if (installed) {
      return
    }

    installed = true
    window.addEventListener('keydown', handleKeydown)
    document.addEventListener('mouseover', syncCurrentFromPointer, true)
    document.addEventListener('click', syncCurrentFromPointer, true)
    observeModalVisibility()
    scheduleSyncCurrent()
  }
}
