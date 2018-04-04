/*eslint no-console: "warn"*/
'use strict';

const express = require('express');
const app = express();

app.use(express.static('public'))

app.get('/', (req, res) => res.send('Hello world'));

app.listen(3000, () => console.log('Hello! Listening on port 3000!'));