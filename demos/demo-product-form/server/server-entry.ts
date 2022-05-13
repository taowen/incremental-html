import express from 'express';
import handle from './server';
import path from 'path';

const server = express()
server.use('/client', express.static(path.join(__dirname, 'client')))
server.use(handle);
server.listen(3000, () => {
    console.log('http://localhost:3000')
});