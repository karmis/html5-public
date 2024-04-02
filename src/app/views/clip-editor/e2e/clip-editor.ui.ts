// import { browser, by, element, protractor } from 'protractor';
// import { logoutFromApp } from '../../../tests/e2e/logout-helper';
// import { loginToApp } from '../../../tests/e2e/login-helper';

// describe('(e2e) App Clip-Editor(ui)', () => {

//     beforeEach(() => {
//         browser.get('./#/media');
//     });

//     function repetition() {
//         let searchInput = browser.driver.findElement(by.css('.test-search-form-input'));
//         searchInput.clear();

//         browser.sleep(2000);

//         searchInput.sendKeys('bunny');

//         browser.sleep(1000);

//         let advanceButton = browser.driver.findElement(
//             by.css('.test-advanced-searching-button'));
//         advanceButton.click();

//         browser.sleep(2000);

//         let btnSelectSaved = browser.driver.findElement(
//             by.css('#selectSavedSearch span.select2'));
//         browser.actions().mouseMove(btnSelectSaved).click().perform();

//         browser.sleep(2000);

//         browser.actions().sendKeys('TEST').perform();
//         browser.sleep(2000);
//         browser.actions().sendKeys(protractor.Key.ENTER).perform();

//         browser.sleep(2000);

//         let advInput = browser.driver.findElement(
//             by.css('imfx-controls-number .field'));
//         advInput.clear();

//         browser.sleep(2000);

//         advInput.sendKeys('65866');

//         browser.sleep(2000);

//         let btnSearch = browser.driver.findElement(
//             by.css('.test-search-form-btn'));
//         btnSearch.click();
//     };
// });
