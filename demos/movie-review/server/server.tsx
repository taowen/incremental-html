import { jsxToHtml } from '@incremental-html/jsx-to-html';
import bodyParser from 'body-parser';
import express from 'express';

export const config = { indexHtml: '' }
const server = express.Router();
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.get('/', async (req, resp) => {
    const deadline = req.query.deadline === 'disabled' ? undefined : new Date().getTime() + 500;
    const loadCache = { shouldReload: false }
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
    const ctx = { deadline, loadCache };
    loadMovieReviews(ctx);
    const appHtml = await jsxToHtml(jsx, ctx);
    let indexHtml = config.indexHtml;
    if (loadCache.shouldReload) {
        indexHtml = indexHtml.replace('<!--prefetch-->', '<link id="reload" href="?deadline=disabled" rel="prefetch" use:reload="$Reload">')
    }
    indexHtml = indexHtml.replace('<!--app-html-->', appHtml);
    resp.write(indexHtml);
    resp.end();
})

async function MovieReviews(props: {}, ctx: any) {
    const movieReviews = await loadMovieReviews(ctx);
    if (movieReviews.loading) {
        return <div class="MovieReviews"><Spinner /></div>
    }
    return <div class="MovieReviews">
        {
            movieReviews.error ? 'failed to load...' : movieReviews.data.map(({ author, summary }) =>
                <div class="review"><div class="summary">{summary}</div>
                    <div class="author">{author}</div>
                </div>)
        }
    </div>
}

async function withDeadline<T>(dataPromise: Promise<T>, ctx: any): Promise<{ data: T, loading: boolean, error: any }> {
    const { loadCache, deadline } = ctx
    const result = { data: undefined as any as T, loading: undefined as any as boolean, error: undefined as any };
    dataPromise.then(data => {
        result.data = data;
    }).catch(error => {
        result.error = error;
    }).finally(() => {
        if (result.loading === undefined) {
            result.loading = false;
        }
    })
    if (deadline) {
        const deadlinePromise = new Promise<void>(resolve => setTimeout(resolve, new Date().getTime() - deadline));
        deadlinePromise.then(() => {
            if (result.loading === undefined) {
                result.loading = true
                loadCache.shouldReload = true;
            }
        })
        await Promise.race([dataPromise, deadlinePromise]);
    } else {
        await dataPromise;
    }
    return result;
}

function loadMovieReviews(ctx: any) {
    let dataPromise: ReturnType<typeof _loadMovieReviews> = ctx.loadCache['MovieReviews'];
    if (!dataPromise) {
        ctx.loadCache['MovieReviews'] = dataPromise = _loadMovieReviews();
    }
    return withDeadline(dataPromise, ctx);
}

async function _loadMovieReviews() {
    await new Promise<void>(resolve => setTimeout(resolve, 1000));
    return [{
        author: 'Nick Allen, RogerEbert.com',
        summary: 'Father Figures is not just painfully anti-charming, it is transparently desperate.'
    }]
}

function Spinner(props: {}) {
    return <div class="Spinner" style="font-size: 28px; line-height: 28px;">
        {'🌀'}
    </div>
}

export default server;