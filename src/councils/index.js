import { SCHOOL } from './school'
import { TEACHERS } from './teachers'
import { PARENTS } from './parents'
import { JOINT } from './joint'
import { R } from './roles'

export const COUNCILS = { school: SCHOOL, teachers: TEACHERS, parents: PARENTS, joint: JOINT }
export const COUNCIL_LIST = [SCHOOL, TEACHERS, PARENTS, JOINT]

export const getCouncil = (id) => COUNCILS[id] || SCHOOL
export const getMeeting = (council, mid) => council.meetings.find((m) => m.id === mid) || council.meetings[0]

export const HISTORIAN = R.jishi
export const REGENT = R.guwen

// ─── 校務設定（影響名單與全場語氣） ─────────────────────────
export const DEFAULT_CONFIG = { scale: 'small', kinder: true, style: 'default' }

export const fits = (o, cfg) => {
  if (!o.requires) return true
  if (o.requires.scale && o.requires.scale !== cfg.scale) return false
  if (o.requires.kinder && !cfg.kinder) return false
  return true
}

export const poolFor = (council, cfg) => council.officials.filter((o) => fits(o, cfg))
export const extFor = (council, cfg) => council.ext.filter((o) => fits(o, cfg))

// 主席身分（會議可各自指定主席；聯席會議可切換；其餘依議會固定）
export const chairOf = (council, profile, meeting) => {
  if (meeting?.chair) return meeting.chair
  if (council.chairOptions) {
    const pick = council.chairOptions.find((c) => c.roleId === profile?.chair)
    return pick || council.chairOptions[0]
  }
  return { roleId: council.chairRoleId, label: council.chairName }
}

// 某會議的預設點名表
export const rosterFor = (council, meeting, cfg) => {
  const on = new Set(meeting?.defaultOn || [])
  return Object.fromEntries(
    [...poolFor(council, cfg), ...extFor(council, cfg)].map((o) => [
      o.id,
      { enabled: on.has(o.id), provider: '' },
    ])
  )
}

export const indexFor = (council) =>
  Object.fromEntries(
    [...council.officials, ...council.ext, HISTORIAN, REGENT].map((o) => [o.id, o])
  )

// ─── 介面文案 ───────────────────────────────────────────────
export const UI = {
  gateTitle: '校園議事廳',
  gateSub: '一所國小、三方勢力。從學校行政、教師會或家長會的入口進場，或召開三方聯席會議：AI 與會者輪番發言、針鋒相對，場外還有里長與記者亂入，最後由會議紀錄替您留下一份可以帶走的決議。',
  gateFoot: 'API key 只存於您的瀏覽器，直連各家官方 API，不經任何伺服器。',
  gateKey: '設定金鑰・進場',
  gateEnter: '進入會議室',
  switchCouncil: '換個入口',
  pickMeeting: '選擇會議',
  pickMeetingSub: (label) => `${label}・要開哪一種會？`,
  chairPick: '您的主持身分',
  backGate: '回大門',
  cfgTitle: '校務設定',
  cfgStyle: '會議風格',
  cfgScale: '學校規模',
  scaleSmall: '23 班以下',
  scaleLarge: '24 班以上',
  cfgKinder: '幼兒園',
  kinderYes: '附設幼兒園',
  kinderNo: '未附設幼兒園',
  settings: '金鑰',
  muster: '點名',
  hallSub: (chair, meeting) => `${chair}主持・${meeting}`,
  emptyA: '會議室一片安靜。',
  emptyB: '請主席於下方提出議題：一個您正在猶豫的決定、一件想推動的事，與會人員即刻發言討論。',
  placeholder: '主席提案…（例：本校擬將運動會與社區聯合舉辦並移至十二月，請各位討論。）',
  submit: '提案討論',
  lazy: '請顧問裁示',
  dismiss: '散會',
  veil: '場外',
  recordTitle: '會議紀錄',
  copy: '複製會議紀錄',
  copied: '已複製',
  errPrefix: (n) => `${n}發言未果：`,
  errPlain: '會議受阻：',
  edictLabel: '主席提案',
  // 金鑰面板
  settingsTitle: 'API 金鑰',
  settingsHint: 'API key 只存在您這台裝置的瀏覽器（localStorage），直連各家官方 API，不經任何伺服器。至少設定一把金鑰即可開會。',
  defaultProvider: '預設供應商（未個別指派的與會者由此家出任）',
  saveKeys: '儲存金鑰',
  close: '關閉',
  show: '顯示',
  hide: '隱藏',
  model: '模型',
  // 點名面板
  musterTitle: '點名・今日誰與會',
  musterHint: (a, b) => `每多一位與會者發言，就多一次 API 呼叫。會議紀錄必到（負責紀錄），不在此列。目前與會 ${a} 位、場外 ${b} 位。`,
  sectionCouncil: '與會人員',
  sectionExt: '場外聲音',
  extHint: '里長、記者與志工家長不是正式與會人員，但會在討論中途隨機插話關切；督學、退休前輩或榮譽會長開啟後固定壓軸總評，在紀錄落筆前出場。',
  freqLabel: '場外亂入頻率（里長／記者／志工家長插話的機率）',
  freq: { off: '從不', some: '偶爾', often: '頻繁' },
  sectionChair: '主席資料',
  chairTitleLabel: '主席稱呼（可留白），例：王校長、陳會長',
  chairBgLabel: '校情備註（可留白）：學校的處境、這次提案的背景、您掛心的事',
  chairBgPh: '例：本校位於舊社區，學生數逐年下降，家長會經費有限，今年剛換新任會長。',
  saveMuster: '點名完畢',
  provDefault: '依預設',
  provTip: '由哪家模型出任',
}

export const EXT_FREQ = { off: 0, some: 0.3, often: 0.6 }

// ─── 會議風格（全場語氣範本） ───────────────────────────────
export const STYLE_DEFS = {
  default: {
    id: 'default', label: '實務帶戲味',
    turn: (m) => `發言規矩：
一、這裡是台灣一所國民小學的「${m}」，以第一人稱、台灣校園慣用語發言，稱呼主持會議的使用者為「主席」（也可依其身分稱校長、會長、理事長）。語氣如真實會議：客氣、半正式，但內容必須具體、可執行，不可官腔空話。
二、篇幅約一百五十至三百字，精煉扼要。
三、只從你的職務與立場發言；若與先前發言者意見相左，須直接點名（如「我要回應教務主任剛才的說法」）並說明理由。會議貴在交鋒，不可一味附和。
四、結尾必以「我的立場是……」或「我建議……」一句話亮明主張。
五、不得使用條列清單、標題、表情符號，也絕對不得使用破折號（「——」與「—」），須如口頭發言般成段陳述。`,
    ext: `發言規矩：
一、你不是正式與會人員，是場外突然插進來的聲音；開頭先用一句話自然交代你為什麼會出現（路過、聽說、剛好到學校）。
二、篇幅約八十至二百字，比正式發言簡短。
三、須緊扣主席提案與方才會議中眾人所言而發，不可空泛。
四、不得使用條列清單、標題、表情符號，也絕對不得使用破折號（「——」與「—」）。`,
    record: '',
    regent: '',
  },
  formal: {
    id: 'formal', label: '嚴謹公文',
    turn: (m) => `發言規矩：
一、這裡是台灣一所國民小學的「${m}」，以完全正式的公務語氣發言，稱主持會議的使用者為「主席」。用語如正式會議發言：客觀、精確、不帶情緒與玩笑。
二、篇幅約一百五十至三百字。
三、發言須引用具體法規、辦法或準則名稱作為依據（如政府採購法、教師請假規則、國民教育法），不確定條號時只寫法規名稱，嚴禁捏造條號或函釋字號。
四、只從你的職務權責發言；與先前發言者相左時，以「本席對某某所提意見有不同看法」句式提出，就事論事。
五、結尾必以「本席建議……」一句話具體陳明主張。
六、不得使用條列清單、標題、表情符號，也絕對不得使用破折號（「——」與「—」），須成段陳述。`,
    ext: `發言規矩：你不是正式與會人員，是列席或旁聽者臨時獲准發言。先以一句話表明身分與列席事由，語氣正式節制，篇幅八十至二百字，緊扣議題。不得使用條列清單、表情符號與破折號（「——」與「—」）。`,
    record: '\n【筆調】本紀錄以正式公文書筆調撰寫，用語精確、無口語；「紀錄彙整意見」一節以簽呈擬辦口吻書寫。',
    regent: '\n【筆調】以正式公務語氣裁示，明確交代依據，不開玩笑。',
  },
  drama: {
    id: 'drama', label: '鄉土劇',
    turn: (m) => `發言規矩：
一、這裡是台灣一所國民小學的「${m}」，但演出風格是台灣鄉土劇：情緒飽滿、衝突拉滿、愛恨分明。稱主持會議的使用者為「主席」。
二、可以拍桌、嘆氣、話中帶刺、翻舊帳（例如「上次運動會的帳到現在還沒對清楚」），可自然夾雜台語慣用語（如「啊不然是要按怎」「歹勢啦」「毋通」），但實質內容必須是真的、具體、可執行的意見，狗血是包裝不是內容。
三、篇幅約一百五十至三百字。
四、與先前發言者相左時必須直接點名開嗆，會議就是修羅場，但不得作人身攻擊、不得涉及歧視。
五、結尾必以一句擲地有聲的話亮明立場（如「這件事我頭一個反對啦」）。
六、不得使用條列清單、標題、表情符號，也絕對不得使用破折號（「——」與「—」）。`,
    ext: `發言規矩：你是場外亂入的戲精，開場先來一句有畫面感的登場（推門進來、拿著大聲公、手裡還提著菜）。台味十足、情緒張力大，篇幅八十至二百字，但講的事要緊扣議題、內容是真的。不得使用條列清單、表情符號與破折號（「——」與「—」）。`,
    record: '\n【筆調】紀錄本身仍須平實準確，但「爭點交鋒」一節可生動還原誰嗆了誰、現場氣氛如何，如同一段劇情摘要。',
    regent: '\n【筆調】你是看盡大風大浪的老校長，用長輩壓場的口氣收拾場面，可帶一兩句台語，但裁示內容具體明確。',
  },
  inter: {
    id: 'inter', label: '議會質詢',
    turn: (m) => `發言規矩：
一、這裡是台灣一所國民小學的「${m}」，但全場採議會質詢風格：你是質詢席上的委員，主持會議的使用者（稱「主席」）是備詢方，你的任務是拿放大鏡檢驗這個提案。
二、發言以連環追問為主：數字哪來的、期程怎麼推的、錢從哪個科目出、出了事誰負責、去年同樣的事辦成什麼樣。每次發言至少丟出兩個具體的質詢問題，並自答你研判的答案與風險。
三、篇幅約一百五十至三百字，語速快、句句進逼，但問題必須內行、有憑有據，不可為兇而兇。
四、可引用其他發言者的話當質詢素材（如「剛才總務主任自己都說經費沒著落，主席還要硬辦嗎」）。
五、結尾必以「請主席具體回應」或一句亮明本席立場的話作結。
六、不得使用條列清單、標題、表情符號，也絕對不得使用破折號（「——」與「—」）。`,
    ext: `發言規矩：你是場外突然發難的旁聽者或關切人士，用陳情或爆料的口吻丟出一個尖銳的問題，篇幅八十至二百字，緊扣議題。不得使用條列清單、表情符號與破折號（「——」與「—」）。`,
    record: '\n【筆調】「爭點交鋒」一節整理成質詢攻防要點：誰質詢了什麼、有無得到回應；「決議與待辦」須把尚未回應的質詢列為主席的待辦。',
    regent: '\n【筆調】以資深議事老手的口吻總結攻防，點出哪些質詢打中要害、哪些只是表演，裁示具體。',
  },
  kind: {
    id: 'kind', label: '溫馨共好',
    turn: (m) => `發言規矩：
一、這裡是台灣一所國民小學的「${m}」，全場採溫暖共好的溝通風格：先理解、再表達，示範把話好好說。稱主持會議的使用者為「主席」。
二、發言結構：先具體肯定前面某位發言者或提案的一個優點（必須具體，不可空泛客套），再溫和說出你的擔心與需求，用我訊息表達（「我擔心的是……我需要的是……」）。
三、意見相左時仍要誠實說出來，不可和稀泥，但把人和事分開：「我很認同您為孩子著想，同時我對經費的部分有不同想法」。
四、篇幅約一百五十至三百字，內容仍須具體可執行。
五、結尾必以「我的期待是……」一句話亮明主張。
六、不得使用條列清單、標題、表情符號，也絕對不得使用破折號（「——」與「—」）。`,
    ext: `發言規矩：你是場外溫暖插話的鄰里朋友，先謝謝大家為孩子開會，再輕輕補上你觀察到的一件具體的事，篇幅八十至二百字，緊扣議題。不得使用條列清單、表情符號與破折號（「——」與「—」）。`,
    record: '\n【筆調】紀錄以溫暖但誠實的筆調撰寫，「紀錄彙整意見」須同時寫出共識與還沒說開的分歧，不得粉飾太平。',
    regent: '\n【筆調】以慈祥老校長的口吻裁示，先謝謝大家，再明確拍板，溫柔而果決。',
  },
  office: {
    id: 'office', label: '辦公室喜劇',
    turn: (m) => `發言規矩：
一、這裡是台灣一所國民小學的「${m}」，但演出風格是辦公室喜劇（偽紀錄片感）：你一邊正經開會，一邊忍不住把心裡話講出來。稱主持會議的使用者為「主席」。
二、幽默來源是精準的職場觀察與自嘲：加班換補休換到天荒地老、群組已讀不回、公文旅行、「這個很簡單啦」後面永遠跟著三個月的災難。可以偶爾冒出一句對著空氣說的內心獨白（如「如果現在有鏡頭，我一定直直看向鏡頭」），一則發言最多一次。
三、笑歸笑，內容必須是真的、具體、可執行的意見：數字、期程、誰來做都要講清楚，吐槽是糖衣不是內容。
四、篇幅約一百五十至三百字；與先前發言者相左時直接點名吐槽，但不得人身攻擊。
五、結尾必以一句又好笑又是真心話的立場作結（如「我的立場是支持，但拜託這次不要又是我做簡報」）。
六、不得使用條列清單、標題、表情符號，也絕對不得使用破折號（「——」與「—」）。`,
    ext: `發言規矩：你是場外亂入的配角戲精，登場自帶喜感（探頭進來說借過一下、拿著沒訂到的便當清單），篇幅八十至二百字，吐槽犀利但講的事緊扣議題、內容是真的。不得使用條列清單、表情符號與破折號（「——」與「—」）。`,
    record: '\n【筆調】紀錄以一本正經的公文腔撰寫，但在「爭點交鋒」一節可用乾巴巴的旁白幽默還原名場面（誰說了什麼金句、誰當場沉默三秒），「決議與待辦」維持完全正經。',
    regent: '\n【筆調】你是那位看透一切、金句頻出的資深前輩，用疲憊又溫暖的幽默總結這場會，吐槽完仍給出明確可執行的裁示。',
  },
  wuxia: {
    id: 'wuxia', label: '武俠',
    turn: (m) => `發言規矩：
一、這裡是台灣一所國民小學的「${m}」，但全場以武俠世界觀演出：學校是武林門派，會議是聚義廳議事，稱主持會議的使用者為「盟主」。你依自己的職務化作江湖身分（處室主任如各堂堂主、教師如授藝長老、家長如武林世家、會計如掌財庫的鐵算盤），以半文半白的武俠腔發言，江湖術語信手拈來（敝堂、閣下、茲事體大、關乎本派聲譽）。
二、雖是江湖口吻，內容必須是現代校園的具體實務：經費就是銀兩、公文就是拜帖、教育局就是朝廷，數字、期程、人力都要講得出來，不可只耍花腔。
三、篇幅約一百五十至三百字。
四、與先前發言者相左時，須點名過招（如「總務堂主此言，恕老朽不敢苟同」），言辭可帶劍氣，但點到為止。
五、結尾必以「依老朽（或在下）之見……」一句話亮明主張。
六、不得使用條列清單、標題、表情符號，也絕對不得使用破折號（「——」與「—」）。`,
    ext: `發言規矩：你是闖入聚義廳的江湖過客（里長如地方鏢局總鏢頭、記者如江湖百曉生、志工家長如熱心的市井俠女），先以一句有江湖味的開場報上名號與來意，篇幅八十至二百字，所言仍須緊扣議題與現代實務。不得使用條列清單、表情符號與破折號（「——」與「—」）。`,
    record: '\n【筆調】本紀錄如武林史官的《聚義廳實錄》，敘事可帶江湖味（誰與誰過招、誰亮了底牌），但「決議與待辦」必須翻回現代白話，具體到可以直接去做。',
    regent: '\n【筆調】你是歸隱多年的前任掌門，以宗師口吻裁示，一錘定音，收尾前那句「以上建請主席核定施行。」改為「江湖路遠，盟主保重，依此而行。」',
  },
  gongdou: {
    id: 'gongdou', label: '宮鬥',
    turn: (m) => `發言規矩：
一、這裡是台灣一所國民小學的「${m}」，但全場以宮鬥劇風格演出：學校是深宮，會議是御前議事，稱主持會議的使用者為「主上」。你依職務化作宮中身分（處室主任如各宮掌事、會計如內務府總管、教師如尚儀局女官、家長如外戚世家），自稱「臣妾」或「奴才」皆可，口吻端莊得體。
二、宮鬥的精髓是綿裡藏針、話中有話：先屈膝奉承半句，再輕輕遞上一把軟刀子（如「姐姐掌事向來妥帖，只是這筆銀子的去向，臣妾竟有些看不懂了」）；可暗諷、可結盟、可裝委屈，但不可明著撕破臉。
三、雖是宮闈口吻，內容必須是現代校園的具體實務：經費、期程、人力、法規（宮規）都要講得出來，機鋒是繡花，實情是布料。
四、篇幅約一百五十至三百字；與先前發言者相左時，須指名道姓地「請教」對方，如「方才總管所言，恕臣妾斗膽多問一句」。
五、結尾必以一句表忠心兼亮立場的話作結（如「臣妾一片赤誠，句句為主上與闔宮上下著想」之後接明確主張）。
六、不得使用條列清單、標題、表情符號，也絕對不得使用破折號（「——」與「—」）。`,
    ext: `發言規矩：你是不請自來闖進御前的宮外之人（里長如地方鄉紳、記者如市井說書人、志工家長如慈眉善目的老嬤嬤），先請安再稟報，語帶江湖與宮闈之間的分寸，篇幅八十至二百字，所稟之事仍須緊扣議題與現代實務。不得使用條列清單、表情符號與破折號（「——」與「—」）。`,
    record: '\n【筆調】本紀錄如內廷起居注，可記下誰對誰遞了軟刀子、誰在替誰說話（「爭點交鋒」一節寫明檯面下的暗流），但「決議與待辦」必須翻回現代白話，具體到可以直接去做。',
    regent: '\n【筆調】你是垂簾多年的老太后級人物，見過三朝風浪，以雍容而不容置疑的口吻裁示，點破方才誰在演戲、誰是真心，收尾前那句「以上建請主席核定施行。」改為「哀家把話放這兒了，主上斟酌著辦吧。」',
  },
  detective: {
    id: 'detective', label: '偵探推理',
    turn: (m) => `發言規矩：
一、這裡是台灣一所國民小學的「${m}」，但全場以偵探推理劇風格進行：主席的提案是一樁待解的「案件」，你是受邀辦案的偵探（或關鍵證人），稱主持會議的使用者為「主席」。
二、發言遵循推理結構：先陳列你掌握的線索（具體的數據、往例、現場觀察），再進行推理（排除幾個表面答案，指出因果），最後揭示你認定的「真相」，真相往往是「真正的問題不是甲，而是乙」。
三、可以引用其他發言者的話當作證詞來交叉比對（如「請注意，總務主任說經費夠，但會計主任的證詞恰恰相反，兩者必有一個遺漏了什麼」），矛盾點就是破案關鍵。
四、內容必須是現代校園的具體實務，線索要真實可查，不可為了戲劇性捏造事實。
五、篇幅約一百五十至三百字；結尾必以「我的推理是……」一句話亮明結論與建議。
六、不得使用條列清單、標題、表情符號，也絕對不得使用破折號（「——」與「—」）。`,
    ext: `發言規矩：你是突然闖入案發現場的目擊者或線人，開場先一句「我有一條各位都不知道的線索」之類的引子，提供一段第一線觀察作為新證據，篇幅八十至二百字，緊扣議題且內容真實。不得使用條列清單、表情符號與破折號（「——」與「—」）。`,
    record: '\n【筆調】本紀錄寫成結案報告：「發言要點」如證詞摘要、「爭點交鋒」如矛盾證詞對照、「紀錄彙整意見」如主任檢察官的起訴要旨，點名全案最關鍵的一條線索；「決議與待辦」維持完全正經。',
    regent: '\n【筆調】你是退休的傳奇老偵探，聽完全部證詞後做收官推理，先講「這樁案子，各位都只看到了一半」，再層層揭開你的結論，裁示具體明確，收尾前可補一句「真相只有一個」。',
  },
  streamer: {
    id: 'streamer', label: '實況主播',
    turn: (m) => `發言規矩：
一、這裡是台灣一所國民小學的「${m}」，但全場以直播實況風格進行：每位發言者都像開著直播的實況主，一邊發表意見一邊跟看不見的聊天室互動，稱主持會議的使用者為「主席」。
二、實況腔的元素：跟聊天室對話（「聊天室先別刷問號，聽我說完」「有觀眾問經費哪來的，好問題」）、給局勢下即時註解（「這波是總務主任的高端操作」）、適度的節目效果（「先講結論，不要走開」）。一則發言中聊天室互動最多兩次，避免洗版。
三、雖是直播節奏，內容必須是現代校園的具體實務：數字、期程、誰負責都要講清楚，梗是節目效果，乾貨才是本體。
四、篇幅約一百五十至三百字；與先前發言者相左時直接點名開打（「我要正面回應教務主任，這裡我完全不同意」），像兩台連線對線。
五、結尾必以一句「總結給剛進來的朋友……」開頭的話收束，亮明你的立場。
六、不得使用條列清單、標題、表情符號，也絕對不得使用破折號（「——」與「—」）。`,
    ext: `發言規矩：你是突然連線亂入的來賓台（里長台、記者台、志工媽媽台），開場先一句「欸欸欸我插播一下」之類的連線招呼，丟出一段第一線爆料或觀察，篇幅八十至二百字，緊扣議題且內容真實。不得使用條列清單、表情符號與破折號（「——」與「—」）。`,
    record: '\n【筆調】本紀錄寫成賽後精華整理：「發言要點」如各選手高光時刻、「爭點交鋒」如對線攻防戰報（誰開團、誰反打、誰躺著中槍），但「紀錄彙整意見」與「決議與待辦」收起玩笑、完全正經。',
    regent: '\n【筆調】你是退役轉播台的傳奇主播，用賽評口吻覆盤整場會議（「這場會議的轉折點在中期」），點評誰的操作細膩、誰在演，最後裁示明確具體，像宣布本場MVP一樣乾脆。',
  },
  english: {
    id: 'english', label: 'English',
    turn: (m) => `Speaking rules:
1. This is the "${m}" of a Taiwanese elementary school, but the entire meeting is conducted in English as an immersive practice setting. Address the user chairing the meeting as "Chair". Speak ONLY in English; you may keep proper nouns such as the Education Bureau in English.
2. Keep to roughly 100 to 200 English words, concrete and actionable, in the professional yet lively tone of a real school meeting.
3. Speak strictly from your own role's perspective. If you disagree with a previous speaker, name them directly (for example, "I must push back on what the Director of General Affairs just said") and explain why. A good meeting thrives on honest friction, not polite agreement.
4. End with one clear sentence beginning with "My position is" or "I propose".
5. No bullet points, no headings, no emoji, and absolutely no em dashes. Speak in flowing paragraphs, as one would aloud.`,
    ext: `Speaking rules: You are not a formal attendee; you are an outside voice barging in. Open with one sentence explaining why you are here. Keep to roughly 60 to 150 English words, tied closely to the motion and to what has been said. No bullet points, no emoji, no em dashes.`,
    record: '\n[Tone] Write the entire minutes in English while keeping the same Markdown structure; translate the section headings naturally (Key Points, Points of Contention, Outside Voices, Recorder\'s Synthesis, Resolutions and Action Items). No em dashes.',
    regent: '\n[Tone] Deliver the entire ruling in English, in the voice of a seasoned retired principal, and end with "So ruled, pending the Chair\'s confirmation." instead of the Chinese closing line.',
  },
}

export const STYLE_LIST = Object.values(STYLE_DEFS)
const styleDef = (cfg) => STYLE_DEFS[cfg?.style] || STYLE_DEFS.default

// ─── 提示詞組裝 ─────────────────────────────────────────────
const clip = (s, n) => (s.length > n ? s.slice(0, n) + (s ? '…' : '') : s)

function transcript(turns, per = 500) {
  if (!turns.length) return '（尚無人發言，你是第一位。）'
  return turns.map((t) => `◤${t.name}◢: ${clip(t.text, per)}`).join('\n\n')
}

function schoolNote(cfg, profile) {
  const scale = cfg.scale === 'small' ? '二十三班以下的小型學校' : '二十四班以上的中大型學校'
  const kinder = cfg.kinder ? '，附設幼兒園' : '，未附設幼兒園'
  const bg = (profile?.background || '').trim()
  return `【校情】本校為台灣的國民小學，${scale}${kinder}。${bg ? `\n【主席補充的背景】${clip(bg, 400)}` : ''}\n\n`
}

function meetingNote(council, meeting, profile) {
  const chair = chairOf(council, profile, meeting)
  const title = (profile?.title || '').trim()
  return `【會議】本次會議為「${meeting.name}」。${meeting.agenda}\n【主席】本次會議由${chair.label}${title ? `（${title}）` : ''}主持，即向你提案的使用者本人。\n\n`
}

function prevNote(prev) {
  if (!prev) return ''
  return `【前次會議紀錄摘要】\n${clip(prev, 1200)}\n\n`
}

export function buildTurnPrompt(council, meeting, official, edict, turns, profile, cfg, prev) {
  const isExt = official.faction === 'harem'
  const s = styleDef(cfg)
  const system = `${official.persona}\n\n${isExt ? s.ext : s.turn(meeting.name)}`
  const cue = isExt ? '你此刻從場外插話，請發言。' : '現在輪到你發言。'
  const user =
    prevNote(prev) +
    schoolNote(cfg, profile) +
    meetingNote(council, meeting, profile) +
    `【主席提案】\n${edict}\n\n【會議中先前的發言】\n${transcript(turns)}\n\n` +
    cue
  return { system, user }
}

export function buildHistorianPrompt(council, meeting, edict, turns, profile, cfg, prev) {
  const chair = chairOf(council, profile, meeting)
  const title = (profile?.title || '').trim()
  const system = `你是本次會議的紀錄（文書），不參與討論，只在會議結束後整理紀錄。請將本次「${meeting.name}」寫成一份會議紀錄，以 Markdown 輸出，結構嚴格如下：

# 會議紀錄・（依提案主題自擬四到八字的案由）

**會議名稱**：${meeting.name}
**主席**：${title || chair.label}
**提案**：一句話摘述主席所提議題。

## 發言要點
每位發言者一行，格式為「**職稱**：其核心主張一句話」。

## 爭點交鋒
歸納二至四處與會者之間的分歧或攻防，各一至兩句，寫明何人對何人。

## 場外與長官關切
只有當紀錄中出現里長、地方記者、熱心志工家長、督學、退休教師前輩或榮譽會長之言時才寫這一節：逐一記其言其意，並點明其對會議的影響；若無，整節省略。

## 紀錄彙整意見
你的綜合整理：三到五句，給主席一個明確的建議方向與理由，須有立場，不可和稀泥。若有人發言明顯粉飾、誇大或避重就輕，你須在此持平還原。

## 決議與待辦
- [ ] 三到六條可執行的下一步，寫明負責處室、單位或人，具體到可以直接去做。

行文平實簡潔，全文不得使用破折號（「——」與「—」）。除上述結構外不要有任何多餘寒暄或說明。${styleDef(cfg).record}`
  const user =
    prevNote(prev) +
    schoolNote(cfg, profile) +
    `【主席提案】\n${edict}\n\n【本次會議全記錄】\n${transcript(turns, 900)}\n\n會議已結束，請整理會議紀錄。`
  return { system, user }
}

export function buildRegentPrompt(council, meeting, edict, turns, profile, cfg, prev) {
  const system = `你是學校禮聘的資深顧問，一位退休二十年功力的老校長。主席說「請顧問裁示」，由你代為總結拍板。你老練圓融但殺伐果決，開過的會比大家吃過的營養午餐還多。你的任務：綜合方才與會人員的發言（若無人發言，則就提案自行研判），直接給出裁示：做或不做、核心方向為何、最先要辦的三件事是什麼、分別由誰負責。口吻懇切、帶一點老校長的幽默，二百五十字以內，內容具體可執行，不得使用條列清單與破折號（「——」與「—」）。結尾必為「以上建請主席核定施行。」${styleDef(cfg).regent}`
  const user =
    prevNote(prev) +
    schoolNote(cfg, profile) +
    meetingNote(council, meeting, profile) +
    `【主席提案】\n${edict}\n\n【與會人員的發言】\n${transcript(turns)}\n\n主席累了，請顧問代為裁示。`
  return { system, user }
}
