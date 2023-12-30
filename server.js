import express from 'express'
import { adminRoutes, usersRoutes } from './routes/bankRoutes.js' 
import cors from 'cors'
import { errorHandler } from './middleware/errorMiddleware.js'

const app = express()

// cors middleware
app.use(cors())

// Middleware for json parsing 
app.use(express.json());

// bank routes
app.use('/users' , usersRoutes )
app.use('/admin' , adminRoutes)

app.use(errorHandler)

const port = process.env.PORT || 3000 
app.listen(port , () => {
    console.log('server is Listening to ' , port)
})


