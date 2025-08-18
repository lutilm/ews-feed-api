import axios from 'axios';
import Cors from 'cors';
import initMiddleware from '../../lib/init-middleware';

// Initialize the cors middleware
const cors = initMiddleware(
    Cors({
        // Only allow requests with GET, POST and OPTIONS
        methods: ['GET', 'POST', 'OPTIONS'],
        origin: (process.env.CORS??'*').split(',').map(x=>x.trim()),
    })
);

// Replace with your actual environment variables
const FEEDLY_CLIENT_ID = process.env.FEEDLY_CLIENT_ID;
const FEEDLY_REFRESH_TOKEN = process.env.FEEDLY_REFRESH_TOKEN;
const API_KEYS = (process.env.API_KEYS ?? '').split(',').map(keyline => { const [key, value] = keyline.split('=>').map(x => x.trim()); return { [key]: value }; }).reduce((obj, item) => ({ ...obj, ...item }), {});
const FEEDLY_STREAMS = (process.env.FEEDLY_STREAMS ?? '').split(',').map(x => x.trim(x));
const DEBUG = process.env.DEBUG === 'true';

/*
    {
      '2737bea7-b386-4ab6-970a-403b26041889': 'test1',
    },

    { "id": "user/f1be1821-9b86-4ab9-aafb-b3ef71090f21/category/16f55145-d5da-4ddb-847c-5e605e431e7a", "type": "stream"},  // watchilist vulns
    { "id": "user/f1be1821-9b86-4ab9-aafb-b3ef71090f21/category/Vulns", "type":"stream"},  // Intel vulns
*/

// Example configuration, replace with actual logic
const config = {
    keys: API_KEYS,
    feedly: {
        'test1': {
            refreshToken: `${FEEDLY_REFRESH_TOKEN}`
        }
    },
    items: {
        'test1': FEEDLY_STREAMS.map(x => { return { id: x, type: 'stream' } })
    }
};

async function getFeedlyAuthToken(refreshToken) {
    try {
        const response = await axios.post('https://api.feedly.com/v3/auth/token', {
            client_id: FEEDLY_CLIENT_ID,
            refresh_token: refreshToken,
            grant_type: "refresh_token"
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching Feedly auth token:', error);
        return null;
    }
}


async function parseFeedlyData(items, options) {
    options = options ? options : {}
    var enrich = options.enrich ? true : false;
    var debug = options.debug ? true : false;
    var iii = Array.isArray(items) ? items : [items]
    var res = iii.map(function (raw) {
        const content_html = ((raw.content || {}).content || '')
        if (debug) { console.log(`[-] raw item `, JSON.stringify(raw)) }
        var obj = {
            title: raw.title,
            //keywords: raw.keywords,
            url: raw.canonicalUrl || (raw.canonical ? raw.canonical[0] || [{}] : [{}]).href,
            //origin: (raw.origin || {}).htmlUrl,
            crawled: new Date(raw.crawled).toISOString(),
            published: new Date(raw.published).toISOString(),
            //content_html: content_html,
            content_txt: content_html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' '),
        };
        if (debug) { console.log(`[-] parsed object`, JSON.stringify(obj)) }
        return obj
    });
    return res;
}
async function fetchFeedlyData(terms, items, authToken, options) {
    try {
        const response = await axios.post(`https://feedly.com/v3/search/contents?count=${options.count??30}&newerThan=${new Date(new Date().getTime()-1000*60*60*(options.last??12)).getTime()}`, {
            layers: [
                { parts: terms.map(text => ({ text: text.toLowerCase() })), type: "matches", salience: "mention" }
            ],
            source: { items }
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const res = await parseFeedlyData(response.data.items, { debug: DEBUG });

        return res;
    } catch (error) {
        console.error('Error fetching data from Feedly:', error);
        return null;
    }
}
/*
Returns:
* [ { title: 'December 2023 Microsoft Patch Tuesday fixed 4 critical flaws',
    url: 'https://securityaffairs.com/155719/security/microsoft-patch-tuesday-december-2023.html',
    crawled: '2023-12-13T09:05:18.600Z',
    published: '2023-12-13T08:18:10.000Z',
    content_txt: 'Microsoft Patch Tuesday security ... ' },
 */
export default async function handler(req, res) {

    await cors(req, res);


    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { terms, last, count } = req.query;
    const key = req.headers['X-API-KEY']|| req.headers['x-api-key'];

    

    // Validate key and terms
    if (!key || !terms) {
        return res.status(400).json({ error: 'Missing key or terms', datasent:req.headers});
    }

    if (!config.keys[key]) {
        return res.status(401).json({ error: 'Invalid key' });
    }
    const termsArray = terms.split(',').map(decodeURIComponent);

    console.log(`[+] processing request for key "${key}" with terms "${termsArray}" (last=${last},count=${count})`);

    const feedlyConfig = config.feedly[config.keys[key]];
    const feedlyItems = config.items[config.keys[key]];
    const authToken = await getFeedlyAuthToken(feedlyConfig.refreshToken);

    if (!authToken) {
        return res.status(500).json({ error: 'Failed to authenticate the backend services' });
    }

    const feedlyResponse = await fetchFeedlyData(termsArray, feedlyItems, authToken, { last:last, count:count});

    // Process the Feedly response as needed
    // ...

    res.status(200).json(  feedlyResponse );
}
