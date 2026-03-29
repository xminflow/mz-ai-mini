const { STORY_PAGE_SIZE, fetchStoryList } = require("../../services/story");
const { encodeBusinessCaseRouteId } = require("../../utils/businessCaseId");
const { buildStoryTabs, buildWaterfallColumns } = require("./layout");

const HOME_BANNER_IMAGE_LIST = Object.freeze([
  "cloud://rlink-5g3hqx773b8980a1.726c-rlink-5g3hqx773b8980a1-1415950630/images/banner1.png",
  "cloud://rlink-5g3hqx773b8980a1.726c-rlink-5g3hqx773b8980a1-1415950630/images/banner2.png",
]);

const buildFeedData = (storyList = []) => ({
  storyList,
  ...buildWaterfallColumns(storyList),
});

const buildTabData = (availableTags = []) => ({
  availableTags,
  tabList: buildStoryTabs(availableTags),
});

Page({
  data: {
    bannerImageList: HOME_BANNER_IMAGE_LIST,
    storyList: [],
    leftColumnStoryList: [],
    rightColumnStoryList: [],
    availableTags: [],
    tabList: buildStoryTabs(),
    selectedTag: "",
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

  async loadInitialStories({ tag = this.data.selectedTag } = {}) {
    this.setData({
      ...buildFeedData(),
      selectedTag: tag,
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
        tag,
      });

      this.setData({
        ...buildFeedData(response.list),
        ...buildTabData(response.availableTags),
        selectedTag: tag,
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
        tag: this.data.selectedTag,
      });
      const storyList = this.data.storyList.concat(response.list);

      this.setData({
        ...buildFeedData(storyList),
        ...buildTabData(response.availableTags),
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
    const { tag = "" } = event.currentTarget.dataset;

    if (tag === this.data.selectedTag) {
      return;
    }

    this.loadInitialStories({ tag });
  },

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
