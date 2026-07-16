// ─── 教師會議會（玩家＝教師會理事長） ───────────────────────
import { R } from './roles'

export const TEACHERS = {
  id: 'teachers',
  label: '教師會',
  sub: '理事長主持・會員代表與會',
  chairName: '教師會理事長',
  chairChar: '師',
  chairRoleId: 't_chair',

  officials: [
    R.t_admin, R.t_low, R.t_mid, R.t_high, R.t_kinder, R.t_sub,
  ],

  ext: [R.lizhang, R.jizhe, R.zhiyuan, R.qianbei],

  meetings: [
    {
      id: 'lishi',
      name: '理事會議',
      desc: '理事推動會務，進行校內的預先協調與溝通。',
      defaultOn: ['t_admin', 't_low', 't_mid', 't_high'],
      agenda: '本會議為教師會理事會議，與會者皆為理事。理事的職責是會務的推動與校內的預先協調溝通：活動與提案怎麼推、先跟哪個處室通氣、會員的意見怎麼彙整成一致的口徑，重點是把事情在檯面下先喬順，正式場合才不會擦槍走火。',
    },
    {
      id: 'lijianshi',
      name: '理監事會議',
      desc: '理事報告會務，監事監督會務推展與經費收支。',
      defaultOn: ['t_admin', 't_mid', 't_high', 't_sub'],
      agenda: '本會議為理監事聯席會議：理事報告會務推動與協調進度，監事的職責是監督會務推展與經費收支，就帳目、程序與執行成效提出質疑與把關，並決定哪些案子要提到會員代表大會表決。發言可以比大會直白，但仍須評估會員買不買單。',
    },
    {
      id: 'huiyuan',
      name: '會員代表大會',
      desc: '會員代表大會，討論會務、章程與教師權益重大議題。',
      defaultOn: ['t_admin', 't_low', 't_mid', 't_high', 't_kinder', 't_sub'],
      agenda: '本會議為學校教師會（教師自主成立之專業團體）的會員代表大會，議題聚焦教師專業自主與勞動權益：工作負擔、非教學業務、活動支援、代課與補償等。決議代表教師會對校方的正式立場，發言須衡量可行性與團體形象。',
    },
  ],
}
