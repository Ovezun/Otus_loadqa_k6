import http from 'k6/http';
import { check, group } from 'k6';
import { SharedArray } from 'k6/data';
import { Trend, Rate } from 'k6/metrics';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { SelectElement } from 'k6/html';

export const options = {
    discardResponseBodies: false,
  
  scenarios: {
    contacts: {
      executor: 'ramping-arrival-rate',

      // Start iterations per `timeUnit`
      startRate: 1,

      // Start `startRate` iterations per minute
      timeUnit: '1m',

      // Pre-allocate necessary VUs.
      preAllocatedVUs: 50,
      

      stages: [
        // Start 300 iterations per `timeUnit` for the first minute.
        { target: 60, duration: '30s' },

        // Linearly ramp-up to starting 600 iterations per `timeUnit` over the following two minutes.
        { target: 60, duration: '30s' },

        // Continue starting 600 iterations per `timeUnit` for the following four minutes.
        { target: 72, duration: '30s' },

        // Linearly ramp-down to starting 60 iterations per `timeUnit` over the last two minutes.
        { target: 72, duration: '30s' },
        { target: 1, duration: '30s' },
      ],
    },
  },
};
    // scenarios: {
    //   ya_ru: {
    //     exec: 'yandex', 
    //     executor: 'ramping-arrival-rate',
    //     // Start iterations per `timeUnit`
    //     startRate: 0,
    //     // Start `startRate` iterations per minute
    //     timeUnit: '1s',  
    //     // Pre-allocate necessary VUs.
    //     preAllocatedVUs: 7,
    //       stages: [
    //       // Start 300 iterations per `timeUnit` for the first minute.
    //       { target: 60, duration: '5s' },
    //         // Linearly ramp-up to starting 600 iterations per `timeUnit` over the following two minutes.
    //       { target: 60, duration: '5s' },
    //         // Continue starting 600 iterations per `timeUnit` for the following four minutes.
    //       { target: 72, duration: '5s' },
    //       { target: 1, duration: '5s' },
    //       ],
    //    },
    //   www_ru: {
    //     exec: 'wwwru', 
    //     executor: 'ramping-arrival-rate',
    //     // Start iterations per `timeUnit`
    //     startRate: 60,
    //     // Start `startRate` iterations per minute
    //     timeUnit: '4s',  
    //     // Pre-allocate necessary VUs.
    //     preAllocatedVUs: 7,
    //       stages: [
    //       // Start 300 iterations per `timeUnit` for the first minute.
    //       { target: 60, duration: '8s' },
    //         // Linearly ramp-up to starting 600 iterations per `timeUnit` over the following two minutes.
    //       { target: 60, duration: '5s' },
    //         // Continue starting 600 iterations per `timeUnit` for the following four minutes.
    //       { target: 72, duration: '8s' },
    //       { target: 1, duration: '5s' },
    //       ],
    //   },
//     },
//   };
  
  export default function() {
    http.get('https://test.k6.io/contacts.php');
  }
// export function yandex() {

//     let http_ya_ru = http.get('http://ya.ru');
//     check(http_ya_ru, {
//         'verify yandex status code 200': (http_ya_ru) => http_ya_ru.status===200,

//     })
    
// }
//  export function wwwru() {
    
//     let http_www_ru = http.get('http://www.ru');
//     check(http_www_ru, {
//         'status code www.ru is 200': (http_www_ru) => http_www_ru.status===200,
//     })
//  }