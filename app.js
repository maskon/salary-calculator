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
        e.target.style.border = '1px solid #b9c0c5'
        examinationInput(e)
        if (e.target.dataset.type === "input1") saveInput1()
    }
})

function examinationInput(e) { 
    let value = e.target.value
    
    if (value === '') return value
    
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
    input.style.border = '2px solid red'
    input.focus()
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

submitBtn.onclick = function() {   
    blockResult.style.display = 'block'
    renderInput()

    if (!input1.value.trim() || !input2.value.trim()) {
        showError('заполните все обязательные поля!')
        if (!input2.value.trim()) markError(input2)
        if (!input1.value.trim()) markError(input1)
        return
    }

    const [
        hourlyRate,
        totalShifts,
        nightShifts,
        holidayShifts,
        weekendShifts
    ] = [input1, input2, input3, input4, input5].map(getNumberValue)

    const errors = []
    const errorInputs = []
    
    if (nightShifts > totalShifts) {
        errorInputs.push(input3)
        errors.push('ночных')
    }
    if (holidayShifts > totalShifts) {
        errorInputs.push(input4)
        errors.push('праздничных')
    }
    if (weekendShifts > totalShifts) {
        errorInputs.push(input5)
        errors.push('выходных')
    }
    
    if (errors.length > 0) {
        errorInputs.forEach(markError)
        
        let errorMessage
        if (errors.length === 3) {
            errorMessage = 'ночных, праздничных и выходных смен не может быть больше общего количества!'
        } else if (errors.length === 2) {
            errorMessage = `${errors.join(' и ')} смен не может быть больше общего количества!`
        } else {
            errorMessage = `${errors[0]} смен не может быть больше общего количества!`
        }
        
        showError(errorMessage)
        return
    }

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
    
    renderBlock()
}

cleanInput.onclick = function() {    
    blockResult.style.display = 'none'
    const _ = [input1, input2, input3, input4, input5].forEach(input => input.value = '')
    clearInput1()
    renderInput()
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
   
    renderInput() 
}

function renderEror(message = 'заполните все обязательные поля!') {    
    showError(message)
}

function renderInput() {
    [input1, input2, input3, input4, input5].forEach(input => {
        input.style.border = '1px solid #b9c0c5'
    })
}

// Регистрация Service Worker для PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker зарегистрирован:', registration);
      })
      .catch(error => {
        console.log('Ошибка регистрации Service Worker:', error);
      });
  });
}