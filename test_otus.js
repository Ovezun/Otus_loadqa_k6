import http from 'k6/http';
import { check, group } from 'k6';
import { SharedArray } from 'k6/data';
import { Trend, Rate } from 'k6/metrics';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { SelectElement } from 'k6/html';

export const options = {
    discardResponseBodies: false,
  scenarios: {
    ya_ru: {
      exec: 'yandex', 
      executor: 'ramping-arrival-rate',
      // Start iterations per `timeUnit`
      startRate: 0,
      // Start `startRate` iterations per minute
      timeUnit: '1m',  
      // Pre-allocate necessary VUs.
      preAllocatedVUs: 50,
      stages: [
        { target: 60, duration: '5m' },
        { target: 60, duration: '10m' },
        { target: 72, duration: '5m' },
        { target: 72, duration: '10m' },
        { target: 80, duration: '1m' }
      ],
      },
      www_ru: {
        exec: 'wwwru', 
        executor: 'ramping-arrival-rate',
        // Start iterations per `timeUnit`
        startRate: 60,
        // Start `startRate` iterations per minute
        timeUnit: '1m',  
        // Pre-allocate necessary VUs.
        preAllocatedVUs: 50,
          stages: [
          { target: 120, duration: '5m' },
          { target: 120, duration: '10m' },
          { target: 144, duration: '5m' },
          { target: 144, duration: '10m' },
          { target: 1, duration: '1m' },
          ],
      },
    },
  };
  
  export default function() {
    //http.get('https://test.k6.io/contacts.php');
    yandex();
    wwwru();
  }
 export function yandex() {
    group('yandex', () => {
      let http_ya_ru = http.get('http://ya.ru');
    check(http_ya_ru, {
        'verify yandex status code 200': (http_ya_ru) => http_ya_ru.status===200,

    })
    })
    
}
 export function wwwru() {
    group ('wwwru', () => {
      let http_www_ru = http.get('http://www.ru');
    check(http_www_ru, {
        'status code www.ru is 200': (http_www_ru) => http_www_ru.status===200,
    })
    })
    
 }