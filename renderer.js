const ipc = require('electron').ipcRenderer
const smalltalk = require('smalltalk')

let app = null
let cryptocurrencies = ['BTC', 'ETH', 'LTC']

// Fetch price data from CryptoCompare API
function getPrices() {
  return fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${cryptocurrencies.join(',')}&tsyms=USD,EUR`
  ).then(res => {
    return res.json()
  })
}

// Renders the application
function update() {
  getPrices().then(res => {
    const html = Object.entries(res)
      .map(currency => {
        return `<div class="currency-row">
          <h2 class="currency-title">${currency[0]}</h2>
          € ${currency[1].EUR}<br />
          $ ${currency[1].USD}
        </div>`
      })
      .join('')

    // Notify the main process that prices have been updated
    ipc.send('update-prices', res)

    app.innerHTML = html
  })
}

function addCryptocurrency() {
  smalltalk
    .prompt('Add cryptocurrency', "Symbol of the cryptocurrency you'd like to add \n\n")
    .then(value => {
      if (!value) return
      cryptocurrencies.push(value.toUpperCase())
      update()
    })
}

document.addEventListener('DOMContentLoaded', () => {
  app = document.getElementById('app')

  update()
  setInterval(update, 2000)

  // Listen to `add-cryptocurrency` event
  ipc.on('add-cryptocurrency', addCryptocurrency)
})
