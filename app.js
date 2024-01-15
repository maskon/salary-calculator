const input1 = document.querySelector('#input1')
const input2 = document.querySelector('#input2')
const input3 = document.querySelector('#input3')
const input4 = document.querySelector('#input4')

const submitBtn = document.querySelector('#submit')
const cleanInput = document.querySelector('#clean')

const blockResult = document.querySelector('#block--result')
const resultElement = document.querySelector('#result')
const resultElementClean = document.querySelector('#result-clean')
const resultElementNal = document.querySelector('#result-nal')
const resultElementSubtitle = document.querySelector('#result-subtitle')
const resultEl = document.querySelectorAll('.resultat')

let sum
let sumClean
let sumNal

input1.addEventListener('input', function () {
    if (Number(input1.value) < 0) {
        input1.value = 0
    }
})

input2.addEventListener('input', function () {
    if (Number(input2.value) < 0) {
        input2.value = 0
    }
})

input3.addEventListener('input', function () {
    if (Number(input3.value) < 0) {
        input3.value = 0
    }
})

input4.addEventListener('input', function () {
    if (Number(input4.value) < 0) {
        input4.value = 0
    }
})

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
        resultElementSubtitle.textContent = 'Ошибка! Ночных и праздничных смен не может быть больше!'
    }
    
    else if (Number(input3.value) > Number(input2.value)) {
        renderBlock()
        renderEror()
        input3.style.border = '2px solid red'
        input3.focus()
        resultElementSubtitle.textContent = 'Ошибка! Ночных смен не может быть больше!'
    }
    
    else if (Number(input4.value) > Number(input2.value)) {
        renderBlock()
        renderEror()
        input4.style.border = '2px solid red'
        input4.focus()
        resultElementSubtitle.textContent = 'Ошибка! Праздничных смен не может быть больше!'
    }
    
    else { renderBlock() } 
}

cleanInput.onclick = function() {
    
    blockResult.style.display = 'none'
    
    input1.value = ''
    input2.value = ''
    input3.value = ''
    input4.value = ''
    
    resultElement.textContent = ''
    
    resultElementClean.textContent = ''
    
    resultElementNal.textContent = ''
    
    renderInput()
}

function renderBlock() {
    
    resultElementSubtitle.innerHTML = 'Размер зарплаты:'
    
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
    
    resultElementSubtitle.style.color = '#333333' // <span style="color: blue; font-weight: bold;">${resultElementCleanHTML}</span>
    
    resultEl[0].innerHTML = `Чистыми: <span style="color: #1668e3;">${resultElementCleanHTML}</span> ₽`
    
    resultEl[1].innerHTML = `До вычета налога: <span style="color: #1668e3;">${resultElementHTML}</span> ₽` 
    
    resultEl[2].innerHTML = `Сумма налога: <span style="color: #1668e3;">${resultElementNalHTML}</span> ₽`
   
    renderInput() 
}

function renderEror() {
    
    resultEl.forEach( function (item) {
        item.innerHTML = ''
    })
    
    resultElementSubtitle.style.color = 'red'
    resultElementSubtitle.textContent = 'Ошибка! Заполните все обязательные поля!'   
}

function renderInput() {
    input1.style.border = '1px solid #b9c0c5'
    input2.style.border = '1px solid #b9c0c5'
    input3.style.border = '1px solid #b9c0c5'
    input4.style.border = '1px solid #b9c0c5'
}














