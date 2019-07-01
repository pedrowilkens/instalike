const puppeteer = require('puppeteer');
const commander = require('commander');

commander
  .version('1.0.0', '-v, --version')
  .usage('[OPTIONS]...')
  .option('-u, --username <username>', 'Your Instagram Username')
  .option('-p, --password <password>', 'Your Instagram password')
  .option('-t, --target <target>', 'The User you want to like all images of')
  .option('-s, --speed <speed>', 'The User you want to like all images of')
  .parse(process.argv);

(async () => {

  const username = commander.username;
  const password = commander.password;
  const target   = commander.target;
  const speed    = commander.speed;


  const browser = await puppeteer.launch({
    slowMo: parseInt(speed, 10),
    headless: false
  });

  const elements = {
    'userInput': 'input[name="username"]',
    'passInput': 'input[name="password"]',
    'popup': '.PdwC2',
    'login_button': 'button[type="submit"]',
    'pictures': '.v1Nh3',
    'heart': '.glyphsSpriteHeart__outline__24__grey_9',
    'red_heart': '.glyphsSpriteHeart__filled__24__red_5',
    'heart_button': '.afkep'
  };

  const pages = {
    'loginPage': 'https://www.instagram.com/accounts/login/?source=auth_switcher',
    'targetsPage': `https://www.instagram.com/${target}/`
  };

  const page = await browser.newPage();
  await page.goto(pages['loginPage']);

  const userInput = await page.waitForSelector(elements['userInput']);
  const passInput = await page.waitForSelector(elements['passInput']);
  
  await userInput.type(username);
  await passInput.type(password);

  const [response] = await Promise.all([
    page.waitForNavigation(),
    page.click(elements['login_button'])
  ]);

  await page.goto(pages['targetsPage']);
  await page.waitFor(1000);

  let pictures = await page.$$(elements['pictures'])
  let i = 0
  let red_heart

  while(true) {

    for (; i < pictures.length; i++) {
      await pictures[i].click();
      const popup = await page.waitForSelector(elements['popup']);
      const heart = await popup.$(elements['heart'])
      red_heart = await popup.$(elements['red_heart'])

      if (heart) {
        await heart.click()
      } else if (red_heart) {
        break
      }

      await page.keyboard.press('Escape');
    }

    if (red_heart) {
      break
    }

    pictures = await page.$$(elements['pictures'])
  }

  await browser.close();

})().catch((err) => {
    console.log(err)
})