import axios from 'axios'
import moment from 'moment'
import CryptoJS from 'crypto-js'

async function createZaloPayPayment(ctx) {
  const { amount, orderInfo } = ctx.params
  console.log('aaaaaa', typeof amount, typeof orderInfo)
  try {
    const { app_id, key1, key2, endpoint, callbackUrl } = this.settings
    const embed_data = {}
    const items = []
    const transID = Math.floor(Math.random() * 1000000)
    const order = {
      app_id: parseInt(app_id),
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: 'user123',
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: amount,
      description: orderInfo,
      bank_code: 'zalopayapp',
      callback_url: callbackUrl,
    }
    console.log('order', order)
    const data =
      order.app_id +
      '|' +
      order.app_trans_id +
      '|' +
      order.app_user +
      '|' +
      order.amount +
      '|' +
      order.app_time +
      '|' +
      order.embed_data +
      '|' +
      order.item
    order.mac = CryptoJS.HmacSHA256(data, key1).toString()

    const response = await axios.post(endpoint, null, { params: order })
    return {
      order: order,
      response: response.data,
    }
  } catch (error) {
    this.logger.error('Error while creating payment request to ZaloPay:', error)
    throw error
  }
}

export default createZaloPayPayment
