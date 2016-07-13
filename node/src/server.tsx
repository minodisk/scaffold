import * as express from 'express'
import * as morgan from 'morgan'

const SSR_PORT = process.env.SSR_PORT;

const app = express();

app.use(morgan('short'))

app.get('/', function (req, res) {
  res.send(`
<html>
  <head>
  </head>
  <body>
    what?
    <div id="root"></div>
    <script src="/assets/client.js"></script>
  </body>
</html>
`);
});

app.listen(SSR_PORT, function () {
  console.log(`[SSR] listening on port ${SSR_PORT}`);
});
