const calculatorElem = document.getElementById('calculator')
const inputTariff = document.getElementById('input-tariff')
const inputAllShifts = document.getElementById('input-all-shifts')
const inputNight = document.getElementById('input-night')
const inputHoliday = document.getElementById('input-holiday')
const inputHolidayNight = document.getElementById('input-holiday-night')
const inputAdditionally = document.getElementById('input-additionally')
const inputAdditionallyNight = document.getElementById('input-additionally-night')
const blockAdditionally = document.getElementById('input__block__additionally')
const blockAdditionallyNight = document.getElementById('input__block__additionally__night')
const inputFree = document.getElementById('input-free')
const checkboxAdvance = document.getElementById('checkbox-advance')
const checkboxAdditionally = document.getElementById('checkbox-additionally')
const checkboxNight = document.getElementById('checkbox-night')
const submitBtn = document.getElementById('submit')
const cleanInput = document.getElementById('clean')
const blockResult = document.getElementById('block--result')
const checkboxBlock = document.getElementById('checkbox__block')
const checkboxBlockNight = document.getElementById('checkbox__block__night')
const helpWrapper = document.getElementById('help-wrapper')
const helpBtn = document.getElementById('help-btn')

let sum,
  sumSalary,
  sumClean,
  sumNal,
  sumNight,
  sumMilk,
  sumWeekend,
  sumHarmfulConditions,
  sumSalaryPercent,
  sumHolidaySalary,
  sumNightHoliday,
  sumAdditionally,
  sumAdditionallyNight

const STORAGE_KEY_INPUT1 = 'calculator_input1'
const HOURS_IN_SHIFT = 8
const NIGHT_PERCENT = 40
const MILK_COMPENSATION = 40
const WEEKEND_PERCENT = 50
const TAX_PERCENT = 13
const HARMFUL_PERCENT = 4
const MAX_INPUT1 = 9999
const MAX_INPUT_OTHERS = 99
const MAX_HOLIDAY_NIGHT_HOURS = 999
const MAX_ADDITIONALLY_HOURS = 999

// === Лимиты длины ввода ===
const MAX_LENGTHS = {
  'input-tariff': 4,
  'input-all-shifts': 2,
  'input-night': 2,
  'input-holiday': 2,
  'input-free': 2,
  'input-holiday-night': 3,
  'input-additionally': 3,
  'input-additionally-night': 3,
}
Object.entries(MAX_LENGTHS).forEach(([id, len]) => {
  const el = document.getElementById(id)
  if (el) el.setAttribute('maxlength', len)
})

// === Хелперы видимости блоков ===
const showBlock = el => el && el.classList.add('is-visible')
const hideBlock = el => el && el.classList.remove('is-visible')

// === Тост-уведомления ===
function ensureToast() {
  let toast = document.getElementById('toast')
  if (!toast) {
    toast = document.createElement('div')
    toast.id = 'toast'
    toast.className = 'toast'
    document.body.appendChild(toast)
  }
  return toast
}

function showToast(message, color = '#3d9950', duration = 1800) {
  const toast = ensureToast()
  toast.textContent = message
  toast.style.background = color
  toast.style.whiteSpace = ''
  toast.style.textAlign = ''
  toast.style.maxWidth = ''
  void toast.offsetHeight
  toast.classList.add('show')
  clearTimeout(toast._hideTimer)
  toast._hideTimer = setTimeout(() => toast.classList.remove('show'), duration)
}

function showErrorToast(message) {
  const toast = ensureToast()
  toast.textContent = capitalizeFirst(message)
  toast.style.background = 'rgba(200, 40, 40, 0.95)'
  toast.style.whiteSpace = 'normal'
  toast.style.textAlign = 'left'
  toast.style.maxWidth = 'min(420px, calc(100vw - 16px))'
  void toast.offsetHeight
  toast.classList.add('show')
  clearTimeout(toast._hideTimer)
  toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 3200)
}

function hideToast() {
  const toast = document.getElementById('toast')
  if (toast) toast.classList.remove('show')
}

function showToastWhenReady(message, color = '#3d9950') {
  const attempt = () => {
    if (document.body.classList.contains('pwa-loaded')) {
      showToast(message, color)
    } else {
      setTimeout(attempt, 200)
    }
  }
  attempt()
}

// === Звук ошибки (Web Audio API, без файлов) ===
let audioCtx = null

function playErrorSound() {
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return
      audioCtx = new AC()
    }

    // Некоторые браузеры держат контекст в состоянии 'suspended'
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {})
    }

    const now = audioCtx.currentTime

    // Два коротких нисходящих тона — «уип-уип»
    const tones = [
      { freq: 520, start: 0, dur: 0.1 },
      { freq: 380, start: 0.12, dur: 0.14 },
    ]

    tones.forEach(({ freq, start, dur }) => {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + start)

      // Плавное затухание, чтобы не было резкого «щелчка» в конце
      gain.gain.setValueAtTime(0.0001, now + start)
      gain.gain.exponentialRampToValueAtTime(0.18, now + start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur)

      osc.connect(gain)
      gain.connect(audioCtx.destination)

      osc.start(now + start)
      osc.stop(now + start + dur + 0.02)
    })
  } catch (e) {
    // Звук — необязательная функция, молча игнорируем ошибку
  }
}

// === Вибрация ошибки ===
function vibrateError() {
  if (navigator.vibrate) {
    try {
      navigator.vibrate([80, 40, 80])
    } catch (e) {
      /* noop */
    }
  }
}

// === Копирование результата ===
function copyResult() {
  if (sum == null) return

  const text = [
    `Зарплата: ${formatMoney(sumClean)}`,
    `Начислено: ${formatMoney(sum)}`,
    `Оклад: ${formatMoney(sumSalaryPercent)}`,
    `Налог: ${formatMoney(sumNal)}`,
  ].join('\n')

  const onCopied = () => {
    const btn = blockResult.querySelector('.copy-result-btn')
    if (!btn) return
    const original = btn.textContent
    btn.textContent = '✓ Скопировано'
    setTimeout(() => {
      if (btn) btn.textContent = original
    }, 1500)
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(onCopied)
      .catch(() => {
        fallbackCopy(text)
        onCopied()
      })
  } else {
    fallbackCopy(text)
    onCopied()
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  try {
    document.execCommand('copy')
  } catch (e) {
    /* noop */
  }
  document.body.removeChild(ta)
}

blockResult.addEventListener('click', e => {
  if (e.target.closest('.copy-result-btn')) {
    copyResult()
  }
})

// === IIFE: лоадер ===
;(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const appContent = document.getElementById('app-content')
    const loader = document.getElementById('pwa-loader')
    const loaderMessage = document.getElementById('loader-message')

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
    const isGitHubPages = window.location.hostname.includes('github.io')

    function hideLoader() {
      if (!loader) return
      loader.style.opacity = '0'

      setTimeout(function () {
        loader.style.display = 'none'

        if (appContent) {
          appContent.style.display = 'block'
          setTimeout(function () {
            appContent.classList.add('show')
            appContent.classList.add('content-fade-in')
          }, 50)
        }

        document.body.classList.add('pwa-loaded')
      }, 300)
    }

    const messages = {
      pwa: ['Инициализация калькулятора...', 'Загрузка данных...', 'Почти готово...'],
      browser: ['Загрузка...', 'Готово!'],
    }

    let messageIndex = 0
    let messageInterval

    function updateLoaderMessage() {
      if (loaderMessage) {
        const messageList = isStandalone ? messages.pwa : messages.browser
        if (messageIndex < messageList.length) {
          loaderMessage.textContent = messageList[messageIndex]
          messageIndex++
        } else {
          clearInterval(messageInterval)
        }
      }
    }

    if (loaderMessage) {
      messageInterval = setInterval(updateLoaderMessage, 800)
    }

    let loaderTime
    if (isStandalone) {
      loaderTime = 2500
    } else if (isMobile) {
      loaderTime = 1500
    } else {
      loaderTime = 800
    }

    if (isGitHubPages) {
      loaderTime += 1000
    }

    window.addEventListener('load', function () {
      setTimeout(hideLoader, 500)
    })

    setTimeout(function () {
      if (loader && loader.style.display !== 'none') {
        hideLoader()
      }
    }, 5000)

    setTimeout(hideLoader, loaderTime)

    if (!localStorage.getItem('app_first_launch')) {
      localStorage.setItem('app_first_launch', new Date().toISOString())
    }
  })

  let deferredPrompt
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault()
    deferredPrompt = e
  })
})()

// === Валидация ===
function validateAllInputs() {
  const hourlyRate = getNumberValue(inputTariff)
  const totalShifts = getNumberValue(inputAllShifts)
  const nightShifts = getNumberValue(inputNight)
  const holidayShifts = getNumberValue(inputHoliday)
  const weekendShifts = getNumberValue(inputFree)
  const holidayNightHours = getNumberValue(inputHolidayNight)

  let hasErrors = false

  if (!hourlyRate || !totalShifts) {
    if (!hourlyRate) markError(inputTariff)
    if (!totalShifts) markError(inputAllShifts)
    hasErrors = true
  } else {
    inputTariff.classList.remove('error')
    inputAllShifts.classList.remove('error')
  }

  if (nightShifts > totalShifts) {
    markError(inputNight)
    hasErrors = true
  } else {
    inputNight.classList.remove('error')
  }

  if (holidayShifts > totalShifts) {
    markError(inputHoliday)
    hasErrors = true
  } else {
    inputHoliday.classList.remove('error')
  }

  if (weekendShifts > totalShifts) {
    markError(inputFree)
    hasErrors = true
  } else {
    inputFree.classList.remove('error')
  }

  const maxHolidayNightHours = holidayShifts * 8
  if (holidayNightHours > maxHolidayNightHours) {
    markError(inputHolidayNight)
    hasErrors = true
  } else {
    inputHolidayNight.classList.remove('error')
  }

  inputAdditionally.classList.remove('error')
  inputAdditionallyNight.classList.remove('error')

  return !hasErrors
}

function validateInputs() {
  const hourlyRate = getNumberValue(inputTariff)
  const totalShifts = getNumberValue(inputAllShifts)

  if (!hourlyRate || !totalShifts) {
    showError('заполните все обязательные поля (тарифная ставка и общее количество смен)!')
    if (!hourlyRate) markError(inputTariff)
    if (!totalShifts) markError(inputAllShifts)
    return false
  }

  if (hourlyRate) inputTariff.classList.remove('error')
  if (totalShifts) inputAllShifts.classList.remove('error')

  return true
}

// === Трекинг видимости блоков ===
function trackInput(input) {
  input.addEventListener('input', () => {
    const value = parseFloat(input.value)
    if (!isNaN(value) && value > 0) {
      showBlock(checkboxBlock)
    } else {
      hideBlock(checkboxBlock)
    }
  })
}
trackInput(inputHoliday)

function trackCheckbox(checkbox) {
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      showBlock(checkboxBlockNight)
    } else {
      hideBlock(checkboxBlockNight)
    }
  })
}
trackCheckbox(checkboxNight)

function trackCheckbox2(checkbox) {
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      showBlock(blockAdditionally)
      showBlock(blockAdditionallyNight)
    } else {
      hideBlock(blockAdditionally)
      hideBlock(blockAdditionallyNight)
      closeHelpTooltip()
    }
  })
}
trackCheckbox2(checkboxAdditionally)

// === Подсказка «?» под блоком доп. часов ===
const isHoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches

function openHelpTooltip() {
  if (!helpWrapper || !helpBtn) return
  helpWrapper.classList.add('is-open')
  helpBtn.setAttribute('aria-expanded', 'true')
}

function closeHelpTooltip() {
  if (!helpWrapper || !helpBtn) return
  helpWrapper.classList.remove('is-open')
  helpBtn.setAttribute('aria-expanded', 'false')
}

function toggleHelpTooltip() {
  if (!helpWrapper) return
  if (helpWrapper.classList.contains('is-open')) {
    closeHelpTooltip()
  } else {
    openHelpTooltip()
  }
}

if (helpWrapper && helpBtn) {
  if (isHoverCapable) {
    // Десктоп: hover + focus
    helpWrapper.addEventListener('mouseenter', openHelpTooltip)
    helpWrapper.addEventListener('mouseleave', closeHelpTooltip)
    helpBtn.addEventListener('focus', openHelpTooltip)
    helpBtn.addEventListener('blur', closeHelpTooltip)
  } else {
    // Мобила: открыть по клику на кнопку, закрыть по клику вне области
    helpBtn.addEventListener('click', e => {
      e.stopPropagation()
      e.preventDefault()
      openHelpTooltip()
    })

    document.addEventListener('click', e => {
      if (!helpWrapper.contains(e.target)) closeHelpTooltip()
    })
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeHelpTooltip()
  })
}

// === Сохранение / восстановление ===
let saveTimeout
let lastSavedTariff = null

const saveInput1 = () => {
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    const value = inputTariff.value
    if (value === lastSavedTariff) return
    lastSavedTariff = value
    localStorage.setItem(STORAGE_KEY_INPUT1, value)
    if (value !== '') showToast('✓ Сохранено')
  }, 500)
}

const loadInput1 = () => {
  const saved = localStorage.getItem(STORAGE_KEY_INPUT1)
  if (saved !== null && saved !== '') {
    inputTariff.value = saved
    lastSavedTariff = saved
    showToastWhenReady('Данные восстановлены', '#1668e3')
  }
}

const clearInput1 = () => {
  localStorage.removeItem(STORAGE_KEY_INPUT1)
  lastSavedTariff = null
}

window.addEventListener('DOMContentLoaded', loadInput1)

// === Обработка ввода ===
calculatorElem.addEventListener('input', e => {
  if (
    /^(inputTariff|inputAllShifts|inputNight|inputHoliday|inputHolidayNight|inputFree|inputAdditionally|inputAdditionallyNight)$/.test(
      e.target.dataset.type
    )
  ) {
    examinationInput(e)
    if (e.target.dataset.type === 'inputTariff') saveInput1()
    e.target.classList.remove('error')
    hideToast()
  }
})

const allInputs = [
  inputTariff,
  inputAllShifts,
  inputNight,
  inputHoliday,
  inputFree,
  inputHolidayNight,
  inputAdditionally,
  inputAdditionallyNight,
]

function clearAllInputErrors() {
  allInputs.forEach(input => {
    if (input) input.classList.remove('error')
  })
}

allInputs.forEach(input => {
  if (input) {
    input.addEventListener('blur', () => {
      validateAllInputs()
    })
  }
})

// === Enter → расчёт ===
calculatorElem.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('input')) {
    e.preventDefault()
    submitBtn.click()
  }
})

function validateShifts(total, night, holiday, weekend, holidayNight) {
  let isValid = true

  if (night > total) {
    markError(inputNight)
    isValid = false
  }

  if (holiday > total) {
    markError(inputHoliday)
    isValid = false
  }

  if (weekend > total) {
    markError(inputFree)
    isValid = false
  }

  if (holidayNight > night * 8) {
    markError(inputHolidayNight)
    isValid = false
  }

  const maxHolidayNightHours = holiday * 8
  if (holidayNight > maxHolidayNightHours) {
    markError(inputHolidayNight)
    isValid = false
  }

  if (!isValid) {
    showValidationErrors()
    return false
  }

  return true
}

const examinationInput = e => {
  let value = e.target.value

  if (value === '') {
    e.target.value = ''
    return ''
  }

  value = value.replace(/\D/g, '')

  if (value === '') {
    e.target.value = ''
    return ''
  }

  let numericValue = parseInt(value, 10)

  if (isNaN(numericValue)) {
    e.target.value = ''
    return ''
  }

  if (e.target.id === 'input-tariff') {
    if (numericValue > MAX_INPUT1) numericValue = MAX_INPUT1
  } else if (e.target.id === 'input-holiday-night') {
    if (numericValue > MAX_HOLIDAY_NIGHT_HOURS) numericValue = MAX_HOLIDAY_NIGHT_HOURS
  } else if (e.target.id === 'input-additionally' || e.target.id === 'input-additionally-night') {
    if (numericValue > MAX_ADDITIONALLY_HOURS) numericValue = MAX_ADDITIONALLY_HOURS
  } else {
    if (numericValue > MAX_INPUT_OTHERS) numericValue = MAX_INPUT_OTHERS
  }

  e.target.value = String(numericValue)
  return e.target.value
}

const allInputsForProtection = [
  inputTariff,
  inputAllShifts,
  inputNight,
  inputHoliday,
  inputHolidayNight,
  inputFree,
  inputAdditionally,
  inputAdditionallyNight,
]

allInputsForProtection.forEach(input => {
  if (input) {
    input.addEventListener('keydown', e => {
      if (
        e.key === 'Backspace' ||
        e.key === 'Delete' ||
        e.key === 'Tab' ||
        e.key === 'Escape' ||
        e.key === 'Enter' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'Home' ||
        e.key === 'End'
      ) {
        return
      }

      if (!/^\d$/.test(e.key)) {
        e.preventDefault()
      }
    })

    input.addEventListener('paste', e => {
      const pastedText = (e.clipboardData || window.clipboardData).getData('text')
      if (!/^\d+$/.test(pastedText)) {
        e.preventDefault()
        showError('Можно вставлять только цифры!')
      }
    })
  }
})

const getNumberValue = input => Number(input.value) || 0

const markError = input => {
  if (!input) return
  input.classList.remove('error')
  void input.offsetHeight
  input.classList.add('error')
}

const capitalizeFirst = str => str.charAt(0).toUpperCase() + str.slice(1)

const showError = message => {
  showErrorToast(message)
  playErrorSound()
  vibrateError()
}

const formatMoney = amount =>
  amount.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }) + ' ₽'

// === Основной расчёт ===
function calculateSalary() {
  clearAllInputErrors()

  if (!validateInputs()) return false

  const [hourlyRate, totalShifts, nightShifts, holidayShifts, weekendShifts, holidayNightHours] = [
    inputTariff,
    inputAllShifts,
    inputNight,
    inputHoliday,
    inputFree,
    inputHolidayNight,
  ].map(getNumberValue)

  if (!validateShifts(totalShifts, nightShifts, holidayShifts, weekendShifts, holidayNightHours))
    return false

  let additionallyHours = 0
  let additionallyNightHours = 0
  if (checkboxAdditionally.checked) {
    additionallyHours = getNumberValue(inputAdditionally)
    additionallyNightHours = getNumberValue(inputAdditionallyNight)
  }

  calculateValues(
    hourlyRate,
    totalShifts,
    nightShifts,
    holidayShifts,
    weekendShifts,
    holidayNightHours,
    additionallyHours,
    additionallyNightHours
  )
  renderBlock()
  return true
}

function showValidationErrors() {
  const totalShifts = getNumberValue(inputAllShifts)
  const nightShifts = getNumberValue(inputNight)
  const holidayShifts = getNumberValue(inputHoliday)
  const weekendShifts = getNumberValue(inputFree)
  const holidayNightHours = getNumberValue(inputHolidayNight)
  const hourlyRate = getNumberValue(inputTariff)

  if (!hourlyRate || !totalShifts) {
    showError('заполните все обязательные поля!')
    return
  }

  const errors = []

  if (nightShifts > totalShifts) errors.push('ночных смен')
  if (holidayShifts > totalShifts) errors.push('праздничных смен')
  if (weekendShifts > totalShifts) errors.push('выходных смен')
  if (holidayNightHours > nightShifts * 8) errors.push('праздн. ночных часов')

  const maxHolidayNightHours = holidayShifts * 8
  if (holidayNightHours > maxHolidayNightHours) {
    errors.push(
      `праздничных ночных часов (не более ${maxHolidayNightHours}ч. при ${holidayShifts} праздн. смен${getPluralEnding(holidayShifts)})`
    )
  }

  if (errors.length > 0) {
    let errorMessage
    if (errors.length === 4) {
      errorMessage =
        'Количество ночных, праздничных, выходных смен и праздничных ночных часов превышает допустимые значения!'
    } else if (errors.length === 3) {
      errorMessage = `${errors.slice(0, -1).join(', ')} и ${errors[errors.length - 1]} не может быть больше общего кол-ва!`
    } else if (errors.length === 2) {
      errorMessage = `${errors.join(' и ')} не может быть больше общего кол-ва!`
    } else {
      errorMessage = `${errors[0]} ${
        errors[0].includes('праздничных ночных часов')
          ? 'не может быть больше, чем праздничных смен'
          : errors[0].includes('ночных часов')
            ? 'не может быть больше, чем ночных смен'
            : 'не может быть больше общего количества смен'
      }!`
    }
    showError(errorMessage)
  }
}

function getPluralEnding(num) {
  const n = Math.abs(num) % 100
  const n1 = n % 10
  if (n > 10 && n < 20) return ''
  if (n1 === 1) return 'а'
  if (n1 >= 2 && n1 <= 4) return 'ы'
  return ''
}

function calculateValues(
  hourlyRate,
  totalShifts,
  nightShifts,
  holidayShifts,
  weekendShifts,
  holidayNightHours,
  additionallyHours = 0,
  additionallyNightHours = 0
) {
  const shiftRate = hourlyRate * HOURS_IN_SHIFT
  const dayShifts = totalShifts - nightShifts

  const daySalary = shiftRate * dayShifts
  const nightRate = (shiftRate * NIGHT_PERCENT) / 100
  const nightSalary = (nightRate + shiftRate) * nightShifts

  // === Сборка доп. часов в смены ===
  let remainingNight = additionallyNightHours
  let remainingDay = additionallyHours

  let additionalNightShifts = 0
  let additionalDayShifts = 0

  additionalNightShifts += Math.floor(remainingNight / HOURS_IN_SHIFT)
  remainingNight = remainingNight % HOURS_IN_SHIFT

  if (remainingNight > 0 && remainingDay > 0) {
    const need = HOURS_IN_SHIFT - remainingNight
    const take = Math.min(need, remainingDay)
    remainingDay -= take
    remainingNight += take
    if (remainingNight === HOURS_IN_SHIFT) {
      additionalNightShifts += 1
      remainingNight = 0
    }
  }

  additionalDayShifts += Math.floor(remainingDay / HOURS_IN_SHIFT)
  remainingDay = remainingDay % HOURS_IN_SHIFT

  const additionallyNightHoursPaid =
    additionallyNightHours +
    (additionallyHours - remainingDay - additionalDayShifts * HOURS_IN_SHIFT)
  const additionallyDayHoursPaid =
    additionallyHours - (additionallyNightHoursPaid - additionallyNightHours)

  let addDaySalary = additionallyDayHoursPaid * hourlyRate
  let addNightSalary = additionallyNightHoursPaid * hourlyRate * (1 + NIGHT_PERCENT / 100)

  if (checkboxAdvance.checked) {
    addDaySalary = 0
    addNightSalary = 0
  }

  sumAdditionally = addDaySalary
  sumAdditionallyNight = addNightSalary

  let milkCompensation
  if (checkboxAdvance.checked) {
    milkCompensation = 0
  } else {
    const additionalFullShifts = additionalNightShifts + additionalDayShifts
    milkCompensation = (totalShifts + additionalFullShifts) * MILK_COMPENSATION
  }

  let holidaySalary = holidayShifts * shiftRate

  let weekendSalary
  if (checkboxAdvance.checked) {
    weekendSalary = 0
  } else {
    weekendSalary = (weekendShifts * shiftRate * WEEKEND_PERCENT) / 100
  }

  let holidayNightInShifts
  if (checkboxAdvance.checked) {
    holidayNightInShifts = 0
  } else {
    holidayNightInShifts = holidayNightHours / 8
  }

  sumNightHoliday = holidayNightInShifts * nightRate

  sumWeekend = weekendSalary

  sum =
    daySalary +
    nightSalary +
    milkCompensation +
    holidaySalary +
    weekendSalary +
    sumNightHoliday +
    addDaySalary +
    addNightSalary

  const taxableAmount = sum - milkCompensation
  const taxAmount = (taxableAmount * TAX_PERCENT) / 100
  sumClean = sum - taxAmount
  sumNal = taxAmount

  sumNight = nightRate * nightShifts + addNightSalary
  sumMilk = milkCompensation

  sumSalary = sum - sumNight - sumMilk - sumWeekend - sumNightHoliday
  sumHarmfulConditions = (sumSalary * HARMFUL_PERCENT) / 100
  sumSalaryPercent = sumSalary - sumHarmfulConditions
  sumHolidaySalary = holidaySalary
}

function uncheckAllCheckboxes(checkbox) {
  checkbox.checked = false
}

function clearAll() {
  hideBlock(blockResult)
  clearAllInputErrors()

  const inputs = [
    inputTariff,
    inputAllShifts,
    inputNight,
    inputHoliday,
    inputFree,
    inputHolidayNight,
    inputAdditionally,
    inputAdditionallyNight,
  ]

  uncheckAllCheckboxes(checkboxNight)
  uncheckAllCheckboxes(checkboxAdvance)
  uncheckAllCheckboxes(checkboxAdditionally)
  hideBlock(checkboxBlock)
  hideBlock(checkboxBlockNight)
  hideBlock(blockAdditionally)
  hideBlock(blockAdditionallyNight)
  closeHelpTooltip()

  if (!inputs || !Array.isArray(inputs)) {
    clearInput1()
    return
  }

  inputs.forEach((input, index) => {
    if (input && typeof input === 'object') {
      input.value = ''
    } else {
      console.warn(`Инпут ${index + 1} не найден:`, input)
    }
  })

  clearInput1()
}

function renderBlock() {
  blockResult.style.color = 'black'

  let additionalBlocks = ''

  if (sumNight > 0) {
    additionalBlocks += `
    <div class="fl">
      <img src="img/weather-few-clouds-night.svg" alt="night" width="20px"> Ночные: 
      <span class="result-sp">${formatMoney(sumNight)}</span>
    </div>`
  }

  if (sumWeekend > 0) {
    additionalBlocks += `
    <div class="fl">
      <img src="img/money.svg" alt="money" width="20px"> Доп. начисления:
      <span class="result-sp">${formatMoney(sumWeekend)}</span>
    </div>`
  }

  if (sumHolidaySalary > 0) {
    additionalBlocks += `
    <div class="fl">
      <img src="img/santa-claus.svg" alt="nalog" width="20px" height='20px'> Праздничные: 
      <span class="result-sp">${formatMoney(sumHolidaySalary)}</span>
    </div>`
  }

  if (sumNightHoliday > 0) {
    additionalBlocks += `
    <div class="fl">
      <img src="img/zzz.svg" alt="nalog" width="20px" height='20px'> Праздничные ночные: 
      <span class="result-sp">${formatMoney(sumNightHoliday)}</span>
    </div>`
  }

  blockResult.innerHTML = `
    <div class="mb">
      <div class="subtitle">
        <img src="img/money-bag.svg" alt="money-bag" width="22px">
        <span>Размер зарплаты:</span>
      </div>
      <div class="result-sp-fs">
        <img src="img/piggy-bank.svg" alt="piggy-bank" width="28px">
        <span>${formatMoney(sumClean)}</span>
      </div>
    </div>
    <div class="fl">
      <img src="img/earnings.svg" alt="earnings" width="20px"> Начисленная сумма: 
      <span class="result-sp">${formatMoney(sum)}</span>
    </div>
    <div class="fl">
      <img src="img/briefcase.svg" alt="briefcase" width="20px"> Оклад: 
      <span class="result-sp">${formatMoney(sumSalaryPercent)}</span>
    </div>
    <div class="fl">
      <img src="img/milk-carton.svg" alt="milk" width="20px"> Компенсация молока: 
      <span class="result-sp">${formatMoney(sumMilk)}</span>
    </div>
    <div class="fl">
      <img src="img/hazard.svg" alt="hazard" width="20px"> Вредные условия: 
      <span class="result-sp">${formatMoney(sumHarmfulConditions)}</span>
    </div>
    ${additionalBlocks}
    <div class="fl">
    <img src="img/tax.svg" alt="nalog" width="20px"> Сумма налога: 
    <span class="result-sp">${formatMoney(sumNal)}</span>
    </div>
    <button type="button" class="copy-result-btn">📋 Скопировать результат</button>`
}

// === Кнопки ===
submitBtn.addEventListener('click', function () {
  const ok = calculateSalary()
  if (ok) {
    showBlock(blockResult)
  } else {
    hideBlock(blockResult)
  }
})

cleanInput.addEventListener('click', clearAll)

setTimeout(function () {
  const loader = document.getElementById('pwa-loader')
  const appContent = document.getElementById('app-content')

  if (loader && loader.style.display !== 'none') {
    loader.style.display = 'none'
  }

  if (appContent && appContent.style.display !== 'block') {
    appContent.style.display = 'block'
    appContent.classList.add('show')
  }
}, 10000)

// === Service Worker ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const isGitHubPages = window.location.hostname.includes('github.io')
    let swPath = '/sw.js'

    if (isGitHubPages) {
      const path = window.location.pathname
      const pathParts = path.split('/')

      if (pathParts.length > 2) {
        swPath = '/' + pathParts[1] + '/sw.js'
      }
    }

    console.log('Регистрация Service Worker по пути:', swPath)

    navigator.serviceWorker
      .register(swPath)
      .then(registration => {
        console.log('Service Worker успешно зарегистрирован:', registration.scope)

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('Доступна новая версия приложения')
            }
          })
        })
      })
      .catch(error => {
        console.log('Ошибка регистрации Service Worker:', error)

        if (isGitHubPages && error.message.includes('404')) {
          console.log('Пробуем альтернативный путь...')

          const altSwPath = '/salary-calculator/sw.js'
          navigator.serviceWorker
            .register(altSwPath)
            .then(reg =>
              console.log('Service Worker зарегистрирован по альтернативному пути:', reg.scope)
            )
            .catch(err => console.log('Вторая попытка также не удалась:', err))
        }
      })
  })
}

// === Установка PWA ===
let deferredPrompt

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault()
  deferredPrompt = e
  showInstallButton()
})

function showInstallButton() {
  if (document.querySelector('.install-btn')) return

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)

  let buttonText = isMobile ? '📱 Установить' : '➕ Установить приложение'
  if (isIOS) {
    buttonText = '📲 Добавить на главный экран'
  }

  const installBtn = document.createElement('button')
  installBtn.textContent = buttonText
  installBtn.className = 'install-btn'

  installBtn.style.cssText = `
        position: fixed;
        bottom: ${isMobile ? '100px' : '30px'};
        right: ${isMobile ? '10px' : '20px'};
        background: linear-gradient(135deg, #1668e3, #0d47a1);
        color: white;
        padding: ${isMobile ? '10px 16px' : '12px 24px'};
        border: none;
        border-radius: 25px;
        cursor: pointer;
        z-index: 1000;
        font-size: ${isMobile ? '13px' : '14px'};
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(22, 104, 227, 0.3);
        max-width: ${isMobile ? '140px' : '180px'};
        word-wrap: break-word;
        text-align: center;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s ease, transform 0.3s ease;
    `

  installBtn.addEventListener('click', async () => {
    if (isIOS) {
      alert(
        'Для установки приложения:\n1. Нажмите кнопку "Поделиться"\n2. Выберите "На экран «Домой»"\n3. Нажмите "Добавить"'
      )
      return
    }

    if (!deferredPrompt) return

    installBtn.textContent = 'Устанавливается...'
    installBtn.disabled = true

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        installBtn.textContent = '✓ Установлено!'
        setTimeout(() => {
          installBtn.style.opacity = '0'
          setTimeout(() => installBtn.remove(), 300)
        }, 1500)
      } else {
        installBtn.textContent = buttonText
        installBtn.disabled = false
      }
    } catch (error) {
      console.error('Ошибка установки:', error)
      installBtn.textContent = buttonText
      installBtn.disabled = false
    }

    deferredPrompt = null
  })

  document.body.appendChild(installBtn)

  setTimeout(() => {
    installBtn.style.opacity = '1'
    installBtn.style.transform = 'translateY(0)'
  }, 100)

  setTimeout(() => {
    if (installBtn.parentNode) {
      installBtn.style.opacity = '0'
      setTimeout(() => {
        if (installBtn.parentNode) {
          installBtn.remove()
        }
      }, 300)
    }
  }, 10000)
}

window.addEventListener('appinstalled', () => {
  console.log('Приложение успешно установлено')
})
