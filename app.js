// ===== PWA ЛОАДЕР ЛОГИКА =====
(function() {
    'use strict';
    
    // Ждем полной загрузки DOM
    document.addEventListener('DOMContentLoaded', function() {
        const appContent = document.getElementById('app-content');
        const loader = document.getElementById('pwa-loader');
        const loaderMessage = document.getElementById('loader-message');
        
        // Проверяем, установлено ли приложение как PWA
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        console.log('Режим запуска:', {
            isPWA: isStandalone,
            isMobile: isMobile,
            displayMode: isStandalone ? 'standalone' : 'browser'
        });
        
        // Сообщения для лоадера
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
        };
        
        let messageIndex = 0;
        let messageInterval;
        
        // Функция обновления сообщения
        function updateLoaderMessage() {
            if (loaderMessage) {
                const messageList = isStandalone ? messages.pwa : messages.browser;
                if (messageIndex < messageList.length) {
                    loaderMessage.textContent = messageList[messageIndex];
                    messageIndex++;
                } else {
                    clearInterval(messageInterval);
                }
            }
        }
        
        // Запускаем смену сообщений
        if (loaderMessage) {
            messageInterval = setInterval(updateLoaderMessage, 800);
        }
        
        // Определяем время показа лоадера
        let loaderTime;
        if (isStandalone) {
            // Для PWA показываем дольше (лучший UX)
            loaderTime = 2500;
            if (loaderMessage) {
                loaderMessage.textContent = 'Запуск приложения...';
            }
        } else if (isMobile) {
            // Для мобильного браузера
            loaderTime = 1500;
        } else {
            // Для десктопа
            loaderTime = 800;
        }
        
        // Скрываем лоадер через заданное время
        setTimeout(function() {
            // Плавно скрываем лоадер
            if (loader) {
                loader.style.opacity = '0';
            }
            
            // Показываем контент
            setTimeout(function() {
                if (loader) {
                    loader.style.display = 'none';
                }
                if (appContent) {
                    appContent.style.display = 'block';
                    // Небольшая задержка для плавности
                    setTimeout(function() {
                        appContent.classList.add('show');
                        appContent.classList.add('content-fade-in');
                    }, 50);
                }
                
                // Добавляем класс для скрытия лоадера в CSS
                document.body.classList.add('pwa-loaded');
                
                // Очищаем интервал сообщений
                clearInterval(messageInterval);
                
                // Логируем завершение загрузки
                console.log('Приложение загружено');
            }, 300); // Время анимации исчезновения
        }, loaderTime);
        
        // Сохраняем информацию о первом запуске
        if (!localStorage.getItem('app_first_launch')) {
            localStorage.setItem('app_first_launch', new Date().toISOString());
            console.log('Первый запуск приложения сохранен');
        }
    });
    
    // Регистрация Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            // Используем try/catch для обработки ошибок
            try {
                navigator.serviceWorker.register('sw.js')
                    .then(function(registration) {
                        console.log('Service Worker успешно зарегистрирован:', registration.scope);
                    })
                    .catch(function(error) {
                        console.log('Ошибка регистрации Service Worker:', error);
                    });
            } catch (error) {
                console.log('Ошибка при попытке регистрации Service Worker:', error);
            }
        });
    }
    
    // Определяем события beforeinstallprompt для PWA
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        // Предотвращаем автоматическое отображение подсказки
        e.preventDefault();
        // Сохраняем событие для использования позже
        deferredPrompt = e;
        console.log('PWA может быть установлено');
        
        // Можно показать свою кнопку установки
        // showInstallButton();
    });
    
    // Функция для показа кнопки установки
    function showInstallButton() {
        const installBtn = document.createElement('button');
        installBtn.innerHTML = '📲 Установить приложение';
        installBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background: #1668e3;
            color: white;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(22, 104, 227, 0.3);
            z-index: 1000;
            cursor: pointer;
        `;
        
        installBtn.onclick = async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`Пользователь ${outcome} установку`);
                if (outcome === 'accepted') {
                    installBtn.style.display = 'none';
                }
                deferredPrompt = null;
            }
        };
        
        document.body.appendChild(installBtn);
    }
})();

// ===== ВАШ ОСТАЛЬНОЙ КОД НИЖЕ =====
// Весь ваш существующий JavaScript код должен быть здесь
// Убедитесь, что он начинается после закрывающей скобки выше

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