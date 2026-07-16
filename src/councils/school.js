// ─── 學校行政議會（玩家＝校長） ─────────────────────────────
import { R } from './roles'

export const SCHOOL = {
  id: 'school',
  label: '學校行政',
  sub: '校長主持・處室同仁與會',
  chairName: '校長',
  chairChar: '校',
  chairRoleId: 'principal',

  // 出席池（依此順序發言；requires 不合校務設定者自動隱藏）
  officials: [
    R.jiaodao, R.jiaowu, R.xuewu, R.zongwu, R.fudao, R.fudao_t,
    R.renshi, R.zhigong, R.youzhu,
    R.t_admin, R.t_low, R.t_mid, R.t_high, R.t_sub,
    R.kuaiji,
  ],

  ext: [R.lizhang, R.jizhe, R.zhiyuan, R.duxue],

  meetings: [
    {
      id: 'zhuguan',
      name: '主管會議',
      desc: '校長與各處室主任的核心主管會報，議大方向。',
      defaultOn: ['jiaodao', 'jiaowu', 'xuewu', 'zongwu', 'fudao', 'fudao_t', 'youzhu'],
      agenda: '本會議為校長與一級主管的核心會報，人數精簡、直話直說：議校務大方向、跨處室協調與棘手個案的對策；細部執行與經費核銷另於行政會議處理。',
    },
    {
      id: 'xingzheng',
      name: '行政會議',
      desc: '擴大行政會議，各處室與人事會計職工協調庶務。',
      defaultOn: ['jiaodao', 'jiaowu', 'xuewu', 'zongwu', 'fudao', 'fudao_t', 'renshi', 'kuaiji', 'zhigong', 'youzhu'],
      agenda: '本會議為擴大行政會議，聚焦各處室分工、期程、經費與資源調度；涉及教師權益或家長會經費的事項，須提醒主席另送相關會議或委員會決議。',
    },
    {
      id: 'xuenian',
      name: '學年會議',
      desc: '各學年導師與科任代表討論教學進度與活動配合。',
      chair: { roleId: 'grade_rep', label: '學年代表' },
      defaultOn: ['t_low', 't_mid', 't_high', 't_sub'],
      agenda: '本會議為學年會議，由學年代表主持，各學年導師與科任教師代表就課程進度、評量規劃、活動的課務配合與班級間協調交換意見；重點放在教學實務怎麼做對學生最好、對教學現場負擔最合理，必要時彙整意見反映給行政端。',
    },
    {
      id: 'kaohe',
      name: '考核委員會（成績考核會）',
      desc: '評定教職員工年終成績考核與平時考核獎懲。',
      defaultOn: ['jiaodao', 'jiaowu', 'xuewu', 'renshi', 't_admin', 't_high', 't_mid', 't_sub'],
      agenda: '本會議依公立高級中等以下學校教師成績考核辦法辦理，未兼行政教師代表應達法定比例；討論內容涉及個人考核，發言須注意保密義務與程序正義，就事論事，不作人身攻擊。',
    },
  ],
}
