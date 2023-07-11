const {
    schema,
    arrayOf
  } = require('../../../schema-utils')

  const ServiceExampleField = schema({fields: {
  }})
  
  module.exports.ServiceExampleRecord = schema({fields: {
    id: {type: String, required: true, example:"this will be prefilled", placeholder:"shadow text when empty", help:"Tooltip on what to enter here."},
    fields: {type:arrayOf(ServiceExampleField), required:true}
    }})