const resultElement = document.querySelector('#result')
const resultElementClean = document.querySelector('#result-clean')
const input1 = document.querySelector('#input1')
const input2 = document.querySelector('#input2')
const input3 = document.querySelector('#input3')
const input4 = document.querySelector('#input4')
const submitBtn = document.querySelector('#submit')


submitBtn.onclick = function() {
    const sum1 = +(input1.value) * 8
    const sum2 = +(input2.value) - +(input3.value)
    const sum3 = sum1 * sum2

    const sum4 = sum1 / 100 * 40

    const sum5 = sum4 * +(input3.value)
    const sum6 = sum1 * +(input3.value)
    const sum7 = sum5 + sum6

    const sum8 = sum2 + +(input3.value)
    const sum9 = sum8 * 40

    const sum10 = sum1 / 2 * +(input4.value)

    const sum = sum3 + sum7 + sum9 + sum10

    const sumPercent = sum / 100 * 13
    const sumClean = sum - sumPercent

    resultElement.textContent = sum + ' ₽'
    resultElementClean.textContent = 'Чистыми: ' + sumClean + ' ₽'

}












