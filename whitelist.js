let _addressList = [
  '0x4430b3230294D12c6AB2aAC5C2cd68E80B16b581',
  '0x90F729F31e20C58b93A7092f1e10bdAE9CC4d82B',
  '0x107830BC52E2FC449336F8Fd039939c841d4131C'
]

$(async () => {
  $('#loader').hide()
  $('#content').show()
  $('#input-address').keyup(checkWhitelistStatus)
})

async function checkWhitelistStatus() {
  let inputAddress = $('#input-address').val()
  if (inputAddress) {
    const isWhiteListed = _addressList.includes(inputAddress)
    if (isWhiteListed) {
      //whitelisted
      $('#whitelist-status').html("Accepted for whitelist.")
      $('#whitelist-status').removeClass('cta-btn-blue').addClass('cta-btn-green')
    }
    else {
      //sl('success', 'Your wallet is not whitelisted.')
      $('#whitelist-status').html("Your wallet is not whitelisted.")
      $('#whitelist-status').removeClass('cta-btn-green').addClass('cta-btn-blue')
    }
  } else {
    $('#input-address').val('')
  }
}

function sl(type, msg) {
  Swal.fire({
    icon: type,
    text: msg,
  })
}
