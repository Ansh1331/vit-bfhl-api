require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));

const isNumericString = (val) => {
  if (typeof val === 'number') return Number.isFinite(val) && Number.isInteger(val);
  if (typeof val !== 'string') return false;
  return /^[0-9]+$/.test(val);
};

const isAlphabeticString = (val) => {
  if (typeof val !== 'string') return false;
  return /^[A-Za-z]+$/.test(val);
};

const isSpecialOnly = (val) => {
  if (typeof val !== 'string') return false;
  return val.length > 0 && /^[^A-Za-z0-9]+$/.test(val);
};

const normalizeToString = (val) => {
  if (typeof val === 'string') return val;
  if (typeof val === 'number' && Number.isFinite(val)) return String(val);
  return String(val ?? '');
};

const buildUserId = (fullName, dob) => {
  const safeName = String(fullName || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  const safeDob = String(dob || '')
    .trim()
    .replace(/[^0-9]/g, '');
  return `${safeName}_${safeDob}`;
};

function processData(inputArray) {
  const even_numbers = [];
  const odd_numbers = [];
  const alphabets = [];
  const special_characters = [];

  let sum = 0;

  const alphaChars = [];

  for (const raw of inputArray) {
    const token = normalizeToString(raw);

    const letters = token.match(/[A-Za-z]/g);
    if (letters) alphaChars.push(...letters);

    if (isNumericString(raw)) {
      const n = typeof raw === 'number' ? raw : parseInt(token, 10);
      if (!Number.isNaN(n)) {
        if (n % 2 === 0) {
          even_numbers.push(token); 
        } else {
          odd_numbers.push(token); 
        }
        sum += n;
      }
      continue;
    }

    if (isAlphabeticString(token)) {
      alphabets.push(token.toUpperCase());
      continue;
    }

    if (isSpecialOnly(token)) {
      special_characters.push(token);
      continue;
    }

    if (token.length > 0) special_characters.push(token);
  }

  alphaChars.reverse();
  const concat_string = alphaChars
    .map((ch, idx) => (idx % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
    .join('');

  return {
    even_numbers,
    odd_numbers,
    alphabets,
    special_characters,
    sum: String(sum),
    concat_string,
  };
}

app.post('/bfhl', (req, res) => {
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

    const result = processData(data);

    return res.status(200).json({
      is_success: true,
      user_id: buildUserId(process.env.FULL_NAME || 'john doe', process.env.DOB_DDMMYYYY || '17091999'),
      email: process.env.EMAIL || 'john@xyz.com',
      roll_number: process.env.ROLL_NUMBER || 'ABCD123',
      odd_numbers: result.odd_numbers,
      even_numbers: result.even_numbers,
      alphabets: result.alphabets,
      special_characters: result.special_characters,
      sum: result.sum,
      concat_string: result.concat_string,
    });
  } catch (err) {
    return res.status(500).json({
      is_success: false,
      user_id: buildUserId(process.env.FULL_NAME || 'john doe', process.env.DOB_DDMMYYYY || '17091999'),
      email: process.env.EMAIL || 'john@xyz.com',
      roll_number: process.env.ROLL_NUMBER || 'ABCD123',
      error: 'Internal server error'
    });
  }
});


app.get("/", (_req, res) => {
  res.status(200).json({
    ok: true,
    message: "Welcome to the BFHL API",
    endpoints: {
      post_bfhl: "https://vit-bfhl-api-bit0215.vercel.app/bfhl",
    },
  });
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
