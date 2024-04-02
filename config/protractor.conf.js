/**
 * @author: tipe.io
 */

require('ts-node/register');
const prot = require('protractor');
const helpers = require('./helpers');

exports.config = {
    // baseUrl: 'http://localhost:3000/',
    baseUrl: 'http://192.168.90.39/imfx3-dev/',
    // seleniumAddress: 'http://localhost:17556/',
    // seleniumArgs: ['-Dwebdriver.edge.driver=node_modules/protractor/selenium/MicrosoftWebDriver.exe'],
    chromeOnly: true,
    // use `npm run e2e`
    specs: [
        helpers.root("src/e2e/main.e2e.ts")

        // for full
        // helpers.root('src/e2e/full/**/main.e2e');

        // for fast
        // helpers.root('src/e2e/fast/**/main.e2e')
    ],

    exclude: [],
    framework: 'jasmine2',
    jasmineNodeOpts: {
        showTiming: true,
        showColors:
            true,
        isVerbose:
            false,
        includeStackTrace:
            false,
        defaultTimeoutInterval:
            400000
    },
    directConnect: true,
    capabilities: {
        browserName: 'chrome',
        // chromeOptions: {
        //     args: ["--headless", "--disable-gpu", "--window-size=800x600", "--no-sandbox"]
        // }
    },
    multiCapabilities: [
        // {'browserName': 'internet explorer'},
        // {'browserName': 'chrome'},
        // {'browserName': 'firefox'},
        // {'browserName': 'MicrosoftEdge'},
    ],

    maxSessions: 1,
    onPrepare: function () {
        browser.waitForAngularEnabled(false);
        browser.driver.manage().window().maximize();
        prot.browser.manage().timeouts().pageLoadTimeout(60000);
        prot.browser.manage().timeouts().implicitlyWait(10000);
        prot.browser.manage().timeouts().setScriptTimeout(60000);
        var jasmineReporters = require('jasmine-reporters');
        jasmine.getEnv().addReporter(new jasmineReporters.TeamCityReporter());
        jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
            consolidateAll: true,
            savePath: './testresults/',
            filePrefix: 'xmlresults'
        }));

        var fs = require('fs-extra');

        fs.emptyDir('./testresults/screenshots/', function (err) {
            console.log(err);
        });

        jasmine.getEnv().addReporter({
            specDone: function (result) {
                if (result.status != 'disabled') {
                    browser.getCapabilities().then(function (caps) {
                        var browserName = caps.get('browserName');

                        browser.takeScreenshot().then(function (png) {
                            var stream = fs.createWriteStream('./testresults/screenshots/' + browserName + '-' + result.fullName /*.replace(/ /g, '_')*/ + '.png');
                            stream.write(new Buffer(png, 'base64'));
                            stream.end();
                        });
                    });
                }
            }
        });
    },
    onComplete: function () {
        var browserName, browserVersion;
        var capsPromise = browser.getCapabilities();

        capsPromise.then(function (caps) {
            browserName = caps.get('browserName');
            browserVersion = caps.get('version');

            var HTMLReport = require('protractor-html-reporter');

            testConfig = {
                reportTitle: 'Test Execution Report',
                outputPath: './testresults',
                screenshotPath: './screenshots',
                testBrowser: browserName,
                browserVersion: browserVersion,
                modifiedSuiteName: false,
                screenshotsOnlyOnFailure: false
            };
            new HTMLReport().from('./testresults/xmlresults.xml', testConfig);
        });
    },


// onPrepare: function () {
//     // Use it in your test if you using as single test
//     // let loginToAppHelper = require("../../tests/e2e/login-helper.ts");
//     // loginToAppHelper.loginToApp();
// },

    /**
     * Angular 2 configuration
     *
     * useAllAngular2AppRoots: tells Protractor to wait for any angular2 apps on the page instead of just the one matching
     * `rootEl`
     */
    useAllAngular2AppRoots: true,

    SELENIUM_PROMISE_MANAGER: false,
};
