# VIT BFHL – Node.js (Express)

Implements the required `POST /bfhl` route. Returns 200 on success and includes the exact fields expected by the prompt.

## 1) Setup & Run Locally

```bash
npm install
cp .env.example .env
# Edit .env with **your** name, DOB (ddmmyyyy), email, roll number
npm run dev
# then send a request:
curl -X POST http://localhost:3000/bfhl     -H 'Content-Type: application/json'     -d '{"data":["a","1","334","4","R","$"]}'
```

## 2) Deploy to Render (free & simple)
1. Push this repo to **GitHub**.
2. Create a new **Render > Web Service**.
3. Connect the repo.
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. Add Environment Variables from your `.env` (FULL_NAME, DOB_DDMMYYYY, EMAIL, ROLL_NUMBER).
7. Deploy. Your endpoint will be: `https://<your-app>.onrender.com/bfhl`

## 3) Deploy to Railway
1. Push to **GitHub**.
2. Create a new project in **Railway** and select your repo.
3. Railway auto-detects Node. Set `PORT` var if asked.
4. Add env vars (FULL_NAME, DOB_DDMMYYYY, EMAIL, ROLL_NUMBER).
5. Deploy. Your endpoint: `https://<your-app>.up.railway.app/bfhl`

## 4) Optional – Deploy to Vercel (Serverless)
If you prefer a serverless function, create a **separate** minimal project with this structure:

```
vercel-bfhl/
├─ vercel.json
└─ api/
   └─ bfhl.js
```

**vercel.json**
```json
{
  "version": 2,
  "routes": [
    { "src": "/bfhl", "dest": "/api/bfhl" }
  ]
}
```

**api/bfhl.js**
```js
export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ is_success: false, error: 'Method Not Allowed' });
  }

  const normalizeToString = (val) => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number' && Number.isFinite(val)) return String(val);
    return String(val ?? '');
  };
  const isNumericString = (val) => {
    if (typeof val === 'number') return Number.isFinite(val) && Number.isInteger(val);
    if (typeof val !== 'string') return false;
    return /^[0-9]+$/.test(val);
  };
  const isAlphabeticString = (val) => typeof val === 'string' && /^[A-Za-z]+$/.test(val);
  const isSpecialOnly = (val) => typeof val === 'string' && val.length > 0 && /^[^A-Za-z0-9]+$/.test(val);

  const buildUserId = (fullName, dob) => `${String(fullName||'').trim().toLowerCase().replace(/\s+/g,'_')}_${String(dob||'').trim().replace(/[^0-9]/g,'')}`;

  try {
    const { data } = req.body || {};
    if (!Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        user_id: buildUserId(process.env.FULL_NAME || 'john doe', process.env.DOB_DDMMYYYY || '17091999'),
        email: process.env.EMAIL || 'john@xyz.com',
        roll_number: process.env.ROLL_NUMBER || 'ABCD123',
        error: 'Invalid payload: "data" must be an array.'
      });
    }

    const even_numbers = [], odd_numbers = [], alphabets = [], special_characters = [];
    let sum = 0; const alphaChars = [];

    for (const raw of data) {
      const token = normalizeToString(raw);
      const letters = token.match(/[A-Za-z]/g);
      if (letters) alphaChars.push(...letters);

      if (isNumericString(raw)) {
        const n = typeof raw === 'number' ? raw : parseInt(token, 10);
        (n % 2 === 0 ? even_numbers : odd_numbers).push(token);
        sum += n; continue;
      }
      if (isAlphabeticString(token)) { alphabets.push(token.toUpperCase()); continue; }
      if (isSpecialOnly(token)) { special_characters.push(token); continue; }
      if (token.length > 0) special_characters.push(token);
    }

    alphaChars.reverse();
    const concat_string = alphaChars.map((ch, i) => (i % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase())).join('');

    return res.status(200).json({
      is_success: true,
      user_id: buildUserId(process.env.FULL_NAME || 'john doe', process.env.DOB_DDMMYYYY || '17091999'),
      email: process.env.EMAIL || 'john@xyz.com',
      roll_number: process.env.ROLL_NUMBER || 'ABCD123',
      odd_numbers, even_numbers, alphabets, special_characters,
      sum: String(sum), concat_string
    });
  } catch (e) {
    return res.status(500).json({ is_success: false, error: 'Internal server error' });
  }
}
```

**Deploy**
```bash
npm i -g vercel
vercel login
vercel --prod
# Your POST endpoint will be: https://<your-vercel-app>.vercel.app/bfhl
```

## 5) Test Requests
Example A
```bash
curl -X POST "$URL/bfhl" -H 'Content-Type: application/json' -d '{"data":["a","1","334","4","R","$"]}'
```
Example B
```bash
curl -X POST "$URL/bfhl" -H 'Content-Type: application/json' -d '{"data":["2","a","y","4","&","-","*","5","92","b"]}'
```
Example C
```bash
curl -X POST "$URL/bfhl" -H 'Content-Type: application/json' -d '{"data":["A","ABcD","DOE"]}'
```

## What to Submit
- Hosted URL with `/bfhl` route
- Public GitHub repository link
