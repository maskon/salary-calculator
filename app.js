const resultElement = document.querySelector('#result')
const resultElementClean = document.querySelector('#result-clean')
const resultElementNal = document.querySelector('#result-nal')

const input1 = document.querySelector('#input1')
const input2 = document.querySelector('#input2')
const input3 = document.querySelector('#input3')
const input4 = document.querySelector('#input4')

const submitBtn = document.querySelector('#submit')
const cleanInput = document.querySelector('#clean')

const blockResult = document.querySelector('#block--result')

submitBtn.onclick = function() {
    
    blockResult.style.display = 'block'
    
    const input1Value = +(input1.value)
    const input2Value = +(input2.value)
    const input3Value = +(input3.value)
    const input4Value = +(input4.value)

    const sum1 = input1Value * 8
    const sum2 = input2Value - input3Value
    const sum3 = sum1 * sum2

    const sum4 = sum1 / 100 * 40

    const sum5 = sum4 * input3Value
    const sum6 = sum1 * input3Value
    const sum7 = sum5 + sum6

    const sum8 = sum2 + input3Value
    const sum9 = sum8 * 40

    const sum10 = sum1 / 2 * input4Value

    const sum = sum3 + sum7 + sum9 + sum10

    const sumPercent = sum / 100 * 13
    const sumClean = sum - sumPercent
    const sumNal = sum - sumClean
    
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

    else if (input3Value > input2Value && input4Value > input2Value) {
        renderBlock()
        renderEror()
        input3.style.border = '2px solid red'
        input4.style.border = '2px solid red'
        input3.focus()
        resultElement.textContent = 'Ошибка! Ночных и праздничных смен не может быть больше!'
    }
    
    else if (input3Value > input2Value) {
        renderBlock()
        renderEror()
        input3.style.border = '2px solid red'
        input3.focus()
        resultElement.textContent = 'Ошибка! Ночных смен не может быть больше!'
    }
    
    else if (input4Value > input2Value) {
        renderBlock()
        renderEror()
        input4.style.border = '2px solid red'
        input4.focus()
        resultElement.textContent = 'Ошибка! Праздничных смен не может быть больше!'
    }
    
    else { renderBlock() }
    
    function renderEror() {
        resultElement.style.color = ('red')
        resultElementClean.style.color = ('red')
        resultElement.textContent = 'Ошибка! Заполните все обязательные поля!'
        resultElementClean.textContent = ''
        resultElementNal.textContent = ''
    }
    
    function renderBlock() {
        resultElement.style.color = ('#1668e3')
        resultElementClean.style.color = ('#1668e3')
        resultElementNal.style.color = ('#1668e3')
        
        input1.style.border = '1px solid #b9c0c5'
        input2.style.border = '1px solid #b9c0c5'
        input3.style.border = '1px solid #b9c0c5'
        input4.style.border = '1px solid #b9c0c5'
        
        resultElement.textContent = 'До вычета налога: ' + sum.toFixed(2) + ' ₽'
        resultElementClean.textContent = 'Чистыми: ' + sumClean.toFixed(2) + ' ₽'
        resultElementNal.textContent = 'Сумма налога: ' + sumNal.toFixed(2) + ' ₽'
    }
}

// Очистить инпуты
cleanInput.onclick = function() {
    
    blockResult.style.display = 'none'
    
    input1.value = ''
    input2.value = ''
    input3.value = ''
    input4.value = ''
    
    resultElement.textContent = ''
    resultElement.style.color = ('#333333')
    
    resultElementClean.textContent = ''
    resultElementClean.style.color = ('#333333')
    
    resultElementNal.textContent = ''
    resultElementNal.style.color = ('#333333')
    
    input1.style.border = '1px solid #b9c0c5'
    input2.style.border = '1px solid #b9c0c5'
    input3.style.border = '1px solid #b9c0c5'
    input4.style.border = '1px solid #b9c0c5'
}














