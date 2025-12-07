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

calculatorElem.addEventListener('input', (e) => {     
    if (/^input[1-5]$/.test(e.target.dataset.type)) {
        examinationInput(e)
    }
})

function examinationInput(e) { 
    return Number(e.target.value) < 0 ? e.target.value = 0 : e.target.value 
}

submitBtn.onclick = function() {   
    blockResult.style.display = 'block'
    
    renderInput()

    if (input1.value === '' || input2.value === '') {
        renderEror()        
        if (input2.value === '') {
            input2.style.border = '2px solid red'
            input2.focus()
        }        
        if (input1.value === '') {
            input1.style.border = '2px solid red'
            input1.focus()
        }
        return
    }

    const input2Val = Number(input2.value)
    const input3Val = Number(input3.value)
    const input4Val = Number(input4.value)
    const input5Val = Number(input5.value)

    if (input3Val > input2Val && input4Val > input2Val) {
        renderEror()
        input3.style.border = '2px solid red'
        input4.style.border = '2px solid red'
        input3.focus()
        blockResult.innerHTML = 'Ночных и праздничных смен не может быть больше!'
        return
    }
    
    else if (input3Val > input2Val) {
        renderEror()
        input3.style.border = '2px solid red'
        input3.focus()
        blockResult.innerHTML = 'Ночных смен не может быть больше!'
        return
    }
    
    else if (input4Val > input2Val) {
        renderEror()
        input4.style.border = '2px solid red'
        input4.focus()
        blockResult.innerHTML = 'Праздничных смен не может быть больше!'
        return
    }

    else if (input5Val > input2Val) {
        renderEror()
        input5.style.border = '2px solid red'
        input5.focus()
        blockResult.innerHTML = 'Выходных смен не может быть больше!'
        return
    }
    
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
    sumWeekend = moneyWeekend
    sumSalary = sum - sumNight - sumMilk - sumWeekend
    sumHarmfulConditions = sumSalary / 100 * 4
    sumSalaryPercent = sumSalary - sumHarmfulConditions
    
    renderBlock()
}

cleanInput.onclick = function() {    
    blockResult.style.display = 'none'
    input1.value = '', input2.value = '', input3.value = '', input4.value = '', input5.value = ''
    
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
                <img src="img/piggy-bank.svg" alt="piggy-bank" width="30px">
                <span>${sumClean.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₽</span>
            </div>
        </div>
        <div class="fl">
            <img src="img/earnings.svg" alt="earnings" width="20px"> Начисленная сумма: 
            <span class="result-sp">${sum.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₽</span>
        </div>
        <div class="fl">
            <img src="img/briefcase.svg" alt="briefcase" width="20px"> Оклад: 
            <span class="result-sp">${sumSalaryPercent.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₽</span>
        </div>
        <div class="fl">
            <img src="img/weather-few-clouds-night.svg" alt="night" width="20px"> Ночные: 
            <span class="result-sp">${sumNight.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₽</span>
        </div>
        <div class="fl">
            <img src="img/money.svg" alt="money" width="20px"> Доп. начисления:
            <span class="result-sp">${sumWeekend.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₽</span>
        </div>
        <div class="fl">
            <img src="img/milk-carton.svg" alt="milk" width="20px"> Компенсация молока: 
            <span class="result-sp">${sumMilk.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₽</span>
        </div>
        <div class="fl">
            <img src="img/hazard.svg" alt="hazard" width="20px"> Вредные условия: 
            <span class="result-sp">${sumHarmfulConditions.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₽</span>
        </div>
        <div class="fl">
            <img src="img/tax.svg" alt="nalog" width="20px"> Сумма налога: 
            <span class="result-sp">${sumNal.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₽</span>
        </div>`
   
    renderInput() 
}

function renderEror() {    
    blockResult.style.color = 'red'
    blockResult.innerHTML = 'Заполните все обязательные поля!'   
}

function renderInput() {
    const inputs = [input1, input2, input3, input4, input5]
    inputs.forEach(input => {
        input.style.border = '1px solid #b9c0c5'
    })
}