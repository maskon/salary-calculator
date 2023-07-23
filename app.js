const resultElement = document.querySelector('#result')
const resultElementClean = document.querySelector('#result-clean')
const input1 = document.querySelector('#input1')
const input2 = document.querySelector('#input2')
const input3 = document.querySelector('#input3')
const input4 = document.querySelector('#input4')
const submitBtn = document.querySelector('#submit')
const cleanInput = document.querySelector('#clean')

// Калькулятор
submitBtn.onclick = function() {
    const input1Value = +(input1.value)
    const input2Value = +(input2.value)
    const input3Value = +(input3.value)
    const input4Value = +(input4.value)

    if(isNaN(input1Value) || isNaN(input2Value) || isNaN(input3Value) || isNaN(input4Value)) {
        alert('Пожалуйста, введите корректные числовые значения')
        return; // выходим из функции, чтобы не производить расчеты
    }

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
    
    if (sum === 0) {
        resultElement.style.color = ('red')
        resultElementClean.style.color = ('red')
        resultElement.textContent = 'Ошибка! Введите коректное значение'
        resultElementClean.textContent = ''
    }
    else if (sum > 0) {
        resultElement.style.color = ('#333333')
        resultElementClean.style.color = ('#333333')
        resultElement.textContent = sum.toFixed(2) + ' ₽'
        resultElementClean.textContent = 'Чистыми: ' + sumClean.toFixed(2) + ' ₽'
    }
}

// Очистить инпуты
cleanInput.onclick = function() {
    input1.value = ''
    input2.value = ''
    input3.value = ''
    input4.value = ''
    resultElement.textContent = '0'
    resultElement.style.color = ('#333333')
    resultElementClean.textContent = '0'
    resultElementClean.style.color = ('#333333')
}














