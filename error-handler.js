// error-handler-enhanced.js
;(function () {
  'use strict'

  const CONFIG = {
    loaderId: 'pwa-loader',
    contentId: 'app-content',
    fallbackTimeout: 10000, // 10 секунд
    showErrorMessages: true,
    logToConsole: true,
  }

  // Логирование
  function log(...args) {
    if (CONFIG.logToConsole) {
      console.log('[Error Handler]', ...args)
    }
  }

  function error(...args) {
    if (CONFIG.logToConsole) {
      console.error('[Error Handler]', ...args)
    }
  }

  // Получение элементов
  function getElements() {
    return {
      loader: document.getElementById(CONFIG.loaderId),
      content: document.getElementById(CONFIG.contentId),
    }
  }

  // Скрытие лоадера
  function hideLoader() {
    const { loader, content } = getElements()

    if (loader && loader.style.display !== 'none') {
      log('Скрываем лоадер')

      // Плавное исчезновение
      loader.style.transition = 'opacity 0.3s ease'
      loader.style.opacity = '0'

      setTimeout(() => {
        if (loader) {
          loader.style.display = 'none'
        }
        if (content) {
          content.style.display = 'block'
          // Плавное появление контента
          setTimeout(() => {
            content.style.transition = 'opacity 0.5s ease'
            content.style.opacity = '1'
            content.classList.add('show')
          }, 50)
        }
      }, 300)
    }
  }

  // Показ сообщения об ошибке
  function showErrorMessage(message) {
    if (!CONFIG.showErrorMessages) return

    // Удаляем старые сообщения
    const oldMessages = document.querySelectorAll('.error-message')
    oldMessages.forEach(msg => msg.remove())

    const errorDiv = document.createElement('div')
    errorDiv.className = 'error-message'
    errorDiv.innerHTML = `
            <div class="error-content">
                <span>⚠️ ${message}</span>
                <button class="error-close">&times;</button>
            </div>
        `

    // Стили можно вынести в CSS
    errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ffebee;
            border: 2px solid #ef5350;
            color: #c62828;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 9999;
            font-size: 14px;
            max-width: 90%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `

    const errorContent = errorDiv.querySelector('.error-content')
    errorContent.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
        `

    const closeBtn = errorDiv.querySelector('.error-close')
    closeBtn.style.cssText = `
            background: none;
            border: none;
            color: #c62828;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        `

    closeBtn.addEventListener('click', () => errorDiv.remove())
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.backgroundColor = 'rgba(198, 40, 40, 0.1)'
    })
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.backgroundColor = 'transparent'
    })

    document.body.appendChild(errorDiv)

    // Автоскрытие
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.style.transition = 'opacity 0.3s ease'
        errorDiv.style.opacity = '0'
        setTimeout(() => errorDiv.remove(), 300)
      }
    }, 5000)
  }

  // Обработчики ошибок
  window.addEventListener('error', function (e) {
    error('JavaScript ошибка:', {
      message: e.message,
      file: e.filename,
      line: e.lineno,
      column: e.colno,
    })

    hideLoader()
    showErrorMessage('Произошла ошибка в приложении. Попробуйте перезагрузить страницу.')
  })

  window.addEventListener('unhandledrejection', function (e) {
    error('Необработанный Promise:', e.reason)
    hideLoader()
    showErrorMessage('Ошибка при выполнении операции.')
  })

  // Аварийный таймер
  const fallbackTimer = setTimeout(() => {
    const { loader } = getElements()
    if (loader && loader.style.display !== 'none') {
      log('Аварийное скрытие лоадера по таймауту')
      hideLoader()
    }
  }, CONFIG.fallbackTimeout)

  // Если приложение загрузилось успешно, отменяем таймер
  window.addEventListener('app-loaded', () => {
    clearTimeout(fallbackTimer)
    log('Приложение успешно загрузилось')
  })

  // API для использования из других скриптов
  window.ErrorHandler = {
    hideLoader,
    showError: showErrorMessage,
    config: CONFIG,
    reportError: function (errorDetails) {
      error('Сообщение об ошибке:', errorDetails)
      // Можно отправить на сервер для логирования
    },
  }

  log('Обработчик ошибок инициализирован')
})()
