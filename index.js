const puppeteer = require('puppeteer');
const program = require('commander');

program
  .version('1.0.0', '-v, --version')
  .usage('[OPTIONS]...')
  .option('-u, --username <username>', 'Your Instagram Username (required)')
  .option('-p, --password <password>', 'Your Instagram password (required)')
  .option('-t, --target <target>', 'The User you want to like all images of (required)')
  .option('-s, --speed <speed>', 'The Delay between interactions. The lower the faster (0 minimum) but be aware that instagrams ui may have problems with low delay', parseInt)
  .parse(process.argv);

(async () => {
  
  const needHelp = (!program.username || !program.password || !program.target)

  needHelp && program.outputHelp()
  needHelp && process.exit(1)

  const username = program.username 
  const password = program.password
  const target   = program.target
  const speed    = program.speed !== undefined ? program.speed : 40;


  const browser = await puppeteer.launch({
    slowMo: speed,
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
  await page.goto( pages['loginPage'] );

  const userInput = await page.waitForSelector( elements['userInput'] );
  const passInput = await page.waitForSelector( elements['passInput'] );
  
  await userInput.type(username);
  await passInput.type(password); 

 await Promise.all([
    page.waitForNavigation(),
    page.click( elements['login_button'] )
  ]).then(() => {
    console.info('Logged In')
  })

  await page.goto( pages['targetsPage'] );
  await page.waitFor(1000);

  let pictures = await page.$$( elements['pictures'] );
  let i = 0
  let red_heart

  while(true) {

    for (; i < pictures.length; i++) {
      await pictures[i].click();
      const popup = await page.waitForSelector( elements['popup'] );
      const heart = await popup.$( elements['heart'] )
      red_heart = await popup.$( elements['red_heart'] )

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

    // get all pictures also the lazy loaded once. 
    pictures = await page.$$( elements['pictures'] )
  }

  await browser.close();

})().catch((err) => {
    console.error(err)
})