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
                    <h1>Father Figures</h1>
                    <div>
                        <div>
                            <h3>Tomatometer</h3>🤢22%</div>
                        <div>
                            <h3>Critics Consensus</h3>No consensus yet.
                        </div>
                    </div>
                    <MovieReviews />
                </div>
            </div>
        </div>
    </div>
    resp.write(config.indexHtml.replace('<!--app-html-->', await jsxToHtml(jsx)));
    resp.end();
})

function MovieReviews() {
    return <div class="MovieReviews">
        {/* <div class="review"><div class="summary">Father Figures is not just painfully anti-charming, it is transparently desperate.</div>
            <div class="author">Nick Allen, RogerEbert.com</div>
        </div> */}
        <Spinner />
    </div>
}

function Spinner() {
    return <div class="Spinner" style="font-size: 28px; line-height: 28px;">
        {'🌀'}
    </div>
}

export default server;