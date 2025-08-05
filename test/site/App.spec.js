import * as ROUTES from 'site/constants/routes';

var assert = require('chai').assert;

describe('App Component Routes', () => {
  it('should have correct route constants', () => {
    assert.equal('/', ROUTES.LANDING);
    assert.equal('/home', ROUTES.HOME);
    assert.equal('/account', ROUTES.ACCOUNT);
    assert.equal('/admin', ROUTES.ADMIN);
    assert.equal('/signin', ROUTES.SIGNIN);
    assert.equal('/signup', ROUTES.SIGNUP);
    assert.equal('/password-forget', ROUTES.PASSWORD_FORGET);
  });

  it('should have slide routes defined', () => {
    assert.equal('/slide/new', ROUTES.SLIDE_NEW);
    assert.equal('/slide/:id', ROUTES.SLIDE);
  });
});