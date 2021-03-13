let LOADING = false
let IS_ACTIVE = false
let TOTAL_FOR_SALE = 1000000  //Total token count for sale, using for progress

$(async () => {
  setLoading(false)
})

async function load() {
  await loadReadContract()
  // await loadAccount()
  // await loadContract()
  await render()
  setInterval(setRemainingTokens,10000);
}

async function loadReadContract() {
  ABI = await $.getJSON('CrowdSale.json')

  READ_CONTRACT = new ethers.Contract(CONTRACT_ADDRESS, ABI, READ_WEB3_PROVIDER)
}

async function loadWriteContract() {
  WRITE_CONTRACT = new ethers.Contract(
    CONTRACT_ADDRESS,
    ABI,
    WRITE_WEB3_PROVIDER.getSigner()
  )
}

function showWallets() {
  $('#connect-wallets').removeClass('hidden')
}

function closeWallets() {
  $('#connect-wallets').addClass('hidden')
}

async function connectWallet() {
  showWallets()
}

async function connectMetamask() {
  if (!window.ethereum)
    return sl('error', 'Please install the Metamask extension')
  await window.ethereum.enable()
  closeWallets()
  await loadAccount(window.ethereum)
}

async function connectWalletConnect() {
  const walletConnectProvider = new WalletConnectProvider.default({
    infuraId: INFURA_ID,
  })
  await walletConnectProvider.enable()
  closeWallets()
  await loadAccount(walletConnectProvider)
}

async function connectBsc() {
  if (!window.BinanceChain)
    return sl('error', 'Please install the Binance Wallet extension')
  await window.BinanceChain.enable()
  closeWallets()
  await loadAccount(window.BinanceChain)
}

async function setAddress() {
  if (WRITE_WEB3_PROVIDER) {
    ADDRESS = await WRITE_WEB3_PROVIDER.getSigner().getAddress()
    $('#account').html(
      `${ADDRESS.substring(0, 6)}...${ADDRESS.substring(
        ADDRESS.length - 4,
        ADDRESS.length
      )}`
    )
    $('#account_wrapper').removeClass('hidden');
  }
}

async function checkIsActive() {
  IS_ACTIVE = await READ_CONTRACT.isSaleActive()
}

async function setRemainingTokens() {
  const remainingTokens = new Big((await READ_CONTRACT.remainingTokens()).toString()).div(
    new Big(1e18)
  )
  const remainingTokensHumanized = toHumanizedCurrency(remainingTokens)
  $('#remainingTokens').html(remainingTokensHumanized)

  const percentRaised = 100-(remainingTokens.toFixed(0)/TOTAL_FOR_SALE)*100;
  $('#remainingTokensProgress').attr('style', `width:${percentRaised}%;`)
}

async function calculateReceiveAmount() {
  let inputAmount = $('#input-amount').val()
  if (inputAmount) {
    const inputAmountInWei = ethers.utils.parseEther(inputAmount)
    if (inputAmountInWei.isZero()) {
      return
    }
    try {
      const receiveAmount = toHumanizedCurrency(
        new Big(
          (await READ_CONTRACT._getTokenAmount(inputAmountInWei)).toString()
        ).div(new Big(1e18))
      )
      $('#receive-amount').val(receiveAmount)
    } catch (error) {
      console.error(error)
      sl('error', 'An error occurred. Error: ' + error.reason)
      $('#receive-amount').val('')
    }
  } else {
    $('#receive-amount').val('')
  }
}

async function buyTokens() {
  if (!IS_ACTIVE) {
    return sl('error', 'Sale is not active.')
  }
  let inputAmount = $('#input-amount').val()
  if (inputAmount) {
    let inputAmountInWei = ethers.utils.parseEther(inputAmount)
    try {
      setLoading(true, true)
      await WRITE_CONTRACT.buyTokens(ADDRESS, {
        value: inputAmountInWei,
      })
      setLoading(false)
      sl(
        'success',
        'You will receive your tokens once the transaction has been mined..'
      )
      $('input').trigger('reset')
    } catch (error) {
      console.error(error)
      sl('error', 'An error occurred. Please see the console!')
      setLoading(false)
    }
  } else {
    return
  }
}

function toggleBuyButton() {
  if (WRITE_WEB3_PROVIDER) {
    $('#connect-wallet-btn').hide()
    $('#buy-btn').show()
  } else {
    $('#connect-wallet-btn').show()
    $('#buy-btn').hide()
  }
  if (!IS_ACTIVE) {
    $('#buy-btn').text('Sale is not active')
  }
}

function setLoading(loading, txnProcessing = false) {
  LOADING = loading

  if (LOADING) {
    $('#loader').show()
    $('#content').hide()
    if (txnProcessing) {
      $('#txn-processing-msg').show()
    }
  } else {
    $('#loader').hide()
    $('#txn-processing-msg').hide()
    $('#content').show()
  }
}

function sl(type, msg) {
  Swal.fire({
    icon: type,
    text: msg,
  })
}

function toHumanizedCurrency(val) {
  if (val.toNumber) {
    return new Big(val.toString()).toFormat(2)
  }
  return new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'})
    .format(val)
    .replace('$', '')
}
