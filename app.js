const calculatorElem = document.getElementById('calculator')
const inputTariff = document.getElementById('input-tariff')
const inputAllShifts = document.getElementById('input-all-shifts')
const inputNight = document.getElementById('input-night')
const inputHoliday = document.getElementById('input-holiday')
const inputHolidayNight = document.getElementById('input-holiday-night')
const inputFree = document.getElementById('input-free')
const checkboxAdvance = document.getElementById('checkbox-advance')
const checkboxNight = document.getElementById('checkbox-night')
const submitBtn = document.getElementById('submit')
const cleanInput = document.getElementById('clean')
const blockResult = document.getElementById('block--result')
const checkboxBlock = document.getElementById('checkbox__block')
const checkboxBlockNight = document.getElementById('checkbox__block__night')

let sum,
  sumSalary,
  sumClean,
  sumNal,
  sumNight,
  sumMilk,
  sumWeekend,
  sumHarmfulConditions,
  sumSalaryPercent

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

let saveTimeout
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

function validateAllInputs() {
  const hourlyRate = getNumberValue(inputTariff)
  const totalShifts = getNumberValue(inputAllShifts)
  const nightShifts = getNumberValue(inputNight)
  const holidayShifts = getNumberValue(inputHoliday)
  const weekendShifts = getNumberValue(inputFree)
  const holidayNightHours = getNumberValue(inputHolidayNight)

  let hasErrors = false

  // Проверяем обязательные поля
  if (!hourlyRate || !totalShifts) {
    if (!hourlyRate) markError(inputTariff)
    if (!totalShifts) markError(inputAllShifts)
    hasErrors = true
  } else {
    inputTariff.classList.remove('error')
    inputTariff.style.border = ''
    inputAllShifts.classList.remove('error')
    inputAllShifts.style.border = ''
  }

  // Проверяем ночные смены
  if (nightShifts > totalShifts) {
    markError(inputNight)
    hasErrors = true
  } else {
    inputNight.classList.remove('error')
    inputNight.style.border = ''
  }

  // Проверяем праздничные смены
  if (holidayShifts > totalShifts) {
    markError(inputHoliday)
    hasErrors = true
  } else {
    inputHoliday.classList.remove('error')
    inputHoliday.style.border = ''
  }

  // Проверяем выходные смены
  if (weekendShifts > totalShifts) {
    markError(inputFree)
    hasErrors = true
  } else {
    inputFree.classList.remove('error')
    inputFree.style.border = ''
  }

  // Проверяем праздничные ночные часы
  const maxHolidayNightHours = holidayShifts * 8
  if (holidayNightHours > maxHolidayNightHours) {
    markError(inputHolidayNight)
    hasErrors = true
  } else {
    inputHolidayNight.classList.remove('error')
    inputHolidayNight.style.border = ''
  }

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

  // Снимаем ошибку, если поля заполнены
  if (hourlyRate) {
    inputTariff.classList.remove('error')
    inputTariff.style.border = ''
  }
  if (totalShifts) {
    inputAllShifts.classList.remove('error')
    inputAllShifts.style.border = ''
  }

  return true
}

function trackInput(input) {
  input.addEventListener('input', () => {
    const value = parseFloat(input.value)
    if (!isNaN(value) && value > 0) {
      checkboxBlock.style.display = 'block'
    } else {
      checkboxBlock.style.display = 'none'
    }
  })
}
trackInput(inputHoliday)

function trackCheckbox(checkbox) {
  checkbox.addEventListener('change', () => {
    checkboxBlockNight.style.display = checkbox.checked ? 'block' : 'none'
  })
}
trackCheckbox(checkboxNight)

const saveInput1 = () => {
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY_INPUT1, inputTariff.value)
  }, 500)
}

const loadInput1 = () => {
  const saved = localStorage.getItem(STORAGE_KEY_INPUT1)
  if (saved !== null) inputTariff.value = saved
}

const clearInput1 = () => localStorage.removeItem(STORAGE_KEY_INPUT1)

window.addEventListener('DOMContentLoaded', loadInput1)

calculatorElem.addEventListener('input', e => {
  if (
    /^(inputTariff|inputAllShifts|inputNight|inputHoliday|inputHolidayNight|inputFree)$/.test(
      e.target.dataset.type
    )
  ) {
    examinationInput(e)
    if (e.target.dataset.type === 'inputTariff') saveInput1()

    // Убираем ошибку только с текущего инпута, так как пользователь начал его исправлять
    e.target.classList.remove('error')
    e.target.style.border = ''
  }
})

const allInputs = [
  inputTariff,
  inputAllShifts,
  inputNight,
  inputHoliday,
  inputFree,
  inputHolidayNight,
]

allInputs.forEach(input => {
  if (input) {
    input.addEventListener('blur', () => {
      validateAllInputs()
    })
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

  // Определяем максимальное значение по id элемента
  if (e.target.id === 'input-tariff') {
    if (numericValue > MAX_INPUT1) numericValue = MAX_INPUT1
  } else if (e.target.id === 'input-holiday-night') {
    if (numericValue > MAX_HOLIDAY_NIGHT_HOURS) numericValue = MAX_HOLIDAY_NIGHT_HOURS
  } else {
    if (numericValue > MAX_INPUT_OTHERS) numericValue = MAX_INPUT_OTHERS
  }

  e.target.value = String(numericValue)
  return e.target.value
}

// Защита от вставки текста с буквами
const allInputsForProtection = [
  inputTariff,
  inputAllShifts,
  inputNight,
  inputHoliday,
  inputHolidayNight,
  inputFree,
]

allInputsForProtection.forEach(input => {
  if (input) {
    input.addEventListener('keydown', e => {
      // Разрешаем: Backspace, Delete, Tab, Escape, Enter, стрелки, Home, End
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

      // Запрещаем ввод букв и символов (разрешаем только цифры)
      if (!/^\d$/.test(e.key)) {
        e.preventDefault()
      }
    })

    // Защита от вставки
    input.addEventListener('paste', e => {
      const pastedText = (e.clipboardData || window.clipboardData).getData('text')
      if (!/^\d+$/.test(pastedText)) {
        e.preventDefault()
        showError('Можно вставлять только цифры!')
        setTimeout(() => {
          blockResult.style.color = 'black'
          blockResult.innerHTML = ''
        }, 1500)
      }
    })
  }
})

const getNumberValue = input => Number(input.value) || 0

const markError = input => {
  if (!input) return
  input.classList.remove('error')
  // Форсируем перерисовку
  void input.offsetHeight
  input.classList.add('error')
  input.style.border = '2px solid red'
}

const capitalizeFirst = str => str.charAt(0).toUpperCase() + str.slice(1)

const showError = message => {
  blockResult.style.color = 'red'
  const capitalizedMessage = capitalizeFirst(message)
  blockResult.innerHTML = `
        <div class="fl">
            <img src="img/dialog-error.svg" alt="error" width="20px">
            <span>${capitalizedMessage}</span>
        </div>`
}

const formatMoney = amount =>
  amount.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }) + ' ₽'

function calculateSalary() {
  renderInput()

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

  calculateValues(
    hourlyRate,
    totalShifts,
    nightShifts,
    holidayShifts,
    weekendShifts,
    holidayNightHours
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
  if (num === 1) return 'е'
  if (num >= 2 && num <= 99) return 'ах'
  return 'ах'
}

function calculateValues(
  hourlyRate,
  totalShifts,
  nightShifts,
  holidayShifts,
  weekendShifts,
  holidayNightHours
) {
  const shiftRate = hourlyRate * HOURS_IN_SHIFT
  const dayShifts = totalShifts - nightShifts

  const daySalary = shiftRate * dayShifts
  const nightRate = (shiftRate * NIGHT_PERCENT) / 100
  const nightSalary = (nightRate + shiftRate) * nightShifts

  let milkCompensation
  if (checkboxAdvance.checked) {
    milkCompensation = 0
  } else {
    milkCompensation = totalShifts * MILK_COMPENSATION
  }

  let holidaySalary
  if (checkboxAdvance.checked) {
    holidaySalary = 0
  } else {
    holidaySalary = holidayShifts * shiftRate
  }

  let weekendSalary
  if (checkboxAdvance.checked) {
    weekendSalary = 0
  } else {
    weekendSalary = (weekendShifts * shiftRate * WEEKEND_PERCENT) / 100
  }

  const holidayNightInShifts = holidayNightHours / 8
  sumNightHoliday = holidayNightInShifts * nightRate

  sum = daySalary + nightSalary + milkCompensation + holidaySalary + weekendSalary + sumNightHoliday
  const taxableAmount = sum - milkCompensation
  const taxAmount = (taxableAmount * TAX_PERCENT) / 100
  sumClean = sum - taxAmount
  sumNal = taxAmount
  sumNight = nightRate * nightShifts
  sumMilk = milkCompensation
  sumWeekend = weekendSalary
  sumSalary = sum - sumNight - sumMilk - sumWeekend - sumNightHoliday
  sumHarmfulConditions = (sumSalary * HARMFUL_PERCENT) / 100
  sumSalaryPercent = sumSalary - sumHarmfulConditions
}

function uncheckAllCheckboxes(checkbox) {
  checkbox.checked = false
}

function clearAll() {
  blockResult.style.display = 'none'

  const inputs = [
    inputTariff,
    inputAllShifts,
    inputNight,
    inputHoliday,
    inputFree,
    inputHolidayNight,
  ]

  uncheckAllCheckboxes(checkboxNight)
  uncheckAllCheckboxes(checkboxAdvance)
  checkboxBlock.style.display = 'none'
  checkboxBlockNight.style.display = 'none'

  if (!inputs || !Array.isArray(inputs)) {
    clearInput1()
    return
  }

  inputs.forEach((input, index) => {
    if (input && typeof input === 'object') {
      input.value = ''
      input.classList.remove('error')
      input.style.border = ''
    } else {
      console.warn(`Инпут ${index + 1} не найден:`, input)
    }
  })

  clearInput1()
}

function renderBlock() {
  blockResult.style.color = 'black'
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
            <img src="img/weather-few-clouds-night.svg" alt="night" width="20px"> Ночные: 
            <span class="result-sp">${formatMoney(sumNight)}</span>
        </div>
        <div class="fl">
            <img src="img/money.svg" alt="money" width="20px"> Доп. начисления:
            <span class="result-sp">${formatMoney(sumWeekend)}</span>
        </div>
        <div class="fl">
            <img src="img/milk-carton.svg" alt="milk" width="20px"> Компенсация молока: 
            <span class="result-sp">${formatMoney(sumMilk)}</span>
        </div>
        <div class="fl">
            <img src="img/hazard.svg" alt="hazard" width="20px"> Вредные условия: 
            <span class="result-sp">${formatMoney(sumHarmfulConditions)}</span>
        </div>
        <div class="fl">
            <img src="img/tax.svg" alt="nalog" width="20px"> Сумма налога: 
            <span class="result-sp">${formatMoney(sumNal)}</span>
        </div>`
}

function renderInput() {
  const inputs = [inputTariff, inputAllShifts, inputNight, inputHoliday, inputFree]

  inputs.forEach(input => {
    if (!input) return
    input.classList.remove('error')
    input.style.border = ''
  })
}

submitBtn.onclick = function () {
  blockResult.style.display = 'block'
  calculateSalary()
}

cleanInput.onclick = clearAll

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

// Регистрация Service Worker с проверкой путей
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Определяем путь для GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io')
    let swPath = '/sw.js'

    if (isGitHubPages) {
      const path = window.location.pathname
      const pathParts = path.split('/')

      // Если в пути есть имя репозитория
      if (pathParts.length > 2) {
        swPath = '/' + pathParts[1] + '/sw.js'
      }
    }

    console.log('Регистрация Service Worker по пути:', swPath)

    navigator.serviceWorker
      .register(swPath)
      .then(registration => {
        console.log('Service Worker успешно зарегистрирован:', registration.scope)

        // Проверяем обновления
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('Доступна новая версия приложения')
              // Можно показать уведомление пользователю
            }
          })
        })
      })
      .catch(error => {
        console.log('Ошибка регистрации Service Worker:', error)

        // Fallback для GitHub Pages
        if (isGitHubPages && error.message.includes('404')) {
          console.log('Пробуем альтернативный путь...')

          // Пробуем другой путь
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

let deferredPrompt

window.addEventListener('beforeinstallprompt', e => {
  // Предотвращаем автоматическое показ баннера
  e.preventDefault()
  deferredPrompt = e

  // Показываем свою кнопку установки
  showInstallButton()
})

function showInstallButton() {
  if (document.querySelector('.install-btn')) return

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)

  // На iOS показываем другое сообщение
  let buttonText = isMobile ? '📱 Установить' : '➕ Установить приложение'
  if (isIOS) {
    buttonText = '📲 Добавить на главный экран'
  }

  const installBtn = document.createElement('button')
  installBtn.textContent = buttonText
  installBtn.className = 'install-btn'

  // Базовые стили
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
      // На iOS показываем инструкцию
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

  // Плавное появление
  setTimeout(() => {
    installBtn.style.opacity = '1'
    installBtn.style.transform = 'translateY(0)'
  }, 100)

  // Автоматическое скрытие через 15 секунд
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

// Проверяем, установлено ли приложение
window.addEventListener('appinstalled', () => {
  console.log('Приложение успешно установлено')
  // Можно спрятать кнопку установки
})
