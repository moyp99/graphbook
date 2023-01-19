import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import compress from 'compression';
import { fileURLToPath } from 'url';

import services from './services/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
if(process.env.NODE_ENV === 'production') {
    app.use(helmet());
    app.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "*.amazonaws.com"]
        }
    }));
    app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
}

app.use(compress());
app.use(cors());

const serviceNames = Object.keys(services);
for (let i = 0; i < serviceNames.length; i += 1) {
    const name = serviceNames[i];
    if (name === 'graphql') {
        (async () => {
            await services[name].start();
            services[name].applyMiddleware({ app });
        })();
    } else {
        app.use(`/${name}`, services[name]);
    }
}

app.get('/', function (req, res, next) {
    const random = Math.random() * (10 - 1) + 1;
    if (random > 5) next('route');
    else next()
}, function (req, res, next) {
    res.send('first');
})

app.listen(8080, ()=> console.log("hello from port:", 8080))