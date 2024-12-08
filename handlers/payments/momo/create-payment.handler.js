import axios from 'axios'
import crypto from 'crypto'

export default async function createMomoPayment(ctx) {
  const { amount, orderInfo } = ctx.params
  try {
    const { accessKey, secretKey, redirectUrl, ipnUrl } = this.settings
    var partnerCode = 'MOMO'
    var orderId = partnerCode + new Date().getTime()
    var extraData = ''
    var requestId = orderId
    var requestType = 'payWithMethod'
    var lang = 'vi'
    var autoCapture = true
    var orderGroupId = ''

    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    var rawSignature =
      'accessKey=' +
      accessKey +
      '&amount=' +
      amount +
      '&extraData=' +
      extraData +
      '&ipnUrl=' +
      ipnUrl +
      '&orderId=' +
      orderId +
      '&orderInfo=' +
      orderInfo +
      '&partnerCode=' +
      partnerCode +
      '&redirectUrl=' +
      redirectUrl +
      '&requestId=' +
      requestId +
      '&requestType=' +
      requestType
    //puts raw signature
    console.log('--------------------RAW SIGNATURE----------------')
    console.log(rawSignature)
    //signature
    var signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex')
    console.log('--------------------SIGNATURE----------------')
    console.log(signature)

    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      orderGroupId: orderGroupId,
      signature: signature,
    })

    const options = {
      method: 'POST',
      url: 'https://test-payment.momo.vn/v2/gateway/api/create',
      headers: {
        'Content-Type': 'application/json',
      },
      data: requestBody,
    }
    let result
    try {
      result = await axios(options)
      console.log(result.data)
      return result.data
    } catch (error) {
      console.error('Error while making request to Momo API:', error)
    }
  } catch (error) {
    this.logger.error('Error while creating payment request to momo:', error)
    throw error
  }
}
