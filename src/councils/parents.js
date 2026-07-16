// ─── 家長會議會（玩家＝家長會長） ───────────────────────────
import { R } from './roles'

export const PARENTS = {
  id: 'parents',
  label: '家長會',
  sub: '會長主持・班級代表與會',
  chairName: '家長會長',
  chairChar: '長',
  chairRoleId: 'p_chair',

  officials: [
    R.principal, R.jiaodao, R.jiaowu, R.xuewu, R.zongwu, R.fudao, R.fudao_t,
    R.p_low, R.p_mid, R.p_high, R.p_kinder, R.p_vice,
  ],

  ext: [R.lizhang, R.jizhe, R.zhiyuan, R.rongyu],

  meetings: [
    {
      id: 'weiyuan',
      name: '家長委員會',
      desc: '各委員對口學校行政處室，提出支援與協調工作。',
      defaultOn: ['principal', 'p_low', 'p_mid', 'p_high', 'p_kinder', 'p_vice'],
      agenda: '本會議為家長委員會，各家長委員分別對口學校的行政處室（教務、學務、總務、輔導），逐一提出家長會能提供的支援與需要協調的工作：活動人力、經費補助、設備贊助、親師溝通事項，並議定工作計畫與經費預算。發言時請具體點名對口的處室與事項；每一筆支出都要對得起捐款家長，校方的需求須說明學校自有預算為何不足。必要時可請對口處室主任列席說明（於點名面板勾選）。',
    },
    {
      id: 'daibiao',
      name: '家長代表大會（家代會議）',
      desc: '各班家長代表大會，聽取會務報告並討論年度方向。',
      defaultOn: ['principal', 'p_low', 'p_mid', 'p_high', 'p_kinder', 'p_vice'],
      agenda: '本會議為家長會最高意思機關，校長列席致意；議題包括會務與財務報告、年度工作方向、家長關心的校務建言。家長會經費來自家長捐款，動支須經大會或委員會同意。',
    },
    {
      id: 'changwu',
      name: '家長常務委員會',
      desc: '常務委員處理緊急或重要行政事務。',
      defaultOn: ['p_mid', 'p_high', 'p_vice'],
      agenda: '本會議為常務委員會，專責處理緊急或重要的行政事務：來不及召開委員會的突發狀況、時效性的支出、對外的緊急回應。決議事後仍須提報委員會追認，發言須衡量授權範圍，避免小會做大決定。',
    },
  ],
}
