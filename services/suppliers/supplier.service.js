'use strict'
import dbMixin from '../../mixins/db.mixin.js'

const SupplierService = {
  name: 'supplier',
  mixins: dbMixin('suppliers'),
  collection: 'suppliers',
  settings: {
    fields: ['name'],
    entityValidator: {
      name: { type: 'string', required: true },
    },
  },

  actions:{
    create: {
      rest: 'POST ',
      params: {
        name: { type: 'string', required: true },
      },
      auth: 'activated',
      role: 'admin',
    },
  }
}

export default SupplierService
