import { travelTools } from "./travel-tool-catalog";
import { fraxTool } from "./frax-tool";
export const toolGroups = [
  {
    slug: "cardiovascular",
    name: "心血管健康",
    icon: "heart",
    description: "LDL 目標・十年心血管風險",
    tone: "rose",
  },
  {
    slug: "sleep",
    name: "睡眠健康",
    icon: "moon",
    description: "ISI・STOP-BANG・ESS・睡眠日誌",
    tone: "lavender",
  },
  {
    slug: "mental",
    name: "心理健康",
    icon: "brain",
    description: "PHQ-9・GAD-7",
    tone: "purple",
  },
  {
    slug: "metabolic",
    name: "體重與代謝",
    icon: "scale",
    description: "BMI・代謝症候群・TDEE・腰圍身高比",
    tone: "green",
  },
  {
    slug: "liver-kidney",
    name: "肝腎健康",
    icon: "activity",
    description: "FIB-4・eGFR",
    tone: "amber",
  },
  {
    slug: "prevention",
    name: "預防保健",
    icon: "shield",
    description: "台灣癌篩資格・成人健檢・成人疫苗",
    tone: "teal",
  },
  {
    slug: "older-adults",
    name: "高齡健康",
    icon: "person",
    description: "FRAX・SARC-F・MNA-SF・FRAIL・肌少症量測",
    tone: "sand",
  },
  {
    slug: "travel",
    name: "旅遊健康",
    icon: "plane",
    description: "高山症・瘧疾預防・旅遊疫苗",
    tone: "blue",
  },
] as const;
export type ToolGroup = (typeof toolGroups)[number];
export type ToolSource = { title: string; url: string; detail: string };
export type HealthTool = {
  kind: "calculator" | "questionnaire" | "guide" | "score" | "record";
  slug: string;
  name: string;
  shortName: string;
  group: ToolGroup["slug"];
  icon: string;
  description: string;
  audience: string;
  limitations: string[];
  advice: string;
  formula?: string;
  sources: ToolSource[];
  rights: string;
  validation: string;
  rightsConfirmed: boolean;
  review: {
    status: "pending" | "approved";
    physician: string;
    reviewedAt: string;
  };
  related: { href: string; label: string }[];
};
const pending: HealthTool["review"] = {
  status: "pending",
  physician: "",
  reviewedAt: "",
};
const sleepRelated = [
  {
    href: "/articles/sleep-basics/",
    label: "總是睡不好？先從日常的睡眠習慣開始（示範文章）",
  },
];
const labRelated = [
  {
    href: "/articles/health-check-red-flags/",
    label: "健檢報告有紅字，下一步可以怎麼做？（示範文章）",
  },
];
const phqRights: ToolSource = {
  title: "PHQ and GAD-7 Instructions：使用與重製聲明",
  url: "https://www.uab.edu/medicine/pcp-sci/images/SCIMS/PHQ-9_Instruction_Manual.pdf",
  detail:
    "開發者手冊公開鏡像；原版無須另行取得重製、翻譯、展示、散布許可。仍須確認實際使用的繁體中文版。",
};
export const healthTools: HealthTool[] = [
  fraxTool,
  ...travelTools,
  {
    slug: "bmi",
    kind: "calculator",
    name: "成人 BMI 體位評估",
    shortName: "BMI",
    group: "metabolic",
    icon: "scale",
    description: "透過身高與體重，認識成人體位指標。",
    audience: "18 歲以上成人；結果不能取代營養及身體組成評估。",
    limitations: [
      "未成年人、孕期、運動員與高齡或肌肉量異常者不宜直接套用一般成人切點。",
    ],
    advice: "若對體重、飲食或營養有疑問，請向家庭醫師或營養師諮詢。",
    formula: "體重（kg）÷ 身高（m）²",
    sources: [
      {
        title: "健康體位",
        url: "https://www.hpa.gov.tw/Pages/List.aspx?nodeid=1757",
        detail: "衛生福利部國民健康署，台灣成人體位分類。",
      },
    ],
    rights: "數學公式與體位分類以官方資料查核，本站自行實作介面。",
    validation: "非問卷；依台灣成人體位標準。",
    rightsConfirmed: true,
    review: pending,
    related: [
      {
        href: "/categories/weight-management/",
        label: "體重管理衛教專區（文章準備中）",
      },
    ],
  },
  {
    slug: "fib-4",
    kind: "calculator",
    name: "FIB-4 肝纖維化風險評估",
    shortName: "FIB-4",
    group: "liver-kidney",
    icon: "activity",
    description: "結合年齡、肝功能與血小板，輔助肝纖維化風險分層。",
    audience:
      "成人、檢驗狀況穩定；本站分層僅對應 AASLD 2023 脂肪肝照護情境，不可直接套用所有肝病。",
    limitations: [
      "未滿 18 歲不適用；18–34 歲可看算式結果，但準確度不足，不提供風險分層。",
      "35–65 歲使用較低切點 1.3；大於 65 歲改用 2.0。較高切點為 >2.67，分層依未四捨五入數值。",
      "急性疾病、急性肝損傷或非肝臟原因的血小板異常可能影響判讀。FIB-4 不能診斷肝硬化。",
    ],
    advice:
      "非較低風險區間時，請與醫師討論進一步檢查，例如肝臟彈性檢查。較低值也不能完全排除疾病。",
    formula: "年齡（歲）× AST（U/L）÷〔血小板（10⁹/L）× √ALT（U/L）〕",
    sources: [
      {
        title:
          "Development of a simple noninvasive index to predict significant fibrosis in patients with HIV/HCV coinfection",
        url: "https://pubmed.ncbi.nlm.nih.gov/16729309/",
        detail:
          "Sterling RK et al. Hepatology. 2006;43:1317–1325. DOI: 10.1002/hep.21178。原始族群為 HIV/HCV 共感染，原始切點與本站脂肪肝情境不同。",
      },
      {
        title:
          "AASLD Practice Guidance on the clinical assessment and management of nonalcoholic fatty liver disease",
        url: "https://doi.org/10.1097/HEP.0000000000000323",
        detail:
          "2023 年照護指引；採用 >65 歲的年齡調整定義，65 歲整仍使用 1.3。",
      },
    ],
    rights: "引用公式與指引，自行實作；未重製原文圖表。",
    validation: "非翻譯量表；分層採 AASLD 2023 的成人脂肪肝照護情境。",
    rightsConfirmed: true,
    review: pending,
    related: labRelated,
  },
  {
    slug: "egfr",
    kind: "calculator",
    name: "eGFR 與 KDIGO 腎臟風險評估",
    shortName: "eGFR",
    group: "liver-kidney",
    icon: "activity",
    description: "估算 eGFR，加入 UACR 與已確認病因，查看 KDIGO CGA 分類中的 G／A 風險矩陣。",
    audience:
      "18 歲以上、肌酸酐穩定的非孕成人。公式無種族係數，使用 IDMS 標準化的檢驗值。",
    limitations: [
      "不是 CKD 診斷：單次異常不足以診斷，需評估持續至少三個月的異常、尿白蛋白及其他腎損傷證據。",
      "G1、G2 若無其他腎損傷證據，不能單憑此數值稱為 CKD。",
      "CGA 包含病因（C）、腎功能（G）、尿白蛋白（A）；本工具不推斷病因，僅記錄醫師已確認的原因。矩陣是族群相對風險分層，不是個人洗腎機率或 KFRE 預測。",
      "UACR 使用 mg/g，依 KDIGO 2024 表 3：A1 <30、A2 30–300、A3 >300；300 歸 A2。未填不視為 A1。尿蛋白／肌酸酐比值（UPCR）、尿白蛋白濃度與試紙結果不能直接代入。",
      "運動、發燒、泌尿道感染、血尿或月經等可能影響 UACR；單次異常應由醫師確認並安排複檢，通常以晨起第一次中段尿確認。",
      "急性腎損傷、懷孕、透析、截肢、肌肉量極端或營養不良等情境不宜單獨套用。可能需 cystatin C 或進一步檢查。",
      "輸入性別是原始公式使用的生理參數；跨性別、荷爾蒙治療或無法適用二元參數時，請由醫師個別評估。",
    ],
    advice:
      "若出現尿量明顯減少、呼吸困難或快速惡化，請立即就醫。新發或明顯降低的結果應儘速由醫師判讀，不要自行停藥或調整劑量。",
    formula:
      "142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^−1.200 × 0.9938^年齡 ×〔女性 1.012〕；κ：女性 0.7、男性 0.9；α：女性 −0.241、男性 −0.302；Scr 單位 mg/dL。",
    sources: [
      {
        title: "CKD-EPI Creatinine Equation (2021)",
        url: "https://www.kidney.org/ckd-epi-creatinine-equation-2021",
        detail: "National Kidney Foundation；公式常數與適用對象。",
      },
      {
        title:
          "New Creatinine- and Cystatin C–Based Equations to Estimate GFR without Race",
        url: "https://doi.org/10.1056/NEJMoa2102953",
        detail: "Inker LA et al. N Engl J Med. 2021;385:1737–1749。",
      },
      {
        title:
          "KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of CKD",
        url: "https://kdigo.org/wp-content/uploads/2024/03/KDIGO-2024-CKD-Guideline.pdf",
        detail:
          "2026-11-26 核對。S126 CGA 與 G／A 風險格、S137 表 2–3（A2 含 300 mg/g）；Practice Points 1.1.3.2、1.1.4.1、1.3.1.1。分層不是單次 CKD 診斷或個人事件機率。",
      },
    ],
    rights: "引用公式與分類門檻，以本站 HTML/CSS 自行呈現風險格，未嵌入指引原圖。",
    validation: "非翻譯量表；使用 2021 CKD-EPI 肌酸酐公式。",
    rightsConfirmed: true,
    review: pending,
    related: labRelated,
  },
  {
    slug: "isi",
    kind: "questionnaire",
    name: "ISI 失眠嚴重度評估",
    shortName: "ISI",
    group: "sleep",
    icon: "moon",
    description: "回答 7 題，了解睡不好對生活的影響。",
    audience: "18 歲以上成人，回想過去兩週的睡眠狀況。",
    limitations: [
      "常用 0–7、8–14、15–21、22–28 區間僅為症狀描述，不能診斷失眠症或找出原因。",
    ],
    advice: "睡眠困擾若持續影響白天功能，請尋求醫療評估；嗜睡時避免駕駛。",
    sources: [
      {"title":"PhenX Toolkit：Insomnia（protocol 640801）","url":"https://www.phenxtoolkit.org/protocols/view/640801","detail":"英文 protocol 列出七題構念、選項與計分，標示可自由使用；本站中文閱讀版未經驗證。"},
      {
        title:
          "Validation of the Insomnia Severity Index as an outcome measure for insomnia research",
        url: "https://pubmed.ncbi.nlm.nih.gov/11438246/",
        detail:
          "Bastien CH, Vallières A, Morin CM. Sleep Med. 2001;2:297–307。",
      },
      {
        title: "失眠嚴重度量表中文版的信、效度研究",
        url: "https://tpl.ncl.edu.tw/NclService/JournalContentDetail?SysId=A11034673",
        detail:
          "2009 年台灣研究之書目紀錄；原始題本、繁體字版本與電子呈現等同性尚未核對完成。",
      },
      {
        title: "American Thoracic Society：Insomnia Severity Index",
        url: "https://site.thoracic.org/assemblies/srn/sleep-related-questionnaires/isi",
        detail: "列明須由開發者許可使用；研究發表不等同重製授權。",
      },
    ],
    rights: "ATS 列為需開發者許可；PhenX 將其英文 protocol 標示為無須許可。本站未取得個別繁體中文電子版授權，不宣稱為官方中文版。",
    validation: "本站中文閱讀版依 PhenX 英文 protocol 整理，未經中文版等同性驗證；中文研究不能直接當作本頁的驗證。",
    rightsConfirmed: false,
    review: pending,
    related: sleepRelated,
  },
  {
    slug: "stop-bang",
    kind: "questionnaire",
    name: "STOP-BANG 睡眠呼吸中止篩檢",
    shortName: "STOP-BANG",
    group: "sleep",
    icon: "moon",
    description: "打呼、白天想睡？回答 8 題，了解睡眠呼吸中止風險。",
    audience:
      "18 歲以上成人，約 1 分鐘完成。",
    limitations: [
      "分層除總分也考慮 STOP 子分數與原版 B、N、G 項的組合；不能單用總分排除風險。",
      "較低分數不能排除睡眠呼吸中止，仍可能需要睡眠檢查。",
    ],
    advice:
      "若有睡眠中呼吸中止、明顯嗜睡，請和醫師討論；有駕駛嗜睡時避免駕駛。",
    sources: [
      {"title":"STOP-Bang 官方台灣繁體中文版（2015）","url":"https://www.stopbang.ca/translation/pdf/taiwanese.pdf","detail":"TW-chi 15MAY2015；頸圍採男性 ≥43 公分、女性 ≥41 公分，與目前英文網站切點不同。中文閱讀版依此組指標，不宣稱已取得授權或驗證。"},
      {
        title: "STOP-Bang 官方篩檢與計分",
        url: "https://www.stopbang.ca/osa/screening.html",
        detail: "University Health Network；計分組合參考，不重製題目。",
      },
      {
        title:
          "STOP questionnaire: a tool to screen patients for obstructive sleep apnea",
        url: "https://pubmed.ncbi.nlm.nih.gov/18431116/",
        detail:
          "Chung F et al. Anesthesiology. 2008;108:812–821. DOI: 10.1097/ALN.0b013e31816d83e4；原始開發與驗證研究。",
      },
      {
        title:
          "Evaluation and validation of four translated Chinese questionnaires for obstructive sleep apnea patients in Hong Kong",
        url: "https://pubmed.ncbi.nlm.nih.gov/25182345/",
        detail:
          "Ha SCN et al. Sleep Breath. 2014;18:715–721. DOI: 10.1007/s11325-013-0889-1。",
      },
      {
        title: "STOP-Bang 官方使用許可說明",
        url: "https://www.stopbang.ca/about/contactus.html",
        detail: "須聯絡權利人申請使用；本網站尚未申請或取得。",
      },
    ],
    rights: "官方使用許可需另向 University Health Network 申請，本站未取得個別授權；本頁為中文閱讀版，不宣稱為官方授權版本。",
    validation: "風險因子與頸圍切點依官方 TW-chi 15MAY2015 版；中文閱讀說明未經電子版等同性驗證。",
    rightsConfirmed: false,
    review: pending,
    related: sleepRelated,
  },
  {
    slug: "phq-9",
    kind: "questionnaire",
    name: "PHQ-9 憂鬱症狀篩檢",
    shortName: "PHQ-9",
    group: "mental",
    icon: "brain",
    description: "評估憂鬱症狀，並獨立留意第九題的安全訊號。",
    audience: "18 歲以上成人，回想過去兩週的心情。",
    limitations: [
      "第九題非零時，無論總分多少都需要進一步關心與專業評估；第九題為零也不能保證沒有風險。",
    ],
    advice:
      "症狀影響生活或持續困擾時，可向家庭醫師、身心科或心理專業人員求助；不要只依分數決定是否求助。",
    sources: [
      {"title":"PHQ-9 繁體中文題本（香港版）","url":"https://multiculturalmentalhealth.ca/wp-content/uploads/2019/07/PHQ9_Traditional-Chinese-for-Hong-Kong.pdf","detail":"題本附重製、翻譯、展示及分發聲明；本頁以白話中文呈現，並非逐字驗證版本。"},
      {
        title: "The PHQ-9: Validity of a Brief Depression Severity Measure",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC1495268/",
        detail:
          "Kroenke K, Spitzer RL, Williams JBW. J Gen Intern Med. 2001;16:606–613。",
      },
      {
        title:
          "Validation of Patient Health Questionnaire for depression screening among primary care patients in Taiwan",
        url: "https://pubmed.ncbi.nlm.nih.gov/21111406/",
        detail:
          "Liu SI et al. 台灣基層醫療病人的中文 PHQ-9 驗證研究；實際題本版本仍待核對。",
      },
      phqRights,
    ],
    rights:
      "PHQ 開發者手冊允許重製、翻譯與展示；本站提供中文閱讀版。",
    validation:
      "中文閱讀版參考繁體題本與原始研究；本站用語未經獨立驗證，不宣稱與台灣研究題本等同。",
    rightsConfirmed: false,
    review: pending,
    related: [
      ...sleepRelated,
      {
        href: "/categories/sleep-mental-health/",
        label: "睡眠與身心健康衛教專區",
      },
    ],
  },
  {
    slug: "gad-7",
    kind: "questionnaire",
    name: "GAD-7 焦慮症狀篩檢",
    shortName: "GAD-7",
    group: "mental",
    icon: "brain",
    description: "了解焦慮症狀的嚴重度與需要進一步討論的方向。",
    audience: "18 歲以上成人，回想過去兩週的狀況。",
    limitations: [
      "台灣繁體中文版研究的對象為癲癇患者，該族群的研究切點不能直接泛用一般民眾。",
      "一般症狀區間 0–4、5–9、10–14、15–21，供症狀分數解讀，不是台灣所有族群的診斷切點。",
    ],
    advice:
      "如果焦慮讓你難以工作、休息或維持日常生活，請向醫師或心理專業人員求助，不需等待達到某個分數。",
    sources: [
      {"title":"SBIRT Oregon：GAD-7 繁體中文題本","url":"https://www.sbirtoregon.org/wp-content/uploads/GAD-7-chinese-pdf.pdf","detail":"本站中文閱讀用語參照其七題構念，非台灣驗證研究題本的逐字重製。"},
      {
        title:
          "A brief measure for assessing generalized anxiety disorder: the GAD-7",
        url: "https://pubmed.ncbi.nlm.nih.gov/16717171/",
        detail:
          "Spitzer RL et al. Arch Intern Med. 2006;166:1092–1097. DOI: 10.1001/archinte.166.10.1092。",
      },
      {
        title:
          "Reliability and validity of the traditional Chinese version of the GAD-7 in Taiwanese patients with epilepsy",
        url: "https://pubmed.ncbi.nlm.nih.gov/35584970/",
        detail:
          "Shih YC et al. J Formos Med Assoc. 2022;121:2324–2330. DOI: 10.1016/j.jfma.2022.04.018；不可泛化族群特定切點。",
      },
      phqRights,
    ],
    rights: "PHQ 開發者手冊允許重製、翻譯與展示；本站提供中文閱讀版。",
    validation:
      "本站中文閱讀版未經獨立驗證；台灣癲癇患者研究不能泛化為本頁已驗證。",
    rightsConfirmed: false,
    review: pending,
    related: [
      {
        href: "/categories/sleep-mental-health/",
        label: "睡眠與身心健康衛教專區",
      },
    ],
  },
{
  "slug": "cardiovascular-risk",
  "name": "心血管風險評估",
  "shortName": "十年心血管風險",
  "group": "cardiovascular",
  "icon": "heart",
  "description": "輸入血壓、血脂與病史，估算未來十年一般心血管疾病風險。",
  "audience": "30–74 歲、尚未罹患心血管疾病者。",
  "limitations": [
    "採 Framingham 2008 一般心血管疾病血脂模型，涵蓋冠心病、腦中風、周邊動脈疾病及心衰竭，並非只估算 ASCVD 或心肌梗塞。",
    "源自美國族群，未經本站校準為台灣模型，可能高估或低估個人風險；不能直接用來決定是否用藥。",
    "不適用既有心血管疾病者或原始年齡範圍以外的人。血脂單位為 mg/dL，血壓使用穩定狀態的量測值。",
    "本站血脂與血壓輸入界限為錯誤防護，不代表正常值；超出範圍應由醫療人員判讀。"
  ],
  "advice": "可帶結果與醫師討論血壓、血脂、吸菸及糖尿病控制；有胸痛、呼吸困難或突然神經症狀時應立即就醫，不等待風險計算。",
  "formula": "風險 = 1 − S₀^exp(ΣβX − 平均值)。所有年齡、總膽固醇、HDL 與收縮壓採自然對數；男性 S₀=0.88936、平均值=23.9802，女性 S₀=0.95012、平均值=26.1931。完整係數見 Framingham 官方來源。",
  "sources": [
    {
      "title": "Framingham Heart Study：Cardiovascular Disease (10-year risk)",
      "url": "https://www.framinghamheartstudy.org/fhs-for-researchers/fhs-risk-functions/cardiovascular-disease-10-year-risk/",
      "detail": "2008 primary lipid model；男女係數、基準存活率、中心化常數及適用族群。"
    },
    {
      "title": "General cardiovascular risk profile for use in primary care",
      "url": "https://pubmed.ncbi.nlm.nih.gov/18212285/",
      "detail": "D’Agostino RB et al. Circulation. 2008;117:743–753。"
    }
  ],
  "validation": "非翻譯量表；未宣稱為台灣校準模型。",
  "related": [
    {
      "href": "/articles/home-blood-pressure/",
      "label": "居家血壓量測衛教"
    },
    {
      "href": "/tools/metabolic-syndrome/",
      "label": "代謝症候群自評"
    }
  ],
  "kind": "calculator",
  "rights": "引用公開公式與判定數據，自行實作介面，不重製原文圖表。",
  "rightsConfirmed": true,
  "review": {
    "status": "pending",
    "physician": "",
    "reviewedAt": ""
  }
},
{
  "slug": "metabolic-syndrome",
  "name": "代謝症候群自評",
  "shortName": "代謝症候群",
  "group": "metabolic",
  "icon": "activity",
  "description": "核對台灣五項指標，了解哪些需要追蹤。",
  "audience": "20 歲以上成人，依台灣成人判定標準。",
  "limitations": [
    "五項指標：男性腰圍 ≥90、女性 ≥80 公分；收縮壓 ≥130 或舒張壓 ≥85 mmHg；空腹血糖 ≥100；三酸甘油酯 ≥150；HDL 男性 <40、女性 <50 mg/dL。",
    "降血壓、降血糖及降三酸甘油酯處方治療者，即使數值正常，仍計入相對應指標；不把所有降膽固醇藥都視為降三酸甘油酯治療。",
    "至少三項符合時達到篩檢條件，由醫師確認。空白值或不清楚的用藥不是零分；資料不足時不會假設沒有異常。",
    "請使用空腹至少八小時的血糖與三酸甘油酯報告；單次讀值、懷孕及急性疾病等情境需個別判讀。"
  ],
  "advice": "有符合項目即值得追蹤；三項以上時請帶檢驗報告、量測紀錄與用藥資料和醫師討論。",
  "formula": "五個獨立指標各計一項；至少三項符合時達到代謝症候群篩檢條件。",
  "sources": [
    {
      "title": "國民健康署：成人肥胖防治實證指引",
      "url": "https://health99.hpa.gov.tw/storage/pdf/materials/22062.pdf",
      "detail": "第 45 頁，表 5-1：2007 台灣、20 歲以上成人標準；含血壓、血糖及三酸甘油酯用藥備註。"
    }
  ],
  "validation": "依台灣成人判定標準實作，不以缺失資料推定正常。",
  "related": [
    {
      "href": "/tools/cardiovascular-risk/",
      "label": "十年心血管風險評估"
    },
    {
      "href": "/articles/health-check-red-flags/",
      "label": "健檢報告紅字解讀"
    }
  ],
  "kind": "calculator",
  "rights": "引用公開公式與判定數據，自行實作介面，不重製原文圖表。",
  "rightsConfirmed": true,
  "review": {
    "status": "pending",
    "physician": "",
    "reviewedAt": ""
  }
},
{
  "slug": "tdee",
  "name": "TDEE 每日熱量估算",
  "shortName": "TDEE",
  "group": "metabolic",
  "icon": "scale",
  "description": "以身高、體重、年齡與活動程度，估算維持體重的每日熱量。",
  "audience": "19–78 歲、非懷孕與非哺乳的一般成人。",
  "limitations": [
    "Mifflin–St Jeor 原始樣本年齡為 19–78 歲，本站限制在此年齡範圍。公式估算靜息能量消耗（REE），並不是直接量測的基礎代謝率。",
    "每日總熱量 = 靜息熱量 × 活動係數。活動係數是粗略估計，需同時考慮工作、日常走動及運動強度，不能只看運動次數。",
    "不適用孕期、哺乳、急性疾病、住院營養支持及需要個別營養處方者；運動員、肌肉量或代謝異常也可能有較大誤差。",
    "結果是維持體重的起始估算，不自動提供熱量赤字、增重或減重處方。"
  ],
  "advice": "可依數週的體重趨勢及活動狀況，和營養師或醫師調整熱量；不要只追求單一天的精確數字。",
  "formula": "靜息熱量（大卡／天）= 10×體重(kg) + 6.25×身高(cm) − 5×年齡 + 性別常數（男性 +5、女性 −161）；TDEE = 靜息熱量 × 活動係數（1.2、1.375、1.55、1.725、1.9）。",
  "sources": [
    {
      "title": "A new predictive equation for resting energy expenditure in healthy individuals",
      "url": "https://pubmed.ncbi.nlm.nih.gov/2305711/",
      "detail": "Mifflin MD et al. Am J Clin Nutr. 1990;51:241–247。"
    },
    {
      "title": "教育部平台教材：如何計算一日所需的熱量？",
      "url": "https://cpd.moe.gov.tw/upload/634BC4F2-119C-7ECB-9A9B-12FABDAA765E/17706288881887.pdf",
      "detail": "教材第 11 頁提供五級活動係數；活動係數不是原始 Mifflin 研究本身的公式常數。"
    }
  ],
  "validation": "非翻譯量表；一般成人靜息熱量與活動量估算。",
  "related": [
    {
      "href": "/tools/bmi/",
      "label": "成人 BMI 評估"
    },
    {
      "href": "/categories/weight-management/",
      "label": "體重管理衛教"
    }
  ],
  "kind": "calculator",
  "rights": "引用公開公式與判定數據，自行實作介面，不重製原文圖表。",
  "rightsConfirmed": true,
  "review": {
    "status": "pending",
    "physician": "",
    "reviewedAt": ""
  }
},
{
  "slug": "waist-height-ratio",
  "name": "腰圍身高比",
  "shortName": "腰圍身高比",
  "group": "metabolic",
  "icon": "scale",
  "description": "腰圍除以身高，了解腹部脂肪的簡易指標。",
  "audience": "成人；NICE 分層適用 BMI 小於 35 kg/m²。",
  "limitations": [
    "腰圍與身高使用相同單位。量腰圍時，皮尺水平通過最低肋骨與骨盆上緣的中點，正常吐氣後讀值。",
    "NICE NG246 分層：0.4–<0.5 為腹部脂肪未增加參考區間；0.5–<0.6 為增加；≥0.6 為較高。低於 0.4 不直接宣告健康或診斷營養不良。",
    "風險分層限成人且 BMI <35；體重未填時只說明比值，BMI ≥35 時不套用此風險分層。懷孕、腹水或無法正確量腰圍時不適用。",
    "比值不能單獨診斷肥胖或排除心血管與代謝疾病；65 歲以上也需考慮肌肉量、營養及功能狀態。"
  ],
  "advice": "腰圍達身高一半時，可與醫師討論血壓、血糖及血脂；即使比值較低，仍需依健康狀況安排追蹤。",
  "formula": "腰圍身高比 = 腰圍(cm) ÷ 身高(cm)；身高的一半 = 身高(cm) × 0.5。",
  "sources": [
    {
      "title": "NICE NG246：Identifying and assessing overweight, obesity and central adiposity",
      "url": "https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity",
      "detail": "成人腰圍身高比的適用範圍及 0.5、0.6 分界。"
    },
    {
      "title": "NHS：Calculate your waist to height ratio",
      "url": "https://www.nhs.uk/health-assessment-tools/calculate-your-waist-to-height-ratio",
      "detail": "量測及適用限制；成人 BMI 大於等於 35 時本站不套用分層。"
    }
  ],
  "validation": "非翻譯量表；比例指標參照 NICE，非台灣專屬校準模型。",
  "related": [
    {
      "href": "/tools/metabolic-syndrome/",
      "label": "代謝症候群自評"
    },
    {
      "href": "/tools/bmi/",
      "label": "成人 BMI 評估"
    }
  ],
  "kind": "calculator",
  "rights": "引用公開公式與判定數據，自行實作介面，不重製原文圖表。",
  "rightsConfirmed": true,
  "review": {
    "status": "pending",
    "physician": "",
    "reviewedAt": ""
  }
},
{
  "kind": "guide",
  "group": "prevention",
  "icon": "shield",
  "audience": "台灣成人；公費身分須由院所查核。",
  "rights": "以公開政策事實自行實作判定介面，未重製量表或官方圖表。",
  "validation": "依國民健康署與疾管署公開政策比對；2026-11-26 查核。",
  "rightsConfirmed": true,
  "review": {
    "status": "pending",
    "physician": "",
    "reviewedAt": ""
  },
  "slug": "taiwan-cancer-screening",
  "name": "台灣癌篩資格",
  "shortName": "癌篩資格",
  "description": "輸入年齡與風險條件，查看台灣公費癌症篩檢項目。",
  "limitations": [
    "依 2026 年公費規則比對，以就醫年減出生年計算年齡；政策更新或跨年度後請再查官方公告。",
    "包含乳癌、大腸癌、口腔癌、子宮頸癌、肺癌，以及幽門螺旋桿菌檢測；HPV 病毒檢測與抹片分列。",
    "公費篩檢主要適用無症狀者；有症狀、曾異常、已罹癌或接受器官切除者，須走個別診療流程，不能只依年齡判定。",
    "上次紀錄不清楚時不視為從未受檢；幽門螺旋桿菌包含既有試辦與原鄉吹氣補助紀錄，HPV 須填目前 35／45／65 歲階段的紀錄。",
    "肺癌吸菸包年為每天支數除以 20 再乘吸菸年數；20 包年門檻不先四捨五入，戒菸須未滿 15 年。"
  ],
  "advice": "血便、咳血、不明原因體重減輕、乳房腫塊或持續口腔潰瘍，請直接就醫，不要等待篩檢。",
  "sources": [
    {
      "title": "國民健康署：癌症篩檢",
      "url": "https://www.hpa.gov.tw/Pages/List.aspx?nodeid=211",
      "detail": "乳癌、抹片、HPV、大腸癌及口腔癌補助條件。"
    },
    {
      "title": "國民健康署：肺癌篩檢擴大對象",
      "url": "https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=4878&pid=18996",
      "detail": "肺癌家族史、吸菸史與每兩年一次 LDCT。"
    },
    {
      "title": "國民健康署：胃幽門螺旋桿菌檢測",
      "url": "https://www.hpa.gov.tw/Pages/List.aspx?nodeid=5006",
      "detail": "2026 年起 45–74 歲終身一次糞便抗原檢測。"
    },
    {
      "title": "衛福部口腔健康司：口腔癌篩檢",
      "url": "https://dep.mohw.gov.tw/DOOH/cp-7148-80480-124.html",
      "detail": "吸菸、檳榔史與原住民年齡條件。"
    }
  ],
  "related": [
    {
      "href": "/tools/adult-health-check/",
      "label": "成人健檢資格"
    },
    {
      "href": "/categories/prevention/",
      "label": "預防醫學衛教"
    }
  ]
},
{
  "kind": "guide",
  "group": "prevention",
  "icon": "shield",
  "audience": "台灣成人；公費身分須由院所查核。",
  "rights": "以公開政策事實自行實作判定介面，未重製量表或官方圖表。",
  "validation": "依國民健康署與疾管署公開政策比對；2026-11-26 查核。",
  "rightsConfirmed": true,
  "review": {
    "status": "pending",
    "physician": "",
    "reviewedAt": ""
  },
  "slug": "adult-health-check",
  "name": "成人健檢資格",
  "shortName": "成人健檢",
  "description": "查詢成人預防保健與 B、C 型肝炎篩檢補助。",
  "limitations": [
    "依 2026 年政策，以就醫年減出生年及年度間隔計算，不是以生日或相隔天數判定。",
    "成人健檢可能分兩階段完成；跨級距、已領第一階段或曾異常追蹤者，須由院所查核，不能直接承諾今天可再次申報。",
    "B、C 型肝炎公費篩檢為民國 75 年次含以前至 79 歲終身一次；不等同每年抽血，也不是肝炎確診或疫苗建議。",
    "補助不包含所有自費健檢項目；掛號費等依院所規定。"
  ],
  "advice": "有不舒服或既有慢性病時，請依診療需要回診，不必等待下一次公費健檢。",
  "sources": [
    {
      "title": "國民健康署：成人預防保健",
      "url": "https://www.hpa.gov.tw/Pages/List.aspx?nodeid=189",
      "detail": "30–39 歲每五年、40–64 歲每三年及每年補助族群。"
    },
    {
      "title": "國民健康署：預防保健服務注意事項修正公告",
      "url": "https://www.hpa.gov.tw/838/20378/n",
      "detail": "級距銜接、兩階段及資格查核以院所最新申報規定為準。"
    },
    {
      "title": "臺中市政府衛生局：成人 B、C 型肝炎篩檢",
      "url": "https://www.health.taichung.gov.tw/26198/26327/26938/1509041/1726140",
      "detail": "75 年次（含）以前出生至 79 歲，終身補助一次。"
    }
  ],
  "related": [
    {
      "href": "/articles/health-check-red-flags/",
      "label": "健檢報告有紅字，下一步怎麼做？"
    },
    {
      "href": "/tools/taiwan-cancer-screening/",
      "label": "台灣癌篩資格"
    }
  ]
},
{
  "kind": "guide",
  "group": "prevention",
  "icon": "shield",
  "audience": "台灣成人；公費身分須由院所查核。",
  "rights": "以公開政策事實自行實作判定介面，未重製量表或官方圖表。",
  "validation": "依國民健康署與疾管署公開政策比對；2026-11-26 查核。",
  "rightsConfirmed": true,
  "review": {
    "status": "pending",
    "physician": "",
    "reviewedAt": ""
  },
  "slug": "adult-vaccines",
  "name": "成人疫苗建議",
  "shortName": "成人疫苗",
  "description": "依年齡、健康狀況與紀錄，檢查五項常見成人疫苗。",
  "limitations": [
    "涵蓋流感、新冠、肺炎鏈球菌、重組帶狀疱疹及 Td／Tdap；不是所有成人或旅遊疫苗的完整接種處方。",
    "流感及新冠依 2026 年 10 月起計畫與 11 月第二階段規則比對，跨年度或供應改變時須重新查核；特殊公費身分未必全部列入。",
    "肺炎鏈球菌採 2026 年 8 月 10 日起 PCV20／21 政策。一般慢性病不能直接等同侵襲性肺炎鏈球菌感染高風險。",
    "未提供各劑確切日期，因此不直接判定追加劑今天到期；不清楚紀錄不視為從未接種。",
    "發燒、曾嚴重過敏、懷孕或免疫不全者，接種前須由醫療人員確認。帶狀疱疹疫苗通常自費，地方補助另計。"
  ],
  "advice": "帶健保卡及接種紀錄至家庭醫學科或合約接種院所；若有新傷口，破傷風預防須另行即時評估。",
  "sources": [
    {
      "title": "疾管署：2026 年度流感及新冠疫苗接種專區",
      "url": "https://www.cdc.gov.tw/Category/MPage/S_ZLz0yyc2lAQ9TStMB0uA",
      "detail": "本季公費身分與分階段開放。"
    },
    {
      "title": "疾管署：成人肺炎鏈球菌疫苗",
      "url": "https://www.cdc.gov.tw/Category/Page/U_hY1WCfa5BU6fuqW9FIXg",
      "detail": "2026 年 8 月 10 日起 PCV20／21 公費政策及舊制銜接。"
    },
    {
      "title": "疾管署：帶狀疱疹疫苗",
      "url": "https://www.cdc.gov.tw/Category/Page/WzNj0ONng_AdPtlJc4XDhA",
      "detail": "50 歲以上或 18 歲以上免疫不全者與兩劑間隔。"
    },
    {
      "title": "疾管署：破傷風 Q&A",
      "url": "https://www.cdc.gov.tw/Category/QAPage/8y6ttFL0JxGZAI0BuFvvSg",
      "detail": "成人十年追加與每次懷孕 28–36 週 Tdap。"
    }
  ],
  "related": [
    {
      "href": "/tools/adult-health-check/",
      "label": "成人健檢資格"
    },
    {
      "href": "/tools/taiwan-cancer-screening/",
      "label": "台灣癌篩資格"
    }
  ]
},
{
  "kind": "questionnaire",
  "group": "older-adults",
  "icon": "person",
  "audience": "65 歲以上成人。",
  "rightsConfirmed": true,
  "rights": "依 ICFSR 2020 圖 1 的 RGA 自由使用聲明及 CC BY 4.0 來源，自行轉寫繁中閱讀版；未宣稱為已驗證台灣電子版。",
  "review": {
    "status": "pending",
    "physician": "",
    "reviewedAt": ""
  },
  "slug": "sarc-f",
  "name": "SARC-F 肌少症篩檢",
  "shortName": "SARC-F",
  "description": "直接回答 5 題繁中問題，自動計分並了解肌少症篩檢結果。",
  "limitations": [
    "依 ICFSR 2020 圖 1 的自由使用原題轉寫繁中閱讀版；不是已驗證的台灣繁中電子量表，",
    "總分 0–10 分，4 分以上為需進一步評估的篩檢切點；低分不能排除肌少症。",
    "提物重量為原題 10 磅（約 4.5 公斤）；跌倒回想過去一年，1–3 次得 1 分、4 次以上得 2 分。",
    "走過房間需輔具，或起身沒人協助就無法完成，依相應選項計分；填答時不要特地進行有跌倒風險的測試。",
    "香港族群驗證研究可參考，但不能當成本網站轉寫版本的電子驗證。"
  ],
  "advice": "有反覆跌倒、走路變慢或無力時，可由家庭醫學科、老年醫學科或復健科評估握力與肌肉量。",
  "sources": [
    {
      "title": "Ruiz、Dent、Morley 等（2020）：ICFSR 共識，圖 1",
      "url": "https://researchnow-admin.flinders.edu.au/ws/portalfiles/portal/120575802/Ruiz_Screening_P2020.pdf",
      "detail": "RGA 的 SARC-F、FRAIL 原題及自由使用聲明；本站將英文轉寫為繁中閱讀版，未聲稱台灣電子版已驗證。"
    },
    {
      "title": "Saint Louis University：高齡評估工具與原題本",
      "url": "https://www.slu.edu/medicine/internal-medicine/geriatric-medicine/aging-successfully/",
      "detail": "FRAIL、SARC-F 原題本入口；公開下載不等於取得本站繁中重製權。"
    },
    {
      "title": "Woo et al. 2014：Validating the SARC-F",
      "url": "https://pubmed.ncbi.nlm.nih.gov/24947762/",
      "detail": "香港社區高齡族群驗證；評估適用性與限制。"
    },
    {
      "title": "Chen et al.：AWGS 2025 consensus update",
      "url": "https://doi.org/10.1038/s43587-025-01004-y",
      "detail": "2025 肌肉健康共識；65 歲以上握力切點延續男性 <28、女性 <18 公斤，篩檢不等同確診。"
    }
  ],
  "validation": "已查香港族群研究；本站繁中閱讀轉寫尚未完成台灣電子版驗證。",
  "related": [
    {
      "href": "/tools/sarcopenia/",
      "label": "肌少症量測評估"
    },
    {
      "href": "/tools/mna-sf/",
      "label": "MNA-SF 營養篩檢"
    }
  ]
},
{
  "kind": "questionnaire",
  "group": "older-adults",
  "icon": "person",
  "audience": "65 歲以上成人。",
  "rightsConfirmed": true,
  "rights": "網站持有人於 2026-11-26 本對話確認已有涵蓋公開網頁的使用授權；依此實作繁中逐題作答，未虛構授權編號或電子驗證。",
  "review": {
    "status": "pending",
    "physician": "",
    "reviewedAt": ""
  },
  "slug": "mna-sf",
  "name": "MNA-SF 營養篩檢",
  "shortName": "MNA-SF",
  "description": "回答 6 題繁中問題，結合 BMI 或小腿圍，自動了解營養風險。",
  "limitations": [
    "適用 65 歲以上成人；共 A–F 六題，最高 14 分，不是完整 MNA 的 30 分版本。",
    "D 題「有」得 0 分、「沒有」得 2 分；B 題「不知道」得 1 分。本站依各選項原始權重計分，不以選項順序代替分數。",
    "F1 使用原版 BMI 門檻 19、21、23；不是台灣成人 BMI 的 18.5、24、27。無法取得 BMI 時才以 F2 小腿圍替代，31 公分以上得 3 分、低於 31 得 0 分；F1 與 F2 擇一。",
    "BMI 採未四捨五入的原始計算值判定；水腫、量測困難或精神心理狀況不清楚時，請由醫療人員協助。缺題或缺量測不以零分或正常值補齊。",
    "0–7 分為營養不良篩檢區間、8–11 分有風險、12–14 分正常區間；篩檢不取代個別診斷。",
    "網站持有人確認已有公開網頁使用授權後提供完整繁中題目；本站電子介面未宣稱已獨立驗證。"
  ],
  "advice": "食量變少、體重下降或吞嚥困難時，請與醫師及營養師討論，不只靠增加保健食品。",
  "sources": [
    {
      "title": "MNA 官方題本與授權說明",
      "url": "https://www.mna-elderly.com/mna-forms",
      "detail": "可選中文題本；電子重製權限另需確認。"
    },
    {
      "title": "Kaiser et al. 2009：Validation of the MNA-SF",
      "url": "https://www.mna-elderly.com/sites/default/files/2021-09/420.pdf",
      "detail": "修訂版三分類與 0–14 分總分。"
    },
    {
      "title": "Tsai et al.：台灣族群的 MNA-SF 調整研究",
      "url": "https://pubmed.ncbi.nlm.nih.gov/19523628/",
      "detail": "台灣不同人體測量切點的版本研究，不能據此冒稱本站原版網頁已驗證。"
    },
    {
      "title": "金門縣政府：長者評估手冊附錄 MNA® 繁中題本",
      "url": "https://ws.kinmen.gov.tw/Download.ashx?n=MeOAgemHkemWgOe4o%2Bihm%2BeUn%2BWxgOi%2BpueQhuihm%2BeUn%2Bemj%2BWIqemDqOWci%2BawkeWBpeW6t%2Be9sjExNeW5tOmVt%2BiAheWBpeW6t%2BS%2Fg%2BmAsuermeioiOeVq%2BS9nOalremgiOefpS5wZGY%3D&u=LzAwMS9VcGxvYWQvMzE2L2NrZmlsZS9iN2ViYzViOS02OTI5LTQ0YzMtYThjMS0zZjgwN2FjN2EwM2UucGRm",
      "detail": "核對原版 A–F、D 題 0／2 權重及 F1／F2 擇一；© Nestlé 1994, Revision 2009。"
    }
  ],
  "validation": "參照原版修訂 MNA-SF 繁中題本及已查台灣版本研究；不混用台灣調整版切點，不宣稱本站電子介面已驗證。",
  "related": [
    {
      "href": "/tools/frail/",
      "label": "FRAIL 衰弱篩檢"
    },
    {
      "href": "/tools/sarcopenia/",
      "label": "肌少症量測評估"
    }
  ]
},
{
  "kind": "questionnaire",
  "group": "older-adults",
  "icon": "person",
  "audience": "65 歲以上成人。",
  "rightsConfirmed": true,
  "rights": "依 ICFSR 2020 圖 1 的 RGA 自由使用聲明及 CC BY 4.0 來源，自行轉寫繁中閱讀版；未宣稱為已驗證台灣電子版。",
  "review": {
    "status": "pending",
    "physician": "",
    "reviewedAt": ""
  },
  "slug": "frail",
  "name": "FRAIL 衰弱篩檢",
  "shortName": "FRAIL",
  "description": "直接回答 5 題繁中問題，自動計分並了解衰弱篩檢結果。",
  "limitations": [
    "依 ICFSR 2020 圖 1 的 RGA 簡版轉寫繁中閱讀版；不是已驗證的台灣繁中電子量表，",
    "此頁固定採 RGA 的六個月體重版本；疾病數採超過 5 種（至少 6 種），體重下降採過去 6 個月超過 5%，不要與原始 12 個月版本混用。",
    "每題否為 0、是為 1；總分 0 為未達切點、1–2 分為衰弱前期、3–5 分為衰弱篩檢區間。",
    "香港及原始研究的驗證結果不能直接當成本網站繁中轉寫版的驗證。FRAIL 不等同 Fried 表型或 CFS。"
  ],
  "advice": "衰弱或衰弱前期可安排營養、用藥、身體功能與跌倒風險評估；避免自行進行有跌倒風險的測試。",
  "sources": [
    {
      "title": "Ruiz、Dent、Morley 等（2020）：ICFSR 共識，圖 1",
      "url": "https://researchnow-admin.flinders.edu.au/ws/portalfiles/portal/120575802/Ruiz_Screening_P2020.pdf",
      "detail": "RGA 的 SARC-F、FRAIL 原題及自由使用聲明；本站將英文轉寫為繁中閱讀版，未聲稱台灣電子版已驗證。"
    },
    {
      "title": "Saint Louis University：高齡評估工具與原題本",
      "url": "https://www.slu.edu/medicine/internal-medicine/geriatric-medicine/aging-successfully/",
      "detail": "FRAIL、SARC-F 原題本入口；公開下載不等於取得本站繁中重製權。"
    },
    {
      "title": "Morley et al. 2012：原始 FRAIL 研究",
      "url": "https://pubmed.ncbi.nlm.nih.gov/22836700/",
      "detail": "總分與預測效度；不是台灣繁中驗證。"
    },
    {
      "title": "Woo et al. 2015：Frailty Screening in the Community Using the FRAIL Scale",
      "url": "https://pubmed.ncbi.nlm.nih.gov/25732832/",
      "detail": "香港 65 歲以上社區族群篩檢研究。"
    }
  ],
  "validation": "已查香港族群研究；本站繁中閱讀轉寫尚未完成台灣電子版驗證。",
  "related": [
    {
      "href": "/tools/mna-sf/",
      "label": "MNA-SF 營養篩檢"
    },
    {
      "href": "/tools/sarcopenia/",
      "label": "肌少症量測評估"
    }
  ]
},
{
  "kind": "questionnaire",
  "group": "sleep",
  "icon": "moon",
  "audience": "18 歲以上成人。",
  "rightsConfirmed": true,
  "rights": "網站持有人於 2026-11-26 本對話確認已有涵蓋公開網頁的使用授權；依此實作繁中逐題作答，未虛構授權編號或電子驗證。",
  "review": {
    "status": "pending",
    "physician": "",
    "reviewedAt": ""
  },
  "slug": "ess",
  "name": "ESS 日間嗜睡評估",
  "shortName": "ESS",
  "description": "回答 8 種日常情境，自動評估白天嗜睡程度。",
  "limitations": [
    "成人版 ESS 共 8 題，每題 0–3 分，總分 0–24 分；11 分以上為日間嗜睡偏高，依官方分級顯示。",
    "請依最近生活常態評估打瞌睡或睡著的可能性，不是只有疲倦；沒有經歷過的情境仍依題本說明推想。任何一題未答都不產生結果。",
    "ESS 不是睡眠呼吸中止診斷，也不能用於判定駕駛適任；有症狀即使分數低仍需評估。",
    "網站持有人確認已有公開網頁使用授權後提供完整繁中題目。本站電子介面未宣稱已獨立驗證。"
  ],
  "advice": "想睡時不要開車或操作危險機械；若經常不由自主睡著，或伴隨打呼與呼吸暫停，請安排睡眠門診。",
  "sources": [
    {
      "title": "ESS 官方分數解釋",
      "url": "https://epworthsleepinessscale.com/about-the-ess/",
      "detail": "總分、分級及使用限制。"
    },
    {
      "title": "ESS 官方授權規定",
      "url": "https://epworthsleepinessscale.com/licenses/",
      "detail": "無論是否收費均需取得使用授權。"
    },
    {
      "title": "Chen et al. 2002：Validation of a Chinese version of the ESS",
      "url": "https://pubmed.ncbi.nlm.nih.gov/12482165/",
      "detail": "台灣睡眠中心的中文版驗證研究；驗證不等於取得重製權。"
    },
    {
      "title": "臺北市立聯合醫院陽明院區：繁中 ESS 題本",
      "url": "https://www-ws.gov.taipei/Download.ashx?icon=..pdf&n=RVNTX%2BmZveaYjuedoeecoOS4reW%2Fgy5wZGY%3D&u=LzAwMS9VcGxvYWQvNTE3L3JlbGZpbGUvMjMzODUvMTQyNDUvYTY1YTRjNGYtYzk0MS00YmIxLWI4MDQtMTQ5ZjVmZTMwOGE1LnBkZg%3D%3D",
      "detail": "核對 8 種情境、繁中作答說明與選項；© M. W. Johns 1990–1997。"
    }
  ],
  "validation": "已查 Chen 等人 2002 年台灣中文版驗證研究；本站電子介面未冒稱另經驗證，",
  "related": [
    {
      "href": "/tools/sleep-diary/",
      "label": "睡眠日誌"
    },
    {
      "href": "/tools/stop-bang/",
      "label": "睡眠呼吸中止篩檢"
    }
  ]
},
{
  "kind": "calculator",
  "group": "older-adults",
  "icon": "person",
  "audience": "65 歲以上成人。",
  "rightsConfirmed": true,
  "rights": "引用公開量測切點，自行設計介面與說明，不重製量表題目或原文圖表。",
  "review": {
    "status": "pending",
    "physician": "",
    "reviewedAt": ""
  },
  "slug": "sarcopenia",
  "name": "肌少症量測評估",
  "shortName": "肌少症量測",
  "description": "輸入小腿圍與握力，查看是否需要進一步評估。",
  "limitations": [
    "此頁限 65 歲以上成人；50–64 歲在新共識的握力切點不同，本站不直接套用。",
    "小腿圍男性 <34 公分、女性 <33 公分為篩檢提示；握力男性 <28 公斤、女性 <18 公斤為低肌力參考切點。等於切點不算偏低。",
    "小腿圍不是肌肉量檢查；水腫、體脂、量測姿勢與手部疼痛均可能干擾。量測應由醫療人員確認。",
    "AWGS 2025 確診強調肌肉量與肌力；本站未量肌肉量，不直接診斷肌少症，也不靠起立速度或小腿圍確診。",
    "缺少量測會標示未測量，不當作正常。"
  ],
  "advice": "有跌倒、活動功能下降、體重減輕或量測偏低時，可洽家庭醫學科、老年醫學科或復健科安排完整評估。",
  "sources": [
    {
      "title": "Chen et al.：AWGS 2025 consensus update",
      "url": "https://doi.org/10.1038/s43587-025-01004-y",
      "detail": "2025 肌肉健康共識；65 歲以上握力切點延續男性 <28、女性 <18 公斤，篩檢不等同確診。"
    },
    {
      "title": "Chen et al.：AWGS 2019 Consensus Update",
      "url": "https://doi.org/10.1016/j.jamda.2019.12.012",
      "detail": "小腿圍篩檢及高齡成人握力切點；本站不複製診斷流程圖。"
    }
  ],
  "validation": "採公開共識的 65 歲以上量測切點；非問卷，非單獨診斷。",
  "related": [
    {
      "href": "/tools/sarc-f/",
      "label": "SARC-F 肌少症篩檢"
    },
    {
      "href": "/tools/mna-sf/",
      "label": "MNA-SF 營養篩檢"
    }
  ]
},
{
  "kind": "record",
  "group": "sleep",
  "icon": "moon",
  "audience": "成人記錄單次在床未滿 24 小時的睡眠。",
  "rightsConfirmed": true,
  "rights": "自行設計生活紀錄欄位，僅引用公開睡眠時間定義；非原版或翻譯版 Consensus Sleep Diary，未重製原題本。",
  "review": {
    "status": "pending",
    "physician": "",
    "reviewedAt": ""
  },
  "slug": "sleep-diary",
  "name": "睡眠日誌",
  "shortName": "睡眠日誌",
  "description": "記錄最多 14 天，自動整理睡眠時間與睡眠效率，可下載或列印。",
  "limitations": [
    "這是本站自行設計的紀錄工具，不是經驗證的 Consensus Sleep Diary 中文版，也不是睡眠檢查。",
    "在床時間依上床至離床的下一個時間點計算；估計睡眠時間扣除入睡前、睡中與最後醒來後的清醒分鐘。跨午夜會自動處理，同一時間起訖或超過 24 小時不適用。",
    "整體睡眠效率為所有紀錄的睡眠分鐘總和除以在床分鐘總和；不是每天百分比的簡單平均，小睡另列。",
    "紀錄日期採離床日；最多 14 天，資料只存在目前分頁，重新整理或離開後不保留，可自行下載 CSV。",
    "不根據睡眠效率給睡眠限制或藥物調整建議。"
  ],
  "advice": "若睡眠問題持續影響生活，可帶一至兩週日誌到家庭醫學科或睡眠門診討論。",
  "sources": [
    {
      "title": "Carney et al. 2012：The Consensus Sleep Diary",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC3250369/",
      "detail": "睡眠自我監測的原始研究；本站只參考時間定義，未重製量表。"
    },
    {
      "title": "Reed & Sacco 2016：Measuring Sleep Efficiency",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC4751425/",
      "detail": "睡眠效率分母與在床時間的定義。"
    },
    {
      "title": "匹茲堡大學：睡眠量測工具及原版 CSD 使用條件",
      "url": "https://www.sleep.pitt.edu/research/measures-and-study-instruments",
      "detail": "原版日誌有不改動等使用條件，本站介面不冒稱為原版。"
    }
  ],
  "validation": "本站生活紀錄工具，未聲稱通過中文版量表驗證。",
  "related": [
    {
      "href": "/tools/isi/",
      "label": "失眠嚴重度評估"
    },
    {
      "href": "/tools/ess/",
      "label": "ESS 日間嗜睡評估"
    }
  ]
},
{
  "kind": "calculator",
  "slug": "ldl-target",
  "name": "台灣健保 LDL 目標",
  "shortName": "LDL 目標",
  "group": "cardiovascular",
  "icon": "heart",
  "description": "依健保表一的疾病與六項風險因子，查看 LDL 目標、達標情況及起始用藥門檻。",
  "audience": "18 歲以上一般成人；透析、孕期及特殊疾病須個別評估。",
  "limitations": [
    "依 2026 年 9 月 1 日生效的健保降膽固醇藥物給付規定表一，於 2026 年 11 月 26 日核對；不是每一項降血脂藥品的給付核准工具。",
    "目標均為嚴格低於：極高55、非常高70、高100、中115、低130、0項心血管風險因子160 mg/dL；起始血脂門檻則為大於等於相同數值。",
    "非常高風險限符合表一的臨床 ASCVD 或影像顯著斑塊定義；缺血性中風／TIA 須合併動脈硬化疾病，不能把所有中風都視為同類。極高風險採條文指定疾病組合，不能把單純冠心病加糖尿病直接升為55。",
    "高風險包含糖尿病、透析前已確診慢性腎臟病、已知 LDL-C ≥190，或 CAC ≥400。慢性腎臟病不能只用一次 eGFR 或尿蛋白異常自行診斷；已用藥須保留用藥前 LDL 病史。",
    "六項風險因子為高血壓、年齡（男≥45／女≥55）、早發冠心病家族史（男性家屬≤55／女性家屬≤65）、低HDL（男<40／女<50）、目前吸菸、代謝症候群。依表一各項獨立計數，不因重疊組成而扣除，HDL≥60亦不額外減一。",
    "未知資料不當成沒有。若未知項目會影響分類，只顯示已知分類及可能目標範圍，不指定單一個人目標；若上下界仍在同一類可顯示該目標。",
    "中、低與0項風險因子族群，起始藥物前須依表一完成3–6個月生活型態調整與紀錄查核。已治療者不以現在較低的數值否定原有給付，不能自行停藥或調藥。",
    "部分品項適用表二，ezetimibe、PCSK9等亦有個別條文。2026年10月29日公告的品項修正於12月1日才生效；本頁不提前套用，也不提供特定藥品代碼審核。",
    "non-HDL = 總膽固醇 − HDL，僅為次要目標；表一0項風險因子列未另定non-HDL目標，本頁不自行補入。"
  ],
  "advice": "帶用藥前與本次檢驗報告、診斷與用藥紀錄和醫師討論；單次篩檢結果不能取代診斷，也不能自行決定處方或健保申報。",
  "sources": [
    {
      "title": "健保署：第2節藥品給付規定，2.6.1表一及風險定義",
      "url": "https://www.nhi.gov.tw/ch/dl-55676-3f0c34a22fda48cb95db47b4807637ab-1.pdf",
      "detail": "第14–17頁，115/9/1表一：六層目標、ASCVD及風險因子、處方追蹤；第18頁另有表二。"
    },
    {
      "title": "健保署：降血脂藥品專區",
      "url": "https://www.nhi.gov.tw/ch/cp-20383-d3598-4167-1.html",
      "detail": "核對適用表一／表二的品項，實際給付需依藥品代碼與個別條文。"
    },
    {
      "title": "健保署：115/10/29公告（115/12/1生效）",
      "url": "https://www.nhi.gov.tw/ch/cp-20681-3808b-3258-1.html",
      "detail": "後續品項名單異動的公告；截至115/11/26尚未生效，不提前套用。"
    }
  ],
  "rights": "依政府公開給付規定的事實與數據自行實作，不複製原圖表或商業計算器。",
  "rightsConfirmed": true,
  "validation": "規則及切點依健保署原文逐項實作；未完成醫師審閱，不冒稱為健保官方審核或臨床診斷。",
  "review": {
    "status": "pending",
    "physician": "",
    "reviewedAt": ""
  },
  "related": [
    { "href": "/articles/ldl-cholesterol/", "label": "LDL 膽固醇過高，一定要吃藥嗎？" },
    {
      "href": "/tools/metabolic-syndrome/",
      "label": "代謝症候群五項自評"
    },
    {
      "href": "/tools/cardiovascular-risk/",
      "label": "十年心血管風險評估"
    },
    {
      "href": "/articles/health-check-red-flags/",
      "label": "健檢報告有紅字，下一步怎麼做？"
    }
  ]
}
];
export function getHealthTool(slug: string) {
  return healthTools.find((t) => t.slug === slug);
}
export function getToolGroup(slug: string) {
  return toolGroups.find((g) => g.slug === slug);
}
