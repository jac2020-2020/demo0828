import{a as T,b as j,p as U}from"./musicApi-3bd1a4e5.js";const $={baseURL:"https://dashscope.aliyuncs.com/compatible-mode/v1",apiKey:"sk-6721e297ae8f47be885e6fe0ac0e3f64",model:"qwen-omni-turbo"},Z=T.create({baseURL:$.baseURL,headers:{Authorization:`Bearer ${$.apiKey}`,"Content-Type":"application/json"},timeout:3e4}),b=async(m,o,t)=>{try{const e={role:"system",content:`你是一个专业的诗词标题创作者。请根据诗词内容创作一个文艺浪漫、富有诗意的标题。

要求：
- 2-6个字的简洁标题
- 要有想象力和艺术感，避免俗套
- 体现诗词的核心意境和情感
- 要独特创新，避免常见标题
- 参考现代文学、古典诗词的命名风格
- 可以使用抽象意象、时间概念、空间意象、情感状态等

请直接返回标题，不要解释。`},a={role:"user",content:`诗词内容：${m}
情感基调：${o}
主题：${t}

请为这首诗创作一个独特的标题。`};return(await I([e,a])).replace(/["""''《》]/g,"").replace(/标题[:：]\s*/g,"").trim()||"诗意人生"}catch(e){console.error("AI标题生成失败:",e);const a=["此时此刻","瞬间永恒","光影流年","心海微澜","意境深处","灵感乍现","诗心初动","情思飞扬"];return a[Date.now()%a.length]}},I=async m=>{var o;try{const t={model:$.model,messages:m,temperature:.9,max_tokens:1e3,top_p:.95,frequency_penalty:.3,presence_penalty:.2,stream:!1};console.log("发送请求:",t);const e=await Z.post("/chat/completions",t);if(console.log("API响应:",e.data),e.data.choices&&e.data.choices.length>0)return e.data.choices[0].message.content;throw new Error("API响应格式错误")}catch(t){throw console.error("API调用错误:",t),t.response?(console.error("错误响应:",t.response.data),new Error(`API错误: ${((o=t.response.data.error)==null?void 0:o.message)||"未知错误"}`)):t.request?new Error("网络连接错误，请检查网络连接"):new Error(`请求配置错误: ${t.message}`)}},W=async(m,o)=>{var t;try{const r={model:"qwen-omni-turbo",messages:[{role:"system",content:`你是一个温暖、善解人意的AI伙伴。请用温柔、理解的语气回应用户。${o?`用户当前的情绪状态是: ${o}，请给予适当的情感支持。`:""}回复要简洁自然，像朋友间的对话。`},...m],modalities:["text","audio"],audio:{voice:"Cherry",format:"wav"},temperature:.7,max_tokens:1e3,stream:!0,stream_options:{include_usage:!0}};console.log("发送多模态语音请求:",r);const i=await fetch(`${$.baseURL}/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${$.apiKey}`},body:JSON.stringify(r)});if(!i.ok)throw new Error(`HTTP error! status: ${i.status}`);const h=(t=i.body)==null?void 0:t.getReader();if(!h)throw new Error("无法读取响应流");let s="",n="",c="";for(;;){const{done:f,value:l}=await h.read();if(f)break;c+=new TextDecoder().decode(l);const u=c.split(`
`);c=u.pop()||"";for(const p of u){const d=p.trim();if(d&&d.startsWith("data: ")){const g=d.slice(6).trim();if(g==="[DONE]"||!g)continue;try{const w=JSON.parse(g);if(w.choices&&w.choices[0]){const y=w.choices[0].delta;y.content&&(s+=y.content),y.audio&&y.audio.data&&(n+=y.audio.data,console.log("收集音频片段，当前总长度:",n.length))}}catch(w){console.warn("解析流数据失败:",g,w);continue}}}}return console.log("收集到的文本长度:",s.length),console.log("收集到的音频数据长度:",n.length),{text:s||"我理解你的感受，请继续和我分享。",audioData:n.length>0?n:void 0}}catch(e){console.error("多模态语音聊天API调用错误:",e),console.warn("降级到纯文本模式...");try{const r=[{role:"system",content:`你是一个温暖、善解人意的AI伙伴。请用温柔、理解的语气回应用户。${o?`用户当前的情绪状态是: ${o}，请给予适当的情感支持。`:""}回复要简洁自然，像朋友间的对话。单次回复控制在60字以内，适合语音对话。`},...m];return{text:await I(r),audioData:void 0}}catch(a){return console.error("文本降级也失败:",a),{text:"我现在有些听不清楚，但我在这里陪伴你。请再试一次吧。",audioData:void 0}}}},P=async(m,o,t,e=!1,a,r,i,h)=>{try{let s="";e&&a&&r&&(s=`
            礼物模式歌词创作指导：
            - 礼物接收者：${a}
            - 关系：${h||"朋友"}
            - 想表达的内容：${r}
            ${i?`- 送礼者：${i}`:""}
            - 情感氛围：${o}
            - 主题：${t}
            
            请根据具体关系"${h||"朋友"}"创作相应的歌词，确保：
            1. 深度体现用户的真实意图和情感
            2. 根据人物关系选择合适的表达方式和音乐风格
            3. 具有高度的艺术感和情感共鸣
            4. 恋人关系使用浪漫词汇，家人关系使用温馨词汇，朋友关系使用友谊词汇
            5. 使用诗意的意象和隐喻，如"星光"、"微风"、"花开"、"时光"等美好元素
            6. 避免使用"给xxx的音乐"等直白表达，而是通过意境营造情感
            7. 创造能够启发优美歌名的诗意氛围
            8. 歌名要富有文学性和想象力，使用抽象意象而非具象描述
            9. 避免在歌词中直接使用歌名，让歌名成为对整首歌意境的诗意概括
            ${i?"10. 在歌词中自然地体现送礼者的身份和情感，但要避免过于直白的表述":""}
`);const n={role:"system",content:`你是一个专业的歌词创作者和音乐制作人。根据用户的对话内容、情绪状态和主题，创作一首富有情感的现代流行歌曲。

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

            ${s}
            
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
            
            只返回JSON格式，不要任何其他内容。`},c={role:"user",content:e?`礼物接收者: ${a}
想表达的内容: ${r}
情绪状态: ${o}
主题: ${t}
请创作歌词。`:`对话内容: ${m}
情绪状态: ${o}
主题: ${t}
请创作歌词。`},f=await I([n,c]);try{let l=f.trim();const u=l.indexOf("{"),p=l.lastIndexOf("}");u!==-1&&p!==-1&&p>u&&(l=l.substring(u,p+1));const d=JSON.parse(l);if(d.title&&d.lyrics){let g=d.lyrics;return typeof g=="string"&&(g=g.replace(/\\n/g,`
`).replace(/\\"/g,'"').replace(/\\\\/g,"\\").trim()),{title:d.title,lyrics:g}}}catch(l){console.warn("歌词响应JSON解析失败，尝试手动提取:",l),console.log("原始响应:",f)}try{const l=f.match(/["']?title["']?\s*[:：]\s*["']([^"']*?)["']/i),u=f.match(/["']?lyrics["']?\s*[:：]\s*["']((?:[^"'\\]|\\.)*)["']/i);let p=l?l[1].trim():"",d=u?u[1].trim():"";if(d=d.replace(/\\n/g,`
`).replace(/\\"/g,'"').replace(/\\\\/g,"\\").trim(),!p)try{p=await b(d||f.slice(0,200),o,t)}catch(g){console.error("AI标题生成失败:",g),p=`${o}心语`}return d||(d=f),{title:p,lyrics:d}}catch(l){return console.error("手动提取也失败:",l),{title:`${o}心语`,lyrics:f}}}catch(s){throw console.error("生成歌词错误:",s),s}},L=(m,o,t=!1,e)=>{const a={开心:["upbeat","joyful","cheerful","bright","energetic"],兴奋:["dynamic","energetic","powerful","intense","uplifting"],温暖:["warm","gentle","soft","tender","comforting"],感动:["touching","emotional","heartfelt","moving","inspiring"],希望:["hopeful","optimistic","inspiring","uplifting","bright"],平静:["peaceful","calm","serene","tranquil","meditative"],满足:["content","peaceful","harmonious","balanced","fulfilled"],自信:["confident","strong","empowering","bold","determined"],伤心:["melancholic","sad","emotional","heartbreaking","tender"],失落:["melancholic","nostalgic","reflective","emotional","bittersweet"],焦虑:["tense","restless","atmospheric","dark","intense"],愤怒:["aggressive","intense","powerful","dramatic","heavy"],孤独:["lonely","introspective","atmospheric","ambient","sparse"],疲惫:["slow","dreamy","atmospheric","mellow","soft"],迷茫:["uncertain","floating","atmospheric","ambient","searching"],沮丧:["downbeat","melancholic","heavy","dark","emotional"],怀念:["nostalgic","wistful","gentle","reminiscent","bittersweet"],期待:["anticipating","building","hopeful","ascending","bright"],纠结:["complex","layered","intricate","conflicted","dramatic"],复杂:["sophisticated","layered","intricate","nuanced","deep"],释然:["freeing","liberating","peaceful","resolved","light"],无奈:["resigned","melancholic","bittersweet","reflective","gentle"],心疼:["tender","caring","gentle","emotional","protective"]},r={爱情:["romantic","intimate","passionate","love song","tender"],友情:["friendship","bonding","loyal","supportive","warm"],亲情:["family love","nurturing","protective","generational","heartwarming"],失恋:["heartbreak","loss","emotional","vulnerable","healing"],思念:["longing","distance","yearning","memories","nostalgic"],告别:["farewell","departure","ending","transitional","poignant"],工作:["motivated","focused","determined","professional","driven"],学习:["growth","discovery","learning","progress","educational"],成长:["evolving","maturing","transformative","progressive","developmental"],梦想:["aspirational","soaring","ambitious","visionary","inspiring"],压力:["stressful","tense","overwhelming","urgent","intense"],生活感悟:["philosophical","reflective","wise","contemplative","deep"],青春:["youthful","vibrant","fresh","spirited","carefree"],回忆:["nostalgic","reminiscent","memory-laden","wistful","vintage"],未来:["forward-looking","hopeful","futuristic","progressive","bright"],当下:["present","immediate","mindful","conscious","grounded"],时光:["temporal","flowing","passing","timeless","eternal"],奋斗:["determined","fighting","persistent","strong-willed","motivated"],迷茫:["searching","uncertain","questioning","exploring","wandering"],坚强:["resilient","powerful","unbreakable","courageous","bold"],脆弱:["delicate","sensitive","vulnerable","fragile","tender"],治愈:["healing","therapeutic","soothing","restorative","calming"],心情分享:["personal","intimate","conversational","sharing","open"]},i=a[m]||["emotional","heartfelt"],h=r[o]||["expressive","personal"];let s=[m.toLowerCase(),"melodic"];const n=i.slice(0,Math.floor(Math.random()*2)+2);s.push(...n);const c=h.slice(0,Math.floor(Math.random()*2)+1);if(s.push(...c),t){if(s.push("gentle","acoustic","soft vocals"),e){const l=e.toLowerCase();l.includes("恋人")||l.includes("情侣")||l.includes("男朋友")||l.includes("女朋友")?s.push("romantic","intimate"):l.includes("家人")||l.includes("父母")||l.includes("爸爸")||l.includes("妈妈")?s.push("family love","nostalgic"):s.push("friendship","uplifting")}}else s.push("contemporary");return[...new Set(s)].slice(0,10).join(", ")},J=async m=>{try{const o={role:"system",content:`你是一个专业的情绪和主题分析师。请根据用户的对话内容，分析出最符合的情绪和主题。

**情绪分析要求**：
- 选择最贴合的核心情绪，如：
  * 积极情绪：开心、兴奋、温暖、感动、希望、平静、满足、自信
  * 消极情绪：伤心、失落、焦虑、愤怒、孤独、疲惫、迷茫、沮丧
  * 复杂情绪：怀念、期待、纠结、复杂、释然、无奈、心疼
- 优先选择情绪强度较高的词汇
- 如果有多种情绪，选择最主要的一种

**主题分析要求**：
- 提取对话的核心主题，如：
  * 情感类：爱情、友情、亲情、失恋、思念、告别
  * 生活类：工作、学习、成长、梦想、压力、生活感悟
  * 时间类：青春、回忆、未来、当下、时光
  * 状态类：奋斗、迷茫、坚强、脆弱、治愈、成长
- 主题应该是2-4个字的精炼表达

请分析以下对话内容，只返回JSON格式：
{
    "emotion": "核心情绪（2-3个字）",
    "theme": "主题概括（2-4个字）"
}

只返回JSON，不要任何其他内容。`},t={role:"user",content:`请分析以下对话的情绪和主题：

${m}`},e=await I([o,t]);try{const a=e.match(/\{[\s\S]*\}/);if(a){const r=JSON.parse(a[0]);return{emotion:r.emotion||"温暖",theme:r.theme||"心情分享"}}}catch(a){console.warn("解析情绪主题分析结果失败:",a)}return{emotion:"温暖",theme:"心情分享"}}catch(o){return console.error("情绪主题分析失败:",o),{emotion:"温暖",theme:"心情分享"}}},G=async(m,o,t,e,a=!1,r,i,h,s)=>{try{e&&e("0%","正在创作歌词...");const n=await P(m,o,t,a,r,i,h,s);console.log("生成的歌词和歌名:",n),e&&e("30%","歌词创作完成，开始生成音乐...");let c=L(o,t,a,s);const f=await j(n.lyrics,n.title,c);e&&e("40%","音乐生成任务已提交，等待处理...");const l=await U(f,u=>{if(e){const p=parseInt(u.replace("%","")),d=Math.max(40,Math.min(100,40+p*.6));e(`${d}%`,"正在生成音乐...")}});return e&&e("100%","音乐生成完成！"),l}catch(n){throw console.error("音乐生成流程错误:",n),n}},S={baseURL:"https://api.siliconflow.cn/v1",apiKey:"sk-cevkjvfzcsvaatiqoffnwxwznqkgdrjdcuzorsrnlpmrvmvw"},O=T.create({baseURL:S.baseURL,headers:{Authorization:`Bearer ${S.apiKey}`,"Content-Type":"application/json"},timeout:6e4}),R=async(m,o,t,e=!1,a,r,i,h)=>{try{let s="";e&&a&&r&&(s=`
            礼物模式创作指导：
            - 礼物接收者：${a}
            - 关系：${h||"朋友"}
            - 想表达的内容：${r}
            ${i?`- 送礼者：${i}`:""}
            - 情感氛围：${o}
            - 主题：${t}
            
            请根据具体关系"${h||"朋友"}"创作相应的诗词，确保：
            1. 深度体现用户的真实意图和情感
            2. 根据人物关系选择合适的表达方式和词汇
            3. 具有高度的艺术美感和情感共鸣
            4. 生图提示词要采用经典艺术风格，避免礼物元素，专注场景和意境
            5. 恋人关系强调浪漫场景，家人关系强调温馨场景，朋友关系强调友谊场景
            ${i?"6. 在诗词中自然地体现送礼者的身份和情感，但要保持诗意美感":""}
            `);const n={role:"system",content:`你是一个专业的现代诗创作者和视觉艺术指导。请严格按照JSON格式返回结果。

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
            - **重要：深度融合${r}中的具体内容，如节日元素、场景描述、情感表达等**

            生图提示词要求：
            - 高艺术性风格：artistic composition, aesthetic beauty, refined visual design
            - **场景融合：根据${r}中的节日主题、场景元素生成对应的视觉场景**
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

            ${s}

            **重要：必须返回标准JSON格式，包含三个字段：**
            - title: 文艺浪漫的诗词标题（2-6个字）
            - content: 现代诗内容（80字以内，海子、北岛风格）
            - imagePrompt: 生图提示词（50-80个英文字符）

            只返回JSON格式，不要任何其他内容。`},c=new Date().toISOString(),f=Math.random().toString(36).substring(2,15),l={role:"user",content:e?`创作时间: ${c}
随机种子: ${f}

礼物接收者: ${a}
想表达的内容: ${r}${i?`
送礼者: ${i}`:""}
情绪状态: ${o}
主题: ${t}

请深度分析"想表达的内容"中的节日主题、场景元素、情感表达等具体信息，每次都要创作全新的、不同的现代诗，并生成与内容高度契合的生图提示词。即使是相同的输入，也要确保创作出完全不同的诗词内容。`:`创作时间: ${c}
随机种子: ${f}

对话内容: ${m}
情绪状态: ${o}
主题: ${t}

请分析对话中的具体场景、情感表达和主题元素，每次都要创作全新的、不同的现代诗并生成配套的生图提示词。即使是相同的输入，也要确保创作出完全不同的诗词内容。`},u=await I([n,l]);try{let p=u.trim();if(p.includes("{")&&p.includes("}")){const g=p.indexOf("{"),w=p.lastIndexOf("}")+1;p=p.substring(g,w)}if(u.includes("```json")){const g=u.match(/```json\s*([\s\S]*?)\s*```/);g&&(p=g[1].trim())}else if(u.includes("```")){const g=u.match(/```\s*([\s\S]*?)\s*```/);g&&(p=g[1].trim())}p=p.replace(/[\u200B-\u200D\uFEFF]/g,"").replace(/[""]/g,'"').replace(/['']/g,"'").replace(/：/g,":").replace(/，/g,",").trim(),console.log("清理后的JSON字符串:",p);const d=JSON.parse(p);return{title:d.title||"无题",content:d.content||"暂时无法生成诗词内容",imagePrompt:d.imagePrompt||"Chinese ink painting style, peaceful landscape, soft warm colors, artistic illustration"}}catch(p){console.error("解析诗词JSON失败:",p),console.log("原始响应:",u);try{const d=u.match(/["']?title["']?\s*[:：]\s*["']([^"']*?)["']/i),g=u.match(/["']?content["']?\s*[:：]\s*["']([\s\S]*?)["']/i),w=u.match(/["']?imagePrompt["']?\s*[:：]\s*["']([^"']*?)["']/i),y=g?g[1].trim():u.slice(0,200);let v=d?d[1].trim():"";if(!v)try{v=await b(y,o,t)}catch(A){console.error("AI标题生成失败:",A),v="心灵絮语"}return{title:v,content:y,imagePrompt:w?w[1].trim():"Chinese ink painting style, serene landscape with soft sunlight, impressionist style, watercolor painting, dreamy atmosphere, ethereal mood, delicate brushstrokes"}}catch(d){console.error("手动提取内容也失败:",d);const g=u.slice(0,200);let w="诗意时光";try{w=await b(g,o,t)}catch(y){console.error("降级标题生成失败:",y),w=`${o}心境`}return{title:w,content:g,imagePrompt:"Chinese ink painting style, serene landscape with soft sunlight, impressionist style, watercolor painting, dreamy atmosphere, ethereal mood, delicate brushstrokes, atmospheric perspective"}}}}catch(s){console.error("生成诗词错误:",s),console.log("使用降级方案生成诗词");const n=`在这个${o||"温暖"}的时刻
我想对你说

有些话语如星辰
闪烁在心间

愿时光善待
愿岁月温柔`;let c="心语轻吟";try{c=await b(n,o||"温暖",t)}catch(f){console.error("紧急标题生成失败:",f),c=`${o||"温暖"}时光`}return{title:c,content:n,imagePrompt:"Chinese ink painting style, warm golden sunset, gentle breeze through wheat field, poetic atmosphere, soft watercolor texture, dreamy landscape"}}},C=async m=>{try{const o={model:"Kwai-Kolors/Kolors",prompt:m,image_size:"1536x2048",batch_size:1,num_inference_steps:20,guidance_scale:7.5};console.log("发送生图请求:",o);const t=await O.post("/images/generations",o);if(console.log("生图API响应:",t.data),t.data.images&&t.data.images.length>0)return t.data.images[0].url;throw new Error("生图API响应格式错误")}catch(o){return console.error("生图API调用错误:",o),console.log("生图API失败，使用默认占位图"),"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjZmZmN2VkIDAlLCAjZmZmMGY2IDEwMCUpIi8+Cjx0ZXh0IHg9IjI1NiIgeT0iMjU2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiPuivl+ivjeWNoeeJh+eUn+aIkDwvdGV4dD4KPC9zdmc+"}},B=async(m,o,t,e,a=!1,r,i,h,s)=>{try{e&&e("0%","正在创作诗词...");const n=await R(m,o,t,a,r,i,h,s);console.log("生成的诗词:",n),e&&e("40%","诗词创作完成，开始生成配图...");const c=await C(n.imagePrompt);return console.log("生成的图片URL:",c),e&&e("80%","配图生成完成，正在制作诗词卡片..."),e&&e("100%","诗词卡片创作完成！"),{poem:n,imageUrl:c,cardImageUrl:void 0}}catch(n){return console.error("诗词卡片生成流程错误:",n),console.log("使用完整降级方案"),e&&e("100%","使用备用方案生成诗词卡片"),{poem:{title:"时光深处",content:`在这个${o||"温暖"}的时刻
我想对你说

有些话语如星辰
闪烁在心间

愿时光善待
愿岁月温柔`,imagePrompt:"Chinese ink painting style, warm golden sunset, gentle breeze through wheat field, poetic atmosphere, soft watercolor texture, dreamy landscape"},imageUrl:"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjZmZmN2VkIDAlLCAjZmZmMGY2IDEwMCUpIi8+Cjx0ZXh0IHg9IjI1NiIgeT0iMjU2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiPuivl+ivjeWNoeeJh+eUn+aIkDwvdGV4dD4KPC9zdmc+",cardImageUrl:void 0}}},x={baseURL:"/api/gpt4o-image",generationURL:"/generations",fetchURL:"/fetch",apiKey:"15172b1c-cb9e-f173-d293-012f281a9181"},M=T.create({baseURL:x.baseURL,headers:{"Content-Type":"application/json"},timeout:6e4}),D=async(m,o="gpt-4o",t)=>{try{console.log("开始生成图像，提示词:",m),t&&t("0%","准备生成图像...");const e={prompt:`帮我生成一张图：${m}`};t&&t("10%","发起图像生成请求...");const a=await M.post(x.generationURL,e);if(console.log("GPT-4o图像生成请求响应:",a.data),a.data.status!=="SUCCESS")throw new Error(`生成请求失败: ${a.data.message}`);const r=a.data.data.jobId;t&&t("20%","等待图像生成...");const i=30;let h=0;for(;h<i;){h++;try{const s={jobId:r},n=await M.post(x.fetchURL,s);console.log(`第${h}次查询结果:`,n.data);const c=n.data.status,f=Math.min(20+h/i*60,80);if(c==="SUCCESS"&&n.data.data.imageUrl)return t&&t("100%","图像生成完成"),{status:"SUCCESS",message:"图像生成成功",data:{imageUrl:n.data.data.imageUrl,width:1024,height:1024,prompt:n.data.data.prompt}};if(c==="FAILED")throw new Error(`图像生成失败: ${n.data.message||"未知错误"}`);c==="ON_QUEUE"||c==="PROCESSING"?(t&&t(`${f}%`,"图像正在生成中..."),await new Promise(l=>setTimeout(l,1e4))):(t&&t(`${f}%`,`状态: ${c}`),await new Promise(l=>setTimeout(l,5e3)))}catch(s){if(console.warn(`第${h}次查询失败:`,s),h>=i)throw s;await new Promise(n=>setTimeout(n,5e3))}}throw new Error("图像生成超时，请稍后重试")}catch(e){throw console.error("GPT-4o图像生成错误:",e),e.response?(console.error("错误响应:",e.response.data),new Error(`图像生成API错误: ${e.response.data.message||"未知错误"}`)):e.request?new Error("网络连接错误，请检查网络连接"):new Error(`请求配置错误: ${e.message}`)}},E=async(m,o,t)=>{t&&t("50%","生成艺术图像..."),await new Promise(r=>setTimeout(r,2e3)),t&&t("100%","图像生成完成");const e=["https://picsum.photos/800/1200?random=1&blur=2","https://picsum.photos/800/1200?random=2&blur=2","https://picsum.photos/800/1200?random=3&blur=2","https://picsum.photos/800/1200?random=4&blur=2","https://picsum.photos/800/1200?random=5&blur=2"];return{status:"SUCCESS",message:"图像生成完成",data:{imageUrl:e[Math.floor(Math.random()*e.length)],width:800,height:1200,prompt:`艺术${m}主题${o}插画`}}},_=async(m,o,t,e,a=!1,r,i,h,s)=>{try{e&&e("0%","分析对话内容...");let n="";if(a&&r&&i){const c=`请分析以下礼物信息并生成贺卡形式的中文艺术图像提示词：

礼物接收者：${r}
关系：${s||"朋友"}
想表达的内容：${i}
${h?`送礼者：${h}`:""}
情感氛围：${o}
主题：${t}

重要要求：
**这是一张贺卡 (greeting card)，必须包含中文文字："致${r}，${i}"**

贺卡设计要求：
1. 贺卡布局：贺卡版式设计，优雅卡片设计，艺术背景上的文字叠加
2. 文字展示要求（非常重要）：
   - 必须是中文文字：仅中文文字，无英文文字
   - 文字内容：准确显示"致${r}，${i}"中文字符
   - 文字大小：小巧文字，精致尺寸，不过大，可读但不突兀
   - 文字样式：优雅中文书法，精美中文字体，传统毛笔书写风格
   - 文字位置：和谐文字布局，与背景完美融合，顶部或底部区域优先
   - 文字对比度：与背景适当对比，清晰可读，艺术字体设计
3. **重要：深度分析${i}中的节日主题和场景元素**：
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

4. 根据接收者关系"${s||"朋友"}"生成对应艺术背景：
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
   - 准确内容：准确显示"致${r}，${i}"中文内容
   - 文字大小：小巧精致的文字尺寸，不应主导画面
   - 书法风格：优雅中文书法，精美中文字体，传统毛笔书写风格
   - 完美融合：与艺术背景无缝融合，文字作为精致设计元素
   - 清晰可读：适当对比度和可见性，既可读又艺术，平衡构图

请直接输出250字以内的中文贺卡艺术提示词，强制要求包含准确的中文文字"致${r}，${i}"，文字要小而精美，体现丰富的艺术风格和场景画面，不要任何解释或英文：`;n=(await I([{role:"user",content:c}])).trim()}else{const c=`基于以下对话内容，生成一个适合OpenAI图像生成的提示词。要求：
1. 提示词应该反映对话的情感氛围和主题
2. 可以使用中文，简洁明了
3. 包含艺术风格描述
4. 适合表达情感和意境
5. 控制在200字以内

对话内容：${m}
情感：${o}
主题：${t}

请直接返回图像生成提示词，不要包含其他解释文字。`;n=(await I([{role:"user",content:c}])).trim()}console.log("生成的OpenAI图像提示词:",n),e&&e("10%","开始生成图像...");try{return await D(n,"gpt-4o",e)}catch(c){return console.warn("OpenAI图像生成API不可用，使用备用图像生成方案:",c),e&&e("20%","切换到备用生成方案..."),await E(o,t,e)}}catch(n){return console.error("从对话生成图像错误:",n),await E(o,t,e)}};export{_ as a,G as b,B as c,J as d,W as e,R as g,I as s};
