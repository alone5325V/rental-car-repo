const mongoose = require('mongoose')

const connectDB = async () => {
    try{
        const conn = await mongoose.connect('')

        console.log(`MongooDB connected: ${conn.connection.host}`)
    } catch(err){
        console.error(`Error: ${err}`)
        process.exit(1)
    }
}