'use strict';
const request = require('superagent');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const parser = (res, fn) => {
  var data = [];
  res.on('data', chunk => data.push(chunk));
  res.on('end', () => fn(null, Buffer.concat(data)));
};

exports.cellphone = (cellphone) => {
  return request.get(`http://www.ip138.com:8080/search.asp?action=mobile&mobile=${cellphone}`)
  .parse(parser)
  .then(res => {
    const html = iconv.decode(res.body, 'gbk');
    const $ = cheerio.load(html);
    const trList = $('table').eq(1).find('tr');
    const address = trList.eq(2).find('td').eq(1).text();
    if (!address) {
      throw new Error('Can n\'t get cellphone location');
    }
    const arr = address.split(String.fromCharCode(160));
    return {
      province: arr[0],
      city: arr[1],
    };
  });
};

exports.ip = (ip) => {
  return request.get(`http://www.ip138.com/ips138.asp?ip=${ip}&action=2`)
  .parse(parser)
  .then(res => {
    const html = iconv.decode(res.body, 'gbk');
    const $ = cheerio.load(html);
    const trList = $('table').eq(2).find('tr');
    const str = trList.eq(2).find('li').eq(0).text();
    if (!str) {
      throw new Error('Can n\'t get ip location');
    }
    const arr = str.split(' ');
    const address = arr[0].split('省');
    return {
      province: address[0].replace('本站数据：', ''),
      city: address[1],
      type: arr.pop(),
    }
  });
};
