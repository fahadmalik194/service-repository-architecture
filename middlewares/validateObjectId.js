const mongoose = require('mongoose')
const validationDebugger = require('debug')('app:validationId')
const Util = require('../utils/Util')

module.exports = function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    validationDebugger('Not a valid object id..')
    return res.send(Util.getBadRequest('Not a valid object id..'))
  }
  next()
}
