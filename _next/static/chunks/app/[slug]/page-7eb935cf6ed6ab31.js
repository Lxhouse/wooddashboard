(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[42],{7183:function(e,t,n){Promise.resolve().then(n.t.bind(n,3377,23)),Promise.resolve().then(n.bind(n,966)),Promise.resolve().then(n.t.bind(n,5323,23)),Promise.resolve().then(n.t.bind(n,7452,23)),Promise.resolve().then(n.bind(n,5978)),Promise.resolve().then(n.bind(n,443)),Promise.resolve().then(n.bind(n,3027))},966:function(e,t,n){"use strict";n.d(t,{default:function(){return a}});var r=n(6232),i=n(7910),o=n(7238),s=n(5754);function a(e){let{className:t,children:n,style:a,href:c,target:l,...u}=e,f=(0,o.useRouter)(),[h,p]=(0,s.useTransition)();return l||c.startsWith("/")||(l="_blank"),(0,r.jsx)(i.default,{...u,target:l,href:c,onClick:e=>{!function(e){let t=e.currentTarget.getAttribute("target");return t&&"_self"!==t||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.nativeEvent&&2===e.nativeEvent.which}(e)&&(e.preventDefault(),p(()=>{f.push(e.currentTarget.href)}))},className:[t,"scale-100 active:scale-100"].join(" "),style:{...a,transform:h?"scale(1)":"",opacity:h?.85:1,transition:"transform 0.2s ease-in-out, opacity 0.2s 0.4s linear"},children:n})}},9899:function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.confetti=function(e){var t,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=Object.assign({},n,(!r.stagger&&r.delay&&(r.stagger=r.delay),r)),o=i.elementCount,s=i.colors,a=i.width,c=i.height,l=i.perspective,u=i.angle,f=i.spread,h=i.startVelocity,p=i.decay,d=i.dragFriction,y=i.duration,b=i.stagger,v=i.random;e.style.perspective=l;var m=Array.from({length:o}).map(function(t,n){var r=document.createElement("div"),i=s[n%s.length];return r.style["background-color"]=i,r.style.width=a,r.style.height=c,r.style.position="absolute",r.style.willChange="transform, opacity",r.style.visibility="hidden",e.appendChild(r),r}).map(function(e){var t;return{element:e,physics:(t=Math.PI/180*f,{x:0,y:0,z:0,wobble:10*v(),wobbleSpeed:.1+.1*v(),velocity:.5*h+v()*h,angle2D:-(Math.PI/180*u)+(.5*t-v()*t),angle3D:-(Math.PI/4)+v()*(Math.PI/2),tiltAngle:v()*Math.PI,tiltAngleSpeed:.1+.3*v()})}});return t=void 0,new Promise(function(n){requestAnimationFrame(function r(i){t||(t=i);var o=i-t,s=t===i?0:(i-t)/y;m.slice(0,Math.ceil(o/b)).forEach(function(e){var t,n,r,i,o,a;e.physics.x+=Math.cos(e.physics.angle2D)*e.physics.velocity,e.physics.y+=Math.sin(e.physics.angle2D)*e.physics.velocity,e.physics.z+=Math.sin(e.physics.angle3D)*e.physics.velocity,e.physics.wobble+=e.physics.wobbleSpeed,p?e.physics.velocity*=p:e.physics.velocity-=e.physics.velocity*d,e.physics.y+=3,e.physics.tiltAngle+=e.physics.tiltAngleSpeed,n=(t=e.physics).x,r=t.y,i=t.z,o=t.tiltAngle,a=t.wobble,e.element.style.visibility="visible",e.element.style.transform="translate3d("+(n+10*Math.cos(a))+"px, "+(r+10*Math.sin(a))+"px, "+i+"px) rotate3d(1, 1, 1, "+o+"rad)",e.element.style.opacity=1-s}),i-t<y?requestAnimationFrame(r):(m.forEach(function(t){if(t.element.parentNode===e)return e.removeChild(t.element)}),n())})})};var n={angle:90,spread:45,startVelocity:45,elementCount:50,width:"10px",height:"10px",perspective:"",colors:["#a864fd","#29cdff","#78ff44","#ff718d","#fdff6a"],duration:3e3,stagger:0,dragFriction:.1,random:Math.random}},957:function(e,t,n){"use strict";var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),i=n(5754),o=i&&i.__esModule?i:{default:i},s=n(9899),a={position:"relative"},c=function(e){function t(e){!function(e,t){if(!(e instanceof t))throw TypeError("Cannot call a class as a function")}(this,t);var n=function(e,t){if(!e)throw ReferenceError("this hasn't been initialised - super() hasn't been called");return t&&("object"==typeof t||"function"==typeof t)?t:e}(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));return n.setRef=n.setRef.bind(n),n}return!function(e,t){if("function"!=typeof t&&null!==t)throw TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}(t,e),r(t,[{key:"componentDidUpdate",value:function(e){!e.active&&this.props.active&&(0,s.confetti)(this.container,this.props.config)}},{key:"setRef",value:function(e){this.container=e}},{key:"render",value:function(){return o.default.createElement("div",{className:this.props.className,style:a,ref:this.setRef})}}]),t}(i.Component);t.Z=c},5978:function(e,t,n){"use strict";n.d(t,{Counter:function(){return s}});var r=n(6232),i=n(5754),o=n(957);function s(){let[e,t]=(0,i.useState)(!1);return(0,r.jsxs)("div",{className:"flex justify-center ",children:[(0,r.jsx)("button",{className:"bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105",onClick:()=>{t(!0),setTimeout(()=>t(!1),3e3)},children:"点我，来点 赛伯朋克烟花庆祝下\uD83C\uDF89"}),(0,r.jsx)(o.Z,{active:e,config:{angle:90,spread:360,startVelocity:40,elementCount:150,dragFriction:.1,duration:3e3,stagger:3,width:"15px",height:"15px",colors:["#f44336","#2196f3","#ffeb3b","#4caf50","#ff9800","#9c27b0"],shapes:["square","circle"],scalar:1.2}})]})}},443:function(e,t,n){"use strict";n.d(t,{AlertModule:function(){return i}});var r=n(6232);function i(){return(0,r.jsx)("button",{className:"bg-cyan-500 text-white p-2 border border-white rounded-md hover:cursor-pointer",onClick:()=>alert("哦吼？ 你点击了？"),children:"这是一个外部引入的按钮"})}},3027:function(e,t,n){"use strict";n.d(t,{Counter:function(){return o}});var r=n(6232),i=n(5754);function o(){let[e,t]=(0,i.useState)(0);return(0,r.jsxs)("button",{className:"dark:color-white rounded-lg bg-purple-700 px-2 py-1 font-sans font-semibold text-white focus:ring active:bg-purple-600",onClick:()=>t(e+1),children:["You clicked me ",e," times"]})}},3377:function(){},7452:function(e){e.exports={style:{fontFamily:"'__Merriweather_9b922e', '__Merriweather_Fallback_9b922e'"},className:"__className_9b922e"}}},function(e){e.O(0,[366,645,483,733,744],function(){return e(e.s=7183)}),_N_E=e.O()}]);