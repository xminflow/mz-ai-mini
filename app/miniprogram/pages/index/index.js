const { STORY_PAGE_SIZE, fetchStoryList } = require("../../services/story");
const { encodeBusinessCaseRouteId } = require("../../utils/businessCaseId");
const {
  DEFAULT_AVAILABLE_INDUSTRIES,
  MORE_INDUSTRY_TAB_VALUE,
  buildIndustryOptions,
  buildIndustryTabs,
  buildWaterfallColumns,
} = require("./layout");

const HOME_BANNER_IMAGE_LIST = Object.freeze([
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

Page({
  data: {
    bannerImageList: HOME_BANNER_IMAGE_LIST,
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
    this.setData({
      keywordInput: event.detail.value || "",
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
});
