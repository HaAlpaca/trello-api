/* eslint-disable no-console */
import express from 'express'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import exitHook from 'async-exit-hook'
import { corsOptions } from './config/cors'
import cors from 'cors'
import { env } from '~/config/environment'
import { APIs_v1 } from '~/routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import cookieParser from 'cookie-parser'
import http from 'http'
import socketIo from 'socket.io'
import { inviteUserToBoardSocket } from './sockets/inviteUserToBoardSocket'
import { MoveCardToDifferentColumnSocket } from './sockets/cardSocket'
import { columnSocket } from './sockets/columnSocket'
import { START_CRON_JOB } from './config/cron'

const START_SERVER = () => {
  const app = express()
  // fix 410 (from disk cache)
  // https://stackoverflow.com/questions/22632593/how-to-disable-webpage-caching-in-expressjs-nodejs/53240717#53240717
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })
  //cau hinh cookie parser
  app.use(cookieParser())
  //cau hinh cors
  app.use(cors(corsOptions))
  // enable req.body json data
  app.use(express.json())
  //
  app.use('/v1', APIs_v1)
  //middleware xu li loi tap trung
  app.use(errorHandlingMiddleware)
  // tạo server bọc app của express để làm realtime
  const server = http.createServer(app)
  // khởi tạo socket io với server và cors
  const io = socketIo(server, { cors: corsOptions })
  io.on('connection', socket => {
    inviteUserToBoardSocket(socket)
    MoveCardToDifferentColumnSocket(socket)
    columnSocket.Create(socket)
    columnSocket.Delete(socket)
    columnSocket.Move(socket)
  })
  if (env.BUILD_MODE === 'production') {
    // dùng server.listen vì server bọc app rồi
    server.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(
        `PRODUCTION: Hi ${env.AUTHOR}, server is running successfully at PORT: ${process.env.PORT}`
      )
    })
  } else {
    // dùng server.listen vì server bọc app rồi
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      // eslint-disable-next-line no-console
      console.log(
        `DEV: Hi ${env.AUTHOR}, server is running successfully at Host: http://${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}/`
      )
    })
  }

  exitHook(() => {
    console.log('Server is shutting down...')
    CLOSE_DB()
    console.log('Disconnected from MongoDB Cloud Atlas.')
  })
}

;(async () => {
  try {
    console.log('Connecting to MongoDB Cloud Atlas...')
    await CONNECT_DB()
    console.log('Connect to MongoDB Cloud Atlas!')
    START_SERVER()
    START_CRON_JOB()
  } catch (error) {
    console.error(error)
  }
})()

// 18.16.0
