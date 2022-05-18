import { jsxToHtml } from '@incremental-html/jsx-to-html';
import bodyParser from 'body-parser';
import express from 'express';

export const config = { indexHtml: '' }
const server = express.Router();
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.get('/', async (req, resp) => {
    const jsx = <div>
        <div><button class="onBack">👈</button>
            <div>
                <div class="MovieDetails"><div class="MoviePoster">
                    <img src="/img/father-figures.png" alt="poster" /></div>
                    <h1>Father Figures</h1><div><div>
                        <h3>Tomatometer</h3>🤢22%</div><div>
                            <h3>Critics Consensus</h3>No consensus yet.</div></div></div><div class="MovieReviews">
                    <div class="review"><div class="summary">Father Figures is not just painfully anti-charming, it is transparently desperate.</div>
                        <div class="author">Nick Allen, RogerEbert.com</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    resp.write(config.indexHtml.replace('<!--app-html-->', await jsxToHtml(jsx)));
    resp.end();
})

export default server;