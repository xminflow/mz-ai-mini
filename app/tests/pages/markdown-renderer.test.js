const test = require("node:test");
const assert = require("node:assert/strict");

const COMPONENT_PATH = require.resolve(
  "../../miniprogram/components/markdown-renderer/index"
);

const clearMarkdownRendererModules = () => {
  delete require.cache[COMPONENT_PATH];
};

const loadMarkdownRenderer = () => {
  clearMarkdownRendererModules();

  let componentConfig = null;
  global.Component = (config) => {
    componentConfig = config;
  };

  require(COMPONENT_PATH);
  return componentConfig;
};

const createComponentInstance = (componentConfig) => {
  const instance = {
    data: {
      ...componentConfig.data,
    },
    properties: {
      markdown: "",
    },
    setData(update) {
      this.data = {
        ...this.data,
        ...update,
      };
    },
  };

  if (typeof componentConfig.created === "function") {
    componentConfig.created.call(instance);
  }

  Object.entries(componentConfig.methods || {}).forEach(([key, value]) => {
    instance[key] = value.bind(instance);
  });

  Object.entries(componentConfig.lifetimes || {}).forEach(([key, value]) => {
    if (typeof value === "function") {
      instance[key] = value.bind(instance);
    }
  });

  if (typeof instance.attached !== "function") {
    instance.attached = () => {};
  }

  return instance;
};

test.afterEach(() => {
  clearMarkdownRendererModules();
  delete global.Component;
  delete global.wx;
});

test("markdown renderer keeps the first async cloud image render result after component attach", async () => {
  const componentConfig = loadMarkdownRenderer();
  const component = createComponentInstance(componentConfig);

  let pendingSuccess = null;
  global.wx = {
    cloud: {
      getTempFileURL(options) {
        pendingSuccess = options.success;
      },
    },
  };

  const firstRenderPromise = component.updateMarkdownBlocks(
    "![封面](cloud://demo-env.bucket/path/cover.png)"
  );

  component.attached();

  pendingSuccess({
    fileList: [
      {
        fileID: "cloud://demo-env.bucket/path/cover.png",
        status: 0,
        tempFileURL: "https://temp.example.com/cover.png",
      },
    ],
  });

  await firstRenderPromise;

  assert.equal(component.data.blocks.length, 1);
  assert.deepEqual(component.data.blocks[0], {
    id: "image-0",
    type: "image",
    alt: "封面",
    src: "https://temp.example.com/cover.png",
  });
});

test("markdown renderer previews image only on double tap and includes all image urls", async () => {
  const componentConfig = loadMarkdownRenderer();
  const component = createComponentInstance(componentConfig);
  const previewCalls = [];
  const originalDateNow = Date.now;

  global.wx = {
    previewImage(options) {
      previewCalls.push(options);
    },
  };

  await component.updateMarkdownBlocks(
    "![封面](https://example.com/cover.png)\n\n![详情图](https://example.com/detail.png)"
  );

  let now = 1000;
  Date.now = () => now;

  try {
    component.handleImageTap({
      currentTarget: {
        dataset: {
          src: "https://example.com/cover.png",
        },
      },
    });
    assert.equal(previewCalls.length, 0);

    now = 1200;
    component.handleImageTap({
      currentTarget: {
        dataset: {
          src: "https://example.com/cover.png",
        },
      },
    });

    assert.equal(previewCalls.length, 1);
    assert.deepEqual(previewCalls[0], {
      current: "https://example.com/cover.png",
      urls: [
        "https://example.com/cover.png",
        "https://example.com/detail.png",
      ],
    });
  } finally {
    Date.now = originalDateNow;
  }
});
