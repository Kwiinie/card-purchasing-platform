import crypto from 'crypto'

export function buildRequestChecksum(data, secret) {
  const params = JSON.stringify(data) + secret
  return crypto.createHash('sha256').update(params).digest('hex')
}

export function validateChecksum(req, secret) {
  const { headers, query, body } = req
  const receivedChecksum = headers['x-checksum']

  const checksum = buildRequestChecksum(req.body, secret)

  return checksum === receivedChecksum
}
