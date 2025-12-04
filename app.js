const calculatorElem = document.getElementById('calculator')

const input1 = document.getElementById('input1')
const input2 = document.getElementById('input2')
const input3 = document.getElementById('input3')
const input4 = document.getElementById('input4')
const input5 = document.getElementById('input5')

const submitBtn = document.getElementById('submit')
const cleanInput = document.getElementById('clean')

const blockResult = document.getElementById('block--result')
const resultElement = document.getElementById('result')
const resultElementClean = document.getElementById('result-clean')
const resultElementNal = document.getElementById('result-nal')
const resultElementSubtitle = document.getElementById('result-subtitle')
const resultElementNight = document.getElementById('result-night')
const resultElementMilk = document.getElementById('result-milk')
const resultEl = document.querySelectorAll('.resultat')

let sum
let sumClean
let sumNal
let sumNight

calculatorElem.addEventListener('input', (e) => {     
    if (e.target.dataset.type === "input1") {examinationInput(e)}    
    if (e.target.dataset.type === "input2") {examinationInput(e)}  
    if (e.target.dataset.type === "input3") {examinationInput(e)}   
    if (e.target.dataset.type === "input4") {examinationInput(e)}
    if (e.target.dataset.type === "input5") {examinationInput(e)}
})

function examinationInput(e) { return Number(e.target.value) < 0 ? e.target.value = 0 : e.target.value }

submitBtn.onclick = function() {
    
    blockResult.style.display = 'block'

    const rate = Number(input1.value) * 8
    const dayShifts = Number(input2.value) - Number(input3.value)
    const moneyDays = rate * dayShifts
    const rateNight = rate / 100 * 40
    const moneyRateNight = rateNight * Number(input3.value)
    const moneyNight = rate * Number(input3.value)
    const monye = moneyRateNight + moneyNight
    const allShifts = dayShifts + Number(input3.value)
    const moneyMilk = allShifts * 40
    const monyeHolliday = Number(input4.value) * rate
    const moneyWeekend = rate / 2 * Number(input5.value)
    
    sum = moneyDays + monye + moneyMilk + monyeHolliday + moneyWeekend

    const sumPercent = sum / 100 * 13
    
    sumClean = sum - sumPercent
    sumNal = sum - sumClean
    sumNight = moneyRateNight
    sumMilk = moneyMilk
    
    if (input1.value === '' || input2.value === '') {
        renderBlock()
        renderEror()
        
        if (input2.value === '') {
            input2.style.border = '2px solid red'
            input2.focus()
        }
        
        if (input1.value === '') {
            input1.style.border = '2px solid red'
            input1.focus()
        }
    }

    else if (Number(input3.value) > Number(input2.value) && Number(input4.value) > Number(input2.value)) {
        renderBlock()
        renderEror()
        input3.style.border = '2px solid red'
        input4.style.border = '2px solid red'
        input3.focus()
        resultElementSubtitle.innerHTML = 'Ошибка! Ночных и праздничных смен не может быть больше!'
    }
    
    else if (Number(input3.value) > Number(input2.value)) {
        renderBlock()
        renderEror()
        input3.style.border = '2px solid red'
        input3.focus()
        resultElementSubtitle.innerHTML = 'Ошибка! Ночных смен не может быть больше!'
    }
    
    else if (Number(input4.value) > Number(input2.value)) {
        renderBlock()
        renderEror()
        input4.style.border = '2px solid red'
        input4.focus()
        resultElementSubtitle.innerHTML = 'Ошибка! Праздничных смен не может быть больше!'
    }

    else if (Number(input5.value) > Number(input2.value)) {
        renderBlock()
        renderEror()
        input5.style.border = '2px solid red'
        input5.focus()
        resultElementSubtitle.innerHTML = 'Ошибка! Выходных смен не может быть больше!'
    }
    
    else { renderBlock() } 
}

cleanInput.onclick = function() {
    
    blockResult.style.display = 'none'
    
    input1.value = ''
    input2.value = ''
    input3.value = ''
    input4.value = ''
    input5.value = ''
    
    resultElement.innerHTML = ''
    
    resultElementClean.innerHTML = ''
    
    resultElementNal.innerHTML = ''
    
    renderInput()
}

function renderBlock() {
    
    resultElementSubtitle.innerHTML = 'Размер з/п за вычетом НДФЛ:'
    
    resultCleanHTML = sumClean.toLocaleString('ru-RU', {
        minimumFractionDigits: 0,      
        maximumFractionDigits: 2,
    })
    
    resultSumHTML = sum.toLocaleString('ru-RU', {
        minimumFractionDigits: 0,      
        maximumFractionDigits: 2,
    })
    
    resultNalHTML = sumNal.toLocaleString('ru-RU', {
        minimumFractionDigits: 0,      
        maximumFractionDigits: 2,
    })

    resultMilkHTML = sumMilk.toLocaleString('ru-RU', {
        minimumFractionDigits: 0,      
        maximumFractionDigits: 2,
    })

    resultNightHTML = sumNight.toLocaleString('ru-RU', {
        minimumFractionDigits: 0,      
        maximumFractionDigits: 2,
    })
    
    resultEl.forEach( function (item) {
        item.style.color = '#333333'
        item.style.fontWeight = '700'
    })
    
    resultElementSubtitle.style.color = '#333333'
    
    resultEl[0].innerHTML = `<span class="result-sp result-sp-fs" style="color: #1668e3;">${resultCleanHTML} ₽</span>`
    resultEl[1].innerHTML = `Начисленная сумма зарплаты: <span class="result-sp">${resultSumHTML} ₽</span>`
    resultEl[2].innerHTML = `Ночные: <span class="result-sp">${resultNightHTML} ₽</span>`
    resultEl[3].innerHTML = `Компенсация молока: <span class="result-sp">${resultMilkHTML} ₽</span>`
    resultEl[4].innerHTML = `Сумма налога: <span class="result-sp">${resultNalHTML} ₽</span>`
   
    renderInput() 
}

function renderEror() {
    
    resultEl.forEach( function (item) {
        item.innerHTML = ''
    })
    
    resultElementSubtitle.style.color = 'red'
    resultElementSubtitle.innerHTML = 'Ошибка! Заполните все обязательные поля!'   
}

function renderInput() {
    input1.style.border = '1px solid #b9c0c5'
    input2.style.border = '1px solid #b9c0c5'
    input3.style.border = '1px solid #b9c0c5'
    input4.style.border = '1px solid #b9c0c5'
    input5.style.border = '1px solid #b9c0c5'
}














