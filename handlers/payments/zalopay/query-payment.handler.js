import axios from 'axios'
import qs from 'qs'

export default async function queryZaloPayment(ctx) {
  try {
    const { app_id, key1, query } = this.settings
    const app_trans_id = ctx.params.id
    const postData = {
      app_id: parseInt(app_id),
      app_trans_id,
    }
    const data = `${postData.app_id}|${postData.app_trans_id}|${key1}`
    postData.mac = CryptoJS.HmacSHA256(data, key1).toString()

    const response = await axios.post(query, qs.stringify(postData), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  } catch (error) {
    this.logger.error('Error while getting payment status from ZaloPay:', error)
    throw error
  }
}
