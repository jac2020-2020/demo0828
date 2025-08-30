import{a as v,b as M,p as Z}from"./musicApi-3bd1a4e5.js";const $={baseURL:"https://dashscope.aliyuncs.com/compatible-mode/v1",apiKey:"sk-6721e297ae8f47be885e6fe0ac0e3f64",model:"qwen-omni-turbo"},j=v.create({baseURL:$.baseURL,headers:{Authorization:`Bearer ${$.apiKey}`,"Content-Type":"application/json"},timeout:3e4}),S=async(h,o,t)=>{try{const e={role:"system",content:`你是一个专业的诗词标题创作者。请根据诗词内容创作一个文艺浪漫、富有诗意的标题。

要求：
- 2-6个字的简洁标题
- 要有想象力和艺术感，避免俗套
- 体现诗词的核心意境和情感
- 要独特创新，避免常见标题
- 参考现代文学、古典诗词的命名风格
- 可以使用抽象意象、时间概念、空间意象、情感状态等

请直接返回标题，不要解释。`},c={role:"user",content:`诗词内容：${h}
情感基调：${o}
主题：${t}

请为这首诗创作一个独特的标题。`};return(await I([e,c])).replace(/["""''《》]/g,"").replace(/标题[:：]\s*/g,"").trim()||"诗意人生"}catch(e){console.error("AI标题生成失败:",e);const c=["此时此刻","瞬间永恒","光影流年","心海微澜","意境深处","灵感乍现","诗心初动","情思飞扬"];return c[Date.now()%c.length]}},I=async h=>{var o;try{const t={model:$.model,messages:h,temperature:.9,max_tokens:1e3,top_p:.95,frequency_penalty:.3,presence_penalty:.2,stream:!1};console.log("发送请求:",t);const e=await j.post("/chat/completions",t);if(console.log("API响应:",e.data),e.data.choices&&e.data.choices.length>0)return e.data.choices[0].message.content;throw new Error("API响应格式错误")}catch(t){throw console.error("API调用错误:",t),t.response?(console.error("错误响应:",t.response.data),new Error(`API错误: ${((o=t.response.data.error)==null?void 0:o.message)||"未知错误"}`)):t.request?new Error("网络连接错误，请检查网络连接"):new Error(`请求配置错误: ${t.message}`)}},W=async(h,o)=>{var t;try{const i={model:"qwen-omni-turbo",messages:[{role:"system",content:`你是一个温暖、善解人意的AI伙伴。请用温柔、理解的语气回应用户。${o?`用户当前的情绪状态是: ${o}，请给予适当的情感支持。`:""}回复要简洁自然，像朋友间的对话。`},...h],modalities:["text","audio"],audio:{voice:"Cherry",format:"wav"},temperature:.7,max_tokens:1e3,stream:!0,stream_options:{include_usage:!0}};console.log("发送多模态语音请求:",i);const n=await fetch(`${$.baseURL}/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${$.apiKey}`},body:JSON.stringify(i)});if(!n.ok)throw new Error(`HTTP error! status: ${n.status}`);const u=(t=n.body)==null?void 0:t.getReader();if(!u)throw new Error("无法读取响应流");let l="",a="",s="";for(;;){const{done:f,value:g}=await u.read();if(f)break;s+=new TextDecoder().decode(g);const r=s.split(`
`);s=r.pop()||"";for(const m of r){const d=m.trim();if(d&&d.startsWith("data: ")){const p=d.slice(6).trim();if(p==="[DONE]"||!p)continue;try{const y=JSON.parse(p);if(y.choices&&y.choices[0]){const w=y.choices[0].delta;w.content&&(l+=w.content),w.audio&&w.audio.data&&(a+=w.audio.data,console.log("收集音频片段，当前总长度:",a.length))}}catch(y){console.warn("解析流数据失败:",p,y);continue}}}}return console.log("收集到的文本长度:",l.length),console.log("收集到的音频数据长度:",a.length),{text:l||"我理解你的感受，请继续和我分享。",audioData:a.length>0?a:void 0}}catch(e){console.error("多模态语音聊天API调用错误:",e),console.warn("降级到纯文本模式...");try{const i=[{role:"system",content:`你是一个温暖、善解人意的AI伙伴。请用温柔、理解的语气回应用户。${o?`用户当前的情绪状态是: ${o}，请给予适当的情感支持。`:""}回复要简洁自然，像朋友间的对话。单次回复控制在60字以内，适合语音对话。`},...h];return{text:await I(i),audioData:void 0}}catch(c){return console.error("文本降级也失败:",c),{text:"我现在有些听不清楚，但我在这里陪伴你。请再试一次吧。",audioData:void 0}}}},P=async(h,o,t,e=!1,c,i,n,u)=>{try{let l="";e&&c&&i&&(l=`
            礼物模式歌词创作指导：
            - 礼物接收者：${c}
            - 关系：${u||"朋友"}
            - 想表达的内容：${i}
            ${n?`- 送礼者：${n}`:""}
            - 情感氛围：${o}
            - 主题：${t}
            
            请根据具体关系"${u||"朋友"}"创作相应的歌词，确保：
            1. 深度体现用户的真实意图和情感
            2. 根据人物关系选择合适的表达方式和音乐风格
            3. 具有高度的艺术感和情感共鸣
            4. 恋人关系使用浪漫词汇，家人关系使用温馨词汇，朋友关系使用友谊词汇
            5. 使用诗意的意象和隐喻，如"星光"、"微风"、"花开"、"时光"等美好元素
            6. 避免使用"给xxx的音乐"等直白表达，而是通过意境营造情感
            7. 创造能够启发优美歌名的诗意氛围
            8. 歌名要富有文学性和想象力，使用抽象意象而非具象描述
            9. 避免在歌词中直接使用歌名，让歌名成为对整首歌意境的诗意概括
            ${n?"10. 在歌词中自然地体现送礼者的身份和情感，但要避免过于直白的表述":""}
`);const a={role:"system",content:`你是一个专业的歌词创作者和音乐制作人。根据用户的对话内容、情绪状态和主题，创作一首富有情感的现代流行歌曲。

            🎵 **歌词结构要求（参考现代流行歌曲标准）**：
            
            **[Verse 1]** - 主歌第一段（4-6行）
            - 设置场景和情境，引入故事背景
            - 每行8-12个字，节奏舒缓，为副歌做铺垫
            - 使用具体的意象和细节描述
            
            **[Chorus]** - 副歌（4-6行）  
            - 情感爆发点，表达核心主题
            - 每行6-10个字，朗朗上口，易于记忆
            - 使用重复和呼应，增强感染力
            - 包含歌曲的情感高潮和核心信息
            
            **[Verse 2]** - 主歌第二段（4-6行）
            - 深化情感层次，推进故事发展  
            - 与第一段呼应但有所发展
            - 为第二次副歌做更深层的情感铺垫
            
            **[Chorus]** - 副歌重复（4-6行）
            - 重复核心旋律和情感表达
            - 可以在最后一行做细微变化增强效果
            
            **[Bridge]** - 过渡段（2-4行，可选）
            - 情感转折或升华
            - 为最终高潮做准备
            
            **[Outro]** - 尾声（2-3行）
            - 情感的沉淀和回味
            - 给听众留下深刻印象

            🎨 **创作质量标准**：
            - **总字数**：300-400字（符合完整歌曲长度）
            - **韵律感**：注重押韵和节拍，易于演唱
            - **情感层次**：从引入→高潮→深化→升华的完整情感弧线
            - **现代感**：融合当代流行音乐的表达方式和词汇
            - **画面感**：使用生动的意象，避免空洞的抒情
            - **记忆点**：副歌部分要有强烈的记忆点和传唱度
            - **歌名独立性**：歌词正文中绝对不能出现歌名，歌名应该是对整首歌意境的抽象概括，而非歌词的直接引用

            🌟 **语言风格**：
            - 自然流畅，符合现代人的表达习惯
            - 情真意切，避免矫揉造作
            - 既有诗意美感，又具备流行歌曲的亲和力
            - 巧妙运用修辞手法：比喻、拟人、排比等

            ${l}
            
            请按以下JSON格式返回结果：
            {
                "title": "歌名（3-5个字，现代流行风格，有记忆点）",
                "lyrics": "完整歌词内容，包含所有结构标记"
            }
            
            🎵 **歌名创作标准**：
            - **3-5个字**，简洁有力，便于传播
            - **文艺诗意风格**：避免具象描述，追求抽象美感和意境深度
            - **情感共鸣**：能瞬间触动人心，引起共鸣
            - **记忆度高**：朗朗上口，容易记住和分享
            - **避免俗套表达**：
              * 不用"给xxx的歌"、"xxx之歌"、"xxx之光"等老套格式
              * 避免"礼物"、"心语"、"情话"等直白词汇
              * 拒绝"爱的xxx"、"xxx的故事"等套路化表达
            - **诗意命名风格**：
              * 时间意象：如"三月雨"、"夜半歌"、"黄昏诗"、"午后光"
              * 自然元素：如"微风词"、"星河谣"、"花间令"、"雪落声"
              * 情感状态：如"心事重"、"思君不见君"、"梦里花"
              * 空间概念：如"远方信"、"窗外雨"、"桥下水"、"山间月"
              * 抽象概念：如"温柔乡"、"岁月痕"、"时光书"、"青春赋"
            - **参考经典**：如"青花瓷"、"烟花易冷"、"东风破"、"发如雪"等富有诗意的歌名
            - **创新性**：每次都要有新意，避免重复和套路
            - **重要提醒**：歌名绝对不能出现在歌词正文中，保持歌名的独立性和神秘感
            
            只返回JSON格式，不要任何其他内容。`},s={role:"user",content:e?`礼物接收者: ${c}
想表达的内容: ${i}
情绪状态: ${o}
主题: ${t}
请创作歌词。`:`对话内容: ${h}
情绪状态: ${o}
主题: ${t}
请创作歌词。`},f=await I([a,s]);try{let g=f.trim();const r=g.indexOf("{"),m=g.lastIndexOf("}");r!==-1&&m!==-1&&m>r&&(g=g.substring(r,m+1));const d=JSON.parse(g);if(d.title&&d.lyrics){let p=d.lyrics;return typeof p=="string"&&(p=p.replace(/\\n/g,`
`).replace(/\\"/g,'"').replace(/\\\\/g,"\\").trim()),{title:d.title,lyrics:p}}}catch(g){console.warn("歌词响应JSON解析失败，尝试手动提取:",g),console.log("原始响应:",f)}try{const g=f.match(/["']?title["']?\s*[:：]\s*["']([^"']*?)["']/i),r=f.match(/["']?lyrics["']?\s*[:：]\s*["']((?:[^"'\\]|\\.)*)["']/i);let m=g?g[1].trim():"",d=r?r[1].trim():"";if(d=d.replace(/\\n/g,`
`).replace(/\\"/g,'"').replace(/\\\\/g,"\\").trim(),!m)try{m=await S(d||f.slice(0,200),o,t)}catch(p){console.error("AI标题生成失败:",p),m=`${o}心语`}return d||(d=f),{title:m,lyrics:d}}catch(g){return console.error("手动提取也失败:",g),{title:`${o}心语`,lyrics:f}}}catch(l){throw console.error("生成歌词错误:",l),l}},N=async(h,o,t,e,c=!1,i,n,u,l)=>{try{e&&e("0%","正在创作歌词...");const a=await P(h,o,t,c,i,n,u,l);console.log("生成的歌词和歌名:",a),e&&e("30%","歌词创作完成，开始生成音乐...");let s=`${o}, melodic, heartfelt, emotional`;if(c){if(s+=", gentle, acoustic, soft vocals, tender",l){const r=l.toLowerCase();r.includes("恋人")||r.includes("情侣")||r.includes("男朋友")||r.includes("女朋友")?s+=", romantic, intimate, love song":r.includes("家人")||r.includes("父母")||r.includes("爸爸")||r.includes("妈妈")?s+=", family love, warm, nostalgic":s+=", friendship, uplifting, positive"}}else s+=", contemporary, expressive";const f=await M(a.lyrics,a.title,s);e&&e("40%","音乐生成任务已提交，等待处理...");const g=await Z(f,r=>{if(e){const m=parseInt(r.replace("%","")),d=Math.max(40,Math.min(100,40+m*.6));e(`${d}%`,"正在生成音乐...")}});return e&&e("100%","音乐生成完成！"),g}catch(a){throw console.error("音乐生成流程错误:",a),a}},A={baseURL:"https://api.siliconflow.cn/v1",apiKey:"sk-cevkjvfzcsvaatiqoffnwxwznqkgdrjdcuzorsrnlpmrvmvw"},R=v.create({baseURL:A.baseURL,headers:{Authorization:`Bearer ${A.apiKey}`,"Content-Type":"application/json"},timeout:6e4}),L=async(h,o,t,e=!1,c,i,n,u)=>{try{let l="";e&&c&&i&&(l=`
            礼物模式创作指导：
            - 礼物接收者：${c}
            - 关系：${u||"朋友"}
            - 想表达的内容：${i}
            ${n?`- 送礼者：${n}`:""}
            - 情感氛围：${o}
            - 主题：${t}
            
            请根据具体关系"${u||"朋友"}"创作相应的诗词，确保：
            1. 深度体现用户的真实意图和情感
            2. 根据人物关系选择合适的表达方式和词汇
            3. 具有高度的艺术美感和情感共鸣
            4. 生图提示词要采用经典艺术风格，避免礼物元素，专注场景和意境
            5. 恋人关系强调浪漫场景，家人关系强调温馨场景，朋友关系强调友谊场景
            ${n?"6. 在诗词中自然地体现送礼者的身份和情感，但要保持诗意美感":""}
            `);const a={role:"system",content:`你是一个专业的现代诗创作者和视觉艺术指导。请严格按照JSON格式返回结果。

            🎯 **核心要求：每次创作都必须完全不同！**
            - 即使输入相同，也要创作全新的诗词内容
            - 利用不同的意象、角度、表达方式
            - 展现创作的多样性和创新性

            任务：根据用户的对话内容、情绪状态、主题等，创作一首现代诗，并生成配套的生图提示词。

            诗词创作要求：
            - **现代诗体裁**，文艺浪漫风格，参考顾城的纯真浪漫、余秀华的质朴深情、海子的明朗天真
            - **字数严格控制在80字以内**，3-4段，每段2-3行，语言自然流畅
            - **句式要求**：
              * 避免四字一句的单调节奏
              * 句长参差错落，有3字、5字、7字、9字等多种变化
              * 追求自然的语言节奏，如"春天来了/在你眼中/我看到了/整个四月的花开"
              * 可以使用短句断行营造意境美，如"轻风/拂过你的发梢/像诗句/散落在黄昏里"
            - **语言特色**：
              * 顾城风格：童话般的纯真，"黑夜给了我黑色的眼睛，我却用它寻找光明"的诗意
              * 余秀华风格：质朴真挚的情感表达，贴近生活的细腻描述
              * 海子风格：明朗天真，"从明天起，做一个幸福的人"的乐观浪漫
            - **意象选择**：自然元素（海、麦田、星空、花朵、风、雨、雪）、生活场景（窗台、书桌、小径、咖啡馆）
            - **情感表达**：真挚自然，通过生活化的意象传达深层情感，语言温柔而有力
            - **标题要求**：
              * 文艺浪漫，富有诗意，2-6个字
              * 必须具有独创性和想象力，避免使用常见、俗套的标题
              * 体现诗词的核心意境，可以使用抽象概念、时空概念、感官体验
              * 参考现代文学风格：如"夜的第八章"、"三月的温度"、"心事如雨"
              * 每次创作都要完全不同，即使主题相似也要用不同角度命名
            - **重要：深度融合${i}中的具体内容，如节日元素、场景描述、情感表达等**

            生图提示词要求：
            - 高艺术性风格：artistic composition, aesthetic beauty, refined visual design
            - **场景融合：根据${i}中的节日主题、场景元素生成对应的视觉场景**
            - 节日元素参考：
              * 春节：红灯笼、梅花、雪景、温暖家庭聚会氛围
              * 情人节：玫瑰、烛光、浪漫晚餐、星空
              * 中秋节：圆月、桂花、团圆场景、古典庭院
              * 生日：蛋糕、烛光、庆祝氛围、温馨聚会
              * 毕业：校园、青春、友谊、成长象征
              * 其他节日或场景：根据具体内容灵活适配
            - 根据情绪和意境调色：温暖(warm golden, soft amber)、忧郁(deep blue, silver gray)、平静(soft cream, pale mint)、激情(rich crimson, deep gold)
            - 质感纹理：watercolor texture, oil painting style, ink wash effect, silk fabric texture, paper grain
            - 意境营造：dreamy atmosphere, poetic mood, artistic lighting, elegant composition
            - **内容呼应：确保视觉元素与"想说些什么"的内容高度契合，营造相应的情感氛围**
            - 提示词长度：50-80个英文字符，包含具体场景元素

            ${l}

            **重要：必须返回标准JSON格式，包含三个字段：**
            - title: 文艺浪漫的诗词标题（2-6个字）
            - content: 现代诗内容（80字以内，海子、北岛风格）
            - imagePrompt: 生图提示词（50-80个英文字符）

            只返回JSON格式，不要任何其他内容。`},s=new Date().toISOString(),f=Math.random().toString(36).substring(2,15),g={role:"user",content:e?`创作时间: ${s}
随机种子: ${f}

礼物接收者: ${c}
想表达的内容: ${i}${n?`
送礼者: ${n}`:""}
情绪状态: ${o}
主题: ${t}

请深度分析"想表达的内容"中的节日主题、场景元素、情感表达等具体信息，每次都要创作全新的、不同的现代诗，并生成与内容高度契合的生图提示词。即使是相同的输入，也要确保创作出完全不同的诗词内容。`:`创作时间: ${s}
随机种子: ${f}

对话内容: ${h}
情绪状态: ${o}
主题: ${t}

请分析对话中的具体场景、情感表达和主题元素，每次都要创作全新的、不同的现代诗并生成配套的生图提示词。即使是相同的输入，也要确保创作出完全不同的诗词内容。`},r=await I([a,g]);try{let m=r.trim();if(m.includes("{")&&m.includes("}")){const p=m.indexOf("{"),y=m.lastIndexOf("}")+1;m=m.substring(p,y)}if(r.includes("```json")){const p=r.match(/```json\s*([\s\S]*?)\s*```/);p&&(m=p[1].trim())}else if(r.includes("```")){const p=r.match(/```\s*([\s\S]*?)\s*```/);p&&(m=p[1].trim())}m=m.replace(/[\u200B-\u200D\uFEFF]/g,"").replace(/[""]/g,'"').replace(/['']/g,"'").replace(/：/g,":").replace(/，/g,",").trim(),console.log("清理后的JSON字符串:",m);const d=JSON.parse(m);return{title:d.title||"无题",content:d.content||"暂时无法生成诗词内容",imagePrompt:d.imagePrompt||"Chinese ink painting style, peaceful landscape, soft warm colors, artistic illustration"}}catch(m){console.error("解析诗词JSON失败:",m),console.log("原始响应:",r);try{const d=r.match(/["']?title["']?\s*[:：]\s*["']([^"']*?)["']/i),p=r.match(/["']?content["']?\s*[:：]\s*["']([\s\S]*?)["']/i),y=r.match(/["']?imagePrompt["']?\s*[:：]\s*["']([^"']*?)["']/i),w=p?p[1].trim():r.slice(0,200);let x=d?d[1].trim():"";if(!x)try{x=await S(w,o,t)}catch(E){console.error("AI标题生成失败:",E),x="心灵絮语"}return{title:x,content:w,imagePrompt:y?y[1].trim():"Chinese ink painting style, serene landscape with soft sunlight, impressionist style, watercolor painting, dreamy atmosphere, ethereal mood, delicate brushstrokes"}}catch(d){console.error("手动提取内容也失败:",d);const p=r.slice(0,200);let y="诗意时光";try{y=await S(p,o,t)}catch(w){console.error("降级标题生成失败:",w),y=`${o}心境`}return{title:y,content:p,imagePrompt:"Chinese ink painting style, serene landscape with soft sunlight, impressionist style, watercolor painting, dreamy atmosphere, ethereal mood, delicate brushstrokes, atmospheric perspective"}}}}catch(l){console.error("生成诗词错误:",l),console.log("使用降级方案生成诗词");const a=`在这个${o||"温暖"}的时刻
我想对你说

有些话语如星辰
闪烁在心间

愿时光善待
愿岁月温柔`;let s="心语轻吟";try{s=await S(a,o||"温暖",t)}catch(f){console.error("紧急标题生成失败:",f),s=`${o||"温暖"}时光`}return{title:s,content:a,imagePrompt:"Chinese ink painting style, warm golden sunset, gentle breeze through wheat field, poetic atmosphere, soft watercolor texture, dreamy landscape"}}},O=async h=>{try{const o={model:"Kwai-Kolors/Kolors",prompt:h,image_size:"1536x2048",batch_size:1,num_inference_steps:20,guidance_scale:7.5};console.log("发送生图请求:",o);const t=await R.post("/images/generations",o);if(console.log("生图API响应:",t.data),t.data.images&&t.data.images.length>0)return t.data.images[0].url;throw new Error("生图API响应格式错误")}catch(o){return console.error("生图API调用错误:",o),console.log("生图API失败，使用默认占位图"),"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjZmZmN2VkIDAlLCAjZmZmMGY2IDEwMCUpIi8+Cjx0ZXh0IHg9IjI1NiIgeT0iMjU2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiPuivl+ivjeWNoeeJh+eUn+aIkDwvdGV4dD4KPC9zdmc+"}},G=async(h,o,t,e,c=!1,i,n,u,l)=>{try{e&&e("0%","正在创作诗词...");const a=await L(h,o,t,c,i,n,u,l);console.log("生成的诗词:",a),e&&e("40%","诗词创作完成，开始生成配图...");const s=await O(a.imagePrompt);return console.log("生成的图片URL:",s),e&&e("80%","配图生成完成，正在制作诗词卡片..."),e&&e("100%","诗词卡片创作完成！"),{poem:a,imageUrl:s,cardImageUrl:void 0}}catch(a){return console.error("诗词卡片生成流程错误:",a),console.log("使用完整降级方案"),e&&e("100%","使用备用方案生成诗词卡片"),{poem:{title:"时光深处",content:`在这个${o||"温暖"}的时刻
我想对你说

有些话语如星辰
闪烁在心间

愿时光善待
愿岁月温柔`,imagePrompt:"Chinese ink painting style, warm golden sunset, gentle breeze through wheat field, poetic atmosphere, soft watercolor texture, dreamy landscape"},imageUrl:"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjZmZmN2VkIDAlLCAjZmZmMGY2IDEwMCUpIi8+Cjx0ZXh0IHg9IjI1NiIgeT0iMjU2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiPuivl+ivjeWNoeeJh+eUn+aIkDwvdGV4dD4KPC9zdmc+",cardImageUrl:void 0}}},b={baseURL:"/api/gpt4o-image",generationURL:"/generations",fetchURL:"/fetch",apiKey:"15172b1c-cb9e-f173-d293-012f281a9181"},T=v.create({baseURL:b.baseURL,headers:{"Content-Type":"application/json"},timeout:6e4}),C=async(h,o="gpt-4o",t)=>{try{console.log("开始生成图像，提示词:",h),t&&t("0%","准备生成图像...");const e={prompt:`帮我生成一张图：${h}`};t&&t("10%","发起图像生成请求...");const c=await T.post(b.generationURL,e);if(console.log("GPT-4o图像生成请求响应:",c.data),c.data.status!=="SUCCESS")throw new Error(`生成请求失败: ${c.data.message}`);const i=c.data.data.jobId;t&&t("20%","等待图像生成...");const n=30;let u=0;for(;u<n;){u++;try{const l={jobId:i},a=await T.post(b.fetchURL,l);console.log(`第${u}次查询结果:`,a.data);const s=a.data.status,f=Math.min(20+u/n*60,80);if(s==="SUCCESS"&&a.data.data.imageUrl)return t&&t("100%","图像生成完成"),{status:"SUCCESS",message:"图像生成成功",data:{imageUrl:a.data.data.imageUrl,width:1024,height:1024,prompt:a.data.data.prompt}};if(s==="FAILED")throw new Error(`图像生成失败: ${a.data.message||"未知错误"}`);s==="ON_QUEUE"||s==="PROCESSING"?(t&&t(`${f}%`,"图像正在生成中..."),await new Promise(g=>setTimeout(g,1e4))):(t&&t(`${f}%`,`状态: ${s}`),await new Promise(g=>setTimeout(g,5e3)))}catch(l){if(console.warn(`第${u}次查询失败:`,l),u>=n)throw l;await new Promise(a=>setTimeout(a,5e3))}}throw new Error("图像生成超时，请稍后重试")}catch(e){throw console.error("GPT-4o图像生成错误:",e),e.response?(console.error("错误响应:",e.response.data),new Error(`图像生成API错误: ${e.response.data.message||"未知错误"}`)):e.request?new Error("网络连接错误，请检查网络连接"):new Error(`请求配置错误: ${e.message}`)}},U=async(h,o,t)=>{t&&t("50%","生成艺术图像..."),await new Promise(i=>setTimeout(i,2e3)),t&&t("100%","图像生成完成");const e=["https://picsum.photos/800/1200?random=1&blur=2","https://picsum.photos/800/1200?random=2&blur=2","https://picsum.photos/800/1200?random=3&blur=2","https://picsum.photos/800/1200?random=4&blur=2","https://picsum.photos/800/1200?random=5&blur=2"];return{status:"SUCCESS",message:"图像生成完成",data:{imageUrl:e[Math.floor(Math.random()*e.length)],width:800,height:1200,prompt:`艺术${h}主题${o}插画`}}},J=async(h,o,t,e,c=!1,i,n,u,l)=>{try{e&&e("0%","分析对话内容...");let a="";if(c&&i&&n){const s=`请分析以下礼物信息并生成贺卡形式的中文艺术图像提示词：

礼物接收者：${i}
关系：${l||"朋友"}
想表达的内容：${n}
${u?`送礼者：${u}`:""}
情感氛围：${o}
主题：${t}

重要要求：
**这是一张贺卡 (greeting card)，必须包含中文文字："致${i}，${n}"**

贺卡设计要求：
1. 贺卡布局：贺卡版式设计，优雅卡片设计，艺术背景上的文字叠加
2. 文字展示要求（非常重要）：
   - 必须是中文文字：仅中文文字，无英文文字
   - 文字内容：准确显示"致${i}，${n}"中文字符
   - 文字大小：小巧文字，精致尺寸，不过大，可读但不突兀
   - 文字样式：优雅中文书法，精美中文字体，传统毛笔书写风格
   - 文字位置：和谐文字布局，与背景完美融合，顶部或底部区域优先
   - 文字对比度：与背景适当对比，清晰可读，艺术字体设计
3. **重要：深度分析${n}中的节日主题和场景元素**：
   - **节日场景适配**（优先级最高，根据用户表达内容判断）：
     * 春节/新年：红灯笼高悬、梅花盛开、雪景飘洒、温暖家庭聚会、传统中国元素、喜庆红金色调、鞭炮烟花
     * 情人节：玫瑰花海、烛光晚餐、浪漫星空、心形元素、粉红紫色调、浪漫约会场景
     * 中秋节：圆月高悬、桂花飘香、团圆场景、古典庭院、月饼茶具、温暖金色调
     * 生日庆祝：生日蛋糕、彩色气球、庆祝氛围、温馨聚会、彩虹色调、派对装饰
     * 毕业季：校园风景、青春友谊、成长象征、学士帽、蓝天白云、青春色彩、毕业合影
     * 母亲节/父亲节：温馨家庭、康乃馨/向日葵、亲情拥抱、温暖家居、感恩氛围
     * 教师节：书本文具、粉笔黑板、校园场景、尊师重教氛围、知识殿堂
     * 圣诞节：圣诞树装饰、雪花飘落、温馨家庭、红绿金色调、圣诞礼物
     * 感恩节：秋叶满地、丰收场景、温暖聚餐、橙黄色调、感恩氛围
     * 婚礼/结婚纪念：婚纱礼服、鲜花装饰、浪漫教堂、幸福新人、纯白粉色调
     * 其他特殊场景：根据具体内容灵活适配相应的视觉元素

4. 根据接收者关系"${l||"朋友"}"生成对应艺术背景：
   - 恋人/情侣/爱人/老公/老婆/男朋友/女朋友：浪漫情侣场景，一起漫步，温柔拥抱，星夜风格，柔和印象派笔触
   - 家人/亲人/父母/爸爸/妈妈/儿子/女儿/兄弟/姐妹：温馨家庭场景，温馨家居氛围，温柔拥抱，柔和印象派风格，自然光照  
   - 朋友/同学/同事/闺蜜/兄弟/好友：友谊场景，快乐时光，愉悦氛围，柔和粉彩色调，清新洁净美学
   - 其他关系：根据具体关系特点选择最合适的温馨场景和艺术风格

5. 丰富的艺术风格选择（根据情感和主题选择最合适的）：
   - 梵高后印象派：旋转笔触，鲜艳色彩，星夜风格，后印象派，动态运动，表现质感
   - 莫奈印象派：柔和印象派风格，自然光照，温柔笔触，梦幻氛围，光影变化，外光画法风格
   - 小清新风格：柔和粉彩色调，温柔光照，清新洁净美学，极简之美，水彩透明感，精致细节
   - 油画古典风格：古典油画，丰富色彩，戏剧光照，文艺复兴风格，巴洛克构图，精美艺术杰作
   - 水彩画风格：水彩绘画，流动色彩，柔和边缘，透明层次，艺术渗透效果，纸张纹理
   - 中国水墨画风格：中国水墨画，传统笔法，优雅简约，诗意氛围，墨色层次
   - 现代艺术风格：当代艺术风格，抽象元素，现代构图，艺术创新，创意视觉语言

6. 丰富的背景场景选择：
   - 自然风光：盛开花朵的花园，宁静田野，浪漫海滩日落，壮丽山景，魅力森林，樱花公园
   - 城市场景：温馨咖啡角落，优雅桥梁，安静街道，温暖书店，艺术工作室，屋顶花园
   - 室内环境：温馨客厅，优雅图书馆，温暖厨房，艺术工作空间，舒适卧室，阳光窗台
   - 特殊场景：繁星夜空，黄金时刻光照，薄雾清晨，雨后彩虹，秋叶飘落，冬日仙境

7. 高级艺术质感要求：
   - 构图美学：黄金比例构图，平衡视觉重量，引导线条，焦点强调，艺术和谐
   - 色彩理论：互补色彩方案，冷暖色彩平衡，色彩心理学，大气透视，色彩和谐
   - 光影效果：戏剧光照，柔和自然光，黄金时刻光辉，轮廓光照，明暗对比技法，环境光照
   - 纹理质感：画布纹理，笔触可见性，颜料厚度变化，表面细节，艺术厚涂法，平滑渐变
   - 情感表达：情感共鸣，情绪增强，氛围感受，视觉诗意，艺术叙事

8. 文字美观要求（最重要）：
   - 强制中文：必须仅为中文字符，图像中绝对不能有英文文字
   - 准确内容：准确显示"致${i}，${n}"中文内容
   - 文字大小：小巧精致的文字尺寸，不应主导画面
   - 书法风格：优雅中文书法，精美中文字体，传统毛笔书写风格
   - 完美融合：与艺术背景无缝融合，文字作为精致设计元素
   - 清晰可读：适当对比度和可见性，既可读又艺术，平衡构图

请直接输出250字以内的中文贺卡艺术提示词，强制要求包含准确的中文文字"致${i}，${n}"，文字要小而精美，体现丰富的艺术风格和场景画面，不要任何解释或英文：`;a=(await I([{role:"user",content:s}])).trim()}else{const s=`基于以下对话内容，生成一个适合OpenAI图像生成的提示词。要求：
1. 提示词应该反映对话的情感氛围和主题
2. 可以使用中文，简洁明了
3. 包含艺术风格描述
4. 适合表达情感和意境
5. 控制在200字以内

对话内容：${h}
情感：${o}
主题：${t}

请直接返回图像生成提示词，不要包含其他解释文字。`;a=(await I([{role:"user",content:s}])).trim()}console.log("生成的OpenAI图像提示词:",a),e&&e("10%","开始生成图像...");try{return await C(a,"gpt-4o",e)}catch(s){return console.warn("OpenAI图像生成API不可用，使用备用图像生成方案:",s),e&&e("20%","切换到备用生成方案..."),await U(o,t,e)}}catch(a){return console.error("从对话生成图像错误:",a),await U(o,t,e)}};export{J as a,N as b,G as c,W as d,L as g,I as s};
