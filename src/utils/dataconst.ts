export const genderOptions = [
  { label: "未知", value: 0 },
  { label: "男", value: 1 },
  { label: "女", value: 2 }
];
export const genderLables = genderOptions.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

export const authTypeOptions = [
  { label: "临时授权", value: 0 },
  { label: "正式授权", value: 1 },
  { label: "永久授权", value: 2 }
];
export const authTypeLables = authTypeOptions.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

export const treeIconsType = {
  paramGroup: 4
};

export const paramTypeOptions = [
  { label: "未知", value: 0 },
  { label: "数值", value: 1 },
  { label: "字符串", value: 2 },
  { label: "图片", value: 3 },
  { label: "唯一性", value: 4 },
  { label: "完整性", value: 5 },
  { label: "齐套性", value: 6 },
  { label: "水印", value: 7 }
];
export const paramTypeLables = paramTypeOptions.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

export const ruleTypeOptions = [
  { label: "系统内建", value: 0 },
  { label: "用户自定义", value: 1 }
];
export const ruleTypeLables = ruleTypeOptions.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

export const ruleKindOptions = [
  { label: "完整性", value: 0 },
  { label: "合理性", value: 1 },
  { label: "逻辑性", value: 2 }
];
export const ruleKindLables = ruleKindOptions.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});
export const ruleKindType = ["primary", "success", "warning"];

export const limitKindOptions = [
  { label: "强制性", value: 0 },
  { label: "非强制性", value: 1 }
];
export const limitKindLables = limitKindOptions.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 性别值域代码表
export const rc001Options = [
  { label: "未知的性别", value: 0 },
  { label: "男", value: 1 },
  { label: "女", value: 2 },
  { label: "未说明的性别", value: 9 }
];
export const rc001Labels = rc001Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 婚姻状况代码表
export const rc002Options = [
  { label: "未婚", value: "1" },
  { label: "已婚", value: "2" },
  { label: "丧偶", value: "3" },
  { label: "离婚", value: "4" },
  { label: "其他", value: "9" }
];
export const rc002Labels = rc002Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 职业代码表
export const rc003Options = [
  { label: "国家公务员", value: "11" },
  { label: "专业技术人员", value: "13" },
  { label: "职员", value: "17" },
  { label: "企业管理人员", value: "21" },
  { label: "工人", value: "24" },
  { label: "农民", value: "27" },
  { label: "学生", value: "31" },
  { label: "现役军人", value: "37" },
  { label: "自由职业者", value: "51" },
  { label: "个体经营者", value: "54" },
  { label: "无业人员", value: "70" },
  { label: "退（离）休人员", value: "80" },
  { label: "其他", value: "90" }
];
export const rc003Labels = rc003Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 入院时情况代码表
export const rc004Options = [
  { label: "危", value: "1" },
  { label: "急", value: "2" },
  { label: "一般", value: "3" }
];
export const rc004Labels = rc004Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 出院情况代码表
export const rc005Options = [
  { label: "治愈", value: "1" },
  { label: "好转", value: "2" },
  { label: "未愈", value: "3" },
  { label: "死亡", value: "4" },
  { label: "其他", value: "9" }
];
export const rc005Labels = rc005Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 血液学检查结果代码表
export const rc007Options = [
  { label: "未做", value: "0" },
  { label: "阴性", value: "1" },
  { label: "阳性", value: "2" }
];
export const rc007Labels = rc007Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 病案质量代码表
export const rc011Options = [
  { label: "甲", value: "1" },
  { label: "乙", value: "2" },
  { label: "丙", value: "3" }
];
export const rc011Labels = rc011Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 麻醉方式代码表
export const rc013Options = [
  { label: "全身麻醉", value: "01" },
  { label: "吸入麻醉（气管内插管、喉罩、面罩）", value: "0101" },
  { label: "静脉麻醉（全凭静脉麻醉）", value: "0102" },
  { label: "静吸复合麻醉", value: "0103" },
  { label: "基础麻醉（直肠注入、肌肉注射）", value: "0104" },
  { label: "区域麻醉", value: "02" },
  { label: "椎管内麻醉", value: "0201" },
  { label: "蛛网膜下腔阻滞", value: "020101" },
  { label: "硬膜外间隙阻滞（含骶管阻滞）", value: "020102" },
  { label: "蛛网膜下-硬膜外复合麻醉", value: "020103" },
  { label: "神经及神经丛阻滞", value: "0202" },
  { label: "颈丛阻滞", value: "020201" },
  { label: "臂丛阻滞及上肢神经阻滞", value: "020202" },
  { label: "腰骶神经丛阻滞及下肢神经阻滞", value: "020203" },
  { label: "躯干神经阻滞：肋间神经阻滞", value: "020204" },
  { label: "椎旁神经阻滞", value: "020205" },
  { label: "会阴神经阻滞", value: "020206" },
  { label: "交感神经阻滞：星状神经节阻滞", value: "020207" },
  { label: "胸腰交感神经阻滞", value: "020208" },
  { label: "脑神经阻滞：三叉神经阻滞、舌咽神经阻滞", value: "020209" },
  { label: "局部麻醉", value: "03" },
  { label: "表面麻醉", value: "0301" },
  { label: "局部浸润麻醉", value: "0302" },
  { label: "局部阻滞麻醉", value: "0303" },
  { label: "静脉局部麻醉", value: "0304" },
  { label: "针刺镇痛与麻醉", value: "04" },
  { label: "复合麻醉", value: "05" },
  {
    label: "不同药物的复合：普鲁卡因静脉复合全麻，神经安定镇痛麻醉等",
    value: "0501"
  },
  {
    label:
      "不同方法的复合：静吸复合全麻，针药复合麻醉，全身-硬膜外复合麻醉，脊髓-硬膜外复合麻醉等",
    value: "0502"
  },
  {
    label: "特殊方法的复合：全麻复合全身降温（低温麻醉），控制性降压等",
    value: "0503"
  },
  { label: "其他", value: "99" }
];
export const rc013Labels = rc013Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 切口愈合等级代码表
export const rc014Options = [
  { label: "0类切口/0-有手术，但体表无切口或腔镜手术切口", value: "0" },
  { label: "Ⅰ/甲 无菌切口/切口愈合良好", value: "1" },
  { label: "Ⅰ/乙 无菌切口/切口愈合欠佳", value: "2" },
  { label: "Ⅰ/丙 无菌切口/切口化脓", value: "3" },
  { label: "Ⅰ/其他 无菌切口/切口愈合情况不确定", value: "10" },
  { label: "Ⅱ/甲 沾染切口/切口愈合良好", value: "4" },
  { label: "Ⅱ/乙 沾染切口/切口愈合欠佳", value: "5" },
  { label: "Ⅱ/丙 沾染切口/切口化脓", value: "6" },
  { label: "Ⅱ/其他 沾染切口/切口愈合情况不确定", value: "20" },
  { label: "Ⅲ/甲 感染切口/切口愈合良好", value: "7" },
  { label: "Ⅲ/乙 感染切口/切口愈合欠佳", value: "8" },
  { label: "Ⅲ/丙 感染切口/切口化脓", value: "9" },
  { label: "Ⅲ/其他 感染切口/切口愈合情况确定", value: "30" }
];
export const rc014Labels = rc014Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 重症监护室名称代码表
export const rc015Options = [
  { label: "心脏监护室", value: "01" },
  { label: "呼吸监护室", value: "02" },
  { label: "外科监护室", value: "03" },
  { label: "新生儿监护室", value: "04" },
  { label: "儿科监护室", value: "05" },
  { label: "急诊重症监护室", value: "06" },
  { label: "内科重症监护室", value: "07" },
  { label: "其他", value: "99" }
];
export const rc015Labels = rc015Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 判断代码表
export const rc016Options = [
  { label: "是", value: "1" },
  { label: "否", value: "2" }
];
export const rc016Labels = rc016Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 输血反应代码表
export const rc018Options = [
  { label: "未输", value: "0" },
  { label: "有", value: "1" },
  { label: "无", value: "2" }
];
export const rc018Labels = rc018Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 离院方式代码表
export const rc019Options = [
  { label: "医嘱离院", value: "1" },
  { label: "医嘱转院", value: "2" },
  { label: "医嘱转社区卫生服务机构/乡镇卫生院", value: "3" },
  { label: "非医嘱离院", value: "4" },
  { label: "死亡", value: "5" },
  { label: "其他", value: "9" }
];
export const rc019Labels = rc019Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 科别代码表
export const rc023Options = [
  { label: "预防保健科", value: "01" },
  { label: "全科医疗科", value: "02" },
  { label: "内科", value: "03" },
  { label: "呼吸内科专业", value: "0301" },
  { label: "消化内科专业", value: "0302" },
  { label: "神经内科专业", value: "0303" },
  { label: "心血管内科专业", value: "0304" },
  { label: "血液内科专业", value: "0305" },
  { label: "肾病学专业", value: "0306" },
  { label: "内分泌专业", value: "0307" },
  { label: "免疫学专业", value: "0308" },
  { label: "变态反应专业", value: "0309" },
  { label: "老年病专业", value: "0310" },
  { label: "其他", value: "0311" },
  { label: "外科", value: "04" },
  { label: "普通外科专业", value: "0401" },
  { label: "肝脏移植项目", value: "040101" },
  { label: "胰腺移植项目", value: "040102" },
  { label: "小肠移植项目", value: "040103" },
  { label: "神经外科专业", value: "0402" },
  { label: "骨科专业", value: "0403" },
  { label: "泌尿外科专业", value: "0404" },
  { label: "肾脏移植项目", value: "040401" },
  { label: "胸外科专业", value: "0405" },
  { label: "肺脏移植项目", value: "040501" },
  { label: "心脏大血管外科专业", value: "0406" },
  { label: "心脏移植项目", value: "040601" },
  { label: "烧伤科专业", value: "0407" },
  { label: "整形外科专业", value: "0408" },
  { label: "其他", value: "0409" },
  { label: "妇产科", value: "05" },
  { label: "妇科专业", value: "0501" },
  { label: "产科专业", value: "0502" },
  { label: "计划生育专业", value: "0503" },
  { label: "优生学专业", value: "0504" },
  { label: "生殖健康与不孕症专业", value: "0505" },
  { label: "其他", value: "0506" },
  { label: "妇女保健科", value: "06" },
  { label: "青春期保健专业", value: "0601" },
  { label: "围产期保健专业", value: "0602" },
  { label: "更年期保健专业", value: "0603" },
  { label: "妇女心理卫生专业", value: "0604" },
  { label: "妇女营养专业", value: "0605" },
  { label: "其他", value: "0606" },
  { label: "儿科", value: "07" },
  { label: "新生儿专业", value: "0701" },
  { label: "小儿传染病专业", value: "0702" },
  { label: "小儿消化专业", value: "0703" },
  { label: "小儿呼吸专业", value: "0704" },
  { label: "小儿心脏病专业", value: "0705" },
  { label: "小儿肾病专业", value: "0706" },
  { label: "小儿血液病专业", value: "0707" },
  { label: "小儿神经病学专业", value: "0708" },
  { label: "小儿内分泌专业", value: "0709" },
  { label: "小儿遗传病专业", value: "0710" },
  { label: "小儿免疫专业", value: "0711" },
  { label: "其他", value: "0712" },
  { label: "小儿外科", value: "08" },
  { label: "小儿普通外科专业", value: "0801" },
  { label: "小儿骨科专业", value: "0802" },
  { label: "小儿泌尿外科专业", value: "0803" },
  { label: "小儿胸心外科专业", value: "0804" },
  { label: "小儿神经外科专业", value: "0805" },
  { label: "其他", value: "0806" },
  { label: "儿童保健科", value: "09" },
  { label: "儿童生长发育专业", value: "0901" },
  { label: "儿童营养专业", value: "0902" },
  { label: "儿童心理卫生专业", value: "0903" },
  { label: "儿童五官保健专业", value: "0904" },
  { label: "儿童康复专业", value: "0905" },
  { label: "其他", value: "0906" },
  { label: "眼科", value: "10" },
  { label: "耳鼻咽喉科", value: "11" },
  { label: "耳科专业", value: "1101" },
  { label: "鼻科专业", value: "1102" },
  { label: "咽喉科专业", value: "1103" },
  { label: "其他", value: "1104" },
  { label: "口腔科", value: "12" },
  { label: "口腔内科专业", value: "1201" },
  { label: "口腔颌面外科专业", value: "1202" },
  { label: "正畸专业", value: "1203" },
  { label: "口腔修复专业", value: "1204" },
  { label: "口腔预防保健专业", value: "1205" },
  { label: "其他", value: "1206" },
  { label: "皮肤科", value: "13" },
  { label: "皮肤病专业", value: "1301" },
  { label: "性传播疾病专业", value: "1302" },
  { label: "其他", value: "1303" },
  { label: "医疗美容科", value: "14" },
  { label: "精神科", value: "15" },
  { label: "精神病专业", value: "1501" },
  { label: "精神卫生专业", value: "1502" },
  { label: "药物依赖专业", value: "1503" },
  { label: "精神康复专业", value: "1504" },
  { label: "社区防治专业", value: "1505" },
  { label: "临床心理专业", value: "1506" },
  { label: "司法精神专业", value: "1507" },
  { label: "其他", value: "1508" },
  { label: "传染科", value: "16" },
  { label: "肠道传染病专业", value: "1601" },
  { label: "呼吸道传染病专业", value: "1602" },
  { label: "肝炎专业", value: "1603" },
  { label: "虫媒传染病专业", value: "1604" },
  { label: "动物源性传染病专业", value: "1605" },
  { label: "蠕虫病专业", value: "1606" },
  { label: "其他", value: "1607" },
  { label: "结核病科", value: "17" },
  { label: "地方病科", value: "18" },
  { label: "肿瘤科", value: "19" },
  { label: "急诊医学科", value: "20" },
  { label: "康复医学科", value: "21" },
  { label: "运动医学科", value: "22" },
  { label: "职业病科", value: "23" },
  { label: "职业中毒专业", value: "2301" },
  { label: "尘肺专业", value: "2302" },
  { label: "放射病专业", value: "2303" },
  { label: "物理因素损伤专业", value: "2304" },
  { label: "职业健康监护专业", value: "2305" },
  { label: "其他", value: "2306" },
  { label: "临终关怀科", value: "24" },
  { label: "特种医学与军事医学科", value: "25" },
  { label: "麻醉科", value: "26" },
  { label: "疼痛科", value: "27" },
  { label: "重症医学科", value: "28" },
  { label: "医学检验科", value: "30" },
  { label: "临床体液、血液专业", value: "3001" },
  { label: "临床微生物学专业", value: "3002" },
  { label: "临床生化检验专业", value: "3003" },
  { label: "临床免疫、血清学专业", value: "3004" },
  { label: "临床细胞分子遗传学专业", value: "3005" },
  { label: "其他", value: "3006" },
  { label: "病理科", value: "31" },
  { label: "医学影像科", value: "32" },
  { label: "X 线诊断专业", value: "3201" },
  { label: "CT 诊断专业", value: "3202" },
  { label: "磁共振成像诊断专业", value: "3203" },
  { label: "核医学专业", value: "3204" },
  { label: "超声诊断专业", value: "3205" },
  { label: "心电诊断专业", value: "3206" },
  { label: "脑电及脑血流图诊断专业", value: "3207" },
  { label: "神经肌肉电图专业", value: "3208" },
  { label: "介入放射学专业", value: "3209" },
  { label: "放射治疗专业", value: "3210" },
  { label: "其他", value: "3211" },
  { label: "中医科", value: "50" },
  { label: "内科专业", value: "5001" },
  { label: "外科专业", value: "5002" },
  { label: "妇产科专业", value: "5003" },
  { label: "儿科专业", value: "5004" },
  { label: "皮肤科专业", value: "5005" },
  { label: "眼科专业", value: "5006" },
  { label: "耳鼻咽喉科专业", value: "5007" },
  { label: "口腔科专业", value: "5008" },
  { label: "肿瘤科专业", value: "5009" },
  { label: "骨伤科专业", value: "5010" },
  { label: "肛肠科专业", value: "5011" },
  { label: "老年病科专业", value: "5012" },
  { label: "针灸科专业", value: "5013" },
  { label: "推拿科专业", value: "5014" },
  { label: "康复医学专业", value: "5015" },
  { label: "急诊科专业", value: "5016" },
  { label: "预防保健科专业", value: "5017" },
  { label: "其他", value: "5018" },
  { label: "民族医学科", value: "51" },
  { label: "维吾尔医学", value: "5101" },
  { label: "藏医学", value: "5102" },
  { label: "蒙医学", value: "5103" },
  { label: "彝医学", value: "5104" },
  { label: "傣医学", value: "5105" },
  { label: "其他", value: "5106" },
  { label: "中西医结合科", value: "52" },
  { label: "其他业务科室", value: "69" }
];
export const rc023Labels = rc023Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 麻醉分级代码表
export const rc024Options = [
  { label: "ASA P1级 正常的患者", value: "1" },
  { label: "ASA P2级 患者有轻微的临床症状", value: "2" },
  { label: "ASA P3级 患者有明显的临床症状", value: "3" },
  { label: "ASA P4级 患者有明显的临床症状，且危及生命", value: "4" },
  { label: "ASA P5级 如果不手术患者将不能存活", value: "5" },
  { label: "ASA P6级 脑死亡患者", value: "6" }
];
export const rc024Labels = rc024Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 入院途径代码表
export const rc026Options = [
  { label: "急诊", value: "1" },
  { label: "门诊", value: "2" },
  { label: "其他医疗机构转入", value: "3" },
  { label: "其他", value: "9" }
];
export const rc026Labels = rc026Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 入院病情代码表
export const rc027Options = [
  { label: "有", value: "1" },
  { label: "临床未确定", value: "2" },
  { label: "情况不明", value: "3" },
  { label: "无", value: "4" }
];
export const rc027Labels = rc027Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 出院31天内再住院计划代码表
export const rc028Options = [
  { label: "无", value: "1" },
  { label: "有", value: "2" }
];
export const rc028Labels = rc028Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 手术级别代码表
export const rc029Options = [
  { label: "一级手术：指风险较低、过程简单、技术难度底的普通手术", value: "1" },
  {
    label: "二级手术：指有一定风险、过程复杂程度一般、有一定技术难度的手术",
    value: "2"
  },
  { label: "三级手术：指风险较高、过程较复杂、难度较大的手术", value: "3" },
  { label: "四级手术：指风险高、过程复杂、难度大的重大手术", value: "4" }
];
export const rc029Labels = rc029Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// ABO血型代码表
export const rc030Options = [
  { label: "A型", value: "1" },
  { label: "B型", value: "2" },
  { label: "O型", value: "3" },
  { label: "AB型", value: "4" },
  { label: "不详", value: "5" },
  { label: "未查", value: "6" }
];
export const rc030Labels = rc030Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// Rh血型代码表
export const rc031Options = [
  { label: "阴性", value: "1" },
  { label: "阳性", value: "2" },
  { label: "不详", value: "3" },
  { label: "未查", value: "4" }
];
export const rc031Labels = rc031Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// RC032 医疗付费方式代码表
export const rc032Options = [
  { label: "本市城镇职工基本医疗保险", value: "1.1" },
  { label: "外埠城镇职工基本医疗保险", value: "1.2" },
  { label: "本市城乡居民基本医疗保险", value: "2.1" },
  { label: "外埠城镇居民基本医疗保险", value: "2.2" },
  { label: "本市新型农村合作医疗", value: "3.1" },
  { label: "外埠新型农村合作医疗", value: "3.2" },
  { label: "贫困救助", value: "4" },
  { label: "商业医疗保险", value: "5" },
  { label: "全公费", value: "6" },
  { label: "全自费", value: "7" },
  { label: "其他社会保险", value: "8" },
  { label: "其他", value: "9" }
];
export const rc032Labels = rc032Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 联系人关系代码表
export const rc033Options = [
  { label: "本人或户主", value: "0" },
  { label: "配偶", value: "1" },
  { label: "子", value: "2" },
  { label: "女", value: "3" },
  { label: "孙子、孙女或外孙子、外孙女", value: "4" },
  { label: "父母", value: "5" },
  { label: "祖父母或外祖父母", value: "6" },
  { label: "兄弟姐妹", value: "7" },
  { label: "同事同学", value: "8" },
  { label: "其他", value: "9" }
];
export const rc033Labels = rc033Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 民族表
export const rc035Options = [
  { label: "汉族", value: "1" },
  { label: "蒙古族", value: "2" },
  { label: "回族", value: "3" },
  { label: "藏族", value: "4" },
  { label: "维吾尔族", value: "5" },
  { label: "苗族", value: "6" },
  { label: "彝族", value: "7" },
  { label: "壮族", value: "8" },
  { label: "布依族", value: "9" },
  { label: "朝鲜族", value: "10" },
  { label: "满族", value: "11" },
  { label: "侗族", value: "12" },
  { label: "瑶族", value: "13" },
  { label: "白族", value: "14" },
  { label: "土家族", value: "15" },
  { label: "哈尼族", value: "16" },
  { label: "哈萨克族", value: "17" },
  { label: "傣族", value: "18" },
  { label: "黎族", value: "19" },
  { label: "傈僳族", value: "20" },
  { label: "佤族", value: "21" },
  { label: "畲族", value: "22" },
  { label: "高山族", value: "23" },
  { label: "拉祜族", value: "24" },
  { label: "水族", value: "25" },
  { label: "东乡族", value: "26" },
  { label: "纳西族", value: "27" },
  { label: "景颇族", value: "28" },
  { label: "柯尔克孜族", value: "29" },
  { label: "土族", value: "30" },
  { label: "达斡尔族", value: "31" },
  { label: "仫佬族", value: "32" },
  { label: "羌族", value: "33" },
  { label: "布朗族", value: "34" },
  { label: "撒拉族", value: "35" },
  { label: "毛难族", value: "36" },
  { label: "仡佬族", value: "37" },
  { label: "锡伯族", value: "38" },
  { label: "阿昌族", value: "39" },
  { label: "普米族", value: "40" },
  { label: "塔吉克族", value: "41" },
  { label: "怒族", value: "42" },
  { label: "乌孜别克族", value: "43" },
  { label: "俄罗斯族", value: "44" },
  { label: "鄂温克族", value: "45" },
  { label: "德昂族", value: "46" },
  { label: "保安族", value: "47" },
  { label: "裕固族", value: "48" },
  { label: "京族", value: "49" },
  { label: "塔塔尔族", value: "50" },
  { label: "独龙族", value: "51" },
  { label: "鄂伦春族", value: "52" },
  { label: "赫哲族", value: "53" },
  { label: "门巴族", value: "54" },
  { label: "珞巴族", value: "55" },
  { label: "基诺族", value: "56" },
  { label: "其他", value: "66" },
  { label: "外籍人士", value: "99" }
];
export const rc035Labels = rc035Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 省、自治区、直辖市表
export const rc036Options = [
  { label: "北京市", value: "1" },
  { label: "天津市", value: "2" },
  { label: "河北省", value: "3" },
  { label: "山西省", value: "4" },
  { label: "内蒙古", value: "5" },
  { label: "辽宁省", value: "6" },
  { label: "吉林省", value: "7" },
  { label: "黑龙江省", value: "8" },
  { label: "上海市", value: "9" },
  { label: "江苏省", value: "10" },
  { label: "浙江省", value: "11" },
  { label: "安徽省", value: "12" },
  { label: "福建省", value: "13" },
  { label: "江西省", value: "14" },
  { label: "山东省", value: "15" },
  { label: "河南省", value: "16" },
  { label: "湖北省", value: "17" },
  { label: "湖南省", value: "18" },
  { label: "广东省", value: "19" },
  { label: "广西壮族自治区", value: "20" },
  { label: "海南省", value: "21" },
  { label: "四川省", value: "22" },
  { label: "重庆市", value: "23" },
  { label: "贵州省", value: "24" },
  { label: "云南省", value: "25" },
  { label: "西藏自治区", value: "26" },
  { label: "陕西省", value: "27" },
  { label: "甘肃省", value: "28" },
  { label: "青海省", value: "29" },
  { label: "宁夏回族自治区", value: "30" },
  { label: "新疆维吾尔自治区", value: "31" },
  { label: "台湾省", value: "32" },
  { label: "香港特别行政区", value: "33" },
  { label: "澳门特别行政区", value: "34" },
  { label: "外籍", value: "35" }
];
export const rc036Labels = rc036Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 有无药物过敏表
export const rc037Options = [
  { label: "无", value: "1" },
  { label: "有", value: "2" }
];
export const rc037Labels = rc037Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 患者证件类别代码表
export const rc038Options = [
  { label: "居民身份证", value: "1" },
  { label: "中国人民解放军军人身份证件", value: "2" },
  { label: "中国人民武装警察身份证件", value: "3" },
  { label: "港澳居民来往内地通行证", value: "4" },
  { label: "台湾居民来往大陆通行证", value: "5" },
  { label: "护照", value: "6" },
  { label: "外国人永久居住证", value: "7" },
  { label: "其他", value: "9" }
];
export const rc038Labels = rc038Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 判断代码表
export const rc039Options = [
  { label: "否", value: "0" },
  { label: "是", value: "1" }
];
export const rc039Labels = rc039Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 国籍代码表
export const rc040Options = [
  { label: "阿富汗", value: "004" },
  { label: "阿尔巴尼亚", value: "008" },
  { label: "阿尔及利亚", value: "012" },
  { label: "美属萨摩亚", value: "016" },
  { label: "安道尔", value: "020" },
  { label: "安哥拉", value: "024" },
  { label: "安圭拉", value: "660" },
  { label: "南极洲", value: "010" },
  { label: "安提瓜和巴布达", value: "028" },
  { label: "阿根廷", value: "032" },
  { label: "亚美尼亚", value: "051" },
  { label: "阿鲁巴", value: "533" },
  { label: "澳大利亚", value: "036" },
  { label: "奥地利", value: "040" },
  { label: "阿塞拜疆", value: "031" },
  { label: "巴哈马", value: "044" },
  { label: "巴林", value: "048" },
  { label: "孟加拉国", value: "050" },
  { label: "巴巴多斯", value: "052" },
  { label: "白俄罗斯", value: "112" },
  { label: "比利时", value: "056" },
  { label: "伯利兹", value: "084" },
  { label: "贝宁", value: "204" },
  { label: "百慕大", value: "060" },
  { label: "不丹", value: "064" },
  { label: "玻利维亚", value: "068" },
  { label: "波黑", value: "070" },
  { label: "博茨瓦纳", value: "072" },
  { label: "布维岛", value: "074" },
  { label: "巴西", value: "076" },
  { label: "英属印度洋领地", value: "086" },
  { label: "文莱", value: "096" },
  { label: "保加利亚", value: "100" },
  { label: "布基纳法索", value: "854" },
  { label: "布隆迪", value: "108" },
  { label: "柬埔寨", value: "116" },
  { label: "喀麦隆", value: "120" },
  { label: "加拿大", value: "124" },
  { label: "佛得角", value: "132" },
  { label: "开曼群岛", value: "136" },
  { label: "中非", value: "140" },
  { label: "乍得", value: "148" },
  { label: "智利", value: "152" },
  { label: "中国", value: "156" },
  { label: "香港", value: "344" },
  { label: "澳门", value: "446" },
  { label: "台湾", value: "158" },
  { label: "圣诞岛", value: "162" },
  { label: "科科斯（基林）群岛", value: "166" },
  { label: "哥伦比亚", value: "170" },
  { label: "科摩罗", value: "174" },
  { label: "刚果（布）", value: "178" },
  { label: "刚果（金）", value: "180" },
  { label: "库克群岛", value: "184" },
  { label: "哥斯达黎加", value: "188" },
  { label: "科特迪瓦", value: "384" },
  { label: "克罗地亚", value: "191" },
  { label: "古巴", value: "192" },
  { label: "塞浦路斯", value: "196" },
  { label: "捷克", value: "203" },
  { label: "丹麦", value: "208" },
  { label: "吉布提", value: "262" },
  { label: "多米尼克", value: "212" },
  { label: "多米尼加", value: "214" },
  { label: "东帝汶", value: "626" },
  { label: "厄瓜多尔", value: "218" },
  { label: "埃及", value: "818" },
  { label: "萨尔瓦多", value: "222" },
  { label: "赤道几内亚", value: "226" },
  { label: "厄立特里亚", value: "232" },
  { label: "爱沙尼亚", value: "233" },
  { label: "埃塞俄比亚", value: "231" },
  { label: "福克兰群岛（马尔维纳斯）", value: "238" },
  { label: "法罗群岛", value: "234" },
  { label: "斐济", value: "242" },
  { label: "芬兰", value: "246" },
  { label: "法国", value: "250" },
  { label: "法属圭亚那", value: "254" },
  { label: "法属波利尼西亚", value: "258" },
  { label: "法属南部领地", value: "260" },
  { label: "加蓬", value: "266" },
  { label: "冈比亚", value: "270" },
  { label: "格鲁吉亚", value: "268" },
  { label: "德国", value: "276" },
  { label: "加纳", value: "288" },
  { label: "直布罗陀", value: "292" },
  { label: "希腊", value: "300" },
  { label: "格陵兰", value: "304" },
  { label: "格林纳达", value: "308" },
  { label: "瓜德罗普", value: "312" },
  { label: "关岛", value: "316" },
  { label: "危地马拉", value: "320" },
  { label: "几内亚", value: "324" },
  { label: "几内亚比绍", value: "624" },
  { label: "圭亚那", value: "328" },
  { label: "海地", value: "332" },
  { label: "赫德岛和麦克唐纳岛", value: "334" },
  { label: "洪都拉斯", value: "340" },
  { label: "匈牙利", value: "348" },
  { label: "冰岛", value: "352" },
  { label: "印度", value: "356" },
  { label: "印度尼西亚", value: "360" },
  { label: "伊朗", value: "364" },
  { label: "伊拉克", value: "368" },
  { label: "爱尔兰", value: "372" },
  { label: "以色列", value: "376" },
  { label: "意大利", value: "380" },
  { label: "牙买加", value: "388" },
  { label: "日本", value: "392" },
  { label: "约旦", value: "400" },
  { label: "哈萨克斯坦", value: "398" },
  { label: "肯尼亚", value: "404" },
  { label: "基里巴斯", value: "296" },
  { label: "朝鲜", value: "408" },
  { label: "韩国", value: "410" },
  { label: "科威特", value: "414" },
  { label: "吉尔吉斯斯坦", value: "417" },
  { label: "老挝", value: "418" },
  { label: "拉脱维亚", value: "428" },
  { label: "黎巴嫩", value: "422" },
  { label: "莱索托", value: "426" },
  { label: "利比里亚", value: "430" },
  { label: "利比亚", value: "434" },
  { label: "列支敦士登", value: "438" },
  { label: "立陶宛", value: "440" },
  { label: "卢森堡", value: "442" },
  { label: "前南马其顿", value: "807" },
  { label: "马达加斯加", value: "450" },
  { label: "马拉维", value: "454" },
  { label: "马来西亚", value: "458" },
  { label: "马尔代夫", value: "462" },
  { label: "马里", value: "466" },
  { label: "马耳他", value: "470" },
  { label: "马绍尔群岛", value: "584" },
  { label: "马提尼克", value: "474" },
  { label: "毛里塔尼亚", value: "478" },
  { label: "毛里求斯", value: "480" },
  { label: "马约特", value: "175" },
  { label: "墨西哥", value: "484" },
  { label: "密克罗尼西亚联邦", value: "583" },
  { label: "摩尔多瓦", value: "498" },
  { label: "摩纳哥", value: "492" },
  { label: "蒙古", value: "496" },
  { label: "蒙特塞拉特", value: "500" },
  { label: "摩洛哥", value: "504" },
  { label: "莫桑比克", value: "508" },
  { label: "缅甸", value: "104" },
  { label: "纳米比亚", value: "516" },
  { label: "瑙鲁", value: "520" },
  { label: "尼泊尔", value: "524" },
  { label: "荷兰", value: "528" },
  { label: "荷属安的列斯", value: "530" },
  { label: "新喀里多尼亚", value: "540" },
  { label: "新西兰", value: "554" },
  { label: "尼加拉瓜", value: "558" },
  { label: "尼日尔", value: "562" },
  { label: "尼日利亚", value: "566" },
  { label: "纽埃", value: "570" },
  { label: "诺福克岛", value: "574" },
  { label: "北马里亚纳", value: "580" },
  { label: "挪威", value: "578" },
  { label: "阿曼", value: "512" },
  { label: "巴基斯坦", value: "586" },
  { label: "帕劳", value: "585" },
  { label: "巴勒斯坦", value: "275" },
  { label: "巴拿马", value: "591" },
  { label: "巴布亚新几内亚", value: "598" },
  { label: "巴拉圭", value: "600" },
  { label: "秘鲁", value: "604" },
  { label: "菲律宾", value: "608" },
  { label: "皮特凯恩", value: "612" },
  { label: "波兰", value: "616" },
  { label: "葡萄牙", value: "620" },
  { label: "波多黎各", value: "630" },
  { label: "卡塔尔", value: "634" },
  { label: "留尼汪", value: "638" },
  { label: "罗马尼亚", value: "642" },
  { label: "俄罗斯联邦", value: "643" },
  { label: "卢旺达", value: "646" },
  { label: "圣赫勒拿", value: "654" },
  { label: "圣基茨和尼维斯", value: "659" },
  { label: "圣卢西亚", value: "662" },
  { label: "圣皮埃尔和密克隆", value: "666" },
  { label: "圣文森特和格林纳丁斯", value: "670" },
  { label: "萨摩亚", value: "882" },
  { label: "圣马力诺", value: "674" },
  { label: "圣多美和普林西比", value: "678" },
  { label: "沙特阿拉伯", value: "682" },
  { label: "塞内加尔", value: "686" },
  { label: "塞舌尔", value: "690" },
  { label: "塞拉利昂", value: "694" },
  { label: "新加坡", value: "702" },
  { label: "斯洛伐克", value: "703" },
  { label: "斯洛文尼亚", value: "705" },
  { label: "所罗门群岛", value: "90" },
  { label: "索马里", value: "706" },
  { label: "南非", value: "710" },
  { label: "南乔治亚岛和南桑德韦奇岛", value: "239" },
  { label: "西班牙", value: "724" },
  { label: "斯里兰卡", value: "144" },
  { label: "苏丹", value: "736" },
  { label: "苏里南", value: "740" },
  { label: "斯瓦尔巴岛和扬马延岛", value: "744" },
  { label: "斯威士兰", value: "748" },
  { label: "瑞典", value: "752" },
  { label: "瑞士", value: "756" },
  { label: "叙利亚", value: "760" },
  { label: "塔吉克斯坦", value: "762" },
  { label: "坦桑尼亚", value: "834" },
  { label: "泰国", value: "764" },
  { label: "多哥", value: "768" },
  { label: "托克劳", value: "772" },
  { label: "汤加", value: "776" },
  { label: "特立尼达和多巴哥", value: "780" },
  { label: "突尼斯", value: "788" },
  { label: "土耳其", value: "792" },
  { label: "土库曼斯坦", value: "795" },
  { label: "特克斯和凯科斯群岛", value: "796" },
  { label: "图瓦卢", value: "798" },
  { label: "乌干达", value: "800" },
  { label: "乌克兰", value: "804" },
  { label: "阿联酋", value: "784" },
  { label: "英国", value: "826" },
  { label: "美国", value: "840" },
  { label: "美国本土外小岛屿", value: "581" },
  { label: "乌拉圭", value: "858" },
  { label: "乌兹别克斯坦", value: "860" },
  { label: "瓦努阿图", value: "548" },
  { label: "梵蒂冈", value: "336" },
  { label: "委内瑞拉", value: "862" },
  { label: "越南", value: "704" },
  { label: "英属维尔京群岛", value: "92" },
  { label: "美属维尔京群岛", value: "850" },
  { label: "瓦利斯和富图纳", value: "876" },
  { label: "西撤哈拉", value: "732" },
  { label: "也门", value: "887" },
  { label: "南斯拉夫", value: "891" },
  { label: "赞比亚", value: "894" },
  { label: "津巴布韦", value: "716" }
];
export const rc040Labels = rc040Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 就诊类型代码表
export const rc041Options = [
  { label: "急诊", value: "1" },
  { label: "普通门诊", value: "2" },
  { label: "特需门诊", value: "3" },
  { label: "互联网诊疗", value: "4" },
  { label: "MDT门诊", value: "5" },
  { label: "其他", value: "9" }
];
export const rc041Labels = rc041Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 急诊患者分级代码表
export const rc042Options = [
  { label: "Ⅰ级", value: "1", description: "急危患者，需要立即得到救治" },
  { label: "Ⅱ级", value: "2", description: "急重患者，需要评估与救治同事进行" },
  { label: "Ⅲ级", value: "3", description: "急症患者，需要在短时间内得到救治" },
  { label: "Ⅳ级", value: "4", description: "亚急症或非急症患者" }
];
export const rc042Labels = rc042Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 医师职称代码表
export const rc044Options = [
  { label: "主任医师", value: "1" },
  { label: "副主任医师", value: "2" },
  { label: "主治（主管）医师", value: "3" },
  { label: "医师", value: "4" },
  { label: "医士", value: "5" }
];
export const rc044Labels = rc044Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});

// 急诊患者去向代码表
export const rc045Options = [
  { label: "医嘱离院", value: "1" },
  { label: "医嘱转院", value: "2" },
  { label: "医嘱转社区卫生服务机构/乡镇卫生院", value: "3" },
  { label: "非医嘱离院", value: "4" },
  { label: "死亡", value: "5" },
  { label: "急诊留观", value: "6" },
  { label: "急诊转入院", value: "7" },
  { label: "其他", value: "9" }
];
export const rc045Labels = rc045Options.reduce((map, item) => {
  map[item.value] = item.label;
  return map;
}, {});
