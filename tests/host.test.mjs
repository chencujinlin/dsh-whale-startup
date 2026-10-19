import test from 'node:test';
import assert from 'node:assert/strict';
import plugin,{injection} from '../lib/index.js';

test('desktop injection stays nonblocking; route belongs to the plugin lifetime',()=>{
  const listeners=new Map(),cleanups=[];let route,removed=false,rejection;
  const ctx={
    connection:{requestRejection(){if(rejection==='throw')throw Error('denied');return rejection;}},
    webServer:{register(value){route=value;return()=>{removed=true;};}},
    effect(fn){cleanups.push(fn());}
  };
  plugin.apply({on(name,fn){listeners.set(name,fn);},inject(deps,fn){assert.deepEqual(deps,['webServer','connection']);fn(ctx);}});
  const rows=[];listeners.get('webserver/index-inject')(rows);listeners.get('webserver/index-inject')(rows);
  assert.equal(rows.length,1);assert.equal(rows[0].kind,'script');assert.equal(rows[0].text,injection);
  assert.ok(injection.includes('s.onerror='));assert.ok(!injection.includes('await'));
  assert.equal(route.path,'/dsh-whale-startup/bootstrap.js');
  function request(method){let status,headers,body;route.handler({method},{writeHead(s,h){status=s;headers=h;},end(b){body=b;}});return{status,headers,body};}
  const get=request('GET');assert.equal(get.status,200);assert.ok(get.body.length>1000000);assert.equal(get.headers['Cache-Control'],'no-store');
  assert.equal(request('HEAD').body,undefined);assert.equal(request('POST').status,405);
  rejection=403;assert.equal(request('GET').status,403);
  rejection='throw';assert.equal(request('GET').status,403);
  cleanups.forEach(fn=>fn());assert.equal(removed,true);
});
