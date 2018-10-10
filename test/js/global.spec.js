const jsdom = require('jsdom'), JSDOM = jsdom.JSDOM;
const chai = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);

describe('Global', function () {
  let globalModule;

  beforeEach(() => {
    return JSDOM.fromFile('./test/html/index.html')
      .then((dom) => {
        global.window = dom.window;
        global.document = window.document;
      })
      .then(() => globalModule = rewire('../../src/js/0-global'));
  });

  describe('xhr requests', () => {
    let loadPlatformsThenData;
    let xhr, requests;

    beforeEach(() => {
      xhr = sinon.useFakeXMLHttpRequest();
      requests = [];

      xhr.onCreate = (req) => requests.push(req);
      loadPlatformsThenData = globalModule.__get__('loadPlatformsThenData');
    });

    afterEach(() => {
      xhr.restore();
    });

    it('loadPlatformsThenData uses local json url', () => {
      globalModule.__with__({XMLHttpRequest: xhr})(() => {
        loadPlatformsThenData();
        expect(requests.length).to.equal(1);

        const request = requests[0];
        expect(request.url).to.equal('./dist/json/config.json');
      });
    });
  });

  describe('getQueryByName', () => {
    let getQueryByName;

    beforeEach(() => {
      getQueryByName = globalModule.__get__('getQueryByName');
    });

    it('returns variant and jvmVariant', () => {
      globalModule.__with__(
        windowHref('https://adoptopenjdk.net/?variant=imavariant&jvmVariant=and+im+a+jvm'))(
        () => {
          expect(getQueryByName('variant')).to.equal('imavariant');
          expect(getQueryByName('jvmVariant')).to.equal('and im a jvm');
        });
    });

    it('returns null for missing params', () => {
      globalModule.__with__(
        windowHref('https://adoptopenjdk.net/?someparam=openjdk9&paramity=openj9'))(
        () => {
          expect(getQueryByName('variant')).to.be.null;
          expect(getQueryByName('jvmVariant')).to.be.null;
        });
    });
  });

  function windowHref(url) {
    return windowLocation({href: url});
  }

  function windowLocation(obj) {
    return {
      window: {
        location: obj
      }
    }
  }
});
