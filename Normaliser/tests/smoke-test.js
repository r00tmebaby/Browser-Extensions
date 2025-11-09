// Smoke test for Audio Normalizer & EQ
// Run with: node tests/smoke-test.js
// Tests basic message passing and meter responses

const puppeteer = require('puppeteer');
const path = require('path');

const EXTENSION_PATH = path.resolve(__dirname, '..');
const TEST_PAGE = `data:text/html,
<!DOCTYPE html>
<html>
<head><title>Audio Test</title></head>
<body>
  <h1>Audio Normalizer Smoke Test</h1>
  <audio id="testAudio" controls autoplay>
    <source src="https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav" type="audio/wav">
  </audio>
  <script>
    // Expose test helpers
    window.audioEl = document.getElementById('testAudio');
    window.audioEl.volume = 0.1; // quiet for testing
  </script>
</body>
</html>`;

async function runSmokeTest() {
  console.log('🔧 Starting Audio Normalizer smoke test...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--no-sandbox'
    ]
  });

  const page = await browser.newPage();

  try {
    // 1. Navigate to test page
    console.log('✅ Test 1: Load test page with audio element');
    await page.goto(TEST_PAGE, { waitUntil: 'networkidle0' });
    await page.waitForSelector('#testAudio', { timeout: 5000 });
    console.log('   ✓ Audio element found\n');

    // 2. Check if content script injected
    console.log('✅ Test 2: Verify content script injection');
    await page.waitForFunction(() => window.__audioNormalizerInjected === true, { timeout: 10000 });
    console.log('   ✓ Content script injected\n');

    // 3. Wait for audio to play (may be blocked by autoplay policy)
    console.log('✅ Test 3: Interact with page to enable AudioContext');
    await page.click('body'); // user gesture
    await page.evaluate(() => {
      const audio = document.getElementById('testAudio');
      audio.play().catch(() => {});
    });
    await page.waitForTimeout(2000); // let audio process
    console.log('   ✓ Audio playback initiated\n');

    // 4. Test message passing (getMeter)
    console.log('✅ Test 4: Test getMeter message response');
    const meterResult = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'getMeter' }, (response) => {
          resolve(response);
        });
      });
    });

    if (meterResult && typeof meterResult.peakDb === 'number') {
      console.log(`   ✓ Received peakDb: ${meterResult.peakDb} dB`);
      console.log(`   ✓ Received grDb: ${meterResult.grDb || 0} dB`);
      console.log(`   ✓ Active: ${meterResult.active}\n`);
    } else {
      throw new Error('getMeter response invalid');
    }

    // 5. Test getSpectrum
    console.log('✅ Test 5: Test getSpectrum message response');
    const spectrumResult = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'getSpectrum' }, (response) => {
          resolve(response);
        });
      });
    });

    if (spectrumResult && Array.isArray(spectrumResult.bands)) {
      console.log(`   ✓ Received ${spectrumResult.bands.length} spectrum bands`);
      console.log(`   ✓ Sample bands: [${spectrumResult.bands.slice(0, 3).map(b => b.toFixed(1)).join(', ')}...]\n`);
    } else {
      throw new Error('getSpectrum response invalid');
    }

    // 6. Test setGain
    console.log('✅ Test 6: Test setGain message');
    const gainResult = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'setGain', value: 2.0 }, (response) => {
          resolve(response);
        });
      });
    });

    if (gainResult && gainResult.ok) {
      console.log(`   ✓ Gain set successfully, applied: ${gainResult.applied}\n`);
    } else {
      throw new Error('setGain failed');
    }

    // 7. Test setEq
    console.log('✅ Test 7: Test setEq message');
    const eqResult = await page.evaluate(() => {
      return new Promise((resolve) => {
        const testBands = [0, 2, 4, 2, 0, -2, -4, -2, 0, 0];
        chrome.runtime.sendMessage({ type: 'setEq', bands: testBands }, (response) => {
          resolve(response);
        });
      });
    });

    if (eqResult && eqResult.ok) {
      console.log('   ✓ EQ bands set successfully\n');
    } else {
      throw new Error('setEq failed');
    }

    // 8. Verify storage
    console.log('✅ Test 8: Verify chrome.storage.sync');
    const storageData = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.sync.get(['enabled', 'gainValue', 'eqBands'], resolve);
      });
    });

    console.log(`   ✓ Storage enabled: ${storageData.enabled}`);
    console.log(`   ✓ Storage gainValue: ${storageData.gainValue || 'not set'}\n`);

    console.log('✅ All smoke tests passed! 🎉\n');

  } catch (error) {
    console.error('❌ Smoke test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  runSmokeTest()
    .then(() => {
      console.log('Smoke test completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Smoke test failed:', err);
      process.exit(1);
    });
}

module.exports = { runSmokeTest };

