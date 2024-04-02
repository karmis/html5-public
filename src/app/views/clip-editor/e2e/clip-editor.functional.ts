// import { browser, by, element, protractor } from 'protractor';
// import { logoutFromApp } from '../../../tests/e2e/logout-helper';
// import { loginToApp } from '../../../tests/e2e/login-helper';

// describe('(e2e) App Clip-Editor(functional)', () => {

//     beforeEach(() => {
//         browser.get('./#/media');
//     });

//     function repetition() {
//         let searchInput = browser.driver.findElement(by.css('.test-search-form-input'));
//         searchInput.clear();

//         browser.sleep(2000);

//         searchInput.sendKeys('ix3');

//         browser.sleep(1000);

//         let btnSearch = browser.driver.findElement(by.css('.test-search-form-btn'));
//         btnSearch.click();

//         browser.sleep(2000);

//         let dropdown = browser.driver.findElement(by.css('.test-search-settings-li-dropdown'));
//         browser.actions().mouseMove(dropdown).click().perform();

//         browser.sleep(1000);

//         let selectLi1 = browser.driver.findElement(
//           by.css('.test-search-settings-li-dropdown li:nth-child(10)'));
//         browser.actions().mouseMove(selectLi1).click().perform();
//     };
// });
