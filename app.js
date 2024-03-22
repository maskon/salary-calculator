const calculatorElem = document.getElementById('calculator')

const input1 = document.getElementById('input1')
const input2 = document.getElementById('input2')
const input3 = document.getElementById('input3')
const input4 = document.getElementById('input4')

const submitBtn = document.getElementById('submit')
const cleanInput = document.getElementById('clean')

const blockResult = document.getElementById('block--result')
const resultElement = document.getElementById('result')
const resultElementClean = document.getElementById('result-clean')
const resultElementNal = document.getElementById('result-nal')
const resultElementSubtitle = document.getElementById('result-subtitle')
const resultEl = document.querySelectorAll('.resultat')

let sum
let sumClean
let sumNal

calculatorElem.addEventListener('input', (e) => {     
    if (e.target.dataset.type === "input1") {examinationInput(e)}    
    if (e.target.dataset.type === "input2") {examinationInput(e)}  
    if (e.target.dataset.type === "input3") {examinationInput(e)}   
    if (e.target.dataset.type === "input4") {examinationInput(e)}
})

function examinationInput(e) { return Number(e.target.value) < 0 ? e.target.value = 0 : e.target.value }

submitBtn.onclick = function() {
    
    blockResult.style.display = 'block'

    const sum1 = Number(input1.value) * 8
    const sum2 = Number(input2.value) - Number(input3.value)
    const sum3 = sum1 * sum2
    const sum4 = sum1 / 100 * 40
    const sum5 = sum4 * Number(input3.value)
    const sum6 = sum1 * Number(input3.value)
    const sum7 = sum5 + sum6
    const sum8 = sum2 + Number(input3.value)
    const sum9 = sum8 * 40
    const sum10 = sum1 / 2 * Number(input4.value)
    
    sum = sum3 + sum7 + sum9 + sum10

    const sumPercent = sum / 100 * 13
    
    sumClean = sum - sumPercent
    sumNal = sum - sumClean
    
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
    
    else { renderBlock() } 
}

cleanInput.onclick = function() {
    
    blockResult.style.display = 'none'
    
    input1.value = ''
    input2.value = ''
    input3.value = ''
    input4.value = ''
    
    resultElement.innerHTML = ''
    
    resultElementClean.innerHTML = ''
    
    resultElementNal.innerHTML = ''
    
    renderInput()
}

function renderBlock() {
    
    resultElementSubtitle.innerHTML = 'Размер з/п за вычетом НДФЛ:'
    
    resultElementCleanHTML = sumClean.toLocaleString('ru-RU', {
        minimumFractionDigits: 0,      
        maximumFractionDigits: 2,
    })
    
    resultElementHTML = sum.toLocaleString('ru-RU', {
        minimumFractionDigits: 0,      
        maximumFractionDigits: 2,
    })
    
    resultElementNalHTML = sumNal.toLocaleString('ru-RU', {
        minimumFractionDigits: 0,      
        maximumFractionDigits: 2,
    })
    
    resultEl.forEach( function (item) {
        item.style.color = '#333333'
        item.style.fontWeight = '700'
    })
    
    resultElementSubtitle.style.color = '#333333'
    
    resultEl[0].innerHTML = `<span class="result-sp result-sp-fs" style="color: #1668e3;">${resultElementCleanHTML} ₽</span>`
    
    resultEl[1].innerHTML = `Начисленная сумма зарплаты: <span class="result-sp">${resultElementHTML} ₽</span>` 
    
    resultEl[2].innerHTML = `Сумма налога: <span class="result-sp">${resultElementNalHTML} ₽</span>`
   
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
}














