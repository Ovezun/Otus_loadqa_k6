import { check, group } from 'k6';
import { uuidv4 , randomIntBetween , randomItem} from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { Writer, SchemaRegistry, SCHEMA_TYPE_JSON, CODEC_SNAPPY } from "k6/x/kafka";

//const brokers = ["localhost:9092"];
//const topic = "my-topic-k6";
//const producer = new Producer({ brokers, topic });
const producer = new Writer({ brokers: ["kafka:9092"], topic: "my-topic-k6" ,  compression: CODEC_SNAPPY, connectLogger: true});
const schemaRegistry = new SchemaRegistry();

export const options = {
  discardResponseBodies: false,
  scenarios:{
    test_run: {
      executor: 'ramping-arrival-rate',
      startRate: 5, 
      timeUnit: '1s',
      preAllocatedVUs: 50,
      stages: [
        { target: 5, duration: '1s' }, //выходим на 5rps
        { target: 5, duration: '300s' }, // держим 5rs  5 минут 
        { target: 10, duration: '1s' }, // выходим на 10rps
        { target: 10, duration: '300s' },// держим 10 rps 5 минут
        { target: 0, duration: '1s' }, //снижаем нагрузку до нуля

      ],
    },
  },
}

export default function () {

  let randomUUID = uuidv4();
  //console.warn(randomUUID);
  let randomId = randomIntBetween(100000000000, 999999999999); // 123456789012
 // console.error(randomId);
   let randomBool = randomItem([true, false]);
  console.log(randomBool);
  
 let index = 0
  producer.produce ({messages: [{
        key: schemaRegistry.serialize({
          data: {
            correlationId: "test-id-def-" + index,
          },
          schemaType: SCHEMA_TYPE_JSON,
        }),
        value: schemaRegistry.serialize({
          data: {
            id: randomId,
             uuid: randomUUID,
            isActive: randomBool,
           about: "keep calm and do testing"
           },
          schemaType: SCHEMA_TYPE_JSON,
        }),
        headers: {
          mykey: "myvalue",
        },
      }]})
        
}
