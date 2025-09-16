var C=Object.defineProperty,R=Object.defineProperties;var S=Object.getOwnPropertyDescriptors;var i=Object.getOwnPropertySymbols;var h=Object.prototype.hasOwnProperty,k=Object.prototype.propertyIsEnumerable;var f=(r,e,t)=>e in r?C(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t,u=(r,e)=>{for(var t in e||(e={}))h.call(e,t)&&f(r,t,e[t]);if(i)for(var t of i(e))k.call(e,t)&&f(r,t,e[t]);return r},_=(r,e)=>R(r,S(e));var y=(r,e)=>{var t={};for(var o in r)h.call(r,o)&&e.indexOf(o)<0&&(t[o]=r[o]);if(r!=null&&i)for(var o of i(r))e.indexOf(o)<0&&k.call(r,o)&&(t[o]=r[o]);return t};import{r as s}from"./vendor-CIE12tXq.js";var x={exports:{}},p={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var O=s,j=Symbol.for("react.element"),A=Symbol.for("react.fragment"),H=Object.prototype.hasOwnProperty,L=O.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,N={key:!0,ref:!0,__self:!0,__source:!0};function w(r,e,t){var o,a={},n=null,l=null;t!==void 0&&(n=""+t),e.key!==void 0&&(n=""+e.key),e.ref!==void 0&&(l=e.ref);for(o in e)H.call(e,o)&&!N.hasOwnProperty(o)&&(a[o]=e[o]);if(r&&r.defaultProps)for(o in e=r.defaultProps,e)a[o]===void 0&&(a[o]=e[o]);return{$$typeof:j,type:r,key:n,ref:l,props:a,_owner:L.current}}p.Fragment=A;p.jsx=w;p.jsxs=w;x.exports=p;var q=x.exports;/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=r=>r.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),v=(...r)=>r.filter((e,t,o)=>!!e&&o.indexOf(e)===t).join(" ");/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var D={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=s.forwardRef((M,E)=>{var m=M,{color:r="currentColor",size:e=24,strokeWidth:t=2,absoluteStrokeWidth:o,className:a="",children:n,iconNode:l}=m,c=y(m,["color","size","strokeWidth","absoluteStrokeWidth","className","children","iconNode"]);return s.createElement("svg",u(_(u({ref:E},D),{width:e,height:e,stroke:r,strokeWidth:o?Number(t)*24/Number(e):t,className:v("lucide",a)}),c),[...l.map(([b,g])=>s.createElement(b,g)),...Array.isArray(n)?n:[n]])});/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=(r,e)=>{const t=s.forwardRef((l,n)=>{var c=l,{className:o}=c,a=y(c,["className"]);return s.createElement(I,u({ref:n,iconNode:e,className:v(`lucide-${$(r)}`,o)},a))});return t.displayName=`${r}`,t};/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=d("DollarSign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=d("Heart",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=d("Shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=d("Vote",[["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}],["path",{d:"M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z",key:"1ezoue"}],["path",{d:"M22 19H2",key:"nuriw5"}]]);export{B as D,T as H,Z as S,z as V,q as j};
