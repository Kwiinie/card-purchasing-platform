'use strict'

import ApiGateway from 'moleculer-web'
import { buildRequestChecksum, validateChecksum } from '../utils/checksum.util.js'
import { validate } from 'uuid'
import _ from 'lodash'
const { UnAuthorizedError } = ApiGateway.Errors

import jwt from 'jsonwebtoken'

const ApiService = {
  name: 'api',
  mixins: [ApiGateway],
  settings: {
    port: process.env.PORT,
    ip: '0.0.0.0',
    routes: [
      {
        path: '/api',

        async onBeforeCall(ctx, route, req, res) {
          if (req.$action.name.startsWith('$node') || req.$action.name.endsWith('callback')) {
            return
          }

          const apiSecret = process.env.API_SECRET
          const checksum = validateChecksum(req, apiSecret)
          if (!checksum) {
            throw new Error('Invalid checksum')
          }
        },

        whitelist: ['**'],

        mergeParams: true,

        authentication: true,

        authorization: true,

        autoAliases: false,

        aliases: {
          'POST user/register': 'user.register',
          'PATCH user/activate': 'user.activate',
          'POST user/resend-otp': 'user.resendOTP',
          'PATCH user/affiliate-status': 'user.activateAffiliate',
          'POST user/login': 'user.login',

          'POST card/': 'card.create',
          'PATCH card/update-quantity': 'card.updateQuantity',

          'POST supplier/': 'supplier.create',

          'POST order/:affiliateCode?': 'order.create',
          'POST order/request': 'order.requestOrders',
          'GET order/findOrders': 'order.findOrders',

          'POST transaction/': 'transaction.create',

          'POST zalopay/callback': 'zalopay.callback',
          'POST zalopay/payment/:id': 'zalopay.queryPayment',

          'POST momo/callback': 'momo.callback',
          'POST momo/payment/:id': 'momo.queryPayment',
        },

        callOptions: {},

        bodyParsers: {
          json: {
            strict: true,
            limit: '1MB',
          },
          urlencoded: {
            extended: true,
            limit: '1MB',
          },
        },

        mappingPolicy: 'all',
        logging: true,
      },
    ],
    assets: {
      folder: 'public',
    },

    log4XXResponses: false,
    logRequestParams: true,
    logResponseData: true,
  },
  methods: {
    async authorize(ctx, route, req) {
      const token = req.headers['authorization']?.split(' ')[1] // Get token from the Authorization header

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET)

          ctx.meta.user = decoded
          ctx.meta.token = token

          if (req.$action.auth === 'not-activated' && ctx.meta.user.isActivated === true) {
            throw new UnAuthorizedError('User is already activated', 401)
          }

          if (req.$action.auth === 'activated' && ctx.meta.user.isActivated === false) {
            throw new UnAuthorizedError('User is not activated', 401)
          }

        } catch (err) {
          throw new Error('Invalid or expired token')
        }
      } else {
        if (req.$action.auth === 'required' && !ctx.meta.user) {
          throw new UnAuthorizedError('Unauthorized access', 401)
        }
      }

      const requiredRoles = req.$action.role
      if (requiredRoles) {
        const userRoles = ctx.meta.user.role
        if (requiredRoles.includes(userRoles)) {
          return
        } else {
          throw new UnAuthorizedError('Unauthorized access', 401)
        }
      }
    },
  }

}

export default ApiService
