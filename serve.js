import express from 'express'
const serve = express()
import enforce from 'express-sslify'
import cookieParser from 'cookie-parser'
import request from 'request'
import dotenv from 'dotenv'
const dotEnvConfig = dotenv.config()
const dotEnv = dotEnvConfig["parsed"]
import createError from 'http-errors'
import ejs from 'ejs'
import path from 'path';
const __dirname = path.resolve();

import TrivialCore from 'trivial-core'
const AppBuilder = TrivialCore.AppBuilder
const AppTemplate = TrivialCore.AppTemplate
const APISpec = TrivialCore.APISpec
const FeatureManager = TrivialCore.FeatureManager
const UpdateManager = TrivialCore.UpdateManager
const OAuth2Manager = TrivialCore.OAuth2Manager
const Redactions = TrivialCore.Redactions

import pino from 'pino'
import pinoHttp from 'pino-http'

const port = process.env.PORT || 3000;
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {paths: Redactions.paths}
})
UpdateManager.defaultLogger = logger
const expressLogger = pinoHttp({ logger })


serve.use(expressLogger)
serve.use((req, res, next) => {
  // don't log the full request on every subsequent log invocation
  req.log = expressLogger.logger.child({req: {id: req.id}})
  next()
})

if ('production' === process.env.NODE_ENV) {
  serve.use(enforce.HTTPS({trustProtoHeader: true}))
}

serve.use(express.json({limit: '5mb'}));

serve.use(express.static('dist'))
serve.set('views', __dirname + '/dist');
serve.engine('html', ejs.renderFile);
serve.use(cookieParser())
serve.use((req, res, next) => {
  res.locals.featureSettings = FeatureManager.envSettings()
  next()
})


// Writes an app and downloads a .zip archive
const download = async (req, res) => {
  try {
    let builder = new AppBuilder(req.params.id, {req})
    const manifestContent = JSON.parse(req.body.manifest.content)
    const archiveData = await builder.createDownload(manifestContent)
    res.attachment(`${req.params.id}-${new Date().toISOString().replace(/[-:.]+/g, '')}.zip`)
    res.send(archiveData)
  } catch (err) {
    req.log.error({err}, `[download] Could not build app '${req.body.app_id}'`)
    res.sendStatus(500)
  }
}

// Writes an app to an AWS Lambda
const build = async (req, res) => {
  try {
    let builder = new AppBuilder(req.body.app_id, {
      template: req.body.template,
      version: req.body.version,
      req: req
    })
    await builder.build(req.body)
    res.sendStatus(200)
  } catch (err) {
    req.log.error({err}, `[build] Could not build app '${req.body.app_id}'`)
    res.sendStatus(500)
  }
}

const teardown = async (req, res) => {
  try {
    let builder = new AppBuilder(req.params.id, {req: req})
    await builder.teardown()
    res.sendStatus(200)
  } catch (err) {
    req.log.error({err}, `[teardown] Failed to tear down app '${req.params.id}'`)
    res.sendStatus(500)
  }
}

const authorizationUrl = async (req, res) => {
  try {
    const mgr = new OAuth2Manager(req, req.params.token)
    const url = await mgr.buildAuthorizationUrl()
    res.json({url})
  } catch (err) {
    req.log.error({err}, `[authorizationUrl] Failed to build authorization url for token ${req.params.token}`)
    res.sendStatus(500)
  }
}

const retrieveCode = async (req, res) => {
  try {
    const mgr = new OAuth2Manager(req, req.query.state)
    const url = await mgr.requestAccessToken()
    res.redirect(url)
  } catch (err) {
    req.log.error({err}, `[retrieveCode] Failed to retrieve auth code for state ${req.query.state}`)
    res.sendStatus(500)
  }
}

const callProtocol = async (req, res) => {
  try {
    const mgr = new OAuth2Manager(req)
    const result = await mgr.proxyProtocolRequest()
    res.json(result)
  } catch (err) {
    req.log.error({err}, `[callProtocol] Failed to invoke protocol`)
    res.sendStatus(500)
  }
}

serve.post('/apps/call', (req, res) => {
  request({
    url: new URL(req.query.url),
    method: 'post',
    json: req.body
  },
    (error, response, body) => {
      if (error) {
        res.status(500).json({error: error})
      } else {
        res.status(response.statusCode).send(response)
      }
    })
})

serve.post('/build', (req, res) => {
	build(req, res)
})

serve.delete('/build/:id', (req, res) => {
  teardown(req, res)
})

serve.post('/download/:id', download)

serve.get('/oauth2/skip_authorization', retrieveCode)

serve.get('/oauth2/authorization_request/:token', authorizationUrl)

serve.get('/oauth2/authorization_response', retrieveCode)

serve.post('/protocol/:credentialSetId/:protocolMethod', callProtocol)

serve.post('/proxy/:service/cookies', (req, res) => {
  const serviceSpec = new APISpec(req.service)
  serviceSpec.setCookies(res, req.body)
  res.status(204).json({success: true});
})

// Begin Proxy Section
// TODO Make a module out of proxy section and import
serve.param('service', (req, res, next, id) => {
  if (req.service = id) {
    next();
  } else {
    next(createError(404, 'failed to find service'));
  }
});

serve.all('/proxy/:service', (req, res) => {
  const serviceSpec = new APISpec(req.service)

  let serviceReq = null
  if (req.method.toUpperCase() == 'PUT' || req.method.toUpperCase() == 'POST') {
	  serviceReq = serviceSpec.createRequest({body: req.body})
  } else {
	  serviceReq = serviceSpec.createRequest(req.query)
  }
  serviceReq.method = req.method


  serviceSpec.injectCredentials(req, serviceReq)
  // req.log.debug({proxyRequest: serviceReq}, 'proxy request')
  request(serviceReq,
  (error, response, body) => {
    // req.log.debug({
    //   err: error,
    //   proxyResponse: {
    //     status: response && response.statusCode ? response.statusCode : undefined,
    //     body: body
    //   }
    // }, 'proxy response')

    if (error) {
      let code = (response && response.statusCode) ? response.statusCode : 500
      return res.status(code).json({ type: 'error', statusCode: code, body: body });
    }
    try {
      serviceSpec.setSpecHeaders(res, response.headers)
      res.status(response.statusCode).json(JSON.parse(body));
    } catch {
      res.status(response.statusCode).send(body)
    }
  })
})
// End Proxy Section

serve.get('*', (req, res) => {
  res.render('index.html')
});

const httpServer = serve.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}/`);
});

