import Dexie from 'dexie'
const { remote, ipcRenderer } = window.require('electron')
const path = window.require('path')
const { app } = remote
const electronPath = app.getPath('exe')
const installRootPath = path.dirname(electronPath)
ipcRenderer.on('before-quit', (event, message) => {
  console.log(message); // 打印收到的消息
  // 在这里执行渲染进程需要的操作，比如数据保存等
  db.close()
});
export const db = new Dexie('myDatabase')//数据库名称：myDatabase


db.version(2).stores({
  education: '++id, name, sort, starTimer,theoryDesc', // Primary key and indexed props 对象仓库（objectStore）：friends，唯一的id作为键路径（key path）
  videoData: '++id, name, imgUrl, starTimer,videoUrl',
  topicData: '++id, name, optionA,optionB,optionC,optionD,correctOptions,starTimer',
  scoreData: '++id, name, score,starTimer',
  psd: 'password',
  Software: '++id, name, imgUrl, runFilePath, softNumber, type, starTimer'
})
db.version(3).stores({
  education: '++id, name, sort, starTimer,theoryDesc',
  videoData: '++id, name, imgUrl, starTimer,videoUrl',
  topicData: '++id, name, optionA,optionB,optionC,optionD,correctOptions,starTimer',
  scoreData: '++id, name, score,starTimer',
  psd: 'password',
  Software: '++id, name, imgUrl, runFilePath, softNumber, type, starTimer, role'
})
db.open()
db.on('populate', function() {
  console.log('Electron 安装路径:', installRootPath)
  db.education.bulkPut([
    {
      id: 1,
      name: '常见触电原因',
      sort: 1,
      starTimer: '2024-02-19',
      theoryDesc: '<p>1．缺乏电气安全知识。如带电拉高压隔离开关、用手触摸破的胶盖刀闸、儿童玩弄带电导线等。</p><p>2．违反操作规程。如在高低压共杆架设的线路电杆上，检修低线或广播线、剪修高压线附近树木而接触高压线、在高压线附近施工，或运输大型货物，施工工具和货物碰击高压线、带电接临时明线及临时电源、火线误接在电动工具外壳上、用湿手拧灯泡、带式照明灯使用的电压不符合安全电压等。</p><p>3．电气设备不合格。如闸刀开关或磁力启动器缺少护壳而触电、电气设备漏电、电炉的热元件没有隐蔽、电器设备外壳没有接地而带电、配电盘设计和制造上的缺陷，使配电盘前后带电部分易于触及人体、电线或电缆因绝缘磨损或腐蚀而损坏、在带电下拆装电缆等。</p><p>4．维修不善。如大风刮断的低压线路未能及时修理、胶盖开关破损长期不修、瓷瓶破裂后火线与拉线长期相碰等。</p><p>5．偶然因素。如大风刮断的电线恰巧落在人体上等。</p><p>从以上触电原因分析中，可以看出，除了偶然因素外，其他的都是可以避免的。</p>'
    },
    {
      id: 2,
      name: '触电伤害类型',
      sort: 2,
      starTimer: '2024-02-19',
      theoryDesc: '<p>触电伤害表现为多种形式。电流通过人体内部器官，会破坏人的心脏、肺部、神经系统等，使人出现痉挛、呼吸窒息、心室纤维性颤动、心跳骤停甚至死亡。电流通过体表时，会对人体外部造成局部伤害，即电流的热效应、化学效应、机械效应以及磁效应对人体外部组织或器官造成伤害，一般常见的伤害类型如下：</p><p>1.电击伤</p><p>    当人体接触电流时，轻者立刻出现惊慌、呆滞、面色苍白，接触部位肌肉收缩，且有头晕、心动过速和全身乏力。重者出现昏迷、持续抽搐、心室纤维颤动、心跳和呼吸停止。有些严重电击患者当时症状虽不重，但在1小时后可突然恶化。有些患者触电后，心跳和呼吸极其微弱，甚至暂时停止，处于“假死状态”，因此要认真鉴别，不可轻易放弃对触电患者的抢救。</p><p>2.电热灼伤</p><p>    电流在皮肤入口处灼伤程度比出口处重。灼伤皮肤呈灰黄色焦皮，中心部位低陷，周围无肿、痛等炎症反应。但电流通路上软组织的灼伤常较为严重。肢体软组织大块被电灼伤后，其远端组织常出现缺血和坏死，血浆肌球蛋白增高和红细胞膜损伤引起血浆游离血红蛋白增高均可引起急性肾小管坏死性肾病。</p><p>3.闪电损伤</p><p>    当人被闪电击中，心跳和呼吸常立即停止，伴有心肌损害。皮肤血管收缩呈网状图案，认为是闪电损伤的特征。继而出现肌球蛋白尿。其他临床表现与高压电损伤相似。</p>'
    },
    {
      id: 3,
      name: '触电急救措施',
      sort: 3,
      starTimer: '2024-02-19',
      theoryDesc: '<p>1.迅速脱离电源</p><p>现场救治应争分夺秒，首要任务是切断电源。根据触电现场的环境和条件，采取最安全而又最迅速的办法切断电源或使触电者脱离电源。常有方法有：关闭电源；挑开电线。</p><p>（1）关闭电源，若触电发生在家中或开关附近，迅速关闭电源开关、拉开电源总闸刀是最简单、安全而有效的方法。</p><p>（2）挑开电线，用干燥木棒、竹杆等将电线从触电者身上挑开，并将此电线固定好，避免他人触电。</p><p>（3）斩断电路，若在野外或远离电源开关的地方，尤其是雨天，不便接近触电者以挑开电源线时，可在现场20米以外用绝缘钳子或干燥木柄的铁锹、斧头、刀等将电线斩断。</p><p>（4）“拉开”触电者，若触电者不幸全身趴在铁壳机器上，抢救者可在自己脚下垫一块干燥木板或塑料板，用干燥绝缘的布条、绳子或用衣服绕成绳条状套在触电者身上将其拉离电源。</p><p>在使触电者脱离电源的整个过程中，必须防止自身触电，注意以下几点：</p><p>①必须严格保持自己与触电者的绝缘，不直接接触触电者，选用的器材必须有绝缘性能。若对所用器材绝缘性能无把握，则在操作时，脚下垫干燥木块、厚塑料块等绝缘物品，使自己与大地绝缘。</p><p>②在下雨天气野外抢救触电者时，一切原先有绝缘性能的器材都因淋湿而失去绝缘性能，因此更需注意。</p><p>③野外高压电线触电，注意跨步电压的可能性并予以防止，最好是选择20米以外切断电源；确实需要进出危险地带，需保证单脚着地的跨跳步进出，绝对不许双脚同时着地。</p><p><br></p><p>2.有缺氧指征者，应给予吸氧。</p><p><br></p><p>3.心肺复苏</p><p>（1）对呼吸微弱或不规则、甚至停止，而心搏尚存在者，应立即口对口人工呼吸，或仰卧压胸、俯卧压背式人工呼吸，有条件者可行气管插管气囊或呼吸机辅助呼吸。</p><p>（2）对心搏停止，而呼吸尚存在者，应立即行胸外按压，对心室颤动者，有条件时应行非同步直流电除颤。</p><p>（3）心跳、呼吸骤停者，即刻予以心肺复苏（CPR）。</p><p><br></p><p>4.保护体表电灼伤创面</p><p>（1）体表电灼伤创面周围皮肤用碘伏处理后，加盖无菌敷料包扎，以减少污染。</p><p>（2）若伤口继发性出血，应给予相应处理。</p><p><br></p><p>5.对症处理</p><p>（1）积极防治脑水肿、急性肾衰等并发症。</p><p>（2）纠正水、电解质、酸碱平衡失调。</p><p>（3）有骨折者应给予适当固定。</p><p>（4）应用抗生素防治感染。</p><p>（5）心跳呼吸骤停者应建立有效通气与给氧，心跳恢复或在有效心脏按压同时转送医院。①危重患者建立静脉通道。②检查是否存在其他合并外伤，如电击伤后从高处跌落致骨折等创伤。③监测生命体征。</p>'
    },
    {
      id: 4,
      name: '安全电压与人体阻抗',
      sort: 4,
      starTimer: '2024-02-19',
      theoryDesc: '<p>安全电压：</p><p>    安全电压是指不致使人直接致死或致残的电压，我国安全电压有5个额定值：</p><p>    1、36V，安全特低电压，但仍有触电致死的可能。</p><p>    2、42V，针对手持电动工具等。</p><p>    3、24V，可以持续接触。</p><p>    4、12V，绝对安全电压。</p><p>    5、6V，水下作业等环境。</p><p>    另外，安全电流为10mA，致命电流为50mA，电击对人体的危害程度，主要取决于通过人体电流的大小和通电时间长短。</p><p><br></p><p>人体阻抗：</p><p>    人体阻抗取决于一定的因素，特别是电流路径、接触电压、电流持续时间、频率、皮肤潮湿度、接触面积、施加的压力和温度等。在工频电压下，人体的阻抗随接触面积增大、电压愈高，而变得愈小。IEC综合了历年来关于人体阻抗的研究成果，严密审查了大量的实测数据，得出人体在50/60Hz交流电时，成人的人体阻抗在1000Ω左右。</p>'
    },
    {
      id: 5,
      name: '触电防护措施',
      sort: 5,
      starTimer: '2024-02-19',
      theoryDesc: '<p>直接触电的预防措施有以下3种。</p><p>    绝缘措施：良好的绝缘是保证电气设备和线路正常运行的必要条件，是防止触电事故的重要措施。选用绝缘材料必须与电气设备的工作电压、工作环境和运行条件相适应。不同的设备或电路对绝缘电阻的要求不同。例如：新装或大修后的低压设备和线路，绝缘电阻不应低于0.5MΩ；运行中的线路和设备，绝缘电阻要求每伏工作电压lkΩ以上；高压线路和设备的绝缘电阻不低于每伏1000MΩ。</p><p>    屏护措施：采用屏护装置，如常用电器的绝缘外壳、金属网罩、金属外壳、变压器的遮栏、栅栏等将带电体与外界隔绝开来，以杜绝不安全因素。凡是金属材料制作的屏护装置，应妥善接地或接零。</p><p>    间距措施：为防止人体触及或过分接近带电体，在带电体与地面之间、带电体与其他设备之间，应保持一定的安全间距。安全间距的大小取决于电压的高低、设备类型、安装方式等因素。</p><p>间接触电的预防措施有以下3种。</p><p>    加强绝缘：对电气设备或线路采取双重绝缘的措施，可使设备或线路绝缘牢固，不易损坏。即使工作绝缘损坏，还有一层加强绝缘，不致发生金属导体裸露造成间接触电。</p><p>    电气隔离：采用隔离变压器或具有同等隔离作用的发电机，使电气线路和设备的带电部分处于悬浮状态。即使线路或设备的工作绝缘损坏，人站在地面上与之接触也不易触电。</p><p>    必须注意，被隔离回路的电压不得超过500V，其带电部分不能与其他电气回路或大地相连。</p><p>    自动断电保护：在带电线路或设备上采取漏电保护、过流保护、过压或欠压保护、短路保护、接零保护等自动断电措施，当发生触电事故时，在规定时间内能自动切断电源起到保护作用。</p><p>其他防护措施：</p><p>（1）加强用电管理，建立健全安全工作规程和制度，并严格执行。</p><p>（2）使用、维护、检修电气设备，严格遵守有关安全规程和操作规程。</p><p>（3）尽量不进行带电作业，特别在危险场所（如高温、潮湿地点），严禁带电工作；必须带电工作时，应使用各种安全防护工具，如使用绝缘棒、绝缘钳和必要的仪表，戴绝缘手套，穿绝缘靴等，并设专人监护。</p><p>（4）对各种电气设备按规定进行定期检查，如发现绝缘损坏、漏电和其他故障，应及时处理；对不能修复的设备，不可使用其带“病”进行，应予以更换。</p><p>（5）根据生产现场情况，在不宜使用380/220伏电压的场所，应使用12～36伏的安全电压。</p><p>（6）禁止非电工人员乱装乱拆电气设备，更不得乱接导线。</p><p>（7）加强技术培训，普及安全用电知识，开展以预防为主的反事故演习。</p>'
    }
  ])
  db.topicData.bulkPut([
    {
      correctOptions: 'A',
      id: 1,
      name: '电线着火时，下列做法错误的是（     ）。',
      optionA: '用水将火浇灭',
      optionB: '切断电源（拉闸）',
      optionC: '用沙土扑盖',
      optionD: '使用干粉灭火器灭火',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'C',
      id: 2,
      name: '按照用电制度规定，除其他保护措施外，夜间常电设备电器还必须有（   ）保护。',
      optionA: '短路',
      optionB: '过流',
      optionC: '漏电',
      optionD: '过电压',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'B',
      id: 3,
      name: '常用插排的额定电流是（   ）。',
      optionA: '5A',
      optionB: '10A',
      optionC: '15A',
      optionD: '20A',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'B',
      id: 4,
      name: '空气开关保护电流大小的选配是根据（   ）的大小。',
      optionA: '电器的功率',
      optionB: '电线',
      optionC: '设备',
      optionD: '闸箱',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'A',
      id: 5,
      name: '电线线径要符合用电设备（   ）的要求。',
      optionA: '功率',
      optionB: '大小',
      optionC: '新旧',
      optionD: '电压',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'A',
      id: 6,
      name: '照明线路每一路配电线容量的标准是不得大于（   ）。',
      optionA: '1KW',
      optionB: '2KW',
      optionC: '3KW',
      optionD: '4KW',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'B',
      id: 7,
      name: '以下哪种物品不是配电消防室的消防用具？',
      optionA: '沙箱',
      optionB: '消防水桶',
      optionC: '铁锨',
      optionD: '干粉灭火器',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'C',
      id: 8,
      name: '以下哪种物品不是配电消防室的消防用具？',
      optionA: '阻燃管',
      optionB: '蜡管',
      optionC: '塑料管',
      optionD: '铁管',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'C',
      id: 9,
      name: '依照常电设备使用管理制度的规定，电工或万能工每（   ）要对常电设备进行一次深度检查。',
      optionA: '每年',
      optionB: '每月',
      optionC: '每周',
      optionD: '每天',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'C',
      id: 10,
      name: '电流流过人体，造成对人体的伤害称为（   ）。',
      optionA: '电伤',
      optionB: '触电',
      optionC: '电击',
      optionD: '电烙印',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'A',
      id: 11,
      name: '在下列电流路径中，最危险的是（   ）。',
      optionA: '左手-前胸',
      optionB: '左手-双脚',
      optionC: '右手-双脚',
      optionD: '左手-右手',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'C',
      id: 12,
      name: '人体电阻一般情况下取（   ）考虑。',
      optionA: '1-10Ω',
      optionB: '10-100Ω',
      optionC: '800-1kΩ',
      optionD: '10k-20kΩ',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'D',
      id: 13,
      name: '下列导体色标，表示接地线的颜色是（   ）。',
      optionA: '黄色',
      optionB: '绿色',
      optionC: '淡蓝',
      optionD: '绿/黄双色',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'C',
      id: 14,
      name: '低压照明灯在潮湿场所、金属容器内使用时，应采用（   ）安全电压。',
      optionA: '380V',
      optionB: '220V',
      optionC: '≤36V',
      optionD: '＞36V',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'C',
      id: 15,
      name: '如果触电者伤势严重，呼吸停止或心脏停止跳动，应竭力施行（   ）和胸外心脏按压。',
      optionA: '按摩',
      optionB: '点穴',
      optionC: '人工呼吸',
      optionD: '针灸',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'A',
      id: 16,
      name: '在易燃易爆场所作业时，不得穿戴（   ）。',
      optionA: '尼龙工作服',
      optionB: '棉布工作服',
      optionC: '防静电服',
      optionD: '耐高温鞋',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'C',
      id: 17,
      name: '在低压工作中，最小检修距离不应小于（   ）。',
      optionA: '2米',
      optionB: '1米',
      optionC: '0.1米',
      optionD: '无所谓',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'C',
      id: 18,
      name: '电气设备在正常情况下不带电的金属部分与电网零线紧密地连接起来，称为（   ）。',
      optionA: '接地保护',
      optionB: '接零保护',
      optionC: '防静电保护',
      optionD: '防漏保护',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'A',
      id: 19,
      name: '当出现危险情况时，能瞬间动作，终止设备地一切运动，并于制动器或离合器连锁，迅速终止运行的开关是（   ）。',
      optionA: '紧急停车开关',
      optionB: '制动开关',
      optionC: '紧急制动开关',
      optionD: '停车开关',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'A',
      id: 20,
      name: '电气装置或电气线路带电部分的某点与大地连接、电气装置或其他装置正常时不带电部分某点与大地的人为连接都叫（   ）。',
      optionA: '接地保护',
      optionB: '接零',
      optionC: '接车体',
      optionD: '防静电',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'C',
      id: 21,
      name: '为防止焊工不受弧光伤害，宜穿什么颜色的衣服？',
      optionA: '黑色',
      optionB: '白色',
      optionC: '灰色',
      optionD: '红色',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'B',
      id: 22,
      name: '下列几种放电形式中，危害最大的是（   ）。',
      optionA: '尖端放电',
      optionB: '电晕放电',
      optionC: '刷形放电',
      optionD: '火花放电',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'C',
      id: 23,
      name: '以下对报警电话描述不正确的是（   ）。',
      optionA: '119报警电话是免费的',
      optionB: '发生火灾时，任何人都可以无偿拨打119',
      optionC: '为了演练，平时可以拨打119',
      optionD: '恶意拨打报警电话，将会受到法律处罚',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'D',
      id: 24,
      name: '凡手提照明灯、高度不足（   ）的一般照明灯，如果没有特殊安全结构或安全措施，应采用42V或36V安全电压。',
      optionA: '30米',
      optionB: '2.0米',
      optionC: '10米',
      optionD: '2.5米',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'A',
      id: 25,
      name: '在易燃易爆的危险环境中，所使用的电气设备必须是（   ）。',
      optionA: '防爆式',
      optionB: '普通式',
      optionC: '加厚式',
      optionD: '无所谓',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'D',
      id: 26,
      name: '凡金属容器内、隧道内、矿井内等工作地点狭窄、行动不便、以及周围有大面积接地导体的环境，使用手提照明灯时应采用（   ）安全电压。',
      optionA: '45',
      optionB: '36',
      optionC: '24',
      optionD: '12',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'C',
      id: 27,
      name: '防止触电的技术措施不包括（   ）。',
      optionA: '绝缘',
      optionB: '屏护',
      optionC: '穿工作服',
      optionD: '隔离',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'B',
      id: 28,
      name: '电脑着火了，应（   ）。',
      optionA: '迅速往电脑上泼水灭火',
      optionB: '拔掉电源后，用湿棉被盖住电脑',
      optionC: '马上拨打火警电话，请消防队灭火',
      optionD: '迅速按下火灾警报',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'C',
      id: 29,
      name: '从事电气工作的人员为（   ）。',
      optionA: '普通员工',
      optionB: '管理人员',
      optionC: '特种作业人员',
      optionD: '安全人员',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'A',
      id: 30,
      name: '卖场内的电气设备（含办公区公用设备）下班时，关闭设备开关就可以了，不同拉闸断电。',
      optionA: '×',
      optionB: '√',
      optionC: '/',
      optionD: '/',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'A',
      id: 31,
      name: '电器设备着火，要先浇水灭火，然后用毛毯、棉被扑盖。',
      optionA: '×',
      optionB: '√',
      optionC: '/',
      optionD: '/',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'A',
      id: 32,
      name: '过道电线如果是弱电线可以不用扣槽防护。',
      optionA: '×',
      optionB: '√',
      optionC: '/',
      optionD: '/',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'B',
      id: 33,
      name: '经常接触和使用的配电箱、配电板、闸刀开关、按钮开关、插座、插销以及导线等，必须保持完好，不得有破损或将带电部分裸露。',
      optionA: '×',
      optionB: '√',
      optionC: '/',
      optionD: '/',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'A',
      id: 34,
      name: '因为零线比火线安全，所以开关大都安装在零线上。',
      optionA: '×',
      optionB: '√',
      optionC: '/',
      optionD: '/',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'A',
      id: 35,
      name: '对于较严重的电气火灾应该先灭火，后断电。',
      optionA: '×',
      optionB: '√',
      optionC: '/',
      optionD: '/',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'A',
      id: 36,
      name: '发现有人触电时，应立即将他拉开。',
      optionA: '×',
      optionB: '√',
      optionC: '/',
      optionD: '/',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'A',
      id: 37,
      name: '清洗电器设备可以不用关掉电源。',
      optionA: '×',
      optionB: '√',
      optionC: '/',
      optionD: '/',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'A',
      id: 38,
      name: '电闸箱里如空间比较大，可以放一些如手套等工具物品。',
      optionA: '×',
      optionB: '√',
      optionC: '/',
      optionD: '/',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'B',
      id: 39,
      name: '两台2100W的电磁炉不可以在一个10A的插排上共同使用。',
      optionA: '×',
      optionB: '√',
      optionC: '/',
      optionD: '/',
      starTimer: '2024-02-19'
    },
    {
      correctOptions: 'A',
      id: 40,
      name: '没有保险丝时，可以用铜丝等代替保险丝。',
      optionA: '×',
      optionB: '√',
      optionC: '/',
      optionD: '/',
      starTimer: '2024-02-19'
    }
  ])
  db.Software.bulkPut([])
  db.psd.add(
    { password: '123456' }
  )
})
