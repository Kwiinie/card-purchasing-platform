import axios from 'axios'
import crypto from 'crypto'

export default async function queryMomoPayment(ctx) {
  const orderId = ctx.params.id
  console.log('aaaaaaa', ctx.params.id)
  console.log('sadfasd', orderId, typeof orderId)
  const { accessKey, secretKey } = this.settings
  var partnerCode = 'MOMO'
  var lang = 'vi'
  var requestId = orderId

  var rawSignature =
    'accessKey=' +
    accessKey +
    '&orderId=' +
    orderId +
    '&partnerCode=' +
    partnerCode +
    '&requestId=' +
    requestId
  console.log(rawSignature)
  var signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex')

  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    requestId: requestId,
    orderId: orderId,
    signature: signature,
    lang: lang,
  })

  console.log(requestBody)

  const options = {
    method: 'POST',
    url: 'https://test-payment.momo.vn/v2/gateway/api/query',
    headers: {
      'Content-Type': 'application/json',
    },
    data: requestBody,
  }

  let result = await axios(options)

  return result.data
}
