const express = require('express');
const router = express.Router();
const path = require('path');

// gets path to the correct file for a page
// work-around for inability to set 'views' path for router
function loc(p) {
    return path.join(__dirname, `views/pages/aac${p}`);
}

// define the home page route
router.get('/', function (req, res) {
  res.render(loc('/index'));
});

// define the demo page route
router.get('/demo', function (req, res) {
  res.render(loc('/demo'));
});

module.exports = router;