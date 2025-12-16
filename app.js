const calculatorElem = document.getElementById('calculator')
const input1 = document.getElementById('input1')
const input2 = document.getElementById('input2')
const input3 = document.getElementById('input3')
const input4 = document.getElementById('input4')
const input5 = document.getElementById('input5')
const submitBtn = document.getElementById('submit')
const cleanInput = document.getElementById('clean')
const blockResult = document.getElementById('block--result')

let sum, sumSalary, sumClean, sumNal, sumNight, sumMilk, sumWeekend, sumHarmfulConditions, sumSalaryPercent

const STORAGE_KEY_INPUT1 = 'calculator_input1'
const HOURS_IN_SHIFT = 8
const NIGHT_PERCENT = 40
const MILK_COMPENSATION = 40
const WEEKEND_PERCENT = 50
const TAX_PERCENT = 13
const HARMFUL_PERCENT = 4
const MAX_INPUT1 = 9999
const MAX_INPUT_OTHERS = 99

let saveTimeout

;(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const appContent = document.getElementById('app-content')
        const loader = document.getElementById('pwa-loader')
        const loaderMessage = document.getElementById('loader-message')
        
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        const isGitHubPages = window.location.hostname.includes('github.io')
        
        function hideLoader() {
            if (!loader) return
            
            loader.style.opacity = '0'
            
            setTimeout(function() {
                loader.style.display = 'none'
                
                if (appContent) {
                    appContent.style.display = 'block'
                    setTimeout(function() {
                        appContent.classList.add('show')
                        appContent.classList.add('content-fade-in')
                    }, 50)
                }
                
                document.body.classList.add('pwa-loaded')
            }, 300)
        }
        
        const messages = {
            pwa: [
                'Инициализация калькулятора...',
                'Загрузка данных...',
                'Почти готово...'
            ],
            browser: [
                'Загрузка...',
                'Готово!'
            ]
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
        
        window.addEventListener('load', function() {
            setTimeout(hideLoader, 500)
        })
        
        setTimeout(function() {
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
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        deferredPrompt = e
    })
})()

const saveInput1 = () => {
    clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY_INPUT1, input1.value)
    }, 500)
}

const loadInput1 = () => {
    const saved = localStorage.getItem(STORAGE_KEY_INPUT1)
    if (saved !== null) input1.value = saved
}

const clearInput1 = () => localStorage.removeItem(STORAGE_KEY_INPUT1)

window.addEventListener('DOMContentLoaded', loadInput1)

calculatorElem.addEventListener('input', (e) => {   
    if (/^input[1-5]$/.test(e.target.dataset.type)) {
        examinationInput(e)
        if (e.target.dataset.type === "input1") saveInput1()
        
        // Убираем ошибку, так как пользователь начал исправлять
        e.target.classList.remove('error')
        e.target.style.border = ''
    }
})

const examinationInput = (e) => { 
    let value = e.target.value
    
    if (value === '') {
        e.target.value = ''
        return ''
    }
    
    value = value.replace(/[^\d]/g, '')
    
    if (value === '') {
        e.target.value = ''
        return ''
    }
    
    let maxValue
    if (e.target.dataset.type === "input1") {
        maxValue = MAX_INPUT1
    } else {
        maxValue = MAX_INPUT_OTHERS
    }
    
    const maxLength = String(maxValue).length
    
    if (value.length > maxLength) {
        value = value.substring(0, maxLength)
    }
    
    const numericValue = Number(value)
    
    if (numericValue > maxValue) {
        e.target.value = String(maxValue)
    } else if (numericValue < 0) {
        e.target.value = '0'
    } else {
        e.target.value = value
    }
    
    return e.target.value
}

const getNumberValue = (input) => Number(input.value) || 0

const markError = (input) => {
    if (!input) return
    input.classList.add('error')
}

const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1)

const showError = (message) => {
    blockResult.style.color = 'red'
    const capitalizedMessage = capitalizeFirst(message)
    blockResult.innerHTML = `
        <div class="fl">
            <img src="img/dialog-error.svg" alt="error" width="20px">
            <span>${capitalizedMessage}</span>
        </div>`
}

const formatMoney = (amount) => 
    amount.toLocaleString('ru-RU', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
    }) + ' ₽'

function calculateSalary() {
    renderInput()
    
    if (!validateInputs()) return false
    
    const [hourlyRate, totalShifts, nightShifts, holidayShifts, weekendShifts] = 
        [input1, input2, input3, input4, input5].map(getNumberValue)
    
    if (!validateShifts(totalShifts, nightShifts, holidayShifts, weekendShifts)) return false
    
    calculateValues(hourlyRate, totalShifts, nightShifts, holidayShifts, weekendShifts)
    renderBlock()
    return true
}

function validateInputs() {
    if (!input1.value.trim() || !input2.value.trim()) {
        showError('заполните все обязательные поля!')
        if (!input2.value.trim()) markError(input2)
        if (!input1.value.trim()) markError(input1)
        return false
    }
    return true
}

function validateShifts(total, night, holiday, weekend) {
    const errors = []
    const errorInputs = []
    
    if (night > total) {
        errorInputs.push(input3)
        errors.push('ночных')
    }
    if (holiday > total) {
        errorInputs.push(input4)
        errors.push('праздничных')
    }
    if (weekend > total) {
        errorInputs.push(input5)
        errors.push('выходных')
    }
    
    if (errors.length > 0) {
        errorInputs.forEach(input => {
            if (input) markError(input)
        })
        
        let errorMessage
        if (errors.length === 3) {
            errorMessage = 'ночных, праздничных и выходных смен не может быть больше общего количества!'
        } else if (errors.length === 2) {
            errorMessage = `${errors.join(' и ')} смен не может быть больше общего количества!`
        } else {
            errorMessage = `${errors[0]} смен не может быть больше общего количества!`
        }
        
        showError(errorMessage)
        return false
    }
    return true
}

function calculateValues(hourlyRate, totalShifts, nightShifts, holidayShifts, weekendShifts) {
    const shiftRate = hourlyRate * HOURS_IN_SHIFT
    const dayShifts = totalShifts - nightShifts
    
    const daySalary = shiftRate * dayShifts
    const nightRate = shiftRate * NIGHT_PERCENT / 100
    const nightSalary = (nightRate + shiftRate) * nightShifts
    const milkCompensation = totalShifts * MILK_COMPENSATION
    const holidaySalary = holidayShifts * shiftRate
    const weekendSalary = weekendShifts * shiftRate * WEEKEND_PERCENT / 100
    
    sum = daySalary + nightSalary + milkCompensation + holidaySalary + weekendSalary
    const taxableAmount = sum - milkCompensation
    const taxAmount = taxableAmount * TAX_PERCENT / 100
    sumClean = sum - taxAmount
    sumNal = taxAmount
    sumNight = nightRate * nightShifts
    sumMilk = milkCompensation
    sumWeekend = weekendSalary
    sumSalary = sum - sumNight - sumMilk - sumWeekend
    sumHarmfulConditions = sumSalary * HARMFUL_PERCENT / 100
    sumSalaryPercent = sumSalary - sumHarmfulConditions
}

function clearAll() {
    blockResult.style.display = 'none'
    
    const inputs = [input1, input2, input3, input4, input5]
    
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
    const inputs = [input1, input2, input3, input4, input5]
    
    inputs.forEach(input => {
        if (!input) return
        input.classList.remove('error')
        input.style.border = ''
    })
}

submitBtn.onclick = function() {   
    blockResult.style.display = 'block'
    calculateSalary()
}

cleanInput.onclick = clearAll

setTimeout(function() {
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