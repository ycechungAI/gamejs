const puppeteer = require('puppeteer');
const path = require('path');
const { exec } = require('child_process');

(async () => {
  const server = exec('npx http-server .');

  // Wait for the server to start
  await new Promise(resolve => setTimeout(resolve, 2000));

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  page.on('console', msg => console.log(msg.text()));

  await page.goto('http://localhost:8080/tests/runner.html');

  await page.waitForSelector('#qunit-testrunner-toolbar');

  const failedTests = await page.evaluate(() => {
    const failed = document.querySelectorAll('.fail');
    return failed.length;
  });

  const totalTests = await page.evaluate(() => {
    const total = document.querySelectorAll('.pass, .fail');
    return total.length;
  });

  console.log(`\n${totalTests} tests run, ${failedTests} failures.`);

  await browser.close();
  server.kill();

  process.exit(failedTests > 0 ? 1 : 0);
})();
