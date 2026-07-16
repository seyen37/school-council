// ─── 聯席會議（三方派代表；玩家可選主持身分） ───────────────
import { R } from './roles'

export const JOINT = {
  id: 'joint',
  label: '聯席會議',
  sub: '學校・教師會・家長會 三方代表與會',
  chairName: '校長',
  chairChar: '主',
  chairRoleId: 'principal',
  // 玩家可選的主持身分；被選中的角色從 AI 名單中移除
  chairOptions: [
    { roleId: 'principal', label: '校長' },
    { roleId: 't_chair', label: '教師會理事長' },
    { roleId: 'p_chair', label: '家長會長' },
  ],

  officials: [
    R.principal,
    R.jiaodao, R.jiaowu, R.xuewu, R.zongwu, R.fudao, R.fudao_t,
    R.renshi, R.zhigong, R.youzhu,
    R.yingyang, R.tejiao,
    R.t_chair, R.t_admin, R.t_low, R.t_mid, R.t_high, R.t_kinder, R.t_sub,
    R.p_chair, R.p_low, R.p_mid, R.p_high, R.p_kinder, R.p_vice,
    R.kuaiji,
  ],

  ext: [R.lizhang, R.jizhe, R.zhiyuan, R.duxue],

  meetings: [
    {
      id: 'xiaowu',
      name: '校務會議',
      desc: '學校最高決策會議，審議校務重大事項與章則。',
      defaultOn: ['principal', 'jiaodao', 'jiaowu', 'xuewu', 'zongwu', 'fudao', 'fudao_t', 'renshi', 'kuaiji', 'zhigong', 'youzhu', 't_chair', 't_admin', 't_low', 't_high', 't_kinder', 'p_chair', 'p_vice'],
      agenda: '本會議依國民教育法為學校最高決策會議，由行政人員、教師代表、家長會代表與職工代表組成，審議校務發展計畫、重要章則與各方提案；決議具拘束力，發言須衡量法規權限與三方立場的平衡。',
    },
    {
      id: 'kefa',
      name: '課程發展委員會（課發會）',
      desc: '規劃全校課程計畫、審查各領域教材與彈性課程。',
      defaultOn: ['principal', 'jiaodao', 'jiaowu', 'fudao', 'fudao_t', 't_low', 't_mid', 't_high', 't_sub', 't_kinder', 'p_chair'],
      agenda: '本會議依十二年國教課綱審議學校課程計畫：領域節數、彈性學習課程、教材選用、跨領域統整。討論須回到課程專業與學生學習，行政可行性與家長觀點為輔。',
    },
    {
      id: 'jiaoping',
      name: '教師評審委員會（教評會）',
      desc: '審議教師聘任、解聘、停聘及不續聘等人事案。',
      defaultOn: ['principal', 'renshi', 't_chair', 't_low', 't_mid', 't_high', 't_sub', 'p_chair'],
      agenda: '本會議依教師法及教評會設置辦法審議教師人事案，未兼行政或董事之教師代表不得少於總額二分之一；案件涉及個人權益與適法程序，發言須嚴守保密、迴避與正當程序，證據與法條要講清楚。',
    },
    {
      id: 'qinshi',
      name: '親師座談（班級家長會）',
      desc: '導師與家長面對面，溝通班級經營與孩子學習。',
      defaultOn: ['fudao', 'fudao_t', 't_low', 't_mid', 't_high', 't_kinder', 'p_low', 'p_mid', 'p_high', 'p_kinder'],
      agenda: '本會議為親師座談性質，導師代表與各年段家長代表就班級經營、作業與評量、親師溝通方式交換意見；重點是把家長的疑慮講開、把老師的做法說清楚，避免流於單方宣導。',
    },
    {
      id: 'jiangcheng',
      name: '學生獎懲委員會',
      desc: '審議學生重大獎懲案件，兼顧管教與輔導。',
      defaultOn: ['jiaodao', 'xuewu', 'fudao', 'fudao_t', 't_mid', 't_high', 't_sub', 'p_vice', 'p_high'],
      agenda: '本會議審議學生重大獎懲案件，須依學生獎懲相關規定與輔導管教注意事項辦理：先了解事實與背景、給予陳述機會、考量比例原則與輔導先行，兼顧被害者保護與行為改變的可能。',
    },
    {
      id: 'bianban',
      name: '常態編班委員會',
      desc: '確保學生編班與導師編配作業公平公開。',
      defaultOn: ['principal', 'jiaodao', 'jiaowu', 't_low', 't_mid', 't_high', 'p_chair', 'p_low', 'p_mid'],
      agenda: '本會議依常態編班及分組學習準則辦理：編班方式（公開抽籤、成績均分）、導師編配原則、特殊個案安置。程序的公平與公開是重點，任何例外都要有明文依據，避免關說疑慮。',
    },
    {
      id: 'xingping',
      name: '性別平等教育委員會（性平會）',
      desc: '推動性平教育、處理校園性別事件之調查與防治。',
      defaultOn: ['principal', 'xuewu', 'jiaodao', 'fudao', 'fudao_t', 'tejiao', 't_sub', 't_low', 'p_vice', 'p_mid'],
      agenda: '本會議依性別平等教育法設置，女性委員應占總額二分之一以上；業務包括性平課程與宣導、校園性別事件的受理與調查程序。凡涉個案，發言須嚴守保密與程序，不得臆測或洩漏當事人資訊。',
    },
    {
      id: 'shensu',
      name: '學生申訴評議委員會',
      desc: '評議學生或家長對學校管教措施之申訴案件。',
      defaultOn: ['fudao', 'fudao_t', 'jiaodao', 'xuewu', 'tejiao', 't_sub', 't_mid', 'p_chair', 'p_high'],
      agenda: '本會議評議學生及家長不服學校管教或處分之申訴：程序上須給雙方陳述機會、迴避利害關係人；實體上檢視原處分的事實認定、法令依據與比例原則。立場要中立，不護短也不獵巫。',
    },
    {
      id: 'wucan',
      name: '午餐委員會',
      desc: '審議午餐菜單、收費、供應商與食安管理。',
      defaultOn: ['jiaodao', 'xuewu', 'zongwu', 'yingyang', 'kuaiji', 't_admin', 't_low', 'p_chair', 'p_low', 'p_mid', 'youzhu'],
      agenda: '本會議討論學校午餐事務：菜單與營養、收費與補助（弱勢學生用餐）、供應商評選與履約、食安自主管理與剩食。錢與食安都是敏感點，數據要攤開，家長端的疑慮要正面回應。',
    },
    {
      id: 'fute',
      name: '輔導及特教推行委員會',
      desc: '統整輔導與特教資源，審議個案安置與支持方案。',
      defaultOn: ['principal', 'fudao', 'fudao_t', 'tejiao', 'xuewu', 'jiaodao', 't_low', 't_high', 't_kinder', 'p_mid', 'p_kinder'],
      agenda: '本會議統整三級輔導與特殊教育資源：個案安置與支持人力、輔導方案、普特合作與入班宣導、家庭支持連結。涉及個案時以匿名方式討論，嚴守保密；資源分配要照顧到最需要的孩子。',
    },
    {
      id: 'biye',
      name: '畢業典禮籌備會',
      desc: '籌備畢業典禮之流程、經費、場地與分工。',
      defaultOn: ['jiaodao', 'xuewu', 'zongwu', 'kuaiji', 'zhigong', 't_high', 't_sub', 'p_chair', 'p_vice', 'p_high'],
      agenda: '本會議籌備畢業典禮：典禮形式與流程、場地與雨備、經費分攤（學校預算與家長會贊助）、禮品與獎項、表演與人力分工。理想與預算的落差是每年吵點，時程回推要抓緊。',
    },
  ],
}
