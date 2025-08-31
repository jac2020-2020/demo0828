// 情绪相关的文艺句子库
export interface ProgressMessage {
  text: string;
  duration?: number; // 显示时长(毫秒)，可选
}

// 基于情绪的音乐生成文艺句子
const MUSIC_PROGRESS_MESSAGES: { [emotion: string]: ProgressMessage[] } = {
  // 积极情绪
  开心: [
    { text: "正在捕捉你心中的那抹阳光..." },
    { text: "让快乐的音符在指尖跳跃..." },
    { text: "将这份美好编织成旋律..." },
    { text: "音乐正在为你的笑容谱曲..." },
    { text: "把今天的甜蜜留在这首歌里..." }
  ],
  兴奋: [
    { text: "激情正在转化为音符..." },
    { text: "让这份热情燃烧成节拍..." },
    { text: "正在创作属于你的狂欢..." },
    { text: "将这股能量注入每个音符..." },
    { text: "音乐在为你的激情而歌唱..." }
  ],
  温暖: [
    { text: "正在用音符编织温柔的拥抱..." },
    { text: "让这份温暖流淌成旋律..." },
    { text: "音乐正在为你点亮心灯..." },
    { text: "将这份柔情化作天籁之音..." },
    { text: "正在谱写心与心的共鸣..." }
  ],
  感动: [
    { text: "正在将这份触动留在歌声里..." },
    { text: "让眼泪化作最美的音符..." },
    { text: "音乐正在诉说你的心语..." },
    { text: "将这份感动凝固成永恒..." },
    { text: "正在用旋律诠释这份深情..." }
  ],
  希望: [
    { text: "正在为梦想谱一首启程曲..." },
    { text: "让希望的光芒变成音符..." },
    { text: "音乐正在点亮前方的路..." },
    { text: "将这份憧憬编织成翅膀..." },
    { text: "正在创作属于明天的序曲..." }
  ],
  平静: [
    { text: "正在用音符勾勒宁静的湖面..." },
    { text: "让内心的安宁流淌成旋律..." },
    { text: "音乐正在为你搭建静谧的港湾..." },
    { text: "将这份淡然化作轻柔的风..." },
    { text: "正在谱写心灵的避风港..." }
  ],
  
  // 消极情绪
  伤心: [
    { text: "正在用音符轻抚你的心痛..." },
    { text: "让这份难过化作治愈的歌声..." },
    { text: "音乐正在陪你走过这段路..." },
    { text: "将这份眼泪谱成最真的旋律..." },
    { text: "正在为你的心情找到出口..." }
  ],
  失落: [
    { text: "正在用音乐为你重新点亮希望..." },
    { text: "让这份失落转化为力量..." },
    { text: "音乐正在为你寻找新的方向..." },
    { text: "将这份迷茫编织成成长..." },
    { text: "正在创作属于重新开始的歌..." }
  ],
  孤独: [
    { text: "正在用音符陪伴你的夜晚..." },
    { text: "让这首歌成为你最忠实的朋友..." },
    { text: "音乐正在拥抱孤单的你..." },
    { text: "将这份寂静填满温柔的声音..." },
    { text: "正在为你的内心搭建一座桥..." }
  ],
  焦虑: [
    { text: "正在用舒缓的旋律安抚你的心..." },
    { text: "让音乐带走内心的不安..." },
    { text: "音符正在为你编织安全感..." },
    { text: "将这份忧虑化作释怀的歌声..." },
    { text: "正在创作一首心灵的镇定剂..." }
  ],
  疲惫: [
    { text: "正在为疲惫的心灵准备休憩..." },
    { text: "让这首歌成为你的枕边音符..." },
    { text: "音乐正在为你铺设梦的道路..." },
    { text: "将这份倦意转化为甜美的旋律..." },
    { text: "正在谱写属于放松的小夜曲..." }
  ],
  
  // 复杂情绪
  怀念: [
    { text: "正在用音符重建美好的回忆..." },
    { text: "让这份思念化作永恒的旋律..." },
    { text: "音乐正在为过往的美好唱响..." },
    { text: "将这份怀念编织成时光的歌..." },
    { text: "正在创作一首穿越时空的情书..." }
  ],
  期待: [
    { text: "正在为未来谱写一首预言..." },
    { text: "让这份期盼变成前进的动力..." },
    { text: "音乐正在为梦想铺路..." },
    { text: "将这份憧憬化作振翅的音符..." },
    { text: "正在创作属于明天的进行曲..." }
  ],
  纠结: [
    { text: "正在用音乐梳理内心的纷扰..." },
    { text: "让这首歌帮你找到答案..." },
    { text: "音符正在为你的选择指引方向..." },
    { text: "将这份困惑转化为智慧的旋律..." },
    { text: "正在创作一首关于成长的歌..." }
  ],
  
  // 默认情绪
  默认: [
    { text: "正在将你的心情编织成独特的旋律..." },
    { text: "音乐正在为你的故事谱曲..." },
    { text: "让这份情感化作最真挚的歌声..." },
    { text: "正在创作只属于你的心灵音符..." },
    { text: "将这段心情留在永恒的旋律中..." }
  ]
};

// 基于情绪的图像生成文艺句子
const IMAGE_PROGRESS_MESSAGES: { [emotion: string]: ProgressMessage[] } = {
  // 积极情绪
  开心: [
    { text: "正在用色彩描绘你的笑容..." },
    { text: "让快乐的光芒跃然纸上..." },
    { text: "正在绘制属于你的阳光画卷..." },
    { text: "将这份美好定格成永恒..." },
    { text: "画笔正在为你的心情上色..." }
  ],
  兴奋: [
    { text: "正在用热烈的色彩点燃画布..." },
    { text: "让这份激情绽放在画面中..." },
    { text: "正在创作一幅充满活力的画..." },
    { text: "将这股能量化作视觉的盛宴..." },
    { text: "画布正在为你的热情而燃烧..." }
  ],
  温暖: [
    { text: "正在用温柔的笔触勾勒心情..." },
    { text: "让这份温暖渲染整个画面..." },
    { text: "正在绘制一幅心灵的拥抱..." },
    { text: "将这份柔情化作画中的暖阳..." },
    { text: "画笔正在描绘内心的温度..." }
  ],
  感动: [
    { text: "正在将这份感动化作画中诗..." },
    { text: "让眼泪成为最美的颜料..." },
    { text: "正在绘制一幅触动心弦的画..." },
    { text: "将这份深情留在永恒的画面..." },
    { text: "画布正在诉说你的心声..." }
  ],
  希望: [
    { text: "正在用希望的光芒点亮画布..." },
    { text: "让梦想的色彩在画中飞舞..." },
    { text: "正在绘制通往未来的彩虹..." },
    { text: "将这份憧憬化作画中的星光..." },
    { text: "画笔正在描绘明天的轮廓..." }
  ],
  平静: [
    { text: "正在用宁静的色调勾勒心境..." },
    { text: "让内心的安宁流淌在画面..." },
    { text: "正在绘制一幅心灵的净土..." },
    { text: "将这份淡然化作画中的清风..." },
    { text: "画布正在展现内心的宁静..." }
  ],
  
  // 消极情绪
  伤心: [
    { text: "正在用温柔的色彩包裹你的心痛..." },
    { text: "让这份难过化作画中的治愈..." },
    { text: "正在绘制一幅陪伴的画面..." },
    { text: "将这份眼泪转化为画中的彩虹..." },
    { text: "画笔正在为你的心情寻找慰藉..." }
  ],
  失落: [
    { text: "正在用画笔为你重新点亮色彩..." },
    { text: "让这份失落转化为画中的力量..." },
    { text: "正在绘制重新开始的画面..." },
    { text: "将这份迷茫化作画中的指引..." },
    { text: "画布正在为你展现新的可能..." }
  ],
  孤独: [
    { text: "正在用色彩陪伴你的孤单..." },
    { text: "让这幅画成为你最温暖的朋友..." },
    { text: "正在绘制一幅拥抱孤独的画..." },
    { text: "将这份寂静填满温柔的色彩..." },
    { text: "画笔正在为你搭建心灵的桥梁..." }
  ],
  焦虑: [
    { text: "正在用舒缓的色调安抚你的心..." },
    { text: "让画面带走内心的不安..." },
    { text: "正在绘制一幅宁静的风景..." },
    { text: "将这份忧虑化作画中的释然..." },
    { text: "画布正在为你展现内心的平静..." }
  ],
  疲惫: [
    { text: "正在为疲惫的心灵绘制休憩..." },
    { text: "让这幅画成为你心灵的枕头..." },
    { text: "正在描绘属于放松的画面..." },
    { text: "将这份倦意化作画中的安详..." },
    { text: "画笔正在为你涂抹梦的色彩..." }
  ],
  
  // 复杂情绪
  怀念: [
    { text: "正在用画笔重现美好的回忆..." },
    { text: "让这份思念定格在画面中..." },
    { text: "正在绘制一幅时光的画卷..." },
    { text: "将这份怀念化作画中的诗意..." },
    { text: "画布正在诉说过往的美好..." }
  ],
  期待: [
    { text: "正在为未来绘制一幅预言..." },
    { text: "让这份期盼化作画中的光芒..." },
    { text: "正在描绘梦想成真的画面..." },
    { text: "将这份憧憬定格在永恒..." },
    { text: "画笔正在勾勒明天的轮廓..." }
  ],
  纠结: [
    { text: "正在用色彩梳理内心的纷扰..." },
    { text: "让这幅画帮你找到答案..." },
    { text: "正在绘制选择的十字路口..." },
    { text: "将这份困惑化作画中的智慧..." },
    { text: "画布正在为你展现清晰的方向..." }
  ],
  
  // 默认情绪
  默认: [
    { text: "正在将你的心情绘制成独特的画面..." },
    { text: "画笔正在为你的故事上色..." },
    { text: "让这份情感化作最真挚的画作..." },
    { text: "正在创作只属于你的心灵画卷..." },
    { text: "将这段心情留在永恒的画面中..." }
  ]
};

// 进度消息管理器
export class ProgressMessageManager {
  private currentMessages: ProgressMessage[] = [];
  private currentIndex: number = 0;
  private intervalId: number | null = null;
  private onUpdateCallback?: (message: string) => void;

  constructor(onUpdate?: (message: string) => void) {
    this.onUpdateCallback = onUpdate;
  }

  // 开始显示动态消息
  start(type: 'music' | 'image', emotion: string = '默认') {
    this.stop(); // 停止之前的动画
    
    const messagePool = type === 'music' ? MUSIC_PROGRESS_MESSAGES : IMAGE_PROGRESS_MESSAGES;
    this.currentMessages = messagePool[emotion] || messagePool['默认'];
    this.currentIndex = 0;

    // 立即显示第一条消息
    this.updateMessage();

    // 设置定时器，每3-5秒切换一次消息
    this.intervalId = window.setInterval(() => {
      this.updateMessage();
    }, this.getRandomInterval());
  }

  // 停止显示动态消息
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // 更新当前消息
  private updateMessage() {
    if (this.currentMessages.length === 0) return;

    const message = this.currentMessages[this.currentIndex];
    if (this.onUpdateCallback) {
      this.onUpdateCallback(message.text);
    }

    // 移动到下一条消息
    this.currentIndex = (this.currentIndex + 1) % this.currentMessages.length;
  }

  // 获取随机的时间间隔(3-5秒)
  private getRandomInterval(): number {
    return Math.floor(Math.random() * 2000) + 3000; // 3000-5000ms
  }

  // 手动设置消息
  setMessage(message: string) {
    if (this.onUpdateCallback) {
      this.onUpdateCallback(message);
    }
  }
}

// 便捷函数：创建进度消息管理器
export const createProgressMessageManager = (onUpdate: (message: string) => void) => {
  return new ProgressMessageManager(onUpdate);
}; 