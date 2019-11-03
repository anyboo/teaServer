import md5 from 'md5'
import unique from 'unique-string'
import cryptoRandom from 'crypto-random-string'
import xmlbuilder from 'xmlbuilder'
import assert from 'assert'
import xml2js from 'xml2js'
import debug from 'debug'

let trace = debug('payAPI:Utility');

let parser = new xml2js.Parser({
  explicitArray: false,
  tagNameProcessors: [nameToLowerCase],
  attrNameProcessors: [nameToLowerCase],
  //valueProcessors: [nameToUpperCase],
  attrValueProcessors: [nameToUpperCase]
});

function nameToUpperCase(name) {
  return name.toUpperCase();
}

function nameToLowerCase(name) {
  return name.toLowerCase();
}


class Utility {

  static toXml(json) {

    assert(typeof json === 'object')
    let data = json;
    let xml = xmlbuilder.create('xml').ele(data).end({
      pretty: true
    });
    trace('toXml =>\n', xml);
    return xml;
  }

  static toJSON(xml) {

    assert(typeof xml === 'string')
    let data = {};
    parser.parseString(xml, (err, result) => {
      trace(err);
      if (err)
        throw err;

      trace('toJSON =>\n', result.xml)
      data = result.xml
    });

    return data;
  }

  static addSign(json, secert) {
    let query = json; //JSON.parse(json);
    let keys = [];
    for (var key in query) {
      keys.push(key);
    }
    keys.sort();

    let result = '';
    for (var i in keys) {
      result += ''.concat(keys[i], '=', query[keys[i]], '&');
    }
    result = result.concat('key=', secert);
    let sign_data = md5(result).toUpperCase();
    trace('getSign : %s => %s', result, sign_data);
    query.sign = sign_data;
    return query;
  }

  static nonce() {
    let nonce_str = cryptoRandom({
      length: 32,
      type: 'base64'
    });
    trace('cryptoRandom =>', nonce_str)

    return nonce_str;
  }

  static out_trade_no() {
    let out_trade_no = unique();
    trace('out_trade_no =>', `${out_trade_no}`);

    return out_trade_no;
  }
}

export default Utility
