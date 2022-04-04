import express, { Express, Request, Response } from "express"
import dotenv from 'dotenv'


// Configuration the .env file
dotenv.config()

// Create Express APP
const app: Express = express();
const port: string | number = process.env.PORT || 8000;

// Define the first Route of APP
app.get('/', (req: Request, res: Response) => {
    const data = {
        message: 'Goodbye, world'
    }
    res.send(data)
})


// Execute APP and Listen Requests to PORT
app.listen(port, () => {
    console.log(`EXPRESS SERVER: Running at http://localhost:${port}`)
})
