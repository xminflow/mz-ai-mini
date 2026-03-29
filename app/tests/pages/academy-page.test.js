const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const ACADEMY_PAGE_PATH = require.resolve("../../miniprogram/pages/academy/index");
const ACADEMY_TEMPLATE_PATH = require.resolve("../../miniprogram/pages/academy/index.wxml");

const clearAcademyModules = () => {
  delete require.cache[ACADEMY_PAGE_PATH];
};

const loadAcademyPage = () => {
  clearAcademyModules();

  let pageConfig = null;
  global.Page = (config) => {
    pageConfig = config;
  };

  require(ACADEMY_PAGE_PATH);
  return pageConfig;
};

test.afterEach(() => {
  clearAcademyModules();
  delete global.Page;
});

test("academy page exposes a complete placeholder training outline", () => {
  const pageConfig = loadAcademyPage();

  assert.equal(pageConfig.data.hero.title, "AI 智能体课程培训大纲");
  assert.equal(pageConfig.data.overviewList.length, 4);
  assert.equal(pageConfig.data.highlightList.length, 3);
  assert.equal(pageConfig.data.moduleList.length, 6);
  assert.equal(pageConfig.data.outcomeList.length, 4);
  assert.deepEqual(pageConfig.data.moduleList[0].lessonList, [
    "AI 智能体定义",
    "典型业务场景",
    "项目筛选标准",
  ]);
});

test("academy page template renders data-driven modules and outcomes", () => {
  const template = fs.readFileSync(ACADEMY_TEMPLATE_PATH, "utf8");

  assert.equal(template.includes('wx:for="{{overviewList}}"'), true);
  assert.equal(template.includes('wx:for="{{moduleList}}"'), true);
  assert.equal(template.includes("模块产出：{{item.deliverable}}"), true);
  assert.equal(template.includes('wx:for="{{outcomeList}}"'), true);
});
