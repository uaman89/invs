import { InvsPage } from './app.po';

describe('invs App', () => {
  let page: InvsPage;

  beforeEach(() => {
    page = new InvsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
