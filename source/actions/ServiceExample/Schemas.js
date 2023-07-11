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


// To make these definitions available to your action, you must add refrences to this file in
// source/lib/TrivialSchemas.js

// Add this line:
// const ServiceExample = require('./actionsv2/actions/ServiceExample/Schemas')

// And this to the TrivialSchemas definition:
//   ...ServiceExample,
