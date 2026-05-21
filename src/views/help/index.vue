<script setup lang="ts">
defineOptions({
  name: "SystemHelp"
});

type TextBlock = {
  title: string;
  items: string[];
};

type GuideSection = {
  name: string;
  label: string;
  title: string;
  summary: string;
  blocks: TextBlock[];
};

type RoleGuide = {
  role: string;
  focus: string;
  steps: string[];
};

const flowSteps = [
  {
    title: "初始化",
    description: "维护诊所资料、账号角色、药品项目和系统参数。"
  },
  {
    title: "挂号",
    description: "录入或选择患者，生成待接诊记录。"
  },
  {
    title: "接诊",
    description: "医生录入病历、诊断、处方、检查和治疗。"
  },
  {
    title: "收费",
    description: "核对费用明细，完成收费或退费。"
  },
  {
    title: "药房",
    description: "处理处方发药、零售、库存出入库和预警。"
  },
  {
    title: "统计",
    description: "查看工作量、项目、药品、财务和运营数据。"
  }
];

const roleGuides: RoleGuide[] = [
  {
    role: "诊所管理员",
    focus: "负责诊所基础配置、账号权限、基础资料和日常运营检查。",
    steps: [
      "维护科室、人员、角色；新增人员后一定要分配角色和可用菜单。",
      "维护挂号费、附加费、诊断字典、药品、检查项目和治疗项目。",
      "在系统参数中维护系统名称、系统 Logo 和与诊所业务相关的参数。",
      "定期检查库存预警、收费退费记录和统计报表。"
    ]
  },
  {
    role: "医生",
    focus: "负责患者接诊、诊断录入、病历记录和处方项目开具。",
    steps: [
      "从待接诊列表进入患者就诊界面，先核对患者身份和挂号信息。",
      "填写主诉、现病史、诊断、医嘱等核心病历内容。",
      "按业务需要开具西药/中成药处方、中药处方、检查项目、治疗项目和附加费用。",
      "保存前核对药品规格、用法、频次、剂量、数量、天数和金额。",
      "需要复用历史方案时，可查看历史病历或处方模板。"
    ]
  },
  {
    role: "收费员",
    focus: "负责处方项目费用核对、收费确认、退费处理和收费记录查询。",
    steps: [
      "在收费列表按患者、日期或状态查询待收费记录。",
      "收费前核对患者、医生、诊断、处方、检查治疗项目和附加费用。",
      "确认收款后完成收费，必要时打印或留存收费凭据。",
      "发生退费时，从退费列表核对原收费记录和退费明细后再处理。",
      "每日结束时结合财务统计核对收费、退费和实收金额。"
    ]
  },
  {
    role: "药房人员",
    focus: "负责药品资料、入库、出库、库存、发药和零售业务。",
    steps: [
      "先维护药品基础资料，确保名称、规格、单位、价格和库存属性准确。",
      "通过入库登记采购、盘盈等库存增加业务。",
      "通过出库登记损耗、调拨等非处方库存减少业务。",
      "收费后按处方发药，并关注库存扣减是否符合预期。",
      "定期查看库存查询和库存预警，及时补货或修正异常库存。"
    ]
  }
];

const sections: GuideSection[] = [
  {
    name: "startup",
    label: "上线准备",
    title: "上线准备与初始化",
    summary:
      "诊所正式使用前，建议先完成组织、账号、收费、药品、项目和参数配置。基础资料越完整，后续接诊和收费越顺。",
    blocks: [
      {
        title: "诊所资料",
        items: [
          "首次使用前先确认诊所名称、系统名称、系统 Logo 和联系方式等基础信息。",
          "系统名称和 Logo 可在系统参数中维护，修改后会影响顶部导航、登录页和关于页面展示。",
          "诊所日常资料应由指定管理员统一维护，避免多人随意调整造成展示或业务口径不一致。"
        ]
      },
      {
        title: "人员与角色",
        items: [
          "诊所管理员负责本诊所的人员、角色、基础资料和系统参数维护。",
          "新增人员后应及时分配角色，确保医生、收费员、药房人员等岗位能看到对应功能。",
          "如果用户登录后提示没有功能模块，优先检查账号状态、用户角色和角色菜单权限。"
        ]
      },
      {
        title: "基础资料",
        items: [
          "建议先维护科室，再维护人员账号，最后给人员分配角色。",
          "药品、诊断字典、挂号费、附加费、检查项目、治疗项目会影响医生开方和收费，应在正式使用前确认。",
          "基础资料维护完成后，建议用一笔测试挂号走完整流程，确认接诊、收费、发药和统计都符合预期。"
        ]
      }
    ]
  },
  {
    name: "visit",
    label: "门诊业务",
    title: "门诊业务操作",
    summary:
      "门诊业务的主线是挂号、接诊、开方、收费、发药和复查历史记录。每个环节都应核对患者和费用信息。",
    blocks: [
      {
        title: "患者挂号",
        items: [
          "进入挂号页面，先搜索患者；如果患者已存在，选择已有患者，避免重复录入。",
          "新患者需要录入姓名、性别、年龄或出生日期、联系方式等基本信息。",
          "选择科室、医生或挂号费用后保存，系统会生成待接诊记录。",
          "挂号后如发现患者信息错误，应在接诊或患者资料环节及时修正。"
        ]
      },
      {
        title: "医生接诊",
        items: [
          "医生从待接诊记录进入工作台，先确认患者姓名、年龄、性别和挂号信息。",
          "填写主诉、现病史、既往史、体格检查、诊断、医嘱等病历信息。",
          "诊断可从诊断字典选择，也可根据权限输入补充内容。",
          "保存接诊信息后，可继续开处方、检查项目、治疗项目和附加费用。"
        ]
      },
      {
        title: "处方与项目",
        items: [
          "西药/中成药处方应核对药品名称、规格、单位、用法、频次、剂量、数量、天数和金额。",
          "中药处方应核对药味、剂量、帖数、煎服法和特殊用法。",
          "检查项目和治疗项目来自基础项目维护，金额会进入收费环节。",
          "附加费用适用于材料费、邮寄费、煎药耗材等额外费用。"
        ]
      },
      {
        title: "历史记录",
        items: [
          "就诊记录可按患者、日期、医生、状态查询历史接诊。",
          "历史记录用于复诊参考、收费核对和处方追溯。",
          "如果历史记录缺失，检查当前登录诊所、日期范围和账号权限。"
        ]
      }
    ]
  },
  {
    name: "charge",
    label: "收费退费",
    title: "收费与退费",
    summary:
      "收费环节承接医生开立的处方、项目和费用，是诊所财务核对的关键节点。",
    blocks: [
      {
        title: "收费处理",
        items: [
          "进入收费列表，按患者姓名、日期或状态筛选待收费记录。",
          "收费前逐项核对挂号费、药品费、检查费、治疗费和附加费。",
          "发现处方或费用错误时，不建议直接收费，应返回业务环节修正后再收费。",
          "收费完成后，记录会进入已收费状态，并参与财务统计。"
        ]
      },
      {
        title: "退费处理",
        items: [
          "退费前先定位原收费记录，确认患者、收费时间、收费项目和退费原因。",
          "部分退费时，只选择需要退的项目或金额；全额退费时确认所有明细。",
          "涉及药品退费时，应同步确认是否需要退药入库或按诊所业务规则处理库存。",
          "退费完成后，应在财务统计或收费记录中核对退费结果。"
        ]
      },
      {
        title: "日结核对",
        items: [
          "收费员每日应核对收费笔数、收费金额、退费金额和实收金额。",
          "财务统计与收费列表数据不一致时，优先检查日期范围、诊所、收费状态和退费状态。",
          "异常单据应及时记录原因，避免跨日难以追溯。"
        ]
      }
    ]
  },
  {
    name: "pharmacy",
    label: "药房库存",
    title: "药房与库存管理",
    summary:
      "药房管理覆盖药品资料、处方发药、零售售药、采购入库、非处方出库、库存查询和库存预警。",
    blocks: [
      {
        title: "药品资料",
        items: [
          "药品名称、规格、单位、零售价、成本价、剂型、用法等信息会影响处方选择和金额计算。",
          "药品启用后可被医生选择；停用后一般不再用于新处方。",
          "同名药品应通过规格、厂家或剂型区分，避免医生选错。"
        ]
      },
      {
        title: "入库与出库",
        items: [
          "入库用于采购入库、盘盈、退货回库等库存增加业务。",
          "出库用于报损、调拨、盘亏、领用等非处方库存减少业务。",
          "出入库时应核对药品、数量、单位、批次或备注，保存后会影响库存查询。"
        ]
      },
      {
        title: "库存查询与预警",
        items: [
          "库存查询用于查看当前药品库存、库存数量和相关明细。",
          "库存预警用于发现低库存、零库存或超过预警线的药品。",
          "如果库存与实际不一致，先核对入库、出库、发药、退费和手工调整记录。"
        ]
      },
      {
        title: "零售售药",
        items: [
          "零售用于不经过门诊处方的售药场景。",
          "零售时应同样核对药品规格、数量、价格和库存。",
          "零售记录应纳入收费或财务核对，避免与门诊处方收入混淆。"
        ]
      }
    ]
  },
  {
    name: "maintenance",
    label: "资料维护",
    title: "基础资料维护",
    summary:
      "基础资料是诊所业务的地基。药品、项目、诊断、费用、科室和人员维护不完整，会直接影响医生开方与收费。",
    blocks: [
      {
        title: "收费项目",
        items: [
          "挂号费用于患者挂号时选择，不同类型挂号可设置不同金额。",
          "附加费用用于处方外的材料费、邮寄费、煎药费等。",
          "检查项目和治疗项目用于医生开单，价格会进入收费列表。"
        ]
      },
      {
        title: "诊断与字典",
        items: [
          "诊断字典用于医生快速选择诊断，减少手工输入差异。",
          "基础字典用于统一单位、用法、频次、剂型等业务口径。",
          "修改字典前应评估是否会影响历史记录展示和新业务选择。"
        ]
      },
      {
        title: "模板",
        items: [
          "处方模板用于复用常见用药方案，减少重复录入。",
          "病历模板用于复用常见主诉、病史、体征和医嘱。",
          "模板应定期维护，避免旧方案或旧用法继续被误用。"
        ]
      },
      {
        title: "系统参数",
        items: [
          "系统名称和系统 Logo 影响顶部导航、登录展示和关于页面。",
          "系统参数按当前诊所保存，不同诊所可维护自己的展示名称和 Logo。",
          "修改参数后如页面未立即刷新，可重新进入系统或刷新页面确认。"
        ]
      }
    ]
  },
  {
    name: "permission",
    label: "权限账号",
    title: "人员、角色与权限",
    summary:
      "用户能否登录、能看到哪些菜单、能操作哪些按钮，取决于账号状态、角色和按钮权限。",
    blocks: [
      {
        title: "人员账号",
        items: [
          "新增人员时填写账号、姓名、昵称、手机号、邮箱、科室和状态。",
          "账号用于登录，姓名和昵称用于业务展示。",
          "停用账号后，该人员不能继续正常使用系统。"
        ]
      },
      {
        title: "角色权限",
        items: [
          "角色用于组合菜单和按钮权限，例如医生、收费员、药房、诊所管理员。",
          "新增人员后必须分配角色，否则可能提示没有角色或没有功能模块。",
          "角色权限应按岗位职责配置，避免无关人员看到或操作不属于自己的业务。"
        ]
      }
    ]
  },
  {
    name: "analysis",
    label: "统计报表",
    title: "统计报表与运营分析",
    summary:
      "统计模块用于从工作量、药品、项目和财务角度观察诊所运营情况，帮助诊所做日常复盘。",
    blocks: [
      {
        title: "首页概览",
        items: [
          "首页展示今日挂号、待接诊、收费等关键指标。",
          "指标通常受当前登录诊所、日期范围和权限影响。",
          "如果首页数据为空，先检查是否已有当天业务数据。"
        ]
      },
      {
        title: "业务统计",
        items: [
          "工作量统计用于查看医生、科室或时间维度的接诊情况。",
          "项目统计用于查看检查和治疗项目使用情况。",
          "药品统计用于查看药品使用量、金额和结构。"
        ]
      },
      {
        title: "财务统计",
        items: [
          "财务统计用于核对收费、退费和收入趋势。",
          "统计口径应与收费列表、退费列表的日期范围保持一致。",
          "出现差异时，优先检查是否存在跨日收费、退费或未完成单据。"
        ]
      }
    ]
  },
  {
    name: "troubleshooting",
    label: "常见问题",
    title: "常见问题与排查",
    summary:
      "遇到登录、权限、数据展示、收费或库存问题时，可按下面清单快速定位。",
    blocks: [
      {
        title: "登录问题",
        items: [
          "提示账号或密码错误：先确认账号、密码、输入法和大小写是否正确。",
          "提示账号停用：联系诊所管理员检查人员账号状态。",
          "提示没有功能模块：检查用户角色、角色菜单和按钮权限。"
        ]
      },
      {
        title: "数据显示不对",
        items: [
          "顶部诊所名称、系统名称或 Logo 不对：确认系统参数是否已按本诊所保存。",
          "列表数据为空：先检查查询日期、状态、关键字和当前账号权限。",
          "历史记录缺失：确认患者、就诊日期、医生和业务状态筛选条件是否正确。"
        ]
      },
      {
        title: "收费与库存异常",
        items: [
          "收费金额不对：检查处方、项目、附加费、挂号费和药品价格。",
          "退费后金额不对：检查是否部分退费、是否重复退费、日期范围是否一致。",
          "库存不对：核对入库、出库、处方发药、退费退药和库存调整记录。"
        ]
      },
      {
        title: "操作建议",
        items: [
          "重要配置修改前，先确认影响范围，尤其是系统参数、角色权限、菜单权限和价格类数据。",
          "遇到异常先记录账号、当前诊所、操作路径、时间、患者或单据编号，便于管理员排查。",
          "权限相关问题优先联系诊所管理员，由管理员核对账号、角色和菜单配置。"
        ]
      }
    ]
  }
];
</script>

<template>
  <div class="help-doc">
    <header class="help-intro">
      <div>
        <h2>诊所系统帮助说明</h2>
        <p>
          这是一份面向诊所日常使用的操作手册，覆盖上线准备、门诊接诊、收费退费、药房库存、基础资料、权限账号、统计报表和常见问题。
        </p>
      </div>
      <el-tag type="primary" effect="plain">按当前账号权限显示菜单</el-tag>
    </header>

    <section class="help-panel">
      <div class="panel-title">
        <h3>业务闭环</h3>
        <span>建议按这个顺序完成诊所日常工作</span>
      </div>
      <el-steps :active="6" finish-status="success" align-center>
        <el-step
          v-for="step in flowSteps"
          :key="step.title"
          :title="step.title"
          :description="step.description"
        />
      </el-steps>
    </section>

    <section class="help-panel">
      <div class="panel-title">
        <h3>按角色查看</h3>
        <span>不同岗位优先关注的功能不同</span>
      </div>
      <div class="role-grid">
        <article
          v-for="guide in roleGuides"
          :key="guide.role"
          class="role-card"
        >
          <h4>{{ guide.role }}</h4>
          <p>{{ guide.focus }}</p>
          <ol>
            <li v-for="step in guide.steps" :key="step">{{ step }}</li>
          </ol>
        </article>
      </div>
    </section>

    <el-tabs tab-position="left" class="help-tabs">
      <el-tab-pane
        v-for="section in sections"
        :key="section.name"
        :name="section.name"
        :label="section.label"
      >
        <section class="manual-section">
          <h3>{{ section.title }}</h3>
          <p class="section-summary">{{ section.summary }}</p>

          <article
            v-for="block in section.blocks"
            :key="block.title"
            class="manual-block"
          >
            <h4>{{ block.title }}</h4>
            <ul>
              <li v-for="item in block.items" :key="item">{{ item }}</li>
            </ul>
          </article>
        </section>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss">
.help-doc {
  max-height: 78vh;
  overflow-y: auto;
  padding: 4px 8px 12px;
  color: var(--el-text-color-primary);
}

.help-intro {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8px 4px 16px;
  border-bottom: 1px solid var(--el-border-color-light);

  h2 {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 700;
  }

  p {
    max-width: 860px;
    margin: 0;
    line-height: 1.8;
    color: var(--el-text-color-secondary);
  }
}

.help-panel {
  padding: 18px 4px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.panel-title {
  display: flex;
  gap: 12px;
  align-items: baseline;
  margin-bottom: 14px;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }

  span {
    color: var(--el-text-color-secondary);
  }
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}

.role-card {
  padding: 14px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-fill-color-blank);

  h4 {
    margin: 0 0 8px;
    font-size: 15px;
    font-weight: 700;
  }

  p {
    margin: 0 0 10px;
    line-height: 1.7;
    color: var(--el-text-color-secondary);
  }

  ol {
    margin: 0;
    padding-left: 18px;
  }

  li {
    margin: 6px 0;
    line-height: 1.7;
  }
}

.help-tabs {
  margin-top: 14px;
}

.manual-section {
  padding: 4px 4px 16px;

  h3 {
    margin: 0 0 10px;
    font-size: 18px;
    font-weight: 700;
  }
}

.section-summary {
  margin: 0 0 14px;
  line-height: 1.8;
  color: var(--el-text-color-secondary);
}

.manual-block {
  padding: 14px 0;
  border-top: 1px solid var(--el-border-color-lighter);

  h4 {
    margin: 0 0 8px;
    font-size: 15px;
    font-weight: 700;
  }

  ul {
    margin: 0;
    padding-left: 18px;
  }

  li {
    margin: 6px 0;
    line-height: 1.8;
    color: var(--el-text-color-regular);
  }
}

:deep(.el-step__description) {
  line-height: 1.5;
}

:deep(.el-tabs__content) {
  padding-left: 18px;
}
</style>
