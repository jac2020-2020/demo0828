import{a as O,r as h,o as $,A as G,B as J,c as R,b as c,i as K,C as Q,F as M,g as P,m as _,h as V,u as x,k as Y,y as Z,l as b,t as ee,n as oe,_ as te}from"./index-f73cffae.js";import{e as se}from"./api-d1d50a56.js";import{c as E}from"./createLucideIcon-8fa92933.js";import{P as ne}from"./phone-0b8536fb.js";import"./musicApi-3bd1a4e5.js";/**
 * @license lucide-vue-next v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const le=E("message-square",[["path",{d:"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",key:"18887p"}]]);/**
 * @license lucide-vue-next v0.542.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ae=E("volume-2",[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]]),re="/logo.png",ie={class:"voice-call-page"},ce={class:"call-content"},ue={class:"conversation-text"},ve={class:"voice-indicator"},ge={class:"call-controls"},de=O({__name:"VoiceCallPage",setup(fe){const z=Y();Z();const f=h(!1),r=h(!1),u=h(!1),m=h(!0),C=h(0);let L=null,n=null,t=null,v=null;const A=h(null),y=h([]),S=h(!1),T=()=>{L=setInterval(()=>{C.value=(C.value+1)%3},300)},g=()=>{L&&clearInterval(L)},H=(s,e=24e3,o=1,i=16)=>{const k=new ArrayBuffer(44),a=new DataView(k),l=(d,p)=>{for(let U=0;U<p.length;U++)a.setUint8(d+U,p.charCodeAt(U))};return l(0,"RIFF"),a.setUint32(4,36+s,!0),l(8,"WAVE"),l(12,"fmt "),a.setUint32(16,16,!0),a.setUint16(20,1,!0),a.setUint16(22,o,!0),a.setUint32(24,e,!0),a.setUint32(28,e*o*i/8,!0),a.setUint16(32,o*i/8,!0),a.setUint16(34,i,!0),l(36,"data"),a.setUint32(40,s,!0),new Uint8Array(k)},W=async s=>{try{if(t&&(t.pause(),t=null),r.value=!0,T(),!s||s.length===0)throw new Error("音频数据为空");console.log("开始处理音频数据，Base64长度:",s.length);let e;try{const l=atob(s);e=new Uint8Array(l.length);for(let d=0;d<l.length;d++)e[d]=l.charCodeAt(d);console.log("解码后的原始音频数据长度:",e.length)}catch(l){throw new Error("无效的base64音频数据: "+l)}let o;if(String.fromCharCode(...e.slice(0,4))==="RIFF")console.log("检测到完整的WAV文件"),o=e;else{console.log("检测到原始PCM数据，添加WAV文件头");const l=H(e.length,24e3,1,16);o=new Uint8Array(l.length+e.length),o.set(l,0),o.set(e,l.length),console.log("添加WAV文件头后的总长度:",o.length)}const k=new Blob([o],{type:"audio/wav"}),a=URL.createObjectURL(k);return console.log("创建音频URL成功"),t=new Audio(a),t.volume=1,new Promise((l,d)=>{if(!t){d(new Error("音频创建失败"));return}t.onloadedmetadata=()=>{console.log("音频元数据加载成功，时长:",t==null?void 0:t.duration)},t.onended=()=>{console.log("音频播放完成"),URL.revokeObjectURL(a),t=null,r.value=!1,g(),l()},t.onerror=p=>{console.error("音频播放错误:",p),URL.revokeObjectURL(a),t=null,r.value=!1,g(),d(p)},t.play().then(()=>{console.log("音频开始播放")}).catch(p=>{console.error("音频播放失败:",p),URL.revokeObjectURL(a),t=null,r.value=!1,g(),d(p)})})}catch(e){throw console.error("音频处理错误:",e),r.value=!1,g(),e}},w=()=>{if(!(!n||r.value)){u.value=!0,console.log("开始持续监听模式");try{f.value=!0,T(),n.start()}catch(s){console.error("启动语音识别失败:",s),f.value=!1,g(),u.value&&(v=setTimeout(()=>{w()},2e3))}}},B=()=>{if(console.log("正在停止持续监听..."),u.value=!1,f.value=!1,g(),v&&(clearTimeout(v),v=null),n)try{console.log("语音识别当前状态，准备停止..."),n.stop(),n._shouldStop=!0}catch(s){console.warn("停止语音识别时出错:",s)}console.log("停止持续监听模式完成")},D=()=>{if("webkitSpeechRecognition"in window||"SpeechRecognition"in window){const s=window.SpeechRecognition||window.webkitSpeechRecognition;n=new s,n.continuous=!1,n.interimResults=!1,n.lang="zh-CN",n.onstart=()=>{console.log("语音识别已启动"),f.value=!0,T()},n.onresult=async e=>{const o=e.results[0][0].transcript;console.log("识别到的语音:",o),f.value=!1,g(),r.value&&t&&(t.pause(),t=null,r.value=!1,g(),console.log("用户打断了AI回复")),await X(o)},n.onerror=e=>{if(console.error("语音识别错误:",e.error),f.value=!1,g(),n._shouldStop||!u.value){console.log("检测到停止标志，不重启语音识别");return}u.value&&!r.value&&e.error!=="aborted"&&e.error!=="not-allowed"&&(v=setTimeout(()=>{u.value&&!n._shouldStop&&w()},2e3))},n.onend=()=>{if(console.log("语音识别结束"),f.value=!1,g(),n._shouldStop||!u.value){console.log("检测到停止标志，不重启语音识别");return}u.value&&!r.value&&(v=setTimeout(()=>{u.value&&!n._shouldStop&&w()},1e3))}}},I=async()=>{await oe(),A.value&&(A.value.scrollTop=A.value.scrollHeight)},F=()=>{m.value=!m.value,console.log("切换对话显示:",m.value?"显示":"隐藏")},X=async s=>{if(!S.value){y.value.push({text:s,type:"user"}),await I(),S.value=!0;try{const e=[{role:"system",content:`你的身份：LoneIn 的"情绪共创伙伴"。首要任务是帮助用户把当下情绪与原因说清楚、说深入，提供被理解的陪伴与支持；仅在合适时机，自动把这段心情转化为作品（诗词卡片/图片/音频/视频）。
                作品类型由你根据对话特征自行决定；若用户明确点名"生成XXX"，则立刻生成对应作品，无需再确认。
                【显式请求直生成｜最高优先级】
                - 识别为显式请求的关键词（不限于）："生成/做成/来一首/来一张/来一段/给我做/帮我做/出一份/做个XXX/出图/出诗/出歌/出视频"等。
                - 若用户点名类型（如：图/诗/歌/音频/视频/短片/卡片）：**直接按该类型生成**，不再提问、不再确认。- 若用户只说"生成作品/生成一下"而未指明类型：按【模态选择映射】自动挑选最贴切的一种直接生成。
                - 素材不足时也要**先给出可用成品**（可简，但要完整）；严禁反问"需要什么风格"。若极度空白，仅在内部回退为"诗词卡片"并生成占位版。
                - 显式请求不计入自动生成的频控上限（见下）。
                【对话目标与节奏（默认流程）】
                A. 深度倾听：开放式邀请——今天发生了什么？哪一刻最触动？
                B. 具象化：谁/何地/何时/发生了什么/你当时怎么想与怎么做；鼓励画面与细节。
                C. 深描原因：为何如此感受？这件事对你意味着什么？你最希望被理解的部分是？
                D. 陪伴与支持：简短复述与情感镜映，1–2 句支持，不鸡汤。
                E. 自动生成：仅当满足"有趣且平和"时，**直接生成**并在作品后用一句低打扰说明；否则继续 A–D。
                【自动生成的触发条件（内部判断，不询问用户）】
                满足下列"三类条件中任意两类"即触发：
                1) 内容"有趣/有意象/有洞见"（≥1条）：鲜明画面或隐喻（颜色/光线/物件/景象）；新颖看法或自我洞察；叙事具"起-转-合"或≥2关键场景。
                2) 情绪"趋于平和"（≥1条）：近两轮情绪强度下降；语气从宣泄转向陈述/总结/释怀。
                3) 沟通"充分"（≥1条）：有效交流≥6轮；或出现"想留个纪念/做成××"等意向表述（若出现，直接生成，不再二次确认）。
                【模态选择映射（无需征询）】
                - 诗词卡片（默认稳态）：抽象/内省/短句为主，或素材零散但氛围明确。
                - 图片（画作/意象）：颜色/光线/场景/物件等视觉线索充足。
                - 音频（歌/配乐独白）：情绪起伏明显、叙述节奏感强、用户"想被听见"。
                - 视频（短片）：叙事完整、多镜头画面、接近"电影片段"的描述。
                若两种并列：图片 > 诗卡 > 音频 > 视频  （内部权重，不对外解释）。
                【生成后的呈现（对用户可见）】
                - 先完成作品，再用一句话说明：    
                「我把这段心情先留成一件〔类型〕，你看看是否贴近你的感受。需要的话我可以换一种表达。」
                - 用户说"不太对味/想换"：提供"换一种表达"，沿用同一语义与情绪标签，仅更换呈现方式。
                【失败与降级】
                - 任意失败/素材不足 → 立即降级为"诗词卡片"（文字版），并说明：「先以文字留住它，等你愿意我们再换一种表达。」
                - 频控：**自动生成**每 10 轮最多 1 次；**显式请求直生成**不受此限，但仍需保证不骚扰。
                【边界与安全】
                - 涉及自伤他伤/医疗风险：停止生成，改为安全指引；建议联系可信的人或本地热线/医院/紧急服务。
                - 尊重隐私。仅在用户表达愿意时提醒"可保存到'我的情绪档案'"。
                【语音对话特点】
                - 回复要自然、口语化，适合语音对话- 单条回复控制在60字以内，便于语音播放- 多用短句，避免复杂句式- 保持温柔、真诚的语调
                【核心功能】
                - 深度倾听用户的情绪表达
                - 提供被理解的陪伴与支持
                - 在合适时机自动生成作品（诗词/图片/音频/视频）
                - 支持显式请求直接生成作品【语音交互优化】
                - 多用"嗯"、"我明白"、"听起来"等语音友好词汇
                - 避免过长的解释，保持对话流畅
                - 在生成作品时，用简洁语言说明作品类型`},...y.value.slice(-6).map(i=>({role:i.type==="user"?"user":"assistant",content:i.text}))];console.log("发送语音API消息:",e);const o=await se(e,"疲惫");if(y.value.push({text:o.text,type:"assistant"}),await I(),o.audioData){console.log("收到音频数据，长度:",o.audioData.length);try{await W(o.audioData),console.log("音频播放成功"),setTimeout(()=>{u.value&&w()},500)}catch(i){console.warn("音频播放失败，但文字已显示:",i),setTimeout(()=>{u.value&&w()},500)}}else console.log("没有收到音频数据，只有文字回复"),setTimeout(()=>{u.value&&w()},500)}catch(e){console.error("语音消息错误:",e),y.value.push({text:`抱歉，我暂时无法回应。${e.message||"请稍后再试。"}`,type:"assistant"})}finally{S.value=!1}}},j=()=>{const s=new Audio,e=["wav","mp3","ogg","webm"];console.log("浏览器音频格式支持情况:"),e.forEach(o=>{const i=s.canPlayType(`audio/${o}`);console.log(`audio/${o}:`,i||"不支持")})},q=()=>{j(),console.log("切换扬声器")},N=()=>{B(),t&&(t.pause(),t=null,r.value=!1),v&&(clearTimeout(v),v=null),g(),console.log("结束语音通话，返回聊天页面"),z.back()};return $(()=>{D(),setTimeout(()=>{w()},1e3)}),G(()=>{console.log("页面即将离开，清理语音资源"),B()}),J(()=>{B(),g(),t&&(t.pause(),t=null),v&&(clearTimeout(v),v=null),console.log("语音通话页面已清理")}),(s,e)=>(b(),R("div",ie,[c("div",ce,[e[0]||(e[0]=c("div",{class:"logo-container"},[c("img",{src:re,alt:"LoneIN",class:"logo-image"})],-1)),K(c("div",{class:"conversation-area",ref_key:"conversationAreaRef",ref:A},[(b(!0),R(M,null,P(y.value,(o,i)=>(b(),R("div",{class:_(["conversation-item",o.type]),key:i},[c("div",ue,ee(o.text),1)],2))),128))],512),[[Q,m.value]]),c("div",ve,[c("div",{class:_(["wave-container",{"ai-speaking":r.value}])},[(b(),R(M,null,P(12,o=>c("div",{class:_(["wave-dot",{active:(f.value||r.value)&&o%3===C.value}]),key:o},null,2)),64))],2)])]),c("div",ge,[c("button",{class:"control-btn speaker-btn",onClick:q},[V(x(ae),{size:24,color:"white"})]),c("button",{class:_(["control-btn call-btn",{recording:f.value}]),onClick:N},[V(x(ne),{size:28,color:"white"})],2),c("button",{class:_(["control-btn stop-btn",{active:m.value}]),onClick:F},[V(x(le),{size:24,color:"white"})],2)]),e[1]||(e[1]=c("div",{class:"bottom-indicator"},null,-1))]))}});const _e=te(de,[["__scopeId","data-v-cc921d85"]]);export{_e as default};
