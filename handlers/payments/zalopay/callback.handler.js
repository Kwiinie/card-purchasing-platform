import getTransactionState from '../../../utils/transaction-state.util.js'

export default async function callbackZaloPay(key2, ctx) {
  let result = {}
  let dataJson

  try {
    const dataStr = ctx.params.data
    const reqMac = ctx.params.mac

    const mac = CryptoJS.HmacSHA256(dataStr, key2).toString()
    console.log('mac =', mac)

    // kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // callback không hợp lệ
      result.return_code = -1
      result.return_message = 'mac not equal'
    } else {
      // thanh toán thành công
      // merchant cập nhật trạng thái cho đơn hàng
      dataJson = JSON.parse(dataStr, key2)
      console.log("update order's status = success where app_trans_id =", dataJson['app_trans_id'])

      result.return_code = 1
      result.return_message = 'success'
      const transactionState = getTransactionState('zalopay', result.return_code)
      console.log(result)
      console.log('trang thai:', transactionState)

      ctx.call('transaction.updateTransaction', {
        transactionId: dataJson['app_trans_id'],
        transactionStatus: transactionState,
        returnMessage: result.return_message,
        responseCode: result.return_code,
        paymentDate: new Date(),
      })
    }
  } catch (ex) {
    result.return_code = 0 // ZaloPay server sẽ callback lại (tối đa 3 lần)
    result.return_message = ex.message

    const query = await ctx.call('zalopay.queryPayment', { id: dataJson['app_trans_id'] })
    const transactionState = getTransactionState('zalopay', query.return_code)
    console.log('query zalopay:', query)
    console.log('trang thai:', transactionState)
    ctx.call('transaction.updateTransaction', {
      transactionId: 'app_trans_id',
      transactionStatus: transactionState,
      returnMessage: query.return_message,
      responseCode: query.return_code,
      paymentDate: new Date(),
    })
  }

  // thông báo kết quả cho ZaloPay server
  return result
}
