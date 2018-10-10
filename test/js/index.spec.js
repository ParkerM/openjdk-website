const jsdom = require('jsdom'), JSDOM = jsdom.JSDOM;
const chai = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

describe('Index', () => {
  let indexModule;
  let el;

  beforeEach(() => {
    return JSDOM.fromFile('./test/html/index.html')
      .then(() => indexModule = rewire('../../src/js/index'))
      .then(() => el = document.body);
  });

  describe('onLoad', () => {
    it('should initialize download section', () => {
      const setDownloadSection = sinon.spy();
      indexModule.__with__({
        setDownloadSection: setDownloadSection
      })(() => {
        indexModule.__get__('onIndexLoad')();
        expect(setDownloadSection).to.have.been.calledOnceWith();
      });
    });
  });
});
