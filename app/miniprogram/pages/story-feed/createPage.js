const { STORY_PAGE_SIZE, fetchStoryList } = require("../../services/story");
const { encodeBusinessCaseRouteId } = require("../../utils/businessCaseId");
const {
  DEFAULT_AVAILABLE_INDUSTRIES,
  MORE_INDUSTRY_TAB_VALUE,
  buildIndustryOptions,
  buildIndustryTabs,
  buildWaterfallColumns,
} = require("../index/layout");

const DEFAULT_BANNER_IMAGE_LIST = Object.freeze([
  "cloud://rlink-5g3hqx773b8980a1.726c-rlink-5g3hqx773b8980a1-1415950630/images/banner1.png",
  "cloud://rlink-5g3hqx773b8980a1.726c-rlink-5g3hqx773b8980a1-1415950630/images/banner2.png",
]);

const buildFeedData = (storyList = []) => ({
  storyList,
  ...buildWaterfallColumns(storyList),
});

const buildIndustryData = ({
  availableIndustries = DEFAULT_AVAILABLE_INDUSTRIES,
  selectedIndustry = "",
} = {}) => ({
  availableIndustries,
  tabList: buildIndustryTabs(selectedIndustry),
  industryOptionList: buildIndustryOptions(availableIndustries, selectedIndustry),
});

const buildPageCopy = ({ contentLabel, emptyDefaultText }) => ({
  contentLabel,
  searchPlaceholder: `搜索${contentLabel}关键词`,
  initialLoadErrorTitle: `暂时无法加载${contentLabel}内容`,
  initialLoadErrorText: "请检查本地后端服务与数据库是否可用，然后重新尝试。",
  emptyKeywordTitle: `没有找到相关${contentLabel}`,
  emptyKeywordText: "试试更换关键词，或调整当前行业筛选条件。",
  emptyIndustryTitle: `该行业下还没有${contentLabel}`,
  emptyIndustryText: `切换其他行业，或补充该行业对应的${contentLabel}内容。`,
  emptyDefaultTitle: `还没有发布${contentLabel}`,
  emptyDefaultText,
  loadingMoreText: `正在加载更多${contentLabel}...`,
});

const normalizeRequiredText = (value, fieldName) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${fieldName} must not be blank.`);
  }

  return value.trim();
};

const createStoryFeedPage = ({
  storyType = "",
  contentLabel,
  emptyDefaultText,
  bannerImageList = DEFAULT_BANNER_IMAGE_LIST,
}) => {
  const normalizedStoryType = typeof storyType === "string" ? storyType.trim() : "";
  const normalizedContentLabel = normalizeRequiredText(contentLabel, "contentLabel");
  const normalizedEmptyDefaultText = normalizeRequiredText(
    emptyDefaultText,
    "emptyDefaultText"
  );
  const pageCopy = buildPageCopy({
    contentLabel: normalizedContentLabel,
    emptyDefaultText: normalizedEmptyDefaultText,
  });

  return {
    data: {
      storyType: normalizedStoryType,
      pageCopy,
      bannerImageList,
      storyList: [],
      leftColumnStoryList: [],
      rightColumnStoryList: [],
      ...buildIndustryData(),
      selectedIndustry: "",
      keywordInput: "",
      submittedKeyword: "",
      isIndustrySelectorVisible: false,
      nextCursor: "",
      hasMore: true,
      isLoadingInitial: true,
      isLoadingMore: false,
      initialLoadError: false,
      loadMoreError: false,
      leftSkeletonList: [1, 2],
      rightSkeletonList: [3, 4],
    },

    onLoad() {
      this.loadInitialStories();
    },

    onPullDownRefresh() {
      this.loadInitialStories();
    },

    onReachBottom() {
      this.loadMoreStories();
    },

    async loadInitialStories({
      industry = this.data.selectedIndustry,
      keyword = this.data.submittedKeyword,
    } = {}) {
      const normalizedIndustry =
        typeof industry === "string" ? industry.trim() : "";
      const normalizedKeyword =
        typeof keyword === "string" ? keyword.trim() : "";

      this.setData({
        ...buildFeedData(),
        ...buildIndustryData({
          availableIndustries: this.data.availableIndustries,
          selectedIndustry: normalizedIndustry,
        }),
        selectedIndustry: normalizedIndustry,
        keywordInput: normalizedKeyword,
        submittedKeyword: normalizedKeyword,
        isIndustrySelectorVisible: false,
        isLoadingInitial: true,
        initialLoadError: false,
        isLoadingMore: false,
        loadMoreError: false,
        hasMore: true,
        nextCursor: "",
      });

      try {
        const response = await fetchStoryList({
          pageSize: STORY_PAGE_SIZE,
          type: normalizedStoryType,
          industry: normalizedIndustry,
          keyword: normalizedKeyword,
        });

        this.setData({
          ...buildFeedData(response.list),
          ...buildIndustryData({
            availableIndustries: response.availableIndustries,
            selectedIndustry: normalizedIndustry,
          }),
          selectedIndustry: normalizedIndustry,
          keywordInput: normalizedKeyword,
          submittedKeyword: normalizedKeyword,
          nextCursor: response.nextCursor,
          hasMore: response.hasMore,
          isLoadingInitial: false,
        });
      } catch (error) {
        console.warn("Failed to load initial stories.", error);

        this.setData({
          ...buildFeedData(),
          nextCursor: "",
          hasMore: true,
          isLoadingInitial: false,
          initialLoadError: true,
        });

        wx.showToast({
          title: "加载失败",
          icon: "none",
        });
      } finally {
        wx.stopPullDownRefresh();
      }
    },

    async loadMoreStories(forceRetry = false) {
      if (
        this.data.isLoadingInitial ||
        this.data.isLoadingMore ||
        !this.data.hasMore
      ) {
        return;
      }

      if (!forceRetry && this.data.loadMoreError) {
        return;
      }

      this.setData({
        isLoadingMore: true,
        loadMoreError: false,
      });

      try {
        const response = await fetchStoryList({
          pageSize: STORY_PAGE_SIZE,
          cursor: this.data.nextCursor,
          type: normalizedStoryType,
          industry: this.data.selectedIndustry,
          keyword: this.data.submittedKeyword,
        });
        const storyList = this.data.storyList.concat(response.list);

        this.setData({
          ...buildFeedData(storyList),
          ...buildIndustryData({
            availableIndustries: response.availableIndustries,
            selectedIndustry: this.data.selectedIndustry,
          }),
          nextCursor: response.nextCursor,
          hasMore: response.hasMore,
          isLoadingMore: false,
        });
      } catch (error) {
        console.warn("Failed to load more stories.", error);

        this.setData({
          isLoadingMore: false,
          loadMoreError: true,
        });

        wx.showToast({
          title: "加载更多失败",
          icon: "none",
        });
      }
    },

    handleRetryInitial() {
      this.loadInitialStories();
    },

    handleRetryMore() {
      this.loadMoreStories(true);
    },

    handleSelectTab(event) {
      const { industry = "" } = event.currentTarget.dataset;

      if (industry === MORE_INDUSTRY_TAB_VALUE) {
        this.setData({
          isIndustrySelectorVisible: true,
        });
        return;
      }

      if (industry === this.data.selectedIndustry) {
        return;
      }

      return this.loadInitialStories({
        industry,
        keyword: this.data.submittedKeyword,
      });
    },

    handleKeywordInput(event) {
      const keywordInput =
        typeof event?.detail?.value === "string" ? event.detail.value : "";
      const normalizedKeyword = keywordInput.trim();

      this.setData({
        keywordInput,
      }, () => {
        if (normalizedKeyword !== "" || this.data.submittedKeyword === "") {
          return;
        }

        this.loadInitialStories({
          industry: this.data.selectedIndustry,
          keyword: "",
        });
      });
    },

    handleSubmitKeywordSearch(event) {
      const keywordSource =
        typeof event?.detail?.value === "string"
          ? event.detail.value
          : this.data.keywordInput;
      const keyword = keywordSource.trim();

      if (keyword === this.data.submittedKeyword) {
        this.setData({
          keywordInput: keyword,
        });
        return;
      }

      return this.loadInitialStories({
        industry: this.data.selectedIndustry,
        keyword,
      });
    },

    handleHideIndustrySelector() {
      this.setData({
        isIndustrySelectorVisible: false,
      });
    },

    handleSelectIndustryOption(event) {
      const { industry = "" } = event.currentTarget.dataset;

      this.setData({
        isIndustrySelectorVisible: false,
      });

      if (industry === this.data.selectedIndustry) {
        return;
      }

      return this.loadInitialStories({
        industry,
        keyword: this.data.submittedKeyword,
      });
    },

    handleStopPropagation() {},

    handleSelectStory(event) {
      const { id } = event.detail;
      const routeId = encodeBusinessCaseRouteId(id);

      if (!routeId) {
        return;
      }

      wx.navigateTo({
        url: `/pages/story-detail/index?id=${routeId}`,
      });
    },
  };
};

module.exports = {
  DEFAULT_BANNER_IMAGE_LIST,
  createStoryFeedPage,
};
