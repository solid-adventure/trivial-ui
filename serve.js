const http = require('http');
const express = require('express')
const serve = express()
const fs = require('fs');
const enforce = require('express-sslify')
const cookieParser = require('cookie-parser')
const request = require('request');
let dotEnvConfig = require('dotenv').config();
const dotEnv = dotEnvConfig["parsed"]
const Session = require(`${__dirname}/Session.js`)
const createError = require('http-errors')

const {
  // ActionCreator,
  ActionInput,
  AppBuilder,
  AppManager,
  AppTemplate,
  APISpec,
  FeatureManager,
  UpdateManager,
  OAuth2Manager,
  Redactions
} = require('trivial-core')
const pino = require('pino')
const pinoHttp = require('pino-http')
const WebSocketServer = require('websocket').server
// const ActionCreator = require('./lib/ActionCreator')
const { encoding_for_model } = require("@dqbd/tiktoken");
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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

serve.use(express.static('public'))
serve.set('views', __dirname + '/public/views/');
serve.engine('html', require('ejs').renderFile);
serve.use(cookieParser(process.env.COOKIE_SIGNATURE))
serve.use((req, res, next) => {
  res.locals.featureSettings = FeatureManager.envSettings()
  next()
})


// Writes an app and downloads a .zip archive
const download = async (req, res) => {
  try {
    let builder = new AppBuilder(req.params.id, {req})
    const archiveData = await builder.createDownload(
      await AppManager.currentManifest(req.params.id, req)
    )
    res.attachment(`${req.params.id}-${new Date().toISOString().replace(/[-:.]+/g, '')}.zip`)
    res.send(archiveData)
  } catch (err) {
    req.log.error({err}, `[download] Could not build app '${req.body.app_id}'`)
    res.sendStatus(500)
  }
}

// Writes an app directly to the filesystem for local development
const writeLocally = async (req, res) => {
  try {
    let builder = new AppBuilder(req.body.app_id, {
      template: req.body.template,
      version: req.body.version,
      req: req
    })
    await builder.writeLocally(req.body)
    res.sendStatus(200)
  } catch (err) {
    req.log.error({err}, `[writeLocally] Could not build app '${req.body.app_id}'`)
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

const initialManifest = async (req, res) => {
  try {
    let template = new AppTemplate(req.query.template, req.query.version, req.query.initial_manifest)
    let manifest = await template.initialManifest()
    req.log.debug({manifest}, 'initial manifest')
    res.json(manifest)
  } catch (err) {
    req.log.error({err}, '[initialManifest] Failed to load initial manifest')
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

const performAction = async (req, res) => {

  let Action
  try {
    Action = require(`trivial-core/lib/actionsv2/actions/${req.params.service}/${req.params.action}/Action`)
  } catch (err) {
    req.log.error({err}, `[performAction] Require Failed ${err}`)
  }

  try {
    let input = new ActionInput({config: req.body.config, values: {payload: req.body.payload}})
    let action = new Action(input)
    await action.perform()
    res.send({body: action.output._values.payload, status: action.output._values.payload.status})
  } catch (err) {
    req.log.error({err}, `[performAction] Failed ${err}`)
    res.sendStatus(500)
  }
}

serve.post('/actions/:service/:action/perform', Session.validate, (req, res) => {
  performAction(req, res)
})

serve.post('/suggestionTokens', Session.validate, (req, res) => {
  const enc = encoding_for_model(req.body.model)
  const tokens = enc.encode(req.body.prompt).length
  res.status(200).json({tokens: tokens})
})

serve.post("/suggestionStream", Session.validate, (req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // flush the headers to establish SSE with client
  if (req.body.model === 'gpt-3.5-turbo') {
    return suggestionChat(req, res)
  }
  return suggestion(req, res)
});

serve.post("/suggestionChatStream", Session.validate, (req, res) => {
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // flush the headers to establish SSE with client
  return suggestionChat(req, res)
});

const suggestion = (req, res) => {
  try {
    const response = openai.createCompletion(req.body, { responseType: 'stream' });
    response.then((resp) => {
        resp.data.on("data", (data) => {
          // console.log(`[DATA] ${data.toString()}`); // TEMP DEBUG
          const lines = data
            .toString()
            .split("\n")
            .filter((line) => line.trim() !== "");
          for (const line of lines) {
            const message = line.replace(/^data: /, "");
            if (message === "[DONE]") {
              res.end();
              return;
            }
            const parsed = JSON.parse(message);
            res.write(JSON.stringify(parsed.choices[0])+'\n');
          }
        });
        resp.data.on("end", (end) => {
          console.log(end);
        });
      })
      .catch((e) => {
        res.end(
          JSON.stringify({ 
            error: e.response.statusText,
            code: e.response.status,
          })
        );
      });
  } catch (e) {
    console.log('[suggestionStream Failed]}', e);
    res.end(JSON.stringify({ error: e.message, code: 500 }));
  }
}

const suggestionChat = (req, res) => {
  try {
    const response = openai.createChatCompletion({
      messages: [{role: 'user', content: req.body.prompt}],
      model: req.body.model,
      max_tokens: req.body.max_tokens,
      temperature: req.body.temperature,
      top_p: req.body.top_p,
      presence_penalty: req.body.presence_penalty,
      frequency_penalty: req.body.frequency_penalty,
      stop: req.body.stop,
      stream: true
    }, { responseType: 'stream' });
    response.then((resp) => {
        // Send space char to format response correctly
        res.write('{"text": " "}\n\n') 
        resp.data.on("data", (data) => {
          try {
          // console.log(`[DATA] ${data.toString()}`); // TEMP DEBUG
            const lines = data
              .toString()
              .split("\n")
              .filter((line) => line.trim() !== "");
            for (const line of lines) {
              const message = line.replace(/^data: /, "");
              if (message === "[DONE]") {
                res.end();
                return;
              }
              const parsed = JSON.parse(message);
              if (!parsed.choices[0].delta.content) continue
              const chunk = {
                text: parsed.choices[0].delta.content,
              }
              res.write(JSON.stringify(chunk)+'\n\n');
            }
          } catch (e) {
            console.log('[suggestionStream Parsing Error]', e)
          }
        });
        resp.data.on("end", (end) => {
          console.log(end);
        });
      })
      .catch((e) => {
        res.end(
          JSON.stringify({ 
            error: e.response.statusText,
            code: e.response.status,
          })
        );
      });
  } catch (e) {
    console.log('[suggestionStream Failed]}', e);
    res.end(JSON.stringify({ error: e.message, code: 500 }));
  }
}

serve.post('/suggestion', Session.validate, (req, res) => {
  request({
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    url: new URL("https://api.openai.com/v1/completions"),
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

serve.post('/suggestionChat', Session.validate, (req, res) => {
  request({
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    url: new URL("https://api.openai.com/v1/chat/completions"),
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

serve.post('/correction-log', Session.validate, (req, res) => {
  let state = req.body.state
  let query = req.body.query
  let path = `./tmp/correction-log`
  fs.promises.mkdir(path, {recursive: true})
  .then(x => fs.promises.writeFile(`${path}/${state}.sql`, query))
  .catch(e => console.log(`[correction-log] ${e}`))
})

serve.post('/correction', Session.validate, (req, res) => {
  request({
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    url: new URL("https://api.openai.com/v1/edits"),
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

// const actionCreatorPaths = function() {
//   serve.get('/actions', Session.validate, (req,res) => {
//     res.render('actions.html')
//   })

//   serve.post('/actions', Session.validate, (req, res) => {

//     let actionCreator = new ActionCreator(req.body.service, req.body.action, req.body.template)
//     actionCreator.build()
//     .then(response => { handleResponse(response) })
//     .catch(error => { handleResponse(error) })

//     function handleResponse(out) {
//       if (out.error) {
//         res.send({status: 500, body: out.error})
//       } else if (out.success) {
//         res.send({status: 200, body: out.success})
//       }
//     }

//   })
// }

// if ('development' === process.env.NODE_ENV) {
//   actionCreatorPaths()
// }

serve.post('/build', (req, res) => {
	build(req, res)
})


serve.post('/writeLocally', (req, res) => {
  writeLocally(req, res)
})

serve.delete('/build/:id', (req, res) => {
  teardown(req, res)
})

// Get request redirects to POST via client side JS to prevent eager-loading triggering downloads
serve.get("/downloadFile/", (req, res) => {
  res.render('downloadFile.html', {url: req.query.u})
})

// /downloadFile?u=https://www.file-to-download.com/path/file.txt
serve.post("/downloadFile/", (req, res) => {
  console.log`[POST] downloadFile`
  let url = req.query.u

  request({
    url: new URL(url)},
    (error, response, body) => {
      let path = `./tmp/downloads`
      let file = `trivial_${Date.now()}.zpl`
      fs.promises.mkdir(path, {recursive: true})
      .then(x => fs.promises.writeFile(`${path}/${file}`, body))
      .then(x => res.download(`${path}/${file}`))    
      .catch(console.error)
    }
  )


});

serve.get('/download/:id', download)

serve.get('/manifest', initialManifest)

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

serve.get('*', Session.validate, (req, res) => {
  res.render('main.html', {
    analytics_id: process.env.ANALYTICS_ID,
    app_id: 'TrivialBuilder'
  })
});


const httpServer = serve.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}/`);
});

// Web Socket
const wsServer = new WebSocketServer({httpServer, autoAcceptConnections: false})
wsServer.on('request', request => UpdateManager.handleRequest(request, expressLogger.logger))
