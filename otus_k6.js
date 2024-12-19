import http from 'k6/http';
import { check, group } from 'k6';
import { SharedArray } from 'k6/data';
import { URLSearchParams } from 'https://jslib.k6.io/url/1.0.0/index.js';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

const data = new SharedArray('get Users', function () {
    const file = JSON.parse(open('./users.json'));
    return file.users;
  });

export default function() {

    //урл  сайта
   
  const base_url = 'http://webtours.load-test.ru:1080';

  let welcomPage = http.get(base_url+'/cgi-bin/welcome.pl');

  check(welcomPage, {
        'status is 200': (r) => r.status === 200,
      });
    
  //получаем куку
  const vuJar = http.cookieJar();
  const cookiesForURL = vuJar.cookiesForURL(welcomPage.url);
  //console.log(cookiesForURL);

  let params = { headers: { 'Cookie': cookiesForURL} };
 
  // получаем user_session
  let nav = http.get(base_url+'/cgi-bin/nav.pl?in=home', params);
  let user_session = nav.html().find('input[name=userSession]').first().attr('value');
  //console.log(user_session);

  const payload = {
      userSession: user_session, 
      username: data[0].username,
      password: data[0].password
    };
  //console.log(payload);

  // авторизуемся
    
  const up = new URLSearchParams(payload);

  const formParams = {...params,headers:{'content-type': 'application/x-www-form-urlencoded'}};
  let login_page = http.post(base_url+'/cgi-bin/login.pl', up.toString(), formParams);
    console.log(login_page.body);
              check(login_page, {
    'status code login is 200': (r) => r.status === 200,
    'check login.pl in response': (r) => r.body.includes('login.pl'),
    
              });

  // переходим на страницу покупки билетов
  let flight_page = http.get(base_url + '/cgi-bin/reservations.pl', params);
  //console.log(flight_page);
  check(flight_page, {
    'verify Find Fligt': (r) => r.body.includes('Find Flight'),
  });

  const citys_from = flight_page.html().find('select[name=depart]').children().map(
    // function (indx, item) {
    //     return item.attr('value');
    // }
    (indx, item) => item.attr('value')
  );
  //console.log(citys_from);

  const random_from = Math.floor(Math.random() * citys_from.length);
  const cityFrom = citys_from[random_from];
  console.log(cityFrom);

  const citys_to = flight_page.html().find('select[name=arrive]').children().map(
    // function (indx, item) {
    //     return item.attr('value');
    // }
    (indx, item) => item.attr('value')
  );
  //console.log(citys_to);

  const random_to = Math.floor(Math.random() * citys_to.length);
  const cityTo = citys_to[random_to];
  console.log(cityTo);

  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() + 1);
  const dateTo = new Date(dateFrom);
  dateTo.setDate(dateTo.getDate() + 1);

  //покупка билетов 
  const payload2 = {
    advanceDiscount: 0,
    depart: cityFrom,
    departDate: `${dateFrom.getMonth() + 1}/${dateFrom.getDate()}/${dateFrom.getFullYear()}`,
    arrive: cityTo,
    returnDate: `${dateTo.getMonth() + 1}/${dateTo.getDate()}/${dateTo.getFullYear()}`,
    numPassengers: 1,
    seatPref: 'None',
    seatType: 'Coach',
    'findFlights.x': 64,
    'findFlights.y': 5
  };

  const up1 = new URLSearchParams(payload2);
  up1.append('.cgifields', 'roundtrip');
  up1.append('.cgifields', 'seatType');
  up1.append('.cgifields', 'seatPref');

  const buyTicketStep1 = http.post(base_url + '/cgi-bin/reservations.pl', up1.toString(), formParams);
  //console.log(up1.toString());
  //console.log(buyTicketStep1);
  check(buyTicketStep1, {
    'verify buyTicketStep1 ': (r) => r.body.includes('Flight departing from '),
  });

  let outboundFlight = buyTicketStep1.html().find('input[name=outboundFlight]').last().attr('value');
  const up2 = new URLSearchParams('outboundFlight=320%3B773%3B12%2F20%2F2024&numPassengers=1&advanceDiscount=0&seatType=Coach&seatPref=None&reserveFlights.x=62&reserveFlights.y=9');
  up2.set('outboundFlight', outboundFlight);
  //console.log(up2.toString())

  const buyTicketStep2 = http.post(base_url + '/cgi-bin/reservations.pl', up2.toString(), formParams);
  //      console.log(buyTicketStep2);
  check(buyTicketStep2, {
    'verify CreditCard': (r) => r.body.includes('Credit Card'),
  });

  const up3 = new URLSearchParams('firstName=&lastName=&address1=&address2=&pass1=+&creditCard=1234000077776666&expDate=12%2F25&saveCC=on&oldCCOption=on&numPassengers=1&seatType=Coach&seatPref=None&outboundFlight=320%3B773%3B12%2F20%2F2024&advanceDiscount=0&returnFlight=&JSFormSubmit=off&buyFlights.x=67&buyFlights.y=14&.cgifields=saveCC');
  up3.set('creditCard', randomString(16, '0123456789'));
  up3.set('outboundFlight', outboundFlight);
  const buyTicketStep3 = http.post(base_url + '/cgi-bin/reservations.pl', up3.toString(), formParams);
  //console.log(up3.toString());
  //console.log(buyTicketStep3);

  check(buyTicketStep3, {
    'verify Thank you for booking through Web Tours': (r) => r.body.includes('Thank you for booking through Web Tours'),
  });

  let welcomPageAgain = http.get(base_url + '/webtours/home.html');
  console.log(welcomPageAgain);
  check(welcomPageAgain, {
    'status welcomPageAgain is 200': (r) => r.status === 200,
    'verify Welcome': (r) => r.body.includes('Welcome'),
  });

    
}

      
